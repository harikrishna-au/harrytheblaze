import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { backendFetch, backendErrorMessage } from "@/lib/backendAuth";

const INTERVIEW_DURATION_SECONDS = 10 * 60; // 10 minutes

// API BASE URL - Adjust based on environment or Vite proxy
// API BASE URL
// API BASE URL
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

/**
 * Session lifecycle:  setup → starting → live → ending → ended
 *                          ↖ (start failed) ↙
 * While live, each turn cycles:  idle → listening → idle → processing → speaking → idle …
 *
 * The old separate flags (interviewStarted, isResumeSubmitting, isEnding, interviewEnded,
 * isRecording, isProcessing) are derived from these two values, so they can't disagree.
 */
export type InterviewPhase = "setup" | "starting" | "live" | "ending" | "ended";
export type InterviewTurn = "idle" | "listening" | "processing" | "speaking";

export const useAIInterview = () => {
    // Session State
    const [resumeText, setResumeText] = useState("");
    const [phase, _setPhase] = useState<InterviewPhase>("setup");
    // Async callbacks (fetches, speech events, timers) read the ref so they never act on a stale phase.
    const phaseRef = useRef<InterviewPhase>("setup");
    const setPhase = (next: InterviewPhase) => {
        phaseRef.current = next;
        _setPhase(next);
    };

    // Interview State
    const [isMicMuted, setIsMicMuted] = useState(false);
    const isMicMutedRef = useRef(false);
    const isRecordingRef = useRef(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [textToSpeak, setTextToSpeak] = useState("");
    const [status, setStatus] = useState<InterviewTurn>("idle");
    // Turn changes only apply during a live interview; anything arriving late is dropped.
    const setTurn = (next: InterviewTurn) => {
        if (next === "idle" || phaseRef.current === "live") setStatus(next);
    };
    const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION_SECONDS);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<any>(null); // Store detailed feedback
    const [showEndConfirmation, setShowEndConfirmation] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);



    const uploadResumeToS3 = async (file: File): Promise<void> => {
        try {
            // 1. Get Presigned URL
            const urlResponse = await backendFetch(`${API_BASE_URL}/api/resume/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: file.name })
            });

            if (!urlResponse.ok) throw new Error("Failed to get upload URL");

            const data = await urlResponse.json();

            if (!data.fields) {
                console.error("Upload configuration missing from backend:", data);
                throw new Error(data.error || "Resume storage is not configured on the server.");
            }

            const { url, fields } = data;

            // 2. Upload to S3
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value as string);
            });
            formData.append("file", file);

            const uploadResponse = await fetch(url, {
                method: "POST",
                body: formData
            });

            if (!uploadResponse.ok) throw new Error("S3 Upload Failed");

        } catch (error) {
            console.error("Resume Upload Error:", error);
            throw error;
        }
    };

    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop tracks immediately after permission check to release mic
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error("Mic permission denied:", error);
            toast.error("Microphone access is required for the interview. Please allow access.");
            return false;
        }
    };

    // The backend takes the user from the Clerk token; userId is kept for callers but not sent.
    const startInterview = async (resume: string, _userId?: string | null, interviewType: "hr" | "technical" | "hackwithinfy" = "hr") => {

        if (phaseRef.current !== "setup") return; // already starting or started

        // Request Mic immediately
        const hasMic = await requestMicPermission();
        if (!hasMic) return;

        setPhase("starting");

        try {
            const formData = new FormData();
            // Always text now
            formData.append("resume_text", resume);
            formData.append("interview_type", interviewType);

            const response = await backendFetch(`${API_BASE_URL}/api/interview/start`, {
                method: "POST",
                // Content-Type header not set for FormData, browser sets it with boundary
                body: formData
            });

            if (!response.ok) {
                toast.error(await backendErrorMessage(response, "Could not start the interview. Please try again."));
                setPhase("setup");
                return;
            }

            const data = await response.json();

            setSessionId(data.session_id);
            setPhase("live");
            setTextToSpeak(data.ai_message);

            // Play Audio
            if (data.audio_content) {
                setAudioSrc(data.audio_content);
                setTurn("speaking");
            } else {
                console.warn("startInterview: No audio_content received from backend");
            }

        } catch (error) {
            console.error("Error starting interview:", error);
            toast.error(`Failed to start AI session: ${error instanceof Error ? error.message : "Unknown error"}`);
            setPhase("setup");
        }
    };

    const openEndConfirmation = () => setShowEndConfirmation(true);
    const closeEndConfirmation = () => setShowEndConfirmation(false);

    const endInterview = useCallback(async () => {
        // Only a live interview can end, and only once (timer and button can both fire).
        if (phaseRef.current !== "live") return;
        if (timerRef.current) clearInterval(timerRef.current);

        setPhase("ending");
        setStatus("idle");
        setShowEndConfirmation(false); // Close modal if open
        cancelAutoSubmit();
        stopRecording();

        if (sessionId) {
            try {
                const response = await backendFetch(`${API_BASE_URL}/api/interview/end`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.feedback) {
                        // Robust check: Ensure feedback is nested as expected by component
                        if (data.feedback.feedback) {
                            setFeedback(data.feedback);
                        } else {
                            // Wrap flat feedback in expected structure
                            setFeedback({ feedback: data.feedback });
                        }
                    }
                }
            } catch (e) {
                console.error("Error ending session:", e);
            }
        }

        setPhase("ended");
    }, [sessionId]);

    // Timer Logic - Must be after endInterview definition
    useEffect(() => {
        if (phase === "live" && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setShowEndConfirmation(true); // Show confirmation instead of auto-ending
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the phase changes
    }, [phase]);

    const toggleRecording = () => {
        if (isRecordingRef.current) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Text-based processing (replaces processAudio)
    const processText = async (text: string) => {
        if (!sessionId || !text.trim() || phaseRef.current !== "live") return;

        setTurn("processing");
        try {
            const response = await backendFetch(`${API_BASE_URL}/api/interview/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_text: text
                })
            });

            if (!response.ok) {
                throw new Error(await backendErrorMessage(response, "Could not send your answer. Please try again."));
            }

            const data = await response.json();

            // The interview was ended while this answer was in flight: drop the reply.
            if (phaseRef.current !== "live") return;

            setTextToSpeak(data.ai_message);

            if (data.audio_content) {
                setAudioSrc(data.audio_content);
                setTurn("speaking");
            } else if (data.status === "completed") {
                if (timerRef.current) clearInterval(timerRef.current);
                setStatus("idle");
                if (data.feedback) {
                    setFeedback(data.feedback);
                }
                setPhase("ended");
            } else {
                console.warn("processText: No audio content and not completed. State set to idle.");
                setTurn("idle");
            }

        } catch (error) {
            console.error("Error processing chat:", error);
            setTurn("idle");
            if (phaseRef.current === "live") {
                toast.error(error instanceof Error ? error.message : "Could not send your answer. Please try again.");
            }
        }
    };

    // User Interaction State
    const [userResponse, _setUserResponse] = useState("");
    const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const baseTextRef = useRef(""); // Snapshot of text before current recording session

    // Wrapper to ensure we cancel timer on manual edit
    const setUserResponse = (val: string) => {
        cancelAutoSubmit();
        _setUserResponse(val);
    };

    const cancelAutoSubmit = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setAutoSubmitCountdown(null);
    };

    const startRecording = () => {
        if (phaseRef.current !== "live") return;
        cancelAutoSubmit(); // Cancel any existing countdown

        // Snapshot current text so we append to it
        baseTextRef.current = userResponse;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Your browser does not support Speech Recognition. Please use Chrome or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true; // Changed to true to show live text
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isRecordingRef.current = true;
            setTurn("listening");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            // Update state directly (we don't want to cancel inside onresult loop repeatedly, wait, actually we do want to ensure no timer)
            cancelAutoSubmit();

            // Append new transcript to the base text
            const prefix = baseTextRef.current.trim() ? " " : "";
            _setUserResponse(baseTextRef.current + prefix + transcript);
        };

        recognition.onerror = (event: any) => {
            isRecordingRef.current = false;
            setStatus((prev) => (prev === "listening" ? "idle" : prev));
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                console.warn("Microphone access blocked/denied. Waiting for user interaction.");
            } else {
                console.error("Speech Recognition Error:", event.error);
            }
        };

        recognition.onend = () => {
            isRecordingRef.current = false;
            setStatus((prev) => {
                if (prev === "listening") return "idle";
                return prev;
            });

            // Start Auto-Submit Timer if we have text
            // Access ref-less state might be stale in closure? No, onend runs after updates.
            // But strict closure might capture old userResponse.
            // Use a ref for userResponse if needed, OR just trust we set it in onresult.
            // Actually, we can't read userResponse state reliably here if it just updated.
            // Workaround: We know we just finished speaking.
            // Let's rely on the fact userResponse IS updated.
            // However, inside onend, `userResponse` might be stale.
            // Let's safely start the timer anyway, and check length in the tick?
            // Or better, checking `_setUserResponse` in `onresult` ensures state update.

            // To be safe, we start the timer. If userResponse is empty, submitting does nothing anyway (submitResponse checks trim).
            startAutoSubmitCountdown();
        };

        // Store in ref to stop if needed (though onresult usually handles it)
        (mediaRecorderRef.current as any) = recognition;
        recognition.start();
    };

    const startAutoSubmitCountdown = () => {
        if (phaseRef.current !== "live") return; // recognition can end after the interview did
        // Clear old
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Start at 5
        let count = 5;
        setAutoSubmitCountdown(count);

        countdownIntervalRef.current = setInterval(() => {
            count--;
            if (count <= 0) {
                // Time's up
                clearInterval(countdownIntervalRef.current!);
                setAutoSubmitCountdown(null);
                submitResponse(true); // Pass flag to bypass stale state check if needed?
            } else {
                setAutoSubmitCountdown(count);
            }
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecordingRef.current) {
            try {
                (mediaRecorderRef.current as any).stop();
            } catch (e) {
                console.error("Error stopping recognition:", e);
            }
        }
    };

    const toggleMicMute = () => {
        const nextMuted = !isMicMutedRef.current;
        isMicMutedRef.current = nextMuted;
        setIsMicMuted(nextMuted);
        if (nextMuted && isRecordingRef.current) {
            stopRecording();
            cancelAutoSubmit();
        }
    };

    // Ref to access latest response in timer callback
    const userResponseRef = useRef(userResponse);
    useEffect(() => { userResponseRef.current = userResponse; }, [userResponse]);

    const submitResponse = async (fromTimer = false) => {
        cancelAutoSubmit(); // Stop timer if manual click

        const text = fromTimer ? userResponseRef.current : userResponse;
        if (!text.trim()) return;

        await processText(text);

        // Clearing
        _setUserResponse("");
    };

    const handleAudioEnd = () => {
        setTurn("idle");
        if (phaseRef.current === "live" && !isMicMutedRef.current) {
            startRecording();
        }
    };

    return {
        resumeText,
        setResumeText,
        phase,
        interviewStarted: phase === "live" || phase === "ending" || phase === "ended",
        isResumeSubmitting: phase === "starting",
        interviewEnded: phase === "ended",
        isRecording: status === "listening",
        isMicMuted,
        toggleMicMute,
        isProcessing: status === "processing",
        textToSpeak,
        audioSrc,
        status,
        timeLeft,
        startInterview,
        endInterview,
        toggleRecording,
        uploadResumeToS3,
        userResponse,       // Exposed
        setUserResponse,    // Exposed
        submitResponse,      // Exposed
        handleAudioEnd, // Exposed
        autoSubmitCountdown,
        cancelAutoSubmit,
        feedback,
        isEnding: phase === "ending",
        showEndConfirmation,
        openEndConfirmation,
        closeEndConfirmation
    };
};

