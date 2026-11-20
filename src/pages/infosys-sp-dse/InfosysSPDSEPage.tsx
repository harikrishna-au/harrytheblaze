import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowRight, ArrowUpRight, Check, Lock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import PaymentPopup from "@/components/PaymentPopup";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { LIST_PRICE, PROMO_ACTIVE, PROMO_PRICE, REGULAR_PRICE } from "@/lib/promo";
import { rememberSeUnlock, takeSeUnlock } from "@/lib/sePremium";
import HiringTaster from "./HiringTaster";
import { FAQ, ROLES, ROUNDS, SCORING_NOTES, TIME_SPLIT, questionFacts } from "./data";

// ─── Shared styles (same vocabulary as /infosys-se and the coding questions page) ──
const DISPLAY = "font-display font-normal uppercase tracking-[0.005em]";
const SHEET = "bg-[var(--color-paper-3)] shadow-[var(--shadow-sheet)]";
const WRAP = "mx-auto w-full max-w-[1180px] px-4 sm:px-8";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]";
const BTN =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-[15px] font-semibold " +
  "shadow-[var(--shadow-offset)] transition-[transform,box-shadow] duration-[120ms] hover:translate-x-px hover:translate-y-px " +
  `hover:shadow-[3px_3px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none ${FOCUS}`;
const BTN_FLAME = `${BTN} bg-[var(--color-accent)] text-[var(--color-ink)]`;
const BTN_PAPER = `${BTN} bg-[var(--color-paper-3)] text-[var(--color-ink)]`;
const BTN_INK = `${BTN} bg-[var(--color-ink)] !text-[var(--color-paper)] !shadow-[4px_4px_0_var(--color-paper)]`;
const ACC_BOX = "bg-[var(--color-paper-3)] px-4 shadow-[var(--shadow-card)] sm:px-5";

const PAGE_URL = "https://www.harrytheblaze.site/infosys-sp-dse";
const NAV = [
  { id: "rounds", label: "Rounds" },
  { id: "scoring", label: "Scoring" },
  { id: "taster", label: "Try it" },
  { id: "questions", label: "The questions" },
  { id: "faq", label: "FAQ" },
];

const SectionHead = ({ id, num, title, lead }: { id: string; num: string; title: string; lead?: string }) => (
  <div id={id} className="scroll-mt-16" data-reveal>
    <div className="flex items-baseline gap-4">
      <p className={`${DISPLAY} text-5xl leading-none text-[var(--color-accent)] sm:text-6xl`} style={{ WebkitTextStroke: "1.5px var(--color-ink)" }}>
        {num}
      </p>
      <h2 className={`${DISPLAY} text-[clamp(1.9rem,3.6vw,3rem)] leading-[1]`}>{title}</h2>
    </div>
    {lead && <p className="mt-3 max-w-[70ch] text-base leading-snug">{lead}</p>}
  </div>
);

