import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, ArrowRight, Check, Clock, Flag, Loader2, Lock, RotateCcw, X } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import SePaymentPopup from "@/components/SePaymentPopup";
import { useSeAccess } from "@/hooks/useSeAccess";
import { SE_LIST_PRICE, SE_PRICE, rememberSeUnlock, seCall, takeSeUnlock } from "@/lib/sePremium";
import type { MockQuestion, MockSection } from "./mockTypes";

// ─── Shared styles (same vocabulary as the rest of the site) ──────────────────
const DISPLAY = "font-display font-normal uppercase tracking-[0.005em]";
const SHEET = "bg-[var(--color-paper-3)] shadow-[var(--shadow-sheet)]";
const WRAP = "mx-auto w-full max-w-[1100px] px-4 sm:px-8";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]";
const BTN =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-[15px] font-semibold " +
  "shadow-[var(--shadow-offset)] transition-[transform,box-shadow] duration-[120ms] hover:translate-x-px hover:translate-y-px " +
  `hover:shadow-[3px_3px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none ${FOCUS}`;
const BTN_FLAME = `${BTN} bg-[var(--color-accent)] text-[var(--color-ink)]`;
const BTN_PAPER = `${BTN} bg-[var(--color-paper-3)] text-[var(--color-ink)]`;
const BTN_INK = `${BTN} bg-[var(--color-ink)] !text-[var(--color-paper)] !shadow-[4px_4px_0_var(--color-accent)]`;

const LETTERS = ["A", "B", "C", "D"];
const STORAGE_KEY = "se_mock_last_v1";

type Answers = Record<string, number>;
type Phase = "intro" | "running" | "between" | "result";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
// What the intro screen shows before anything is unlocked. The questions
// themselves are never in this file: they come from the server after purchase.
const SECTION_INFO = [
  { id: "maths", name: "Mathematical ability", minutes: 35, count: 10, blurb: "Long, multi-step questions. Bank the sure ones first." },
  { id: "reasoning", name: "Logical reasoning", minutes: 25, count: 15, blurb: "Sets first: one diagram pays 3–5 marks." },
  { id: "verbal", name: "Verbal ability", minutes: 20, count: 20, blurb: "About a minute a question. Reading comes last." },
  { id: "pseudocode", name: "Pseudocode", minutes: 10, count: 5, blurb: "Trace each program with a table of variables." },
  { id: "puzzles", name: "Puzzle solving", minutes: 10, count: 4, blurb: "Start with the puzzle you recognise." },
];
const totalQs = SECTION_INFO.reduce((n, s) => n + s.count, 0);
const totalMin = SECTION_INFO.reduce((n, s) => n + s.minutes, 0);

function scoreOf(section: MockSection, answers: Answers) {
  return section.questions.filter((q) => answers[q.id] === q.answer).length;
}

