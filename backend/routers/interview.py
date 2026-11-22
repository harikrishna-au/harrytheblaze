from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
try:
    from backend.schemas import (
        InterviewStartResponse, InterviewChatRequest, InterviewChatResponse, InterviewEndRequest
    )
    from backend.services.ai_utils import openai_client, generate_openai_audio, generate_interview_feedback, generate_interview_questions, generate_hackwithinfy_questions
    from backend.services.aws_utils import (
        save_session, get_session, mark_session_completed, update_session_progress, interview_table
    )
    from backend.auth import premium_limit
except ImportError:
    from schemas import (
        InterviewStartResponse, InterviewChatRequest, InterviewChatResponse, InterviewEndRequest
    )
    from services.ai_utils import openai_client, generate_openai_audio, generate_interview_feedback, generate_interview_questions, generate_hackwithinfy_questions
    from services.aws_utils import (
        save_session, get_session, mark_session_completed, update_session_progress, interview_table
    )
    from auth import premium_limit
from pypdf import PdfReader
import uuid
import time
import json
import os
from boto3.dynamodb.conditions import Key, Attr

router = APIRouter(prefix="/api/interview", tags=["interview"])

INTERVIEW_TYPES = {"hr", "technical", "hackwithinfy"}
MAX_RESUME_CHARS = 10_000
MAX_RESUME_BYTES = 5 * 1024 * 1024
DAILY_INTERVIEW_LIMIT = int(os.environ.get("INTERVIEW_DAILY_LIMIT", "10"))

# Per-user hourly limits (best-effort, per process). The daily cap below is durable.
start_guard = premium_limit("interview_start", int(os.environ.get("INTERVIEW_STARTS_PER_HOUR", "5")))
chat_guard = premium_limit("interview_chat", 200)
end_guard = premium_limit("interview_end", 30)


def interviews_started_today(user_id: str) -> int:
    """Counts this user's sessions created in the last 24 hours (UserIdIndex)."""
    since = int(time.time()) - 24 * 60 * 60
    count, kwargs = 0, {
        "IndexName": "UserIdIndex",
        "KeyConditionExpression": Key("user_id").eq(user_id),
        "FilterExpression": Attr("created_at").gte(since),
        "Select": "COUNT",
    }
    while True:
        resp = interview_table.query(**kwargs)
        count += resp.get("Count", 0)
        if "LastEvaluatedKey" not in resp:
            return count
        kwargs["ExclusiveStartKey"] = resp["LastEvaluatedKey"]


def owned_session(session_id: str, user_id: str) -> dict:
    """Loads a session and checks it belongs to the caller. Same 404 either way."""
    item = get_session(session_id)
    if not item or item.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Session not found")
    return item


@router.post("/start", response_model=InterviewStartResponse)
def start_interview(
    resume_text: str = Form(None),
    interview_type: str = Form("hr"),
    resume_file: UploadFile = File(None),
    user_id: str = Depends(start_guard),
):
    # The user id comes from the verified token. Any user_id form field is ignored.
    if interview_type not in INTERVIEW_TYPES:
        interview_type = "hr"

    try:
        started = interviews_started_today(user_id)
    except Exception as e:
        print(f"Daily limit check failed: {e}")
        started = 0  # the hourly limit still applies
    if started >= DAILY_INTERVIEW_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"You have started {DAILY_INTERVIEW_LIMIT} interviews in the last 24 hours. Try again tomorrow.",
        )

    # 1. Process Resume
    final_resume_text = ""
    if resume_file:
        data = resume_file.file.read(MAX_RESUME_BYTES + 1)
        if len(data) > MAX_RESUME_BYTES:
            raise HTTPException(status_code=413, detail="Resume file is too large (max 5 MB).")
        try:
            import io
            reader = PdfReader(io.BytesIO(data))
            for page in reader.pages:
                final_resume_text += (page.extract_text() or "") + "\n"
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to read PDF file")
    elif resume_text:
        final_resume_text = resume_text

    final_resume_text = final_resume_text[:MAX_RESUME_CHARS]
    if not final_resume_text.strip():
        final_resume_text = "No resume provided. Ask general interview questions suitable for a fresher or entry-level candidate."

    session_id = str(uuid.uuid4())
    is_infy = interview_type == "hackwithinfy"

    system_prompt = f"""
    You are {"Priya, an Infosys technical interviewer conducting the HackWithInfy Round 3 interview" if is_infy else "Devi, an AI Interviewer at a top tech company"}.

    CANDIDATE RESUME:
    "{final_resume_text}"

    GOAL: Conduct a structured {"HackWithInfy Round 3" if is_infy else ""} interview based on the pre-generated question queue.
    {"Cover DSA concepts, CS fundamentals (OOPs, OS, DBMS, CN), resume projects, and Infosys HR questions." if is_infy else ""}
    Ask one question at a time. Do not add commentary between questions.
    """

    # 2. Pre-generate Questions
    if not openai_client:
        print("OpenAI API key not configured")
        raise HTTPException(status_code=503, detail="The interview service is temporarily unavailable.")
    try:
        q_data = (
            generate_hackwithinfy_questions(final_resume_text)
            if is_infy
            else generate_interview_questions(final_resume_text)
        )
        question_queue = q_data.get("questions", [])
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=502, detail="Could not prepare your interview. Please try again.")
    if not question_queue:
        raise HTTPException(status_code=502, detail="Could not prepare your interview. Please try again.")

    intro_msg = (
        "Hello! I am Priya, your Infosys interviewer for the HackWithInfy Round 3 mock interview. "
        if is_infy
        else "Hello, I am Devi, your AI Interviewer taking a mock interview for you. "
    )
    initial_ai_text = intro_msg + question_queue[0]

    full_history = [
        {"role": "system", "content": system_prompt},
        {"role": "assistant", "content": initial_ai_text}
    ]

    # 3. Save Session with Queue
    try:
        save_session({
            'session_id': session_id,
            'user_id': user_id,
            'history': json.dumps(full_history),
            'question_queue': json.dumps(question_queue),
            'current_question_index': 0,
            'interview_type': interview_type,
            'created_at': int(time.time()),
            'status': 'active'
        })
    except Exception as e:
        print(f"DynamoDB Error: {e}")
        raise HTTPException(status_code=500, detail="Database Error")

    # 4. Generate Audio
    audio_b64 = generate_openai_audio(initial_ai_text, voice="shimmer")

    return {
        "session_id": session_id,
        "ai_message": initial_ai_text,
        "audio_content": audio_b64
    }


