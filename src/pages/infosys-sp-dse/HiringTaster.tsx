import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  CODING_Q, CODING_SECONDS, INTERVIEW_Q, PROBLEMS, TASTER, scoreTaster, topicFor,
  type Answers, type TasterQ,
} from "./data";

const DISPLAY = "font-display font-normal uppercase tracking-[0.005em]";
const SHEET = "bg-[var(--color-paper-3)] shadow-[var(--shadow-sheet)]";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]";
const BTN =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-[15px] font-semibold " +
  "rounded-full transition-[transform,box-shadow] duration-[120ms] " +
  `active:scale-[0.97] motion-reduce:transition-none ${FOCUS}`;
const BTN_FLAME = `${BTN} bg-[var(--color-accent)] text-[var(--color-ink)]`;
const BTN_PAPER = `${BTN} bg-[var(--color-paper-3)] text-[var(--color-ink)]`;
const LETTERS = ["A", "B", "C", "D"];

type Phase = "intro" | "coding" | "interview" | "result";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Props = {
  /** Opens checkout, or sends a signed-out visitor to sign up first. */
  onUnlock: () => void;
  premium: boolean;
  priceLabel: string;
};

export default function HiringTaster({ onUnlock, premium, priceLabel }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [i, setI] = useState(0); // index into TASTER
  const [answers, setAnswers] = useState<Answers>({});
  const [picked, setPicked] = useState<number | null>(null); // chosen for the current question (locks it)
  const [left, setLeft] = useState(CODING_SECONDS);
  const endsAt = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);

  const q: TasterQ = TASTER[i];
  const inCoding = phase === "coding";

  const start = () => {
    track("sp_taster_start");
    setAnswers({});
    setPicked(null);
    setI(0);
    endsAt.current = Date.now() + CODING_SECONDS * 1000;
    setLeft(CODING_SECONDS);
    setPhase("coding");
  };

  const toInterview = useCallback(() => {
    setPicked(null);
    setI(CODING_Q.length);
    setPhase("interview");
  }, []);

  // The coding clock. A deadline timestamp keeps it honest if the tab was in the background.
  useEffect(() => {
    if (!inCoding) return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) { window.clearInterval(id); toInterview(); }
    }, 250);
    return () => window.clearInterval(id);
  }, [inCoding, toInterview]);

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setAnswers((a) => ({ ...a, [q.id]: idx }));
  };

  const next = () => {
    const last = i === TASTER.length - 1;
    if (last) {
      const r = scoreTaster({ ...answers });
      track("sp_taster_done", { coding: r.codingPoints, interview: r.interviewPoints, band: r.band, full: r.fullProblems });
      setPhase("result");
      return;
    }
    setPicked(null);
    if (i === CODING_Q.length - 1) setPhase("interview");
    setI(i + 1);
    topRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const result = phase === "result" ? scoreTaster(answers) : null;
  const problem = q.problem ? PROBLEMS[q.problem - 1] : null;
  const step = i + 1;

  return (
    <div ref={topRef} className={`${SHEET} p-5 sm:p-8`} aria-live="polite">
      {/* ── Intro ── */}
      {phase === "intro" && (
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className={`${DISPLAY} text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1]`}>Sit a 5-minute version of the process.</p>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed">
              Three coding problems, easy, medium and hard, on a {mmss(CODING_SECONDS)} clock. Then three interview questions. You pick the
              approach and trace one example for each problem, the way the first round rewards partial progress. No account needed.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button onClick={start} className={BTN_FLAME}>
                Start the taster <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <p className="text-sm text-[var(--color-muted)]">9 questions · about 5 minutes · your answers stay on this page</p>
            </div>
          </div>
          <ul className="grid gap-3 lg:col-span-5">
            {PROBLEMS.map((p) => (
              <li key={p.n} className="flex items-baseline justify-between gap-4 border-t border-[var(--color-rule)] pt-3">
                <span className="text-[15px] font-semibold">Problem {p.n} · {p.title}</span>
                <span className="text-sm text-[var(--color-muted)]">{p.level}</span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 border-t border-[var(--color-rule)] pt-3">
              <span className="text-[15px] font-semibold">Interview round</span>
              <span className="text-sm text-[var(--color-muted)]">3 quick questions</span>
            </li>
          </ul>
        </div>
      )}

      {/* ── A question ── */}
      {(phase === "coding" || phase === "interview") && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-rule)] pb-4">
            <p className="text-sm font-semibold">
              {inCoding ? "Round 1 · coding" : "Interview"} · question {step} of {TASTER.length}
            </p>
            {inCoding ? (
              <p className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold tabular-nums ${left <= 30 ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "bg-[var(--color-accent)]"}`}>
                <Clock className="h-4 w-4" aria-hidden />
                <span aria-label={`${left} seconds left`}>{mmss(left)}</span>
              </p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No clock here</p>
            )}
          </div>

          {problem && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-[var(--color-muted)]">Problem {problem.n} · {problem.level}</p>
              <p className="mt-1 text-xl font-semibold">{problem.title}</p>
              <p className="mt-2 max-w-[70ch] text-base leading-relaxed">{problem.statement}</p>
            </div>
          )}

          {q.context && (
            <p className="mt-4 inline-block bg-[var(--color-paper-2)] px-3 py-2 font-mono text-sm">{q.context}</p>
          )}
          <p className="mt-5 text-lg font-semibold leading-snug">{q.prompt}</p>

          <div role="radiogroup" aria-label={q.prompt} className="mt-4 grid gap-3">
            {q.options.map((o, idx) => {
              const locked = picked !== null;
              const isRight = idx === q.answer;
              const isPicked = picked === idx;
              const state = !locked ? "" : isRight ? "right" : isPicked ? "wrong" : "idle";
              return (
                <button
                  key={idx}
                  role="radio"
                  aria-checked={isPicked}
                  disabled={locked}
                  onClick={() => choose(idx)}
                  className={
                    `flex w-full items-start gap-3 border-2 px-4 py-3 text-left text-[15px] leading-snug transition-colors ${FOCUS} ` +
                    (state === "right" ? "border-[var(--color-ink)] bg-[var(--color-accent)]"
                      : state === "wrong" ? "border-[var(--color-ink)] bg-[var(--color-paper-2)] line-through decoration-[1.5px]"
                      : state === "idle" ? "border-[var(--color-rule)] opacity-60"
                      : "border-[var(--color-rule)] hover:border-[var(--color-ink)]")
                  }
                >
                  <span className="font-display text-lg leading-none">{LETTERS[idx]}</span>
                  <span className="flex-1">{o}</span>
                  {state === "right" && <Check className="mt-0.5 h-4 w-4 shrink-0" aria-label="Correct answer" />}
                  {state === "wrong" && <X className="mt-0.5 h-4 w-4 shrink-0" aria-label="Your answer, not correct" />}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="mt-5 border-l-[6px] border-[var(--color-accent)] bg-[var(--color-paper-2)] p-4">
              <p className="text-sm font-semibold">{picked === q.answer ? "Correct." : "Not quite."}</p>
              <p className="mt-1 text-[15px] leading-relaxed">{q.why}</p>
              <button onClick={next} className={`${BTN_FLAME} mt-4`}>
                {i === TASTER.length - 1 ? "See my result" : "Next"} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
          {inCoding && picked === null && (
            <button onClick={() => { next(); }} className="mt-5 text-sm underline underline-offset-4 hover:no-underline">
              Skip this one
            </button>
          )}
        </div>
      )}

      {/* ── Result ── */}
      {phase === "result" && result && (
        <div>
          <p className="text-sm font-semibold text-[var(--color-muted)]">Your taster result</p>
          <p className={`${DISPLAY} mt-1 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1]`}>
            {result.band === "sp" ? "You read it like an SP candidate."
              : result.band === "dse" ? "You read it like a DSE candidate."
              : "A good warm-up. Now build the base."}
          </p>
          <p className="mt-3 max-w-[64ch] text-base leading-relaxed">
            {result.fullProblems} of 3 coding problems fully right, and {result.interviewPoints} of {INTERVIEW_Q.length} interview questions. Candidates report that
            DSE shortlisting comes from solving the first two problems well and SP from solving all three. This taster only checks that you
            pick the right approach, not that you can code it under a three-hour clock, so treat it as a mirror and not a prediction.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {PROBLEMS.map((p, k) => {
              const pts = result.perProblem[k];
              const t = topicFor(p);
              return (
                <li key={p.n} className="bg-[var(--color-paper-2)] p-4">
                  <p className="text-sm text-[var(--color-muted)]">{p.level} · {p.title}</p>
                  <p className={`${DISPLAY} mt-1 text-4xl leading-none tabular-nums`}>{pts}/2</p>
                  <p className="mt-2 text-sm leading-snug">
                    {pts === 2 ? "Approach and trace both right."
                      : t ? <>Practise <b>{t.title}</b>: {t.count} questions in the full set.</> : "Practise this topic."}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Link to="/coding-questions" className={BTN_FLAME}>
              Practise the {premium ? "full set" : "first 50 free"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {!premium && (
              <button onClick={onUnlock} className={BTN_PAPER}>
                Unlock all questions · {priceLabel}
              </button>
            )}
            <button onClick={start} className="px-2 py-3 text-[15px] underline underline-offset-4 hover:no-underline">
              Take it again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
