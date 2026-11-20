import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { SE_LIST_PRICE, SE_PRICE } from "@/lib/sePremium";
import { LIST_PRICE, PROMO_ACTIVE, PROMO_PRICE, REGULAR_PRICE } from "@/lib/promo";
import { CODING_TOPICS, FREE_COUNT, TOTAL_PROBLEMS } from "@/pages/coding-questions/data";
import { supabase } from "@/integrations/supabase/client";
import { joinNames, summariseExperts, type ConnectFacts } from "@/lib/connectStats";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { InstallAppButton } from "@/components/InstallAppButton";

const GAMES = [
  "Matrix (find the min)",
  "Balloon math",
  "Hidden maze",
  "Grid challenge",
  "Motion challenge",
  "Switch challenge",
  "Digit challenge",
  "BART risk game",
  "Inductive reasoning",
  "Dual task",
];

const STEPS = [
  { n: "1", title: "Pick a senior", body: "Browse people who were recently placed and see who matches the company you are preparing for." },
  { n: "2", title: "Choose a 20-minute slot and pay", body: "Payment goes through Razorpay. The price is set on our server, not in your browser." },
  { n: "3", title: "We send one meeting link", body: "The Connect team confirms the slot by hand and sends the same meeting link to you and the senior." },
];

const ALSO = [
  { title: "AI interview practice", body: "Run a mock interview and get through the awkward first attempts here, not in the real one.", to: "/ai-interview" },
  { title: "Radar job match", body: "Match your skill profile against open roles.", to: "/radar" },
  { title: "Company dashboard", body: "Start with Accenture 2026, with more MNCs after that.", to: "/dashboard" },
];

// Everything below about the coding set is counted from the data, so the page can never drift from the product.
const CQ = (() => {
  const diff = { Easy: 0, Medium: 0, Hard: 0 };
  CODING_TOPICS.forEach((t) => t.problems.forEach((p) => { diff[p.difficulty]++; }));
  const top = [...CODING_TOPICS].sort((a, b) => b.problems.length - a.problems.length).slice(0, 6);
  return { diff, top, topics: CODING_TOPICS.length };
})();
const PREMIUM_PRICE = PROMO_ACTIVE ? PROMO_PRICE : REGULAR_PRICE;

// Paper physics: sheets lift off the board, controls sit on a hard ink offset and drop into it.
const SHEET = "bg-[var(--color-paper-3)] shadow-[var(--shadow-sheet)]";
const BTN =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 text-[15px] font-semibold text-[var(--color-ink)] " +
  "shadow-[var(--shadow-offset)] transition-[transform,box-shadow] duration-[120ms] ease-out " +
  "hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_var(--color-ink)] " +
  "active:translate-x-1 active:translate-y-1 active:shadow-none " +
  "motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]";
const BTN_PRIMARY = `${BTN} bg-[var(--color-accent)]`;
const BTN_SECONDARY = `${BTN} bg-[var(--color-paper-3)]`;
const BTN_INK = `${BTN} bg-[var(--color-ink)] !text-[var(--color-paper)] shadow-[4px_4px_0_var(--color-accent)]`;

const DISPLAY = "font-display font-normal uppercase leading-[0.95] tracking-[0.005em] [overflow-wrap:break-word] [text-wrap:balance]";
const WRAP = "mx-auto w-full max-w-[1360px] px-4 sm:px-8 lg:px-12";
const NAV_LINK =
  "whitespace-nowrap px-3 py-2 text-[15px] text-[var(--color-ink)] underline decoration-transparent underline-offset-4 hover:decoration-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

