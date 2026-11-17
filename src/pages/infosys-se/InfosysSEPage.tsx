import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronRight, ExternalLink, FileText,
  Lock, ShieldAlert, X, Loader2,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import PaymentPopup from "@/components/PaymentPopup";
import { PROMO_ACTIVE, PROMO_PRICE, REGULAR_PRICE } from "@/lib/promo";
import {
  INFY_BLUE, INFY_BG, INFY_BDR, GOLD, GOLD_BG, GOLD_BDR,
} from "../hackwithinfy/theme";
import {
  SNAPSHOT, ELIGIBILITY, DOCUMENTS, ROUTES, STAGES, WHAT_DECIDES,
  TEST_SECTIONS, CAMPUS_VARIANT, TOPICS, TEST_RULES, INTERVIEW_CHECKS,
  INTRO_TEMPLATE, INTERVIEW_QA, UNSURE_ANSWER, PLAN, PLAN_HEADERS, FAQ,
  SE_GUIDE, SE_GUIDE_MAP, SE_GUIDE_DRIVE_ID,
} from "./data";

const NAV = [
  { id: "eligibility", label: "Eligibility" },
  { id: "stages", label: "Hiring stages" },
  { id: "test", label: "The online test" },
  { id: "topics", label: "Topics" },
  { id: "interview", label: "Interview" },
  { id: "plan", label: "4-week plan" },
  { id: "resources", label: "Resources" },
];

const price = PROMO_ACTIVE ? PROMO_PRICE : REGULAR_PRICE;