export default function InfosysSPDSEPage() {
  const page = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const { isPremium, loading } = usePremiumStatus();
  const [showPayment, setShowPayment] = useState(false);
  useGsapReveal(page);

  const facts = useMemo(() => questionFacts(), []);
  const price = PROMO_ACTIVE ? PROMO_PRICE : REGULAR_PRICE;
  const owned = !loading && isPremium;
  const maxTopic = facts.topics[0].count;

  // Landed here from a shared link or after sign-up: scroll to the unlock block.
  useEffect(() => {
    if (window.location.hash === "#unlock" || window.location.hash === "#taster") {
      const id = window.location.hash.slice(1);
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 300);
    }
  }, []);

  // Back from sign-up having asked to unlock: open checkout (once), unless they already have Premium.
  useEffect(() => {
    if (loading || !isSignedIn) return;
    if (takeSeUnlock(window.location.pathname) && !isPremium) setShowPayment(true);
  }, [loading, isSignedIn, isPremium]);

  // Signed-out visitors go to the login screen and come back here (unlock) or to the free questions (sign up).
  const unlock = () => {
    if (!isSignedIn) {
      rememberSeUnlock(`${window.location.pathname}#unlock`);
      window.location.href = "/login";
      return;
    }
    setShowPayment(true);
  };
  const signUp = () => {
    rememberSeUnlock("/coding-questions");
    window.location.href = "/login";
  };
  const signIn = () => {
    rememberSeUnlock("/coding-questions");
    window.location.href = "/login?mode=sign-in";
  };

  const Price = ({ className = "" }: { className?: string }) => (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-3xl leading-none tabular-nums">₹{price}</span>
      {price < LIST_PRICE && <span className="text-sm line-through tabular-nums opacity-70">₹{LIST_PRICE}</span>}
    </span>
  );

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div ref={page} className={`min-h-screen bg-[var(--color-paper)] font-sans text-[var(--color-ink)] ${owned ? "" : "pb-24 sm:pb-0"}`}>
      <SEO
        title="Infosys SP and DSE: Hiring Rounds, Scoring and Coding Questions"
        description="How Infosys SP and DSE hiring works: the rounds, how the coding test is scored, a free 5-minute taster, and 327 coding questions collected from people who got the roles."
        canonical={PAGE_URL}
        jsonLd={faqLd}
      />

      {/* ── Top bar ── */}
      <header className="border-b border-[var(--color-rule)]">
        <div className={`${WRAP} flex items-center justify-between gap-3 py-3`}>
          <Link to={isSignedIn ? "/dashboard" : "/"} className={`inline-flex items-center gap-2.5 ${FOCUS}`}>
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className={`${DISPLAY} hidden text-xl sm:inline`}>Harry The Blaze</span>
          </Link>
          {isSignedIn ? (
            <Link to="/dashboard" className="text-[15px] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)]">
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={signIn} className={`px-2 py-2 text-[15px] font-semibold underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-ink)] ${FOCUS}`}>
                Sign in
              </button>
              <button onClick={signUp} className={`${BTN_FLAME} !px-4 !py-2 !shadow-[3px_3px_0_var(--color-ink)]`}>
                Sign up free
              </button>
            </div>
          )}
        </div>
        <nav aria-label="On this page" className="border-t border-[var(--color-rule)]">
          <ul className={`${WRAP} flex gap-1 overflow-x-auto py-1.5 text-sm [scrollbar-width:none]`}>
            {NAV.map((n) => (
              <li key={n.id} className="shrink-0">
                <a href={`#${n.id}`} className={`inline-block px-3 py-1.5 underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-ink)] ${FOCUS}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        {/* ══ Hero ══ */}
        <section className={`${WRAP} grid items-center gap-12 pb-14 pt-8 lg:grid-cols-12 lg:gap-8 lg:pb-20 lg:pt-12`}>
          <div className="lg:col-span-7">
            <p data-intro className="inline-block bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold">
              Infosys · Specialist Programmer and Digital Specialist Engineer
            </p>
            <h1 data-intro className={`${DISPLAY} mt-4 text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.92]`}>
              Infosys SP and DSE. See how you get hired.
            </h1>
            <p data-intro className="mt-6 max-w-[44ch] text-[clamp(1.125rem,0.35vw+1rem,1.375rem)] leading-snug">
              The rounds, how the coding test is scored, and a 5-minute taster you can sit right now. Then {facts.total} coding questions
              collected from people who got the roles.
            </p>
            <div data-intro className="mt-9 flex flex-col gap-5 sm:flex-row">
              <a href="#taster" className={BTN_FLAME}>
                Try the free taster <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link to="/coding-questions" className={BTN_PAPER}>
                Open {facts.free} questions free
              </Link>
            </div>
            <p data-intro className="mt-5 max-w-[48ch] text-xs leading-snug opacity-70">
              Independent prep material from candidate reports. Not affiliated with or endorsed by Infosys. No account needed for the taster or the free questions.
            </p>
          </div>

          {/* The ticket: the whole path in four lines */}
          <div className="relative mx-auto w-full max-w-[26rem] pb-6 pt-10 lg:col-span-5 lg:max-w-none lg:pt-0">
            <div aria-hidden data-drop="-3" data-parallax="-30" className="absolute inset-x-0 bottom-0 top-6 bg-[var(--color-accent)] shadow-[var(--shadow-sheet)] sm:inset-x-6" />
            <div data-drop="2" className={`${SHEET} relative lg:mx-4`}>
              <div className="flex items-start justify-between p-6 pb-5">
                <div>
                  <p className={`${DISPLAY} text-5xl leading-none sm:text-6xl`}>Admit one</p>
                  <p className="mt-2 text-[15px] text-[var(--color-muted)]">Infosys SP and DSE</p>
                </div>
                <img src="/favicon.svg" alt="" className="h-14 w-14" />
              </div>
              <div className="relative border-t-2 border-dashed border-[var(--color-ink)]">
                <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[var(--color-paper)]" />
                <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[var(--color-paper)]" />
                <ol className="divide-y divide-[var(--color-rule)] p-6 pt-7">
                  {[
                    ["Round 1", "Online coding test"],
                    ["Round 2", "Advanced coding, on-site"],
                    ["Round 3", "Technical + HR interview"],
                    ["Offer", "DSE or SP L1"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-baseline justify-between gap-4 py-3.5">
                      <span className="text-[15px] text-[var(--color-muted)]">{k}</span>
                      <span className="text-right text-lg font-semibold">{v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 01 Roles + rounds ══ */}
        <section className={`${WRAP} pb-16 sm:pb-24`}>
          <SectionHead id="rounds" num="01" title="Two roles, three rounds" lead="What you are aiming at and the path that gets you there, as candidates report it for recent drives." />

          <ul data-reveal-group className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <li key={r.label} className={`${r.hero ? "bg-[var(--color-accent)] shadow-[var(--shadow-sheet)]" : SHEET} p-5`}>
                <p className="text-sm font-semibold">{r.label}</p>
                <p className={`${DISPLAY} mt-1 text-4xl leading-none tabular-nums`}>{r.lpa}</p>
                <p className="mt-2 text-sm leading-snug">{r.sub}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs opacity-70">Figures are as reported for recent drives and vary by year and campus. The offer letter is final.</p>

          <ol data-reveal-group className="mt-8 grid gap-4 lg:grid-cols-3">
            {ROUNDS.map((r) => (
              <li key={r.num} className={`${SHEET} p-6`}>
                <p className={`${DISPLAY} text-6xl leading-none`}>{r.num}</p>
                <h3 className="mt-3 text-xl font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">{r.badge}</p>
                <p className="mt-3 text-[15px] leading-relaxed">{r.desc}</p>
                <p className="mt-4 inline-block bg-[var(--color-paper-2)] px-2.5 py-1 text-xs font-semibold">{r.shortlists}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ══ 02 Scoring ══ */}
        <section className={`${WRAP} pb-16 sm:pb-24`}>
          <SectionHead id="scoring" num="02" title="How the first round is won" lead="Three hours, three problems. This is how candidates say to split the time and what earns marks." />
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-12">
            <div className={`${SHEET} lg:col-span-7`}>
              <table className="w-full text-left text-[15px]">
                <caption className="sr-only">Suggested time split for round 1</caption>
                <thead>
                  <tr className="border-b-2 border-[var(--color-ink)] text-sm">
                    <th scope="col" className="px-5 py-3 font-semibold">Problem</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Spend</th>
                    <th scope="col" className="hidden px-5 py-3 font-semibold sm:table-cell">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {TIME_SPLIT.map((t) => (
                    <tr key={t.p} className="border-b border-[var(--color-rule)] align-top last:border-0">
                      <th scope="row" className="px-5 py-4 font-semibold">{t.p}</th>
                      <td className="px-3 py-4 tabular-nums">{t.plan}</td>
                      <td className="hidden px-5 py-4 leading-snug sm:table-cell">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="grid gap-3 lg:col-span-5">
              {SCORING_NOTES.map((n) => (
                <li key={n} className="flex gap-3 text-[15px] leading-relaxed">
                  <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ══ 03 The taster ══ */}
        <section className={`${WRAP} pb-16 sm:pb-24`}>
          <SectionHead id="taster" num="03" title="Taste it before you buy anything" lead="A short version of the real thing, in your browser. No account, nothing saved, and the questions are original so you are not spoiling the set." />
          <div className="mt-8" data-reveal>
            <HiringTaster onUnlock={unlock} premium={owned} priceLabel={`₹${price}`} />
          </div>
        </section>

        {/* ══ 04 The questions ══ */}
        <section className={`${WRAP} pb-16 sm:pb-24`}>
          <SectionHead
            id="questions"
            num="04"
            title={`${facts.total} questions, ${facts.topics.length} topics`}
            lead={`Collected from a survey of people who got the SP and DSE roles, section by section. ${facts.leetcode} link to LeetCode and ${facts.gfg} to GeeksforGeeks, so you practise on the real judge.`}
          />

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-12">
            <div className={`${SHEET} p-6 sm:p-8 lg:col-span-7`}>
              <p className="text-sm font-semibold">How hard is it?</p>
              <div className="mt-3 flex h-5 w-full overflow-hidden border-2 border-[var(--color-ink)]" role="img" aria-label={`${facts.diff.Easy} easy, ${facts.diff.Medium} medium, ${facts.diff.Hard} hard`}>
                <span className="bg-[var(--color-paper-2)]" style={{ width: `${(facts.diff.Easy / facts.total) * 100}%` }} />
                <span className="bg-[var(--color-accent)]" style={{ width: `${(facts.diff.Medium / facts.total) * 100}%` }} />
                <span className="bg-[var(--color-ink)]" style={{ width: `${(facts.diff.Hard / facts.total) * 100}%` }} />
              </div>
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold tabular-nums">
                <span>{facts.diff.Easy} Easy</span><span>{facts.diff.Medium} Medium</span><span>{facts.diff.Hard} Hard</span>
                <span className="font-normal">· {facts.hardOrMediumPct}% are Medium or Hard</span>
              </p>

              <p className="mt-7 text-sm font-semibold">Where the questions sit</p>
              <ul className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {facts.topics.map((t) => (
                  <li key={t.id}>
                    <div className="flex items-baseline justify-between gap-3 text-[15px]">
                      <span>{t.title}</span>
                      <span className="font-semibold tabular-nums">{t.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-[var(--color-paper-2)]" aria-hidden>
                      <div className="h-full bg-[var(--color-ink)]" style={{ width: `${(t.count / maxTopic) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6 lg:col-span-5">
              <div className={`${SHEET} p-6`}>
                <p className="text-sm font-semibold">A taste: free questions you can open now</p>
                <ul className="mt-3 divide-y divide-[var(--color-rule)]">
                  {facts.samples.map((s) => (
                    <li key={s.title}>
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className={`group flex items-center justify-between gap-3 py-3 ${FOCUS}`}>
                        <span>
                          <span className="block text-[15px] font-semibold group-hover:underline underline-offset-4">{s.title}</span>
                          <span className="text-xs text-[var(--color-muted)]">{s.topic} · {s.difficulty}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[var(--color-accent)] p-6 shadow-[var(--shadow-sheet)]">
                <p className={`${DISPLAY} text-3xl leading-none`}>Free vs Premium</p>
                <ul className="mt-4 grid gap-2.5 text-[15px] leading-snug">
                  <li className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0" aria-hidden /> <span><b>Free:</b> {facts.free} questions, no card, no account.</span></li>
                  <li className="flex gap-2.5"><Lock className="mt-1 h-4 w-4 shrink-0" aria-hidden /> <span><b>Premium:</b> all {facts.total} questions with a progress checklist, the role-wise syllabus, previous-year questions, strategy notes and study resources.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 05 FAQ ══ */}
        <section className={`${WRAP} pb-16 sm:pb-24`}>
          <SectionHead id="faq" num="05" title="Straight answers" />
          <Accordion type="single" collapsible className={`${ACC_BOX} mt-8`}>
            {FAQ.map((f, k) => (
              <AccordionItem key={f.q} value={`f${k}`} className="border-[var(--color-rule)]">
                <AccordionTrigger className="py-4 text-left text-[15px] font-semibold leading-snug hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ══ Unlock ══ */}
        <section id="unlock" className="scroll-mt-4 bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className={`${WRAP} py-16 sm:py-24`}>
            <h2 data-reveal className={`${DISPLAY} max-w-[20ch] text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[0.95]`}>
              {owned ? "You have the full set. Go and practise." : `Open the other ${facts.total - facts.free}.`}
            </h2>
            <p className="mt-5 max-w-[52ch] text-lg leading-snug opacity-90">
              {owned
                ? "All the questions are open on your account."
                : `Start with the ${facts.free} that are free, or unlock all ${facts.total} with one payment. No subscription, no renewal.`}
            </p>

            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center">
              {owned ? (
                <Link to="/coding-questions" className={BTN_FLAME}>
                  Open all {facts.total} questions <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <>
                  <button onClick={unlock} className={`${BTN_FLAME} !shadow-[4px_4px_0_var(--color-paper)]`}>
                    Unlock all {facts.total} <Price /> <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                  {!isSignedIn && (
                    <>
                      <button onClick={signUp} className={BTN_INK + " !border-2 !border-[var(--color-paper)]"}>Sign up free</button>
                      <button onClick={signIn} className="px-2 py-3 text-[15px] font-semibold underline underline-offset-4 hover:no-underline">
                        I already have an account
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            {!owned && (
              <p className="mt-6 text-sm opacity-80">
                Not ready? <Link to="/coding-questions" className="font-semibold underline underline-offset-4">Open {facts.free} questions free</Link>, no account needed.
              </p>
            )}
            <p className="mt-10 max-w-[60ch] text-xs leading-snug opacity-70">
              Independent prep material built from candidate reports. Not affiliated with or endorsed by Infosys. We cannot promise a selection or a package.
              Check the official notice for your drive.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--color-paper)]">
        <div className={`${WRAP} flex flex-wrap items-center gap-x-6 gap-y-2 py-8 text-sm`}>
          <Link to="/" className="underline underline-offset-4 hover:no-underline">Home</Link>
          <Link to="/coding-questions" className="underline underline-offset-4 hover:no-underline">Coding questions</Link>
          <Link to="/hackwithinfy" className="underline underline-offset-4 hover:no-underline">HackWithInfy hub</Link>
          <Link to="/infosys-se" className="underline underline-offset-4 hover:no-underline">Infosys SE Playbook</Link>
          <Link to="/refund" className="underline underline-offset-4 hover:no-underline">Refund policy</Link>
        </div>
      </footer>

      {/* ── Sticky bar on phones, so the next step is always one tap away ── */}
      {!owned && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-3 pr-[4.75rem] sm:hidden">
          <div className="flex gap-3">
            <Link to="/coding-questions" className={`${BTN_PAPER} flex-1 !px-3 !py-3 !shadow-[3px_3px_0_var(--color-ink)]`}>Free {facts.free}</Link>
            <button onClick={unlock} className={`${BTN_FLAME} flex-[1.4] !px-3 !py-3 !shadow-[3px_3px_0_var(--color-ink)]`}>
              Unlock all · ₹{price}
            </button>
          </div>
        </div>
      )}

      <PaymentPopup isOpen={showPayment} onClose={() => setShowPayment(false)} />
    </div>
  );
}
