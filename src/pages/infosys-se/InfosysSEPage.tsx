import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowRight, ArrowUpRight, Check, ExternalLink, Lock } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import SePaymentPopup from "@/components/SePaymentPopup";
import { useSeAccess } from "@/hooks/useSeAccess";
import { toast } from "sonner";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { SE_LIST_PRICE, SE_PRICE, rememberSeUnlock, seCall, takeSeUnlock } from "@/lib/sePremium";
import {
  ELIGIBILITY, DOCUMENTS, ROUTES, STAGES, WHAT_DECIDES,
  TEST_SECTIONS, CAMPUS_VARIANT, TOPICS, TEST_RULES, INTERVIEW_CHECKS,
  INTRO_TEMPLATE, INTERVIEW_QA, UNSURE_ANSWER, PLAN, PLAN_HEADERS, FAQ,
  SE_GUIDE, SE_GUIDE_MAP, GUIDE_INSIDE,
} from "./data";

// ─── Shared styles (same vocabulary as Home and the coding questions page) ────
const DISPLAY = "font-display font-normal uppercase tracking-[0.005em]";
const SHEET = "bg-[var(--color-paper-3)] shadow-[var(--shadow-sheet)]";
const WRAP = "mx-auto w-full max-w-[1180px] px-4 sm:px-8";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]";
const BTN =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-[15px] font-semibold " +
  "rounded-full transition-[transform,box-shadow] duration-[120ms] " +
  `active:scale-[0.97] motion-reduce:transition-none ${FOCUS}`;
const BTN_FLAME = `${BTN} bg-[var(--color-accent)] text-[var(--color-ink)]`;
const BTN_PAPER = `${BTN} bg-[var(--color-paper-3)] text-[var(--color-ink)]`;
const BTN_INK = `${BTN} bg-[var(--color-ink)] !text-[var(--color-paper)]`;
const ACC_BOX = "bg-[var(--color-paper-3)] px-4 shadow-[var(--shadow-card)] sm:px-5";
const ACC_ITEM = "border-[var(--color-rule)]";
const ACC_TRIGGER = "py-4 text-left text-[15px] font-semibold leading-snug hover:no-underline";
const ACC_BODY = "text-[15px] leading-relaxed text-[var(--color-ink-2,var(--color-ink))]";

const NAV = [
  { id: "eligibility", label: "Eligibility" },
  { id: "stages", label: "Stages" },
  { id: "test", label: "The test" },
  { id: "topics", label: "Topics" },
  { id: "interview", label: "Interview" },
  { id: "plan", label: "Plan" },
  { id: "mock", label: "Mock test" },
  { id: "guide", label: "The guide" },
];

const price = SE_PRICE;
const TOTAL_MIN = TEST_SECTIONS.reduce((a, t) => a + t.min, 0);