// ─── Small building blocks ────────────────────────────────────────────────────
const Section = ({
  id, num, title, intro, children,
}: { id: string; num: string; title: string; intro?: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24 mb-14">
    <div className="flex items-baseline gap-3 mb-2">
      <span className="text-[11px] font-bold tracking-[0.3em] font-['Inter']" style={{ color: INFY_BLUE }}>
        {num}
      </span>
      <h2 className="text-2xl font-serif text-stone-800 tracking-tight">{title}</h2>
    </div>
    {intro && (
      <p className="text-stone-500 text-[13.5px] font-['Inter'] leading-relaxed max-w-2xl mb-6">{intro}</p>
    )}
    {children}
  </section>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl bg-white p-5 ${className}`}
    style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
  >
    {children}
  </div>
);

const Callout = ({
  tone = "blue", icon, title, children,
}: { tone?: "blue" | "gold"; icon?: React.ReactNode; title: string; children: React.ReactNode }) => {
  const c = tone === "gold" ? { fg: GOLD, bg: GOLD_BG, bd: GOLD_BDR } : { fg: INFY_BLUE, bg: INFY_BG, bd: INFY_BDR };
  return (
    <div className="rounded-2xl p-4 mt-5" style={{ background: c.bg, border: `1px solid ${c.bd}` }}>
      <div className="flex items-center gap-2 mb-1.5 font-['Inter'] font-semibold text-[13px]" style={{ color: c.fg }}>
        {icon}
        {title}
      </div>
      <div className="text-[13px] text-stone-600 font-['Inter'] leading-relaxed">{children}</div>
    </div>
  );
};

// ─── Guide viewer (same Drive-preview pattern as the HackWithInfy resources) ──
const GuideViewer = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(28,25,23,0.88)", backdropFilter: "blur(8px)" }}>
    <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: "#1c1917" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <FileText className="w-4 h-4 shrink-0" style={{ color: INFY_BLUE }} />
        <span className="text-white text-sm font-semibold font-['Inter'] truncate">{SE_GUIDE.title}</span>
      </div>
      <button
        onClick={onClose}
        aria-label="Close guide"
        className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-400 hover:text-white hover:bg-stone-700 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="flex-1 relative overflow-hidden">
      <iframe
        src={`https://drive.google.com/file/d/${SE_GUIDE_DRIVE_ID}/preview`}
        title={SE_GUIDE.title}
        className="absolute inset-0 w-full h-full border-0"
        style={{ background: "#525659" }}
      />
      {/* Covers Drive's pop-out button so the viewer stays inside the site */}
      <div className="absolute top-0 right-0 z-10" style={{ width: 120, height: 52 }} />
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const InfosysSEPage = () => {
  const navigate = useNavigate();
  const { isPremium, loading } = usePremiumStatus();
  const [showPayment, setShowPayment] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const guideReady = SE_GUIDE_DRIVE_ID.length > 0;

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#fcfcf9]">
        <div
          className="absolute top-0 left-0 w-full h-[400px]"
          style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,124,195,0.06) 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto px-5 sm:px-6 py-10 min-h-screen">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-[13px] font-medium font-['Inter'] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>

        {/* ══ Hero ══ */}
        <header className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.2em] uppercase font-['Inter'] mb-5"
            style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
          >
            Infosys · System Engineer
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-800 tracking-tight leading-[1.15] mb-3">
            Infosys System Engineer.
            <br />
            <span className="text-stone-400 font-light italic">Who can apply, what happens, what they ask.</span>
          </h1>
          <p className="text-stone-500 text-[0.9rem] font-['Inter'] font-light max-w-xl leading-relaxed">
            Read this top to bottom: eligibility, every hiring stage, the online test, the topics, the interview.
            The prep guide is at the end.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {SNAPSHOT.map((s) => (
            <Card key={s.label} className="!p-4">
              <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-stone-400 font-['Inter'] mb-1">{s.label}</div>
              <div className="text-[15px] font-bold text-stone-800 font-['Inter'] leading-tight mb-1">{s.value}</div>
              <div className="text-[11px] text-stone-400 font-['Inter'] leading-snug">{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Section nav */}
        <nav
          aria-label="On this page"
          className="sticky top-0 z-20 -mx-5 sm:mx-0 px-5 sm:px-0 py-3 mb-10 bg-[#fcfcf9]/90 backdrop-blur overflow-x-auto"
        >
          <ul className="flex gap-2 w-max">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className="inline-block px-3.5 py-1.5 rounded-full text-[12px] font-semibold font-['Inter'] text-stone-600 bg-white hover:text-stone-900 transition-colors"
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ══ 01 Eligibility ══ */}
        <Section
          id="eligibility"
          num="01"
          title="Eligibility"
          intro="The 2026-cycle rules as stated in Infosys drive notices. Your own drive's notice is the final word — read it before you apply."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {ELIGIBILITY.map((e) => (
              <Card key={e.title}>
                <h3 className="text-[13.5px] font-bold text-stone-800 font-['Inter'] mb-1.5">{e.title}</h3>
                <p className="text-[12.5px] text-stone-500 font-['Inter'] leading-relaxed">{e.body}</p>
              </Card>
            ))}
          </div>

          <Callout tone="gold" icon={<ShieldAlert className="w-4 h-4" />} title="Your marks must match your documents">
            Infosys verifies every mark sheet during onboarding and background verification. A percentage typed wrongly on the application
            (for example, CGPA converted with the wrong formula) can delay or cancel an offer.
          </Callout>

          <h3 className="text-[15px] font-bold text-stone-800 font-['Inter'] mt-8 mb-3">Keep these ready before you apply</h3>
          <ul className="space-y-2">
            {DOCUMENTS.map((d) => (
              <li key={d} className="flex gap-2.5 text-[13px] text-stone-600 font-['Inter'] leading-relaxed">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: INFY_BLUE }} />
                {d}
              </li>
            ))}
          </ul>
        </Section>

        {/* ══ 02 Stages ══ */}
        <Section
          id="stages"
          num="02"
          title="Hiring stages, step by step"
          intro="You can reach the SE test two ways. The test and interview are the same; only the way you get the invitation differs."
        >
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {ROUTES.map((r) => (
              <Card key={r.title}>
                <h3 className="text-[14px] font-bold text-stone-800 font-['Inter'] mb-2">{r.title}</h3>
                <p className="text-[12.5px] text-stone-600 font-['Inter'] leading-relaxed mb-2">{r.steps}</p>
                <p className="text-[12px] text-stone-400 font-['Inter'] leading-relaxed">{r.note}</p>
              </Card>
            ))}
          </div>

          <ol className="space-y-3">
            {STAGES.map((s) => (
              <li key={s.n}>
                <Card className="flex gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold font-['Inter']"
                    style={{ background: INFY_BG, color: INFY_BLUE, border: `1px solid ${INFY_BDR}` }}
                  >
                    {s.n}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-bold text-stone-800 font-['Inter'] mb-1">{s.title}</h3>
                    <p className="text-[12.5px] text-stone-600 font-['Inter'] leading-relaxed mb-2">{s.detail}</p>
                    <p className="text-[12px] font-['Inter'] font-semibold mb-1" style={{ color: INFY_BLUE }}>{s.gap}</p>
                    <p className="text-[12px] text-stone-500 font-['Inter'] leading-relaxed">
                      <span className="font-semibold text-stone-600">While you wait: </span>{s.meanwhile}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
          <p className="text-[11.5px] text-stone-400 font-['Inter'] mt-3">
            Timings come from 2024–26 candidate reports. Infosys does not publish them, and they vary by drive.
          </p>

          <h3 className="text-[15px] font-bold text-stone-800 font-['Inter'] mt-8 mb-3">What decides the result at each stage</h3>
          <div className="space-y-3">
            {WHAT_DECIDES.map((w) => (
              <Card key={w.stage} className="!p-4">
                <div className="text-[13px] font-bold text-stone-800 font-['Inter'] mb-1">{w.stage}</div>
                <div className="text-[12.5px] text-stone-600 font-['Inter'] leading-relaxed">{w.measured}</div>
                <div className="text-[12px] text-stone-400 font-['Inter'] mt-1">{w.how}</div>
              </Card>
            ))}
          </div>

          <Callout icon={<ShieldAlert className="w-4 h-4" />} title="Infosys never charges a fee">
            Real mail comes only from @infosys.com addresses. Infosys never interviews over chat apps and never asks for bank or card
            details during recruitment. Check any offer on the official page: career.infosys.com/offerValidation.
          </Callout>
        </Section>

        {/* ══ 03 Test ══ */}
        <Section
          id="test"
          num="03"
          title="The online test"
          intro="Five timed sections. Each has its own timer and its own cut-off, and you cannot go back once a section closes."
        >
          <div className="overflow-x-auto rounded-2xl bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
            <table className="w-full text-left text-[12.5px] font-['Inter'] min-w-[520px]">
              <thead>
                <tr className="text-stone-400 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Section</th>
                  <th className="px-4 py-3 font-semibold">Questions</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Difficulty reported</th>
                </tr>
              </thead>
              <tbody>
                {TEST_SECTIONS.map((t) => (
                  <tr key={t.name} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-semibold text-stone-800">{t.name}</td>
                    <td className="px-4 py-3 text-stone-600">{t.q}</td>
                    <td className="px-4 py-3 text-stone-600">{t.min} min</td>
                    <td className="px-4 py-3 text-stone-500">{t.level}</td>
                  </tr>
                ))}
                <tr className="border-t border-stone-200 bg-stone-50/60">
                  <td className="px-4 py-3 font-bold text-stone-800">Total</td>
                  <td className="px-4 py-3 font-bold text-stone-800">{TEST_SECTIONS.reduce((a, t) => a + t.q, 0)}</td>
                  <td className="px-4 py-3 font-bold text-stone-800">{TEST_SECTIONS.reduce((a, t) => a + t.min, 0)} min</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <Callout tone="gold" icon={<ShieldAlert className="w-4 h-4" />} title="The cut-off rule">
            Candidates consistently report sectional cut-offs — you must clear each section (reports put the bar between 60% and 75%
            depending on the drive), not just the total. A brilliant maths score cannot rescue a weak verbal or pseudocode section.
          </Callout>

          <h3 className="text-[15px] font-bold text-stone-800 font-['Inter'] mt-8 mb-2">Campus variant with grammar and essay</h3>
          <p className="text-[13px] text-stone-600 font-['Inter'] leading-relaxed">{CAMPUS_VARIANT}</p>

          <h3 className="text-[15px] font-bold text-stone-800 font-['Inter'] mt-8 mb-3">Rules that save marks</h3>
          <ul className="space-y-2">
            {TEST_RULES.map((r) => (
              <li key={r} className="flex gap-2.5 text-[13px] text-stone-600 font-['Inter'] leading-relaxed">
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" />
                {r}
              </li>
            ))}
          </ul>
        </Section>

        {/* ══ 04 Topics ══ */}
        <Section
          id="topics"
          num="04"
          title="Topics, section by section"
          intro="What to expect in each section, from 2018–2025 candidate reports and old Infosys papers."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {TOPICS.map((t) => (
              <Card key={t.section}>
                <h3 className="text-[14px] font-bold text-stone-800 font-['Inter'] mb-3">{t.section}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.topics.map((x) => (
                    <span
                      key={x}
                      className="px-2.5 py-1 rounded-full text-[11.5px] font-['Inter'] text-stone-600"
                      style={{ background: INFY_BG, border: `1px solid ${INFY_BDR}` }}
                    >
                      {x}
                    </span>
                  ))}
                </div>
                <p className="text-[12px] text-stone-500 font-['Inter'] leading-relaxed">{t.tip}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* ══ 05 Interview ══ */}
        <Section
          id="interview"
          num="05"
          title="The interview"
          intro="One conversation of 15–30 minutes, usually driven by your résumé. It mixes programming basics, OOP, DBMS, SDLC and HR. These are questions SE candidates reported."
        >
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <Card>
              <h3 className="text-[13.5px] font-bold text-stone-800 font-['Inter'] mb-2">Can you be trained?</h3>
              <ul className="space-y-1.5">
                {INTERVIEW_CHECKS.trainable.map((x) => (
                  <li key={x} className="text-[12.5px] text-stone-600 font-['Inter'] leading-relaxed">• {x}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="text-[13.5px] font-bold text-stone-800 font-['Inter'] mb-2">Will you fit the job?</h3>
              <ul className="space-y-1.5">
                {INTERVIEW_CHECKS.fit.map((x) => (
                  <li key={x} className="text-[12.5px] text-stone-600 font-['Inter'] leading-relaxed">• {x}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="mb-6">
            <h3 className="text-[13.5px] font-bold text-stone-800 font-['Inter'] mb-2">Your 60-second introduction</h3>
            <p className="text-[12.5px] text-stone-600 font-['Inter'] leading-relaxed mb-2">{INTRO_TEMPLATE}</p>
            <p className="text-[12px] text-stone-400 font-['Inter']">
              Keep it under a minute, skip family details unless asked, and end on something you are happy to be questioned about.
            </p>
          </Card>

          <div className="space-y-6">
            {INTERVIEW_QA.map((g) => (
              <div key={g.group}>
                <h3 className="text-[14px] font-bold text-stone-800 font-['Inter'] mb-2">{g.group}</h3>
                <Accordion type="multiple" className="rounded-2xl bg-white px-4" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                  {g.items.map((it, i) => (
                    <AccordionItem key={it.q} value={`${g.group}-${i}`} className="border-stone-100">
                      <AccordionTrigger className="text-left text-[13px] font-semibold font-['Inter'] text-stone-700 hover:no-underline">
                        {it.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-[12.5px] text-stone-500 font-['Inter'] leading-relaxed">
                        {it.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <Callout icon={<CheckCircle2 className="w-4 h-4" />} title="If you don't know the answer">
            {UNSURE_ANSWER}
          </Callout>
        </Section>

        {/* ══ 06 Plan ══ */}
        <Section
          id="plan"
          num="06"
          title="A 4-week plan for the SE test"
          intro="One block of topics per slot. Log every mistake in the mock and attack that section next."
        >
          <div className="overflow-x-auto rounded-2xl bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
            <table className="w-full text-left text-[12.5px] font-['Inter'] min-w-[600px]">
              <thead>
                <tr className="text-stone-400 text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Week</th>
                  {PLAN_HEADERS.map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN.map((p) => (
                  <tr key={p.week} className="border-t border-stone-100 align-top">
                    <td className="px-4 py-3 font-bold text-stone-800 whitespace-nowrap">{p.week}</td>
                    <td className="px-4 py-3 text-stone-600">{p.a}</td>
                    <td className="px-4 py-3 text-stone-600">{p.b}</td>
                    <td className="px-4 py-3 text-stone-600">{p.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ══ 07 FAQ ══ */}
        <section className="mb-14">
          <h2 className="text-xl font-serif text-stone-800 tracking-tight mb-4">Common questions</h2>
          <Accordion type="multiple" className="rounded-2xl bg-white px-4" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="border-stone-100">
                <AccordionTrigger className="text-left text-[13px] font-semibold font-['Inter'] text-stone-700 hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[12.5px] text-stone-500 font-['Inter'] leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ══ Resources ══ */}
        <Section
          id="resources"
          num="07"
          title="Your resources"
          intro="The full prep guide: solved questions for every test section, the interview answers, and the plan above."
        >
          <Card className="!p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: INFY_BG, border: `1px solid ${INFY_BDR}` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: INFY_BLUE }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold text-stone-800 font-['Inter']">{SE_GUIDE.title}</h3>
                <p className="text-[12.5px] text-stone-500 font-['Inter'] mt-1">
                  {SE_GUIDE.pages} pages · {SE_GUIDE.note}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 mt-5 text-stone-400 text-[13px] font-['Inter']">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking your access…
              </div>
            ) : isPremium ? (
              <div className="mt-5">
                {guideReady ? (
                  <button
                    onClick={() => setShowGuide(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-['Inter'] transition-transform hover:-translate-y-0.5"
                    style={{ background: INFY_BLUE }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open the guide
                  </button>
                ) : (
                  <p className="text-[12.5px] text-stone-500 font-['Inter']">
                    Your access is active. The guide is being added to this page — check back shortly.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: "#f5f5f4" }}>
                <div className="flex items-center gap-2 text-[13px] text-stone-600 font-['Inter']">
                  <Lock className="w-4 h-4 text-stone-400" />
                  Included with Premium
                  <span className="font-bold text-stone-800">₹{price}</span>
                  {PROMO_ACTIVE && <span className="line-through text-stone-400">₹{REGULAR_PRICE}</span>}
                </div>
                <button
                  onClick={() => setShowPayment(true)}
                  className="px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold font-['Inter'] transition-transform hover:-translate-y-0.5"
                  style={{ background: "#1c1917" }}
                >
                  Unlock for ₹{price}
                </button>
              </div>
            )}
          </Card>

          <h3 className="text-[14px] font-bold text-stone-800 font-['Inter'] mt-8 mb-3">What to read for SE</h3>
          <div className="rounded-2xl bg-white divide-y divide-stone-100" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
            {SE_GUIDE_MAP.map((m) => (
              <div key={m.part} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-stone-800 font-['Inter']">{m.part}</div>
                  <div className="text-[12px] text-stone-500 font-['Inter'] mt-0.5">{m.what}</div>
                </div>
                <div className="text-[11.5px] text-stone-400 font-['Inter'] whitespace-nowrap">{m.pages}</div>
              </div>
            ))}
          </div>
        </Section>

        <p className="text-[11.5px] text-stone-400 font-['Inter'] text-center pb-10">
          Figures are from official Infosys pages and candidate reports for the 2025–26 cycles. Infosys changes patterns between
          drives — always follow your drive's own notification.
        </p>
      </div>

      <PaymentPopup isOpen={showPayment} onClose={() => setShowPayment(false)} />
      {showGuide && guideReady && <GuideViewer onClose={() => setShowGuide(false)} />}
    </>
  );
};

export default InfosysSEPage;