export default function Home() {
  const { isSignedIn } = useAuth();
  const primaryTo = isSignedIn ? "/dashboard" : "/login";
  const page = useRef<HTMLDivElement>(null);
  useGsapReveal(page);

  // Live facts about the Connect seniors (totals only). If it fails, the page just uses the general wording.
  const [connect, setConnect] = useState<ConnectFacts | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase as any).from("experts").select("company,price_inr").eq("approved", true);
        if (!cancelled && !error && Array.isArray(data) && data.length) setConnect(summariseExperts(data));
      } catch { /* keep the fallback wording */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div ref={page} className="min-h-screen bg-[var(--color-paper)] font-sans text-[var(--color-ink)]">
      <SEO
        title="Harry The Blaze | Placement Practice for Infosys and Accenture"
        description="Practise real placement rounds: cognitive games, communication tests, AI mock interviews and Infosys coding questions. Then book a 1:1 with someone just placed."
      />

      {/* Nav: a sheet of copy paper on the board */}
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
        <div className={`${SHEET} mx-auto flex h-14 max-w-[1360px] items-center justify-between gap-2 px-3 sm:px-5`}>
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className={`${DISPLAY} text-xl max-[400px]:sr-only`}>Harry the Blaze</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
            <Link to="/infosys-sp-dse" className={NAV_LINK}>SP and DSE</Link>
            <Link to="/infosys-se" className={NAV_LINK}>Infosys SE</Link>
            <a href="#rounds" className={NAV_LINK}>Practice</a>
            <a href="#connect" className={NAV_LINK}>Connect 1:1</a>
            <a href="#pricing" className={NAV_LINK}>Pricing</a>
            <Link to="/blog" className={NAV_LINK}>Blog</Link>
          </nav>
          <div className="flex items-center gap-1">
            {!isSignedIn && (
              <Link to="/login" className={`${NAV_LINK} whitespace-nowrap font-medium`}>
                Sign in
              </Link>
            )}
            <Link
              to={primaryTo}
              className="whitespace-nowrap bg-[var(--color-accent)] px-4 py-2 text-[15px] font-semibold text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition-[transform,box-shadow] duration-[120ms] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_var(--color-ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
            >
              {isSignedIn ? "Dashboard" : "Get started"}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: the headline on the board, the ticket as the paste-up. The lead offer is the SP and DSE coding set. */}
        <section className={`${WRAP} grid items-center gap-12 pb-20 pt-12 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-16`}>
          <div className="lg:col-span-7">
            <h1 data-intro className={`${DISPLAY} text-[clamp(3.25rem,9vw,8rem)] leading-[0.92]`}>Practice the real rounds.</h1>
            <p data-intro className="mt-6 max-w-[40ch] text-[clamp(1.125rem,0.35vw+1rem,1.375rem)] leading-snug">
              Infosys SP and DSE coding questions, SE test prep, placement games and calls with people just placed.
            </p>
            <div data-intro className="mt-9 flex flex-col gap-5 sm:flex-row">
              <Link to="/coding-questions" className={BTN_PRIMARY}>
                Try {FREE_COUNT} coding questions free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/infosys-se" className={BTN_SECONDARY}>
                Infosys SE Playbook · ₹{SE_PRICE}
              </Link>
            </div>
            <p data-intro className="mt-4 text-sm text-[var(--color-muted)]">The free questions need no card and no sign-up.</p>
          </div>

          {/* The ticket: the real numbers of the lead offer */}
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
                  <p className="mt-2 text-[15px] text-[var(--color-muted)]">Infosys SP and DSE</p>
                </div>
                <img src="/favicon.svg" alt="" className="h-14 w-14" />
              </div>
              <div className="relative border-t-2 border-dashed border-[var(--color-ink)]">
                <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[var(--color-paper)]" />
                <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[var(--color-paper)]" />
                <ol className="divide-y divide-[var(--color-rule)] p-6 pt-7">
                  {[
                    ["Coding questions", String(TOTAL_PROBLEMS)],
                    ["Topics", String(CQ.topics)],
                    ["Free to open", String(FREE_COUNT)],
                    ["Lifetime Premium", `₹${PREMIUM_PRICE} once`],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-baseline justify-between gap-4 py-3.5">
                      <span className="text-[15px] text-[var(--color-muted)]">{k}</span>
                      <span className="num text-right text-lg font-semibold">{v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Infosys SP and DSE coding questions: the lead offer, so the biggest and loudest block */}
        <section aria-labelledby="spdse-title" className={`${WRAP} -mt-4 pb-14 sm:pb-16`}>
          <div data-drop="-1" className="grid gap-8 bg-[var(--color-accent)] p-6 shadow-[var(--shadow-sheet)] sm:p-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <span className="inline-block bg-[var(--color-ink)] px-2.5 py-1 text-xs font-semibold text-[var(--color-paper)]">Infosys SP and DSE</span>
              <h2 id="spdse-title" className={`${DISPLAY} mt-4 text-[clamp(2.5rem,5.5vw,4.75rem)]`}>
                {TOTAL_PROBLEMS} coding questions for the Infosys SP and DSE test.
              </h2>
              <p className="mt-5 max-w-[54ch] text-lg leading-snug">
                Collected from people who got the roles, section by section, with a direct link for every question. Open {FREE_COUNT} free.
              </p>

              <div className="mt-7" role="img" aria-label={`${CQ.diff.Easy} easy, ${CQ.diff.Medium} medium, ${CQ.diff.Hard} hard questions`}>
                <div className="flex h-5 w-full overflow-hidden border-2 border-[var(--color-ink)]">
                  <span className="bg-[var(--color-paper-3)]" style={{ width: `${(CQ.diff.Easy / TOTAL_PROBLEMS) * 100}%` }} />
                  <span className="bg-[var(--color-ink)]/45" style={{ width: `${(CQ.diff.Medium / TOTAL_PROBLEMS) * 100}%` }} />
                  <span className="bg-[var(--color-ink)]" style={{ width: `${(CQ.diff.Hard / TOTAL_PROBLEMS) * 100}%` }} />
                </div>
                <p className="num mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                  <span>{CQ.diff.Easy} Easy</span><span>{CQ.diff.Medium} Medium</span><span>{CQ.diff.Hard} Hard</span>
                  <span className="font-normal">· {Math.round(((CQ.diff.Medium + CQ.diff.Hard) / TOTAL_PROBLEMS) * 100)}% are Medium or Hard</span>
                </p>
              </div>

              <ul className="mt-5 flex flex-wrap gap-2">
                {CQ.top.map((t) => (
                  <li key={t.id} className="num bg-[var(--color-paper-3)] px-2.5 py-1 text-sm font-semibold">
                    {t.title} {t.problems.length}
                  </li>
                ))}
                <li className="px-1 py-1 text-sm">+ {CQ.topics - CQ.top.length} more topics</li>
              </ul>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to="/coding-questions" className={BTN_INK}>
                  Open {FREE_COUNT} questions free
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <p className="num text-sm">Or unlock all {TOTAL_PROBLEMS}: <b>₹{PREMIUM_PRICE}</b> lifetime Premium, once.</p>
              </div>
              <p className="mt-5 text-sm font-semibold">
                <Link to="/infosys-sp-dse#taster" className="underline underline-offset-4 hover:no-underline">
                  Not sure yet? See how SP and DSE hiring works and take a 5-minute taster
                </Link>
              </p>
            </div>

            <div className="self-start bg-[var(--color-paper-3)] p-6 text-[var(--color-ink)] shadow-[var(--shadow-offset)] sm:p-8 lg:col-span-5">
              <p className={`${DISPLAY} text-3xl`}>What Premium unlocks</p>
              <ul className="mt-4 divide-y divide-[var(--color-rule)] text-base">
                {[
                  `All ${TOTAL_PROBLEMS} questions, each with a direct link`,
                  "A progress checklist saved to your account",
                  "Levels 3 to 6 in the games and the full communication rounds",
                  "The AI mock interview, resume builder and job match",
                  "One payment. No subscription, no renewal",
                ].map((x) => (
                  <li key={x} className="py-3 leading-snug">{x}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-[var(--color-muted)]">Community-reported practice material, not official. Not affiliated with Infosys.</p>
            </div>
          </div>
        </section>

        {/* 2. Infosys SE Playbook: the second offer, a calmer sheet */}
        <section aria-labelledby="infosys-se-title" className={`${WRAP} pb-20 sm:pb-28`}>
          <div className={`${SHEET} grid items-center gap-6 border-l-[10px] border-[var(--color-accent)] p-6 sm:p-9 lg:grid-cols-12`}>
            <div className="lg:col-span-8">
              <p className="text-sm font-semibold text-[var(--color-muted)]">Preparing for the System Engineer test instead?</p>
              <h2 id="infosys-se-title" className={`${DISPLAY} mt-2 text-[clamp(2rem,4vw,3.5rem)]`}>
                The Infosys SE Playbook. ₹{SE_PRICE}.
              </h2>
              <p className="mt-3 max-w-[58ch] text-lg leading-snug">
                30 ranked formula cards, 86 solved questions, two timed half-mocks, a full 54-question online mock and the interview
                answers.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link to="/infosys-se" className={BTN_INK}>
                See the SE Playbook
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-3 text-sm">
                <span className="line-through opacity-70">₹{SE_LIST_PRICE}</span> · one payment, PDF to your inbox
              </p>
            </div>
          </div>
        </section>

        {/* Toner band: the game list, counted from the list itself */}
        <div className="bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className={`${WRAP} py-10 sm:py-14`}>
            <p data-reveal className={`${DISPLAY} max-w-[26ch] text-[clamp(2.25rem,5.5vw,4.75rem)] sm:max-w-none`}>
              Ten games. Two communication sets. One senior on the call.
            </p>
          </div>
        </div>

        {/* Rounds: two sheets */}
        <section id="rounds" className={`${WRAP} py-24 sm:py-32`}>
          <h2 data-reveal className={`${DISPLAY} max-w-[18ch] text-[clamp(2.5rem,6vw,5rem)]`}>Two kinds of rounds. Both practiced under time.</h2>
          <p className="mt-5 max-w-[48ch] text-lg">Start with the round you are actually facing, not a feature tour.</p>

          <div data-reveal-group className="mt-12 grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className={`${SHEET} p-6 sm:p-9 lg:col-span-7`}>
              <p className={`${DISPLAY} text-7xl sm:text-8xl`}>01</p>
              <h3 className="mt-4 text-2xl font-semibold">Cognitive games</h3>
              <p className="mt-2 max-w-[44ch] text-lg leading-relaxed">
                The game-based aptitude round, played the way it is played on test day.
              </p>
              <ul data-reveal-group className="mt-8 grid gap-x-8 sm:grid-cols-2">
                {GAMES.map((g) => (
                  <li key={g} className="border-t border-[var(--color-rule)] py-3 text-base">{g}</li>
                ))}
              </ul>
            </div>
            <div className={`${SHEET} p-6 sm:p-9 lg:col-span-5 lg:mt-12`}>
              <p className={`${DISPLAY} text-7xl sm:text-8xl`}>02</p>
              <h3 className="mt-4 text-2xl font-semibold">Communication rounds</h3>
              <p className="mt-2 text-lg leading-relaxed">
                Speaking, writing and fluency tasks with a clock running, so the timing stops being a surprise.
              </p>
              <p className="mt-8 border-t border-[var(--color-rule)] pt-4 text-base leading-relaxed text-[var(--color-muted)]">
                Two sets of communication rounds are available, plus AI mock interviews when you want to rehearse speaking
                out loud.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Connect: the call. Dark, so the flame stays with the lead offer, with real facts from the data */}
        <section id="connect" className={`${WRAP} pb-24 sm:pb-32`}>
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <div data-drop="-1" className="bg-[var(--color-ink)] p-6 text-[var(--color-paper)] shadow-[var(--shadow-sheet)] sm:p-10 lg:col-span-7">
              <span className="inline-block bg-[var(--color-accent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">
                {connect?.minPrice ? `Calls from ₹${connect.minPrice}` : "Live 1:1 calls"}
              </span>
              <h2 className={`${DISPLAY} mt-4 text-[clamp(2.5rem,5.5vw,4.75rem)]`}>
                20 minutes with someone who sat the same rounds last year.
              </h2>
              <p className="mt-6 max-w-[48ch] text-lg leading-relaxed">
                Ask what the interview was really like, what to skip, and what they would do differently. A real call with a real senior,
                not a chatbot and not a marketplace listing.
              </p>
              {connect && (
                <ul className="num mt-6 flex flex-wrap gap-x-8 gap-y-2 text-base font-semibold">
                  <li>{connect.count} placed seniors</li>
                  {connect.companies.length > 0 && <li>{joinNames(connect.companies)}</li>}
                  {connect.minPrice && <li>from ₹{connect.minPrice} a call</li>}
                </ul>
              )}
              <p className="mt-5 max-w-[48ch] text-base leading-relaxed opacity-80">
                You see the price before you pay. Connect is run by hand: after you pay, our team confirms your slot and sends the meeting
                link. It is not instant, and we would rather say so up front.
              </p>
              <Link to="/connect" className={`${BTN_PRIMARY} mt-9 !shadow-[4px_4px_0_var(--color-paper)] active:!shadow-none`}>
                Browse seniors
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <ol data-reveal-group className={`${SHEET} divide-y divide-[var(--color-rule)] px-6 sm:px-9 lg:col-span-5 lg:mt-16`}>
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-6 py-7">
                  <span className={`${DISPLAY} w-10 shrink-0 text-6xl`}>{s.n}</span>
                  <div>
                    <h3 className="text-lg font-semibold [text-wrap:balance]">{s.title}</h3>
                    <p className="mt-1.5 text-base leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Also inside: one typed sheet, a row per tool */}
        <section className={`${WRAP} pb-24 sm:pb-32`}>
          <h2 data-reveal className={`${DISPLAY} text-[clamp(2.25rem,5vw,4rem)]`}>Also inside</h2>
          <ul data-reveal className={`${SHEET} mt-8 divide-y divide-[var(--color-rule)]`}>
            {ALSO.map((a) => (
              <li key={a.title}>
                <Link
                  to={a.to}
                  className="group grid items-baseline gap-x-8 gap-y-1 px-6 py-6 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] sm:px-9 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--color-focus)]"
                >
                  <h3 className="text-xl font-semibold">{a.title}</h3>
                  <p className="text-base leading-relaxed">{a.body}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-base font-semibold underline decoration-transparent underline-offset-4 group-hover:decoration-[var(--color-ink)] sm:mt-0">
                    Open <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing: three sheets in the order of what we most want to sell */}
        <section id="pricing" className="bg-[var(--color-paper-2)]">
          <div className={`${WRAP} py-24 sm:py-32`}>
            <h2 data-reveal className={`${DISPLAY} text-[clamp(2.5rem,6vw,5rem)]`}>Three ways in</h2>
            <p className="mt-4 max-w-[52ch] text-lg">Practice gets you ready. The Playbook focuses it on one test. Connect gets you a real conversation.</p>

            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              <div data-drop="-1" className="flex flex-col bg-[var(--color-accent)] p-6 shadow-[var(--shadow-sheet)] sm:p-9">
                <h3 className="text-xl font-semibold">Premium: SP and DSE questions and practice</h3>
                <p className="mt-4 flex items-baseline gap-4">
                  <span className={`${DISPLAY} num text-[clamp(4.5rem,8vw,6.5rem)]`}>₹{PREMIUM_PRICE}</span>
                  {PREMIUM_PRICE < LIST_PRICE && <span className="num text-xl line-through opacity-70">₹{LIST_PRICE}</span>}
                </p>
                <p className="mt-3 flex-1 text-lg leading-relaxed">
                  All {TOTAL_PROBLEMS} Infosys SP and DSE coding questions, the full games and communication rounds, the AI mock interview
                  and the resume builder. Lifetime, one payment.
                </p>
                <Link to="/coding-questions" className={`${BTN_INK} mt-8 w-[calc(100%-4px)]`}>
                  Start with {FREE_COUNT} free
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div data-reveal className={`${SHEET} flex flex-col p-6 sm:p-9`}>
                <h3 className="text-xl font-semibold">Infosys SE Playbook</h3>
                <p className="mt-4 flex items-baseline gap-4">
                  <span className={`${DISPLAY} num text-[clamp(4.5rem,8vw,6.5rem)]`}>₹{SE_PRICE}</span>
                  <span className="num text-xl text-[var(--color-muted)] line-through">₹{SE_LIST_PRICE}</span>
                </p>
                <p className="mt-3 flex-1 text-lg leading-relaxed">
                  Formulas, 86 solved questions, two timed half-mocks and a full 54-question online mock for the System Engineer test.
                </p>
                <Link to="/infosys-se" className={`${BTN_SECONDARY} mt-8 w-[calc(100%-4px)]`}>See the Playbook</Link>
              </div>

              <div data-reveal className={`${SHEET} flex flex-col p-6 sm:p-9`}>
                <h3 className="text-xl font-semibold">Connect 1:1</h3>
                <p className="mt-4 flex items-baseline gap-3">
                  <span className={`${DISPLAY} num text-[clamp(3rem,5.5vw,4.75rem)]`}>{connect?.minPrice ? `From ₹${connect.minPrice}` : "Per senior"}</span>
                </p>
                <p className="mt-3 flex-1 text-lg leading-relaxed">
                  A 20-minute live call with someone recently placed. You see the price before you pay, and you book separately.
                </p>
                <Link to="/connect" className={`${BTN_SECONDARY} mt-8 w-[calc(100%-4px)]`}>See who is available</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final call: toner band */}
        <section className="bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className={`${WRAP} py-24 sm:py-32`}>
            <h2 data-reveal className={`${DISPLAY} max-w-[20ch] text-[clamp(2.75rem,7vw,6rem)]`}>
              Your interview date is already on the calendar. Start today.
            </h2>
            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              <Link to="/coding-questions" className={`${BTN_PRIMARY} !shadow-[4px_4px_0_var(--color-paper)] active:!shadow-none`}>
                Try {FREE_COUNT} coding questions free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="max-w-[34ch] text-base opacity-80">No card, no sign-up for the free questions. Works best on a phone or laptop.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer: a mast, the wordmark over the links */}
      <footer className="bg-[var(--color-paper)]">
        <div className={`${WRAP} flex flex-col gap-6 py-12`}>
          <span className={`${DISPLAY} text-4xl sm:text-5xl`}>Harry the Blaze</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="max-w-md text-base text-[var(--color-muted)]">
              Install it on your phone. Practise from your home screen, full screen, no app store needed.
            </p>
            <InstallAppButton variant="outline" className="h-11 gap-2 self-start rounded-none border-[var(--color-ink)] font-semibold" />
          </div>
          <nav aria-label="Explore" className="flex flex-wrap gap-x-7 gap-y-2 text-base font-semibold">
            <Link to="/infosys-se" className="underline decoration-[var(--color-ink)] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Infosys System Engineer
            </Link>
            <Link to="/infosys-sp-dse" className="underline decoration-[var(--color-ink)] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Infosys SP and DSE hiring
            </Link>
            <Link to="/coding-questions" className="underline decoration-[var(--color-ink)] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Infosys coding questions
            </Link>
            <Link to="/hackwithinfy" className="underline decoration-[var(--color-ink)] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              HackWithInfy prep hub
            </Link>
            <Link to="/blog" className="underline decoration-[var(--color-ink)] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Placement blog
            </Link>
          </nav>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2 text-base">
            <Link to="/about" className="underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              About
            </Link>
            <Link to="/blog" className="underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Blog
            </Link>
            <Link to="/placed-guru" className="underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Be a Guru
            </Link>
            <Link to="/terms" className="underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Terms
            </Link>
            <Link to="/refund" className="underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Refund policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