const SectionHead = ({ id, num, title, lead }: { id: string; num: string; title: string; lead?: string }) => (
  <div id={id} className="scroll-mt-16" data-reveal>
    <div className="flex items-baseline gap-4">
      <p className={`${DISPLAY} text-5xl leading-none text-[var(--color-accent)] sm:text-6xl`}>
        {num}
      </p>
      <h2 className={`${DISPLAY} text-[clamp(1.9rem,3.6vw,3rem)] leading-[1]`}>{title}</h2>
    </div>
    {lead && <p className="mt-3 max-w-[70ch] text-base leading-snug">{lead}</p>}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InfosysSEPage() {
  const page = useRef<HTMLDivElement>(null);
  const { isSignedIn, getToken } = useAuth();
  const { access, loading, refresh } = useSeAccess();
  const [showPayment, setShowPayment] = useState(false);
  const [busy, setBusy] = useState<"" | "guide" | "resend">("");
  useGsapReveal(page);

  const owned = !loading && access;

  // Landing on /infosys-se#guide (after sign-up, or from a shared link): scroll to the buy section.
  useEffect(() => {
    if (window.location.hash === "#guide") {
      window.setTimeout(() => document.getElementById("guide")?.scrollIntoView({ block: "start" }), 300);
    }
  }, []);

  // Back from sign-up: open the checkout they asked for (or just clear the flag if they already own the pack).
  useEffect(() => {
    if (loading || !isSignedIn) return;
    if (takeSeUnlock(window.location.pathname) && !access) setShowPayment(true);
  }, [loading, isSignedIn, access]);

  const downloadGuide = async () => {
    setBusy("guide");
    try {
      const r = await seCall<{ url?: string }>("guide", getToken);
      if (!r.ok || !r.data.url) throw new Error(r.data.error || "The guide is not available yet. Please contact support.");
      window.location.href = r.data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not fetch the guide.");
    } finally {
      setBusy("");
    }
  };

  const emailGuide = async () => {
    setBusy("resend");
    try {
      const r = await seCall<{ result?: string }>("resend", getToken);
      if (r.status === 429) toast.message("Just sent. Give it a minute, then check your inbox and spam.");
      else if (!r.ok) throw new Error(r.data.error || "Could not send the email.");
      else if (r.data.result === "no_purchase") toast.message("There is no SE pack purchase on this account to email. Use Download the PDF instead.");
      else toast.success("Sent. Check your inbox (and spam) for the PDF.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the email.");
    } finally {
      setBusy("");
    }
  };

  const unlock = () => {
    if (!isSignedIn) {
      rememberSeUnlock(`${window.location.pathname}#guide`); // come back to the buy section
      window.location.href = "/login";
      return;
    }
    setShowPayment(true);
  };

  const BuyPrice = ({ className = "" }: { className?: string }) => (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-3xl leading-none tabular-nums">₹{price}</span>
      <span className="text-sm line-through tabular-nums opacity-70">₹{SE_LIST_PRICE}</span>
    </span>
  );

  return (
    <div ref={page} className={`min-h-screen bg-[var(--color-paper)] font-sans text-[var(--color-ink)] ${owned ? "" : "pb-24 sm:pb-0"}`}>
      <SEO
        title="Infosys System Engineer: Eligibility, Test Pattern and SE Playbook"
        description="Who can apply for Infosys SE, every hiring stage, what the test and interview ask, and a 53-page playbook with a full 54-question timed mock. ₹99."
        canonical="https://www.harrytheblaze.site/infosys-se"
      />

      {/* ── Top bar ── */}
      <header className="border-b border-[var(--color-rule)]">
        <div className={`${WRAP} flex items-center justify-between gap-4 py-3`}>
          <Link to={isSignedIn ? "/dashboard" : "/"} className={`inline-flex items-center gap-2.5 ${FOCUS}`}>
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className={`${DISPLAY} whitespace-nowrap text-lg sm:text-xl`}>Harry The Blaze</span>
          </Link>
          {owned ? (
            <Link to="/dashboard" className="text-[15px] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)]">
              Dashboard
            </Link>
          ) : (
            <button onClick={unlock} className={`${BTN_FLAME} !px-4 !py-2`}>
              Get the guide <BuyPrice className="[&>span:first-child]:!text-base" />
            </button>
          )}
        </div>
      </header>

      <main>
        {/* ══ Hero ══ */}
        <section className={`${WRAP} grid items-center gap-12 pb-12 pt-8 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-10`}>
          <div className="lg:col-span-7">
            <p data-intro className="inline-block bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold">
              Infosys · System Engineer
            </p>
            <h1 data-intro className={`${DISPLAY} mt-4 text-[clamp(2.9rem,7vw,6rem)] leading-[0.92]`}>
              Infosys SE. <em>Know every round.</em>
            </h1>
            <p data-intro className="mt-6 max-w-[40ch] text-[clamp(1.125rem,0.35vw+1rem,1.375rem)] leading-snug">
              Who can apply, what happens at each stage, what the test and the interview ask. Then the {SE_GUIDE.pages}-page guide that drills all of it.
            </p>
            <div data-intro className="mt-9 flex flex-col gap-5 sm:flex-row">
              {owned ? (
                <a href="#guide" className={BTN_FLAME}>
                  Open your guide <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <button onClick={unlock} className={BTN_FLAME}>
                  Get the guide <BuyPrice /> <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
              <a href="#eligibility" className={BTN_PAPER}>
                Read the free explainer
              </a>
            </div>
            <p data-intro className="mt-5 max-w-[46ch] text-xs leading-snug opacity-70">
              Independent prep material from candidate reports and Infosys notices. Not affiliated with or endorsed by Infosys.
            </p>
            <p data-intro className="mt-3 text-[15px]">
              New: a full 54-question mock with real section timers.{" "}
              <Link to="/infosys-se/mock" className="font-semibold underline underline-offset-4">Included with the Playbook</Link>
            </p>
          </div>

          {/* The ticket: the SE path in five lines */}
          <div className="relative mx-auto w-full max-w-[26rem] pb-6 pt-10 lg:col-span-5 lg:max-w-none lg:pt-0">
            <div
              aria-hidden
              data-drop="-3"
              data-parallax="-30"
              className="absolute inset-x-0 bottom-0 top-6 bg-[var(--color-accent)] shadow-[var(--shadow-sheet)] sm:inset-x-6"
            />
            <div data-drop="2" className={`${SHEET} relative lg:mx-4`}>
              <div className="flex items-start justify-between p-6 pb-5">
                <div>
                  <p className={`${DISPLAY} text-5xl sm:text-6xl`}>Admit one</p>
                  <p className="mt-2 text-[15px] text-[var(--color-muted)]">Infosys System Engineer</p>
                </div>
                <img src="/favicon.svg" alt="" className="h-14 w-14" />
              </div>
              <div className="relative border-t-2 border-dashed border-[var(--color-ink)]">
                <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[var(--color-paper)]" />
                <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[var(--color-paper)]" />
                <ol className="divide-y divide-[var(--color-rule)] p-6 pt-7">
                  {[
                    ["Online test", "54 Q · about 100 min"],
                    ["Interview", "15–30 min"],
                    ["Offer", "LOI, then offer letter"],
                    ["Training", "Mysuru, 4–6 months"],
                    ["2026 package", "₹3.6 LPA"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="text-[15px] text-[var(--color-muted)]">{k}</span>
                      <span className="text-right text-lg font-semibold">{v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Toner band */}
        <div className="bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className={`${WRAP} py-6 sm:py-8`}>
            <p data-reveal className={`${DISPLAY} text-[clamp(1.75rem,4vw,3rem)]`}>
              Five sections. Five cut-offs. {TOTAL_MIN} minutes.
            </p>
          </div>
        </div>

        {/* Section chips */}
        <nav aria-label="On this page" className="sticky top-0 z-[300] border-b border-[var(--color-rule)] bg-[var(--color-paper)]/95 backdrop-blur">
          <ul className={`${WRAP} flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]`}>
            {NAV.map((n) => (
              <li key={n.id} className="flex-shrink-0">
                <a
                  href={`#${n.id}`}
                  className={`block bg-[var(--color-paper-3)] px-3.5 py-2 text-sm font-semibold shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-accent)] ${FOCUS}`}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ══ 01 Eligibility ══ */}
        <section className={`${WRAP} pt-14 sm:pt-20`}>
          <SectionHead
            id="eligibility"
            num="01"
            title="Who can apply"
            lead="The 2026-cycle rules as stated in Infosys drive notices. Your own drive's notice is the final word, so read it before you apply."
          />
          <div data-reveal-group className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ELIGIBILITY.map((e) => (
              <div key={e.title} className={`${SHEET} p-5`}>
                <h3 className="text-lg font-semibold">{e.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-12">
            <div data-drop="-1" className="bg-[var(--color-accent)] p-5 shadow-[var(--shadow-sheet)] sm:p-6 lg:col-span-5">
              <h3 className={`${DISPLAY} text-2xl leading-none sm:text-3xl`}>Your marks must match your documents</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Infosys verifies every mark sheet during onboarding and background verification. A percentage typed wrongly on the
                application, for example a CGPA converted with the wrong formula, can delay or cancel an offer.
              </p>
            </div>
            <div data-reveal className={`${SHEET} p-5 sm:p-6 lg:col-span-7`}>
              <h3 className="text-lg font-semibold">Keep these ready before you apply</h3>
              <ul className="mt-3 sm:columns-2 sm:gap-6">
                {DOCUMENTS.map((d) => (
                  <li key={d} className="flex break-inside-avoid items-start gap-3 border-t border-[var(--color-rule)] py-2 text-sm leading-snug">
                    <span aria-hidden className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 border-[var(--color-ink)]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══ 02 Stages ══ */}
        <section className={`${WRAP} pt-14 sm:pt-20`}>
          <SectionHead
            id="stages"
            num="02"
            title="Hiring stages, step by step"
            lead="You can reach the SE test two ways. The test and interview are the same, only the invitation differs."
          />

          <div data-reveal-group className="mt-6 grid gap-4 md:grid-cols-2">
            {ROUTES.map((r) => (
              <div key={r.title} className={`${SHEET} p-5`}>
                <h3 className={`${DISPLAY} text-2xl leading-none`}>{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{r.steps}</p>
                <p className="mt-2 border-t border-[var(--color-rule)] pt-2 text-xs leading-snug text-[var(--color-muted)]">{r.note}</p>
              </div>
            ))}
          </div>

          <ol data-reveal-group className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STAGES.map((s) => (
              <li key={s.n} className={`${SHEET} flex flex-col p-4`}>
                <p className={`${DISPLAY} text-5xl leading-none`}>{s.n}</p>
                <h3 className="mt-2 text-base font-semibold leading-tight">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-snug">{s.detail}</p>
                <p className="mt-2 self-start bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold leading-snug">{s.gap}</p>
                <p className="mt-2 text-xs leading-snug text-[var(--color-muted)]">
                  <span className="font-semibold text-[var(--color-ink)]">While you wait: </span>
                  {s.meanwhile}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Timings come from 2024–26 candidate reports. Infosys does not publish them and they vary by drive.
          </p>

          <div className="mt-6 grid items-start gap-5 lg:grid-cols-12">
            <div data-reveal className={`${SHEET} lg:col-span-7`}>
              <div className="border-b-2 border-[var(--color-ink)] px-4 py-2.5">
                <h3 className={`${DISPLAY} text-2xl leading-none`}>What decides the result</h3>
              </div>
              <ul>
                {WHAT_DECIDES.map((w) => (
                  <li key={w.stage} className="grid gap-1 border-b border-[var(--color-rule)] px-4 py-3 last:border-b-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
                    <p className="text-sm font-semibold">{w.stage}</p>
                    <div>
                      <p className="text-sm leading-snug">{w.measured}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">{w.how}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal className="bg-[var(--color-ink)] p-5 text-[var(--color-paper)] sm:p-6 lg:col-span-5">
              <h3 className={`${DISPLAY} text-2xl leading-none sm:text-3xl`}>Infosys never charges a fee</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Real mail comes only from @infosys.com addresses. Infosys never interviews over chat apps and never asks for bank or card
                details. Check any offer at career.infosys.com/offerValidation.
              </p>
            </div>
          </div>
        </section>

        {/* ══ 03 Test ══ */}
        <section className={`${WRAP} pt-14 sm:pt-20`}>
          <SectionHead
            id="test"
            num="03"
            title="The online test"
            lead="Five timed sections. Each has its own timer and its own cut-off, and you cannot go back once a section closes."
          />

          <div className="mt-6 grid items-start gap-5 lg:grid-cols-12">
            <div data-reveal className={`${SHEET} lg:col-span-7`}>
              <div className="flex items-baseline justify-between gap-3 border-b-2 border-[var(--color-ink)] px-4 py-2.5">
                <h3 className={`${DISPLAY} text-2xl leading-none`}>Where the {TOTAL_MIN} minutes go</h3>
                <p className="text-xs text-[var(--color-muted)]">{TEST_SECTIONS.reduce((a, t) => a + t.q, 0)} questions</p>
              </div>
              <ul>
                {TEST_SECTIONS.map((t) => (
                  <li key={t.name} className="border-b border-[var(--color-rule)] px-4 py-2.5 last:border-b-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-[15px] font-semibold">{t.name}</p>
                      <p className="text-xs tabular-nums"><b className="font-semibold">{t.q}</b> Q · <b className="font-semibold">{t.min}</b> min</p>
                    </div>
                    <div className="mt-1.5 h-2 bg-[var(--color-paper-2)]" aria-hidden>
                      <div className="h-full bg-[var(--color-accent)]" style={{ width: `${(t.min / TOTAL_MIN) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{t.level}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5 lg:col-span-5">
              <div data-drop="-1" className="bg-[var(--color-accent)] p-5 shadow-[var(--shadow-sheet)]">
                <h3 className={`${DISPLAY} text-2xl leading-none sm:text-3xl`}>The cut-off rule</h3>
                <p className="mt-3 text-sm leading-relaxed">
                  Candidates consistently report sectional cut-offs. You must clear each section (reports put the bar between 60% and 75%
                  depending on the drive), not just the total. A brilliant maths score cannot rescue a weak verbal or pseudocode section.
                </p>
              </div>
              <div data-reveal className={`${SHEET} p-5`}>
                <h3 className="text-base font-semibold">Campus variant with grammar and essay</h3>
                <p className="mt-2 text-sm leading-relaxed">{CAMPUS_VARIANT}</p>
              </div>
            </div>
          </div>

          <div data-reveal className={`${SHEET} mt-5 p-5`}>
            <h3 className="text-base font-semibold">Rules that save marks</h3>
            <ul className="mt-2 sm:columns-2 sm:gap-8">
              {TEST_RULES.map((r) => (
                <li key={r} className="flex break-inside-avoid items-start gap-3 border-t border-[var(--color-rule)] py-2 text-sm leading-snug">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={3} aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ 04 Topics ══ */}
        <section className={`${WRAP} pt-14 sm:pt-20`}>
          <SectionHead
            id="topics"
            num="04"
            title="Topics, section by section"
            lead="What to expect in each section, from 2018–2025 candidate reports and old Infosys papers."
          />
          <div data-reveal-group className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <div key={t.section} className={`${SHEET} p-5`}>
                <h3 className={`${DISPLAY} text-2xl leading-none`}>{t.section}</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {t.topics.map((x) => (
                    <li key={x} className="bg-[var(--color-paper-2)] px-2 py-0.5 text-[13px]">{x}</li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-[var(--color-rule)] pt-2.5 text-[13px] leading-snug">{t.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 05 Interview ══ */}
        <section className={`${WRAP} pt-14 sm:pt-20`}>
          <SectionHead
            id="interview"
            num="05"
            title="The interview"
            lead="One conversation of 15–30 minutes, usually driven by your résumé. It mixes programming basics, OOP, DBMS, SDLC and HR. These are questions SE candidates reported."
          />

          <div className="mt-6 grid items-start gap-5 lg:grid-cols-12">
            <div data-reveal-group className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <div className={`${SHEET} p-5`}>
                <h3 className="text-base font-semibold">Can you be trained?</h3>
                <ul className="mt-2">
                  {INTERVIEW_CHECKS.trainable.map((x) => (
                    <li key={x} className="border-t border-[var(--color-rule)] py-2 text-sm leading-snug">{x}</li>
                  ))}
                </ul>
              </div>
              <div className={`${SHEET} p-5`}>
                <h3 className="text-base font-semibold">Will you fit the job?</h3>
                <ul className="mt-2">
                  {INTERVIEW_CHECKS.fit.map((x) => (
                    <li key={x} className="border-t border-[var(--color-rule)] py-2 text-sm leading-snug">{x}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[var(--color-ink)] p-5 text-[var(--color-paper)] sm:col-span-2">
                <h3 className={`${DISPLAY} text-2xl leading-none`}>If you don't know the answer</h3>
                <p className="mt-2 text-sm leading-relaxed">{UNSURE_ANSWER}</p>
              </div>
            </div>
            <div data-reveal className="bg-[var(--color-accent)] p-5 shadow-[var(--shadow-sheet)] lg:col-span-5">
              <h3 className={`${DISPLAY} text-2xl leading-none sm:text-3xl`}>Your 60-second introduction</h3>
              <p className="mt-3 text-sm leading-relaxed">{INTRO_TEMPLATE}</p>
              <p className="mt-2 text-xs">Keep it under a minute, skip family details unless asked, and end on something you are happy to be questioned about.</p>
            </div>
          </div>

          <div data-reveal className="mt-8">
            <h3 className={`${DISPLAY} mb-3 text-2xl leading-none sm:text-3xl`}>Questions candidates reported</h3>
            <Tabs defaultValue={INTERVIEW_QA[0].group}>
              <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-transparent p-0">
                {INTERVIEW_QA.map((g) => (
                  <TabsTrigger
                    key={g.group}
                    value={g.group}
                    className={`rounded-full bg-[var(--color-paper-3)] px-3 py-2 text-sm font-semibold shadow-[var(--shadow-card)] data-[state=active]:bg-[var(--color-ink)] data-[state=active]:text-[var(--color-paper)] data-[state=active]:shadow-none ${FOCUS}`}
                  >
                    {g.group}
                  </TabsTrigger>
                ))}
              </TabsList>
              {INTERVIEW_QA.map((g) => (
                <TabsContent key={g.group} value={g.group} className="mt-3">
                  <Accordion type="multiple" className={ACC_BOX}>
                    {g.items.map((it, i) => (
                      <AccordionItem key={it.q} value={`${g.group}-${i}`} className={ACC_ITEM}>
                        <AccordionTrigger className={ACC_TRIGGER}>{it.q}</AccordionTrigger>
                        <AccordionContent className={ACC_BODY}>{it.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* ══ 06 Plan ══ */}
        <section className={`${WRAP} pt-14 sm:pt-20`}>
          <SectionHead
            id="plan"
            num="06"
            title="A 4-week plan"
            lead="One block of topics per slot. Log every mistake in the mock and attack that section next."
          />
          <div data-reveal-group className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN.map((p) => (
              <div key={p.week} className={`${SHEET} p-5`}>
                <h3 className={`${DISPLAY} text-3xl leading-none`}>{p.week}</h3>
                <dl className="mt-3">
                  {[p.a, p.b, p.c].map((v, i) => (
                    <div key={i} className="border-t border-[var(--color-rule)] py-2">
                      <dt className="text-xs font-semibold text-[var(--color-muted)]">{PLAN_HEADERS[i]}</dt>
                      <dd className="text-sm leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <div data-reveal className="mt-10">
            <h3 className={`${DISPLAY} mb-3 text-2xl leading-none sm:text-3xl`}>Common questions</h3>
            <Accordion type="multiple" className={ACC_BOX}>
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className={ACC_ITEM}>
                  <AccordionTrigger className={ACC_TRIGGER}>{f.q}</AccordionTrigger>
                  <AccordionContent className={ACC_BODY}>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ══ Mock test ══ */}
        <section id="mock" className={`${WRAP} scroll-mt-16 pt-14 sm:pt-20`}>
          <div data-drop="-1" className="grid items-center gap-6 bg-[var(--color-accent)] p-6 shadow-[var(--shadow-sheet)] sm:p-9 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className={`${DISPLAY} text-[clamp(2.25rem,5vw,4rem)] leading-[0.98]`}>Sit the full SE mock.</h2>
              <p className="mt-4 max-w-[54ch] text-lg leading-snug">
                54 fresh questions in the real pattern, each section on its own timer, with a score against the reported cut-offs and an
                explanation for every answer. Included with the SE Playbook.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link to="/infosys-se/mock" className={BTN_INK}>
                Start the mock <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-3 text-sm">100 minutes · included with the Playbook</p>
            </div>
          </div>
        </section>

        {/* ══ The guide: the sale ══ */}
        <section id="guide" className="mt-14 scroll-mt-16 bg-[var(--color-ink)] text-[var(--color-paper)] sm:mt-20">
          <div className={`${WRAP} py-12 sm:py-16`}>
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <p className="inline-block bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">The prep guide</p>
                <h2 data-reveal className={`${DISPLAY} mt-3 text-[clamp(2.25rem,5vw,4rem)] leading-[0.98]`}>
                  Everything above, drilled until it's automatic.
                </h2>
                <p data-reveal className="mt-4 max-w-[52ch] text-base leading-snug">
                  This page tells you what the test asks. The guide gives you the questions, solved, for every section, plus the
                  interview answers and a full timed mock.
                </p>

                <ul data-reveal-group className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">
                  {GUIDE_INSIDE.map((g) => (
                    <li key={g.label} className="border-t-2 border-[var(--color-accent)] pt-3">
                      <p className={`${DISPLAY} text-4xl leading-none sm:text-5xl`}>{g.n}</p>
                      <p className="mt-1.5 text-xs leading-snug opacity-85">{g.label}</p>
                    </li>
                  ))}
                </ul>

                <Accordion type="single" collapsible className="mt-8 bg-[var(--color-paper-3)] px-4 text-[var(--color-ink)] rounded-[20px]">
                  <AccordionItem value="map" className="border-0">
                    <AccordionTrigger className="py-3.5 text-left text-[15px] font-semibold hover:no-underline">
                      What to read for SE: {SE_GUIDE_MAP.length} chapters
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul>
                        {SE_GUIDE_MAP.map((m) => (
                          <li key={m.part} className="flex items-start justify-between gap-4 border-t border-[var(--color-rule)] py-2.5">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-snug">{m.part}</p>
                              <p className="text-xs leading-snug text-[var(--color-muted)]">{m.what}</p>
                            </div>
                            <p className="whitespace-nowrap text-xs tabular-nums text-[var(--color-muted)]">{m.pages}</p>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Buy sheet */}
              <div className="lg:sticky lg:top-20 lg:col-span-5">
                <div data-drop="1" className="bg-[var(--color-accent)] p-6 text-[var(--color-ink)] shadow-[var(--shadow-sheet)] sm:p-8">
                  {owned ? (
                    <>
                      <p className={`${DISPLAY} text-4xl leading-none sm:text-5xl`}>You have access</p>
                      <p className="mt-3 text-base leading-snug">
                        Your Playbook was emailed to you when you paid. You can also download it here, or have it sent again.
                      </p>
                      <button onClick={downloadGuide} disabled={busy !== ""} className={`${BTN_INK} mt-6 w-full`}>
                        {busy === "guide" ? "Preparing your download…" : "Download the PDF"} <ExternalLink className="h-4 w-4" aria-hidden />
                      </button>
                      <button onClick={emailGuide} disabled={busy !== ""} className={`${BTN_PAPER} mt-3 w-full`}>
                        {busy === "resend" ? "Sending…" : "Email it to me again"}
                      </button>
                      <Link to="/infosys-se/mock" className={`${BTN_PAPER} mt-3 w-full`}>
                        Take the online mock <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className={`${DISPLAY} text-4xl leading-none sm:text-5xl`}>{SE_GUIDE.title}</p>
                      <p className="mt-5 flex items-baseline gap-3">
                        <span className="font-display text-[clamp(3.5rem,12vw,5.5rem)] leading-none tabular-nums">₹{price}</span>
                        <span className="text-xl line-through opacity-70 tabular-nums">₹{SE_LIST_PRICE}</span>
                      </p>
                      <p className="mt-2 text-sm font-semibold">One payment. No subscription, no renewal.</p>
                      <ul className="mt-5 divide-y divide-[var(--color-ink)]/25 border-y border-[var(--color-ink)]/25 text-[15px]">
                        {[
                          `The ${SE_GUIDE.pages}-page Playbook as a PDF, emailed to you the moment you pay`,
                          "Two timed half-mocks inside the PDF, plus a full 54-question online mock",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-3 py-3">
                            <Check className="mt-1 h-4 w-4 flex-shrink-0" strokeWidth={3} aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button onClick={unlock} disabled={loading} className={`${BTN_INK} mt-6 w-full disabled:opacity-60`}>
                        {isSignedIn ? `Unlock for ₹${price}` : "Sign up to unlock"}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </button>
                      <p className="mt-3 text-xs leading-snug">
                        Paid through Razorpay. See the{" "}
                        <Link to="/refund" className="underline underline-offset-2">refund policy</Link>.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className={`${WRAP} py-6`}>
          <p className="max-w-[70ch] text-xs leading-relaxed text-[var(--color-muted)]">
            Figures are from Infosys pages and candidate reports for the 2025–26 cycles, and Infosys changes patterns between drives, so
            follow your drive's own notice. Independent practice platform, not affiliated with or endorsed by Infosys.{" "}
            <Link to="/terms" className="underline">Terms and takedown requests</Link>
          </p>
          <Link to="/hackwithinfy" className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold underline underline-offset-4">
            Aiming for DSE or SP instead? <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </main>

      {/* Mobile buy bar */}
      {!owned && !loading && (
        <div className="fixed inset-x-0 bottom-0 z-[350] flex items-center justify-between gap-3 border-t-2 border-[var(--color-ink)] bg-[var(--color-paper)] px-4 py-3 sm:hidden">
          <BuyPrice />
          <button onClick={unlock} className={`${BTN_FLAME} !px-4 !py-2.5`}>
            <Lock className="h-4 w-4" aria-hidden /> Get the guide
          </button>
        </div>
      )}

      <SePaymentPopup isOpen={showPayment} onClose={() => setShowPayment(false)} onUnlocked={refresh} />
    </div>
  );
}