export default function InfosysSEMock() {
  const { isSignedIn, getToken } = useAuth();
  const { access, loading, refresh } = useSeAccess();
  const [showPayment, setShowPayment] = useState(false);
  const [sections, setSections] = useState<MockSection[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [loadError, setLoadError] = useState("");

  const plan = useMemo(() => sections ?? [], [sections]);

  // Back from sign-up: open the checkout they asked for (or just clear the flag if they already own the pack).
  useEffect(() => {
    if (loading || !isSignedIn) return;
    if (takeSeUnlock(window.location.pathname) && !access) setShowPayment(true);
  }, [loading, isSignedIn, access]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [sIdx, setSIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [endAt, setEndAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [taken, setTaken] = useState<string[]>([]); // ids of sections that were sat
  const [last, setLast] = useState<{ score: number; total: number; date: string } | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<MockSection[] | null>(null);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  const answersRef = useRef<Answers>({});
  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLast(JSON.parse(raw));
    } catch { /* storage blocked: fine */ }
  }, []);

  const section = plan[sIdx];
  const question = section?.questions[qIdx];
  const remaining = Math.max(0, Math.ceil((endAt - now) / 1000));

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const scrollTop = () => top.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const startSection = useCallback((i: number) => {
    setSIdx(i);
    setQIdx(0);
    setConfirming(false);
    setEndAt(Date.now() + plan[i].minutes * 60_000);
    setNow(Date.now());
    setPhase("running");
    window.setTimeout(scrollTop, 0);
  }, [plan]);

  const finishAll = useCallback((sat: string[]) => {
    setPhase("result");
    window.setTimeout(scrollTop, 0);
    // remember the last attempt on this device
    setTimeout(() => {
      try {
        const sat2 = (sectionsRef.current ?? []).filter((s) => sat.includes(s.id));
        const score = sat2.reduce((n, s) => n + scoreOf(s, answersRef.current), 0);
        const total = sat2.reduce((n, s) => n + s.questions.length, 0);
        const rec = { score, total, date: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
        setLast(rec);
      } catch { /* ignore */ }
    }, 0);
  }, []);

  const finishSection = useCallback(() => {
    const sat = [...taken, section.id];
    setTaken(sat);
    setConfirming(false);
    if (sIdx + 1 < plan.length) {
      setPhase("between");
      window.setTimeout(scrollTop, 0);
    } else {
      finishAll(sat);
    }
  }, [taken, section, sIdx, plan.length, finishAll]);

  // Time up: the section closes by itself, exactly like the real test.
  useEffect(() => {
    if (phase === "running" && remaining === 0 && endAt > 0) finishSection();
  }, [phase, remaining, endAt, finishSection]);

  const reset = () => {
    setPhase("intro"); setSIdx(0); setQIdx(0); setAnswers({}); setMarked({}); setTaken([]); setConfirming(false); setOnlyWrong(false);
    window.setTimeout(scrollTop, 0);
  };

  /** Pulls the questions from the server, which checks the purchase again. */
  const begin = async () => {
    setLoadError("");
    if (sections) return startSection(0);
    setFetching(true);
    try {
      const r = await seCall<{ sections?: MockSection[] }>("mock", getToken);
      if (!r.ok || !r.data.sections) throw new Error(r.data.error || "Could not load the mock. Please try again.");
      setSections(r.data.sections);
      sectionsRef.current = r.data.sections;
      // startSection reads `plan`, which updates on the next render, so start there.
      setSIdx(0); setQIdx(0); setConfirming(false);
      setEndAt(Date.now() + r.data.sections[0].minutes * 60_000);
      setNow(Date.now());
      setPhase("running");
      window.setTimeout(scrollTop, 0);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load the mock.");
    } finally {
      setFetching(false);
    }
  };

  const unlock = () => {
    if (!isSignedIn) {
      rememberSeUnlock(window.location.pathname);
      window.location.href = "/login";
      return;
    }
    setShowPayment(true);
  };

  const choose = (q: MockQuestion, i: number) =>
    setAnswers((a) => (a[q.id] === i ? (({ [q.id]: _drop, ...rest }) => rest)(a) : { ...a, [q.id]: i }));

  const answeredIn = (s: MockSection) => s.questions.filter((q) => answers[q.id] !== undefined).length;

  // ───────────────────────── render ─────────────────────────
  return (
    <div ref={top} className="min-h-screen bg-[var(--color-paper)] font-sans text-[var(--color-ink)]">
      <SEO
        title="Infosys SE mock test: 54 questions, real section timers | Harry The Blaze"
        description="A full-length Infosys System Engineer mock: maths, reasoning, verbal, pseudocode and puzzles, each with its own timer. Included with the SE Playbook."
        canonical="https://www.harrytheblaze.site/infosys-se/mock"
      />

      <header className="border-b border-[var(--color-rule)]">
        <div className={`${WRAP} flex items-center justify-between gap-4 py-3`}>
          <Link to="/infosys-se" className={`inline-flex items-center gap-2 text-[15px] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)] ${FOCUS}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> SE page
          </Link>
          <span className={`${DISPLAY} text-xl`}>SE Mock</span>
        </div>
      </header>

      {/* ══ INTRO ══ */}
      {phase === "intro" && (
        <main className={`${WRAP} py-10 sm:py-14`}>
          <p className="inline-block bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold">Infosys · System Engineer</p>
          <h1 className={`${DISPLAY} mt-4 text-[clamp(2.75rem,8vw,6rem)] leading-[0.92]`}>The full SE mock.</h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-snug">
            {totalQs} questions in the real pattern, each section on its own timer. When a section's time runs out it closes, and you
            cannot go back, just like the test.
          </p>

          <div className={`${SHEET} mt-10`}>
            <div className="flex items-baseline justify-between gap-3 border-b-2 border-[var(--color-ink)] px-4 py-3 sm:px-5">
              <h2 className={`${DISPLAY} text-3xl leading-none`}>Sections</h2>
              <p className="text-sm text-[var(--color-muted)]">{totalQs} questions · {totalMin} minutes</p>
            </div>
            <ul>
              {SECTION_INFO.map((s, i) => {
                const open = access;
                return (
                  <li key={s.id} className="flex items-start gap-4 border-b border-[var(--color-rule)] px-4 py-4 last:border-b-0 sm:px-5">
                    <span className={`${DISPLAY} w-9 flex-shrink-0 text-4xl leading-none`}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold leading-tight">{s.name}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{s.blurb}</p>
                    </div>
                    <div className="flex-shrink-0 text-right text-sm tabular-nums">
                      <p className="font-semibold">{s.count} Q · {s.minutes} min</p>
                      {open ? (
                        <p className="mt-1 inline-block bg-[var(--color-accent)] px-1.5 text-xs font-semibold">Open</p>
                      ) : (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-muted)]"><Lock className="h-3 w-3" aria-hidden /> SE pack</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className={`${SHEET} p-5 sm:p-6`}>
              <h3 className="text-lg font-semibold">The rules</h3>
              <ul className="mt-3 text-[15px] leading-snug">
                {[
                  "Each section has its own timer. Unused time does not carry over.",
                  "When time ends, or you submit, the section closes for good.",
                  "No negative marking has been reported for the SE test, so answer everything.",
                  "Mark questions for review inside a section, and clear an answer by tapping it again.",
                ].map((r) => (
                  <li key={r} className="flex gap-3 border-t border-[var(--color-rule)] py-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={3} aria-hidden />{r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[var(--color-accent)] p-5 shadow-[var(--shadow-sheet)] sm:p-6">
              <h3 className={`${DISPLAY} text-3xl leading-none`}>Be honest with yourself</h3>
              <p className="mt-3 text-[15px] leading-snug">
                Find a quiet spot, keep a rough sheet and a pen, and do not pause. Reported cut-offs sit between 60 % and 75 % in
                <b> every</b> section, so your weakest section matters most.
              </p>
              {last && (
                <p className="mt-4 border-t border-[var(--color-ink)]/30 pt-3 text-sm">
                  Last attempt on this device: <b>{last.score}/{last.total}</b> on {new Date(last.date).toLocaleDateString()}.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {access ? (
              <button disabled={loading || fetching} onClick={begin} className={BTN_FLAME}>
                {fetching ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading the mock</> : <>Start the full mock <ArrowRight className="h-4 w-4" aria-hidden /></>}
              </button>
            ) : (
              <button disabled={loading} onClick={unlock} className={BTN_FLAME}>
                <Lock className="h-4 w-4" aria-hidden /> Unlock the mock · ₹{SE_PRICE}
                <span className="text-sm line-through opacity-60">₹{SE_LIST_PRICE}</span>
              </button>
            )}
            {!access && !loading && (
              <p className="max-w-[40ch] text-sm leading-snug text-[var(--color-muted)]">
                Included with the SE Playbook: the PDF is emailed to you when you pay, and this mock opens straight away.
              </p>
            )}
          </div>
          {loadError && <p role="alert" className="mt-4 text-sm font-semibold">{loadError}</p>}
          <p className="mt-6 max-w-[70ch] text-xs leading-relaxed text-[var(--color-muted)]">
            Original practice questions written to match reported SE test types. Independent practice platform, not affiliated with or endorsed by Infosys.
          </p>
        </main>
      )}

      {/* ══ RUNNING ══ */}
      {phase === "running" && section && question && (
        <main className={`${WRAP} pb-16 pt-6`}>
          <div className="sticky top-0 z-[300] -mx-4 border-b-2 border-[var(--color-ink)] bg-[var(--color-paper)]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Section {sIdx + 1} of {plan.length}</p>
                <h1 className={`${DISPLAY} truncate text-2xl leading-none sm:text-3xl`}>{section.name}</h1>
              </div>
              <div
                role="timer"
                aria-live="off"
                className={`flex items-center gap-2 px-3.5 py-2 text-xl font-semibold tabular-nums shadow-[3px_3px_0_var(--color-ink)] ${
                  remaining <= 60 ? "bg-[var(--color-ink)] text-[var(--color-accent)]" : "bg-[var(--color-accent)]"
                }`}
              >
                <Clock className="h-5 w-5" aria-hidden /> {fmt(remaining)}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
            {/* Question */}
            <section aria-label={`Question ${qIdx + 1}`} className="min-w-0">
              {question.context && (
                <div className="mb-4 bg-[var(--color-paper-2)] p-4 text-[15px] leading-relaxed">
                  {question.contextTitle && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">{question.contextTitle}</p>}
                  <p className="whitespace-pre-line">{question.context}</p>
                </div>
              )}
              <div className={`${SHEET} p-5 sm:p-7`}>
                <div className="flex items-center gap-3">
                  <span className="bg-[var(--color-ink)] px-2 py-1 font-display text-lg leading-none text-[var(--color-paper)]">Q{qIdx + 1}</span>
                  <span className="text-sm font-semibold text-[var(--color-muted)]">{question.topic}</span>
                  {marked[question.id] && <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold"><Flag className="h-3.5 w-3.5" aria-hidden />Marked</span>}
                </div>
                <p className="mt-4 whitespace-pre-line text-[17px] leading-snug">{question.stem}</p>
                {question.code && (
                  <pre className="mt-4 overflow-x-auto bg-[var(--color-paper-2)] p-4 font-mono text-[14px] leading-relaxed">{question.code}</pre>
                )}
                <div role="radiogroup" aria-label="Options" className="mt-5 grid gap-2.5">
                  {question.options.map((o, i) => {
                    const on = answers[question.id] === i;
                    return (
                      <button
                        key={i}
                        role="radio"
                        aria-checked={on}
                        onClick={() => choose(question, i)}
                        className={`flex items-start gap-3 px-3.5 py-3 text-left text-[16px] leading-snug transition-[transform,box-shadow] duration-[120ms] ${FOCUS} ${
                          on
                            ? "bg-[var(--color-accent)] shadow-[3px_3px_0_var(--color-ink)]"
                            : "bg-[var(--color-paper)] shadow-[var(--shadow-card)] hover:-translate-y-px hover:bg-[var(--color-paper-2)]"
                        }`}
                      >
                        <span className={`mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center border-2 border-[var(--color-ink)] text-xs font-bold ${on ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : ""}`}>
                          {LETTERS[i]}
                        </span>
                        <span className="whitespace-pre-line">{o}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button disabled={qIdx === 0} onClick={() => setQIdx((i) => i - 1)} className={BTN_PAPER}>
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
                </button>
                <button
                  onClick={() => setMarked((m) => ({ ...m, [question.id]: !m[question.id] }))}
                  aria-pressed={!!marked[question.id]}
                  className={`${BTN_PAPER} ${marked[question.id] ? "!bg-[var(--color-ink)] !text-[var(--color-paper)]" : ""}`}
                >
                  <Flag className="h-4 w-4" aria-hidden /> {marked[question.id] ? "Marked" : "Mark for review"}
                </button>
                {qIdx + 1 < section.questions.length ? (
                  <button onClick={() => setQIdx((i) => i + 1)} className={`${BTN_FLAME} sm:ml-auto`}>
                    Next <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <button onClick={() => setConfirming(true)} className={`${BTN_INK} sm:ml-auto`}>
                    Submit section <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            </section>

            {/* Palette */}
            <aside aria-label="Question palette" className="lg:sticky lg:top-24 lg:self-start">
              <div className={`${SHEET} p-4`}>
                <p className="text-sm font-semibold">{answeredIn(section)} of {section.questions.length} answered</p>
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                  {section.questions.map((q, i) => {
                    const a = answers[q.id] !== undefined;
                    const cur = i === qIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setQIdx(i)}
                        aria-label={`Question ${i + 1}${a ? ", answered" : ""}${marked[q.id] ? ", marked" : ""}`}
                        aria-current={cur ? "true" : undefined}
                        className={`relative h-9 text-sm font-semibold tabular-nums ${FOCUS} ${
                          cur ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : a ? "bg-[var(--color-accent)]" : "bg-[var(--color-paper)] shadow-[inset_0_0_0_1.5px_var(--color-rule)]"
                        }`}
                      >
                        {i + 1}
                        {marked[q.id] && <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 bg-[var(--color-ink)] ring-2 ring-[var(--color-paper)]" />}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setConfirming(true)} className={`${BTN_INK} mt-4 w-full !py-2.5 !text-sm`}>Submit section</button>
              </div>
            </aside>
          </div>

          {confirming && (
            <div role="dialog" aria-modal="true" aria-label="Submit section" className="fixed inset-0 z-[400] flex items-center justify-center bg-[var(--color-ink)]/70 p-4">
              <div className={`${SHEET} w-full max-w-md p-6`}>
                <h2 className={`${DISPLAY} text-4xl leading-none`}>Submit this section?</h2>
                <p className="mt-3 text-base leading-snug">
                  You have answered <b>{answeredIn(section)}</b> of {section.questions.length}
                  {section.questions.length - answeredIn(section) > 0 && <> and left <b>{section.questions.length - answeredIn(section)}</b> blank</>}.
                  {Object.entries(marked).filter(([id, v]) => v && section.questions.some((q) => q.id === id)).length > 0 && " Some questions are marked for review."}
                  {" "}Once you submit, you cannot come back to this section.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button onClick={finishSection} className={BTN_INK}>Submit now</button>
                  <button onClick={() => setConfirming(false)} className={BTN_PAPER}>Keep going</button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ══ BETWEEN SECTIONS ══ */}
      {phase === "between" && plan[sIdx + 1] && (
        <main className={`${WRAP} py-14`}>
          <p className="inline-block bg-[var(--color-ink)] px-2.5 py-1 text-xs font-semibold text-[var(--color-paper)]">Section {sIdx + 1} submitted</p>
          <h1 className={`${DISPLAY} mt-4 text-[clamp(2.5rem,7vw,5rem)] leading-[0.95]`}>Take a breath.</h1>
          <p className="mt-4 max-w-[48ch] text-lg leading-snug">
            You answered {answeredIn(plan[sIdx])} of {plan[sIdx].questions.length} in {section.name}. That section is closed.
          </p>
          <div className={`${SHEET} mt-8 max-w-xl p-6`}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Up next</p>
            <h2 className={`${DISPLAY} mt-1 text-4xl leading-none`}>{plan[sIdx + 1].name}</h2>
            <p className="mt-2 text-base">{plan[sIdx + 1].questions.length} questions · {plan[sIdx + 1].minutes} minutes</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{plan[sIdx + 1].blurb}</p>
            <p className="mt-4 text-sm">The timer starts when you press the button.</p>
            <button onClick={() => startSection(sIdx + 1)} className={`${BTN_FLAME} mt-5`}>
              Start section {sIdx + 2} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </main>
      )}

      {/* ══ RESULT ══ */}
      {phase === "result" && renderResult()}

      <SePaymentPopup isOpen={showPayment} onClose={() => setShowPayment(false)} onUnlocked={refresh} />
    </div>
  );

  // ───────────────────────── result view ─────────────────────────
  function renderResult() {
    const sat = plan.filter((s) => taken.includes(s.id));
    const score = sat.reduce((n, s) => n + scoreOf(s, answers), 0);
    const total = sat.reduce((n, s) => n + s.questions.length, 0);
    const pct = total ? Math.round((score / total) * 100) : 0;

    const rows = sat.map((s) => {
      const sc = scoreOf(s, answers);
      const p = Math.round((sc / s.questions.length) * 100);
      return { s, sc, p };
    });
    const weakest = rows.length > 1 ? [...rows].sort((a, b) => a.p - b.p)[0] : null;
    const missedTopics = Array.from(new Set(
      sat.flatMap((s) => s.questions.filter((q) => answers[q.id] !== q.answer).map((q) => q.topic)),
    ));
    const zone = (p: number) => (p >= 75 ? "Above the reported 75 % bar" : p >= 60 ? "Inside the 60–75 % zone: tighten up" : "Below the reported 60 % bar");

    return (
      <main className={`${WRAP} py-10 sm:py-14`}>
        <p className="inline-block bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold">Your result</p>
        <div className="mt-4 grid items-end gap-6 lg:grid-cols-12">
          <h1 className={`${DISPLAY} text-[clamp(4rem,14vw,10rem)] leading-[0.85] lg:col-span-6`}>
            {score}<span className="text-[var(--color-muted)]">/{total}</span>
          </h1>
          <p className="max-w-[44ch] text-lg leading-snug lg:col-span-6">
            {pct}% overall. Overall is not what decides the SE test: every section has its own cut-off, so read the bars below.
          </p>
        </div>

        <div className={`${SHEET} mt-10`}>
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-[var(--color-ink)] px-4 py-3 sm:px-5">
            <h2 className={`${DISPLAY} text-3xl leading-none`}>Section by section</h2>
            <p className="text-xs text-[var(--color-muted)]">Lines mark the reported 60 % and 75 % cut-offs</p>
          </div>
          <ul>
            {rows.map(({ s, sc, p }) => (
              <li key={s.id} className="border-b border-[var(--color-rule)] px-4 py-4 last:border-b-0 sm:px-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-lg font-semibold">{s.name}</p>
                  <p className="tabular-nums"><b className="text-xl">{sc}</b>/{s.questions.length} · {p}%</p>
                </div>
                <div className="relative mt-2 h-4 bg-[var(--color-paper-2)]" role="img" aria-label={`${p} percent`}>
                  <div className={`h-full ${p >= 60 ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink)]"}`} style={{ width: `${p}%` }} />
                  <span aria-hidden className="absolute inset-y-0 w-px bg-[var(--color-ink)]" style={{ left: "60%" }} />
                  <span aria-hidden className="absolute inset-y-0 w-px bg-[var(--color-ink)]" style={{ left: "75%" }} />
                </div>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">{zone(p)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
          <div className="bg-[var(--color-accent)] p-5 shadow-[var(--shadow-sheet)] sm:p-6">
            <h3 className={`${DISPLAY} text-3xl leading-none`}>What to do next</h3>
            <p className="mt-3 text-[15px] leading-snug">
              {weakest ? <>Your weakest section is <b>{weakest.s.name}</b> ({weakest.p}%). Spend your next sessions there, then retake.</> : "Retake after a few days of focused practice and see how the score moves."}
            </p>
            {missedTopics.length > 0 && (
              <p className="mt-3 text-sm leading-snug"><b>Topics you missed:</b> {missedTopics.slice(0, 10).join(" · ")}{missedTopics.length > 10 ? ` · and ${missedTopics.length - 10} more` : ""}</p>
            )}
          </div>
          <div className={`${SHEET} p-5 sm:p-6`}>
            <h3 className={`${DISPLAY} text-3xl leading-none`}>Go again</h3>
            <p className="mt-3 text-[15px] leading-snug">Questions stay the same, so use the review below to learn the method first, then retake in a week.</p>
            <button onClick={reset} className={`${BTN_PAPER} mt-3`}><RotateCcw className="h-4 w-4" aria-hidden /> Back to the start</button>
          </div>
        </div>

        {/* Review */}
        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className={`${DISPLAY} text-4xl leading-none`}>Review and explanations</h2>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} className="h-4 w-4 accent-[var(--color-ink)]" />
            Show only the ones I missed
          </label>
        </div>

        <div className="mt-5 space-y-8">
          {sat.map((s) => {
            const qs = s.questions.map((q, i) => ({ q, i })).filter(({ q }) => !onlyWrong || answers[q.id] !== q.answer);
            if (!qs.length) return null;
            return (
              <div key={s.id}>
                <h3 className={`${DISPLAY} mb-3 text-2xl leading-none`}>{s.name}</h3>
                <Accordion type="multiple" className="bg-[var(--color-paper-3)] px-4 shadow-[var(--shadow-card)] sm:px-5">
                  {qs.map(({ q, i }) => {
                    const mine = answers[q.id];
                    const ok = mine === q.answer;
                    return (
                      <AccordionItem key={q.id} value={q.id} className="border-[var(--color-rule)]">
                        <AccordionTrigger className="gap-3 py-4 text-left hover:no-underline">
                          <span className="flex min-w-0 flex-1 items-start gap-3">
                            <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center ${ok ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink)] text-[var(--color-paper)]"}`}>
                              {ok ? <Check className="h-4 w-4" strokeWidth={3} aria-label="Correct" /> : <X className="h-4 w-4" strokeWidth={3} aria-label={mine === undefined ? "Blank" : "Wrong"} />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-[var(--color-muted)]">Q{i + 1} · {q.topic}</span>
                              <span className="block whitespace-pre-line text-[15px] font-semibold leading-snug">{q.stem.split("\n")[0]}</span>
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-[15px] leading-relaxed">
                          {q.context && <p className="mb-3 whitespace-pre-line bg-[var(--color-paper-2)] p-3 text-sm">{q.context}</p>}
                          {q.stem.includes("\n") && <p className="mb-3 whitespace-pre-line">{q.stem.split("\n").slice(1).join("\n")}</p>}
                          {q.code && <pre className="mb-3 overflow-x-auto bg-[var(--color-paper-2)] p-3 font-mono text-[13px]">{q.code}</pre>}
                          <p><b>Your answer:</b> {mine === undefined ? "Left blank" : `${LETTERS[mine]}. ${q.options[mine]}`}</p>
                          <p className="mt-1"><b>Correct:</b> {LETTERS[q.answer]}. {q.options[q.answer]}</p>
                          <p className="mt-3 border-t border-[var(--color-rule)] pt-3">{q.explain}</p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            );
          })}
        </div>
      </main>
    );
  }
}