@router.post("/chat", response_model=InterviewChatResponse)
def chat_interview(body: InterviewChatRequest, user_id: str = Depends(chat_guard)):
    item = owned_session(body.session_id, user_id)
    if item.get("status") == "completed":
        raise HTTPException(status_code=409, detail="This interview has already ended.")

    history = json.loads(item.get('history', '[]'))
    history.append({"role": "user", "content": body.user_text})

    question_queue = json.loads(item.get('question_queue', '[]'))
    current_index = int(item.get('current_question_index', 0))
    next_index = current_index + 1

    if next_index < len(question_queue):
        ai_text = question_queue[next_index]
        history.append({"role": "assistant", "content": ai_text})
        update_session_progress(body.session_id, history, next_index)

        audio_b64 = generate_openai_audio(ai_text, voice="shimmer")
        return {
            "ai_message": ai_text,
            "audio_content": audio_b64,
            "status": "active"
        }

    # End of Interview
    stored_type = item.get('interview_type', 'hr')
    feedback = generate_interview_feedback(history, next_index, len(question_queue), stored_type)
    mark_session_completed(body.session_id, feedback)

    return {
        "ai_message": "Thank you for your time. The interview is now complete.",
        "audio_content": "",
        "status": "completed",
        "feedback": feedback
    }


FALLBACK_FEEDBACK = {
    "feedback": {
        "strengths": ["Feedback generation unavailable"],
        "areas_for_improvement": ["Please contact support if this persists"],
        "rating": "N/A",
        "summary": "We encountered an issue generating your detailed feedback, but your interview has been recorded.",
        "detailed_analysis": []
    }
}


@router.post("/end")
def end_interview_session(body: InterviewEndRequest, user_id: str = Depends(end_guard)):
    item = owned_session(body.session_id, user_id)

    # Already finished: return the stored report instead of paying for a new one.
    if item.get("status") == "completed" and item.get("feedback"):
        return {"message": "Session ended", "feedback": item["feedback"]}

    try:
        history = json.loads(item.get('history', '[]'))
        question_queue = json.loads(item.get('question_queue', '[]'))
        current_index = int(item.get('current_question_index', 0))
        stored_type = item.get('interview_type', 'hr')
        feedback = generate_interview_feedback(history, current_index, len(question_queue), stored_type)
    except Exception as e:
        print(f"Feedback Generation Failed: {e}")
        feedback = {}

    try:
        # A failed report is not stored, so ending again can retry it.
        mark_session_completed(body.session_id, feedback or None)
    except Exception as e:
        # Still return the report so the student can exit cleanly.
        print(f"DB Update Failed: {e}")

    return {"message": "Session ended", "feedback": feedback or FALLBACK_FEEDBACK}
