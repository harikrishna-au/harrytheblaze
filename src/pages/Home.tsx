import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import { InstallAppButton } from "@/components/InstallAppButton";
import { supabase } from "@/integrations/supabase/client";
import { joinNames, summariseExperts, type ConnectFacts } from "@/lib/connectStats";
import { LIST_PRICE } from "@/lib/promo";
import { SE_LIST_PRICE, SE_PRICE } from "@/lib/sePremium";
import { FREE_COUNT, TOTAL_PROBLEMS } from "@/pages/coding-questions/data";
import { CQ, GAMES, PREMIUM_PRICE, SHOW_LIST_PRICE, waveHeights } from "./home/facts";
import Faq from "./home/Faq";
import Film from "./home/Film";
import Gallery from "./home/Gallery";
import Nav from "./home/Nav";
import Timeline from "./home/Timeline";
import TryRound from "./home/TryRound";
import { Btn, Lines } from "./home/ui";
import { useHomeMotion } from "./home/useHomeMotion";
import "./home/home.css";

const v = (o: Record<string, string | number>) => o as CSSProperties;

const CHIPS = [
  { t: "Hidden maze", bg: "#f4581f", c: "#15140f", at: { left: "57%", top: "15%" }, r: "5deg", d: "0s" },
  { t: `${TOTAL_PROBLEMS} coding questions`, bg: "#15140f", c: "#fff", at: { left: "73%", top: "24%" }, r: "-6deg", d: "-1.4s" },
  { t: "Read it aloud", bg: "#1f4d43", c: "#fff", at: { left: "84%", top: "41%" }, r: "8deg", d: "-2.7s" },
  { t: "Balloon math", bg: "#f3eee3", c: "#15140f", at: { left: "68%", top: "47%" }, r: "-4deg", d: "-3.9s" },
  { t: "“What did they ask you?”", bg: "#fff", c: "#15140f", at: { left: "72%", top: "61%" }, r: "4deg", d: "-5s" },
];

const STATEMENT = "You can read about the rounds for weeks. Then the clock starts, the screen looks new, and the first five minutes are gone. Harry The Blaze gives you those five minutes".split(" ");

const WHY = [
  { k: "01 Games", t: "The rounds, not a lecture", b: `${GAMES.length} cognitive games and two sets of communication rounds, with the clock running. The timing stops being a surprise.` },
  { k: "02 Code", t: "Questions people actually reported", b: `${TOTAL_PROBLEMS} Infosys SP and DSE questions from people who got the roles, sorted into ${CQ.topics} topics with a link for each.` },
  { k: "03 People", t: "Someone who sat it last year", b: "A 20-minute live call with a placed senior. Ask what to skip and what they would do differently." },
];

const STEPS = [
  { k: "01", t: "Pick your test", b: "Start with the company and round you are actually facing, not a feature tour." },
  { k: "02", t: "Practice on the clock", b: "Play the games, solve the questions, speak the answers. Your scores and checklist are saved to your account." },
  { k: "03", t: "Then talk to a senior", b: "When you want the inside view, book 20 minutes with someone who was recently placed." },
];

const CALL_STEPS = [
  { t: "Pick a senior", b: "See who was recently placed and who matches the company you are preparing for." },
  { t: "Choose a slot and pay", b: "Payment goes through Razorpay. You see the price before you pay." },
  { t: "We send one meeting link", b: "The Connect team confirms by hand and sends the same link to you both." },
];

const TERM = waveHeights(40);

export default function Home() {
  const { isSignedIn } = useAuth();
  const primaryTo = isSignedIn ? "/dashboard" : "/login";
  const page = useRef<HTMLDivElement>(null);
  useHomeMotion(page);

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
  const callPrice = connect?.minPrice ? `From ₹${connect.minPrice} a call` : "Priced per senior";

  const TESTS = [
    { to: "/infosys-sp-dse", n: "Infosys SP and DSE", w: `${TOTAL_PROBLEMS} coding questions in ${CQ.topics} topics`, f: `${FREE_COUNT} questions, no sign-up`, p: `₹${PREMIUM_PRICE} Premium, once` },
    { to: "/infosys-se", n: "Infosys SE", w: "The SE Playbook and a full 54-question mock", f: "Eligibility, stages and topics", p: `₹${SE_PRICE}, once` },
    { to: primaryTo, n: "Accenture", w: "Matrix Flow, Balloon Math, Hidden Maze, communication round", f: "First levels, free account", p: `₹${PREMIUM_PRICE} Premium, once` },
    { to: primaryTo, n: "Cognizant", w: "Nine cognitive games and a communication set", f: "The games, with a free account", p: `₹${PREMIUM_PRICE} Premium, once` },
    { to: "/connect", n: "The interview itself", w: "A 20-minute call with a placed senior", f: "Browse seniors first", p: callPrice },
  ];

  return (
    <div ref={page} className="hx">
      <SEO
        title="Harry The Blaze | Placement Practice for Infosys and Accenture"
        description="Practise real placement rounds: cognitive games, communication tests, AI mock interviews and Infosys coding questions. Then book a 1:1 with someone just placed."
      />

      <Nav isSignedIn={!!isSignedIn} primaryTo={primaryTo} />

      <main>
        <section className="hero">
          <div className="chips" aria-hidden>
            {CHIPS.map((c) => (
              <span key={c.t} className="chip" data-chip style={c.at}><b style={v({ background: c.bg, color: c.c, "--r": c.r, "--d": c.d })}>{c.t}</b></span>
            ))}
          </div>
          <div className="wrap">
            <span className="tag" data-intro>Placement practice for engineering students</span>
            <div className="hero-h">
              <Lines as="h1" className="h1" intro lines={["Practice the", <em key="e">real rounds.</em>]} />
            </div>
            <div className="hero-b">
              <p className="lead" data-intro>
                Infosys SP and DSE coding questions, SE test prep, placement games, communication rounds, and calls with people who were just
                placed. Play a round on this page before you decide anything.
              </p>
              <div className="cta" data-intro>
                <Btn to="/coding-questions">Try {FREE_COUNT} questions free</Btn>
                <Btn to="#try" kind="s" down>Play a round</Btn>
              </div>
            </div>
            <div className="chips-m" aria-hidden>
              {CHIPS.slice(0, 4).map((c) => (
                <span key={c.t} className="chip" data-chip><b style={v({ background: c.bg, color: c.c, "--d": c.d })}>{c.t}</b></span>
              ))}
            </div>
            <ul className="facts mono" data-intro>
              <li>No card for the free questions</li>
              <li>One payment, no renewal</li>
              <li>Works on a phone or laptop</li>
            </ul>
          </div>
        </section>

        <Film />

        <TryRound startTo={primaryTo} />

        <section className="wrap" style={{ paddingBlock: "clamp(40px, 6vw, 90px)" }}>
          <p className="statement" data-fill>
            {STATEMENT.map((w, i) => <span key={i}><span className="w">{w}</span>{" "}</span>)}
            <em className="w">before</em> <span className="w">test day.</span>
          </p>
        </section>

        <section className="sec wrap" aria-labelledby="why-title">
          <div className="head">
            <span className="tag">Why it works this way</span>
            <Lines id="why-title" lines={["Less reading.", <em key="e">More rounds.</em>]} />
            <p className="lead" data-up>Start with the round you are facing. Everything else is extra.</p>
          </div>
          <div className="grid3" data-up-group>
            {WHY.map((w) => (
              <div className="bez" key={w.k}><div className="in card"><p className="mono f">{w.k}</p><h3 className="h3">{w.t}</h3><p className="small">{w.b}</p></div></div>
            ))}
          </div>
          <div className="bez tbl" data-up>
            <div className="in">
              <div className="tr hd mono" aria-hidden><span>Your test</span><span>What you practice</span><span>Free to start</span><span>Full access</span></div>
              {TESTS.map((t) => (
                <Link key={t.n} to={t.to} className="tr">
                  <span>{t.n}</span><span>{t.w}</span><span data-k="Free">{t.f}</span><span data-k="Full access">{t.p}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap" style={{ paddingBottom: "clamp(40px, 6vw, 90px)" }} aria-labelledby="steps-title">
          <div className="head">
            <span className="tag">How it works</span>
            <Lines id="steps-title" lines={["Three steps.", <em key="e">No guesswork.</em>]} />
          </div>
          <ol className="steps" data-up-group>
            {STEPS.map((s) => <li key={s.k}><p className="mono f">{s.k}</p><h3 className="h3">{s.t}</h3><p className="small">{s.b}</p></li>)}
          </ol>
        </section>

        <Timeline />

        <Gallery />

        <section className="sec wrap" aria-labelledby="also-title">
          <div className="head">
            <span className="tag">Also inside</span>
            <Lines id="also-title" lines={[<>The rest of <em>the kit.</em></>]} />
          </div>
          <div className="bento" data-up-group>
            <div className="bez b3">
              <Link to="/ai-interview" className="in">
                <div className="viz"><div className="term"><b>Interviewer</b><br />Tell me about a project you are proud of.<br /><b>You</b><br />Last semester I built <u /></div></div>
                <h3 className="h3">AI mock interview</h3>
                <p className="small">Get through the awkward first attempts here, not in the real one.</p>
                <span className="more">Open <ArrowUpRight aria-hidden /></span>
              </Link>
            </div>
            <div className="bez b3">
              <Link to="/forge" className="in">
                <div className="viz l"><div className="paper" aria-hidden>{["46%", "88%", "72%", "94%", "58%", "84%", "66%"].map((w, i) => <span key={i} style={v({ "--w": w, "--d": `${i * 0.14}s` })} />)}</div></div>
                <h3 className="h3">Resume builder</h3>
                <p className="small">Build the resume you will send before the drive, and keep it in one place.</p>
                <span className="more">Open <ArrowUpRight aria-hidden /></span>
              </Link>
            </div>
            <div className="bez b2">
              <Link to="/radar" className="in">
                <div className="viz"><div className="radar" aria-hidden>
                  <svg viewBox="0 0 200 200"><g fill="none" stroke="rgba(255,255,255,.16)"><circle cx="100" cy="100" r="30" /><circle cx="100" cy="100" r="58" /><circle cx="100" cy="100" r="86" /></g>
                    <path className="sw" d="M100 100L100 14A86 86 0 0 1 160 38Z" fill="rgba(244,88,31,.42)" />
                    {[[128, 62, 0.3], [64, 118, 2.6], [142, 124, 1.4], [84, 58, 3.6]].map(([x, y, t]) => <circle key={x} className="bl" style={v({ "--d": `${t}s` })} cx={x} cy={y} r="4.5" fill="#f4581f" />)}</svg>
                </div></div>
                <h3 className="h3">Radar job match</h3>
                <p className="small">Match your skill profile against open roles.</p>
                <span className="more">Open <ArrowUpRight aria-hidden /></span>
              </Link>
            </div>
            <div className="bez b2">
              <Link to="/hackwithinfy" className="in">
                <div className="viz"><div className="months" aria-hidden>{TERM.slice(0, 12).map((h, i) => <span key={i} style={v({ "--h": `${h * 100}%`, "--d": `${i * 0.07}s` })} />)}</div></div>
                <h3 className="h3">HackWithInfy hub</h3>
                <p className="small">Syllabus, resources, tips and previous years for the SP and DSE route.</p>
                <span className="more">Open <ArrowUpRight aria-hidden /></span>
              </Link>
            </div>
            <div className="bez b2">
              <Link to="/blog" className="in">
                <div className="viz l"><div className="lines" aria-hidden><span className="f" style={v({ "--w": "64%" })} />{["96%", "88%", "92%", "54%"].map((w) => <span key={w} style={v({ "--w": w })} />)}</div></div>
                <h3 className="h3">Placement blog</h3>
                <p className="small">Guides and write-ups on the rounds, free to read.</p>
                <span className="more">Read <ArrowUpRight aria-hidden /></span>
              </Link>
            </div>
          </div>
        </section>

        <section id="connect" className="wrap" aria-labelledby="connect-title">
          <div className="call">
            <div className="head" style={{ gap: 26 }}>
              <span className="tag">{connect?.minPrice ? `Calls from ₹${connect.minPrice}` : "Live 1:1 calls"}</span>
              <Lines id="connect-title" lines={[<>20 minutes with someone <em>just placed.</em></>]} />
              <p className="lead">
                Ask what the interview was really like, what to skip, and what they would do differently. A real call with a real senior, not a
                chatbot.
              </p>
              {connect && (
                <ul className="call-f">
                  <li>{connect.count} placed seniors</li>
                  {connect.companies.length > 0 && <li>{joinNames(connect.companies)}</li>}
                </ul>
              )}
              <Btn to="/connect">Browse seniors</Btn>
              <p className="small" style={{ maxWidth: "50ch" }}>
                Connect is run by hand: after you pay, our team confirms your slot and sends the link. It is not instant, and we would rather say so
                up front.
              </p>
            </div>
            <ol data-up-group>
              {CALL_STEPS.map((s, i) => (
                <li key={s.t}><span className="mono">0{i + 1}</span><div><h3 className="h3">{s.t}</h3><p className="small" style={{ marginTop: 6 }}>{s.b}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="sec wrap" aria-labelledby="price-title">
          <div className="head">
            <span className="tag">Pricing</span>
            <Lines id="price-title" lines={[<>Pay once. <em>Keep it.</em></>]} />
            <p className="lead" data-up>Practice gets you ready. The Playbook focuses it on one test. Connect gets you a real conversation.</p>
          </div>
          <div className="grid3" data-up-group>
            <div className="bez hot"><div className="in price">
              <h3 className="mono f">Premium, lifetime</h3>
              <p className="amt">{SHOW_LIST_PRICE && <s>₹{LIST_PRICE}</s>}<b><small>₹</small>{PREMIUM_PRICE}</b><span>once</span></p>
              <ul className="ticks">
                <li>All {TOTAL_PROBLEMS} Infosys SP and DSE questions, each with a direct link</li>
                <li>Every level in the games</li>
                <li>Full Accenture and Cognizant communication rounds</li>
                <li>AI mock interview, resume builder and job match</li>
                <li>No subscription, no renewal</li>
              </ul>
              <Btn to="/coding-questions" wide>Start with {FREE_COUNT} free</Btn>
            </div></div>
            <div className="bez"><div className="in price">
              <h3 className="mono">Infosys SE Playbook</h3>
              <p className="amt"><s>₹{SE_LIST_PRICE}</s><b><small>₹</small>{SE_PRICE}</b><span>once</span></p>
              <ul className="ticks">
                <li>30 ranked formula cards</li>
                <li>86 solved questions</li>
                <li>Two timed half-mocks and a full 54-question online mock</li>
                <li>Interview answers</li>
                <li>PDF to your inbox</li>
              </ul>
              <Btn to="/infosys-se" kind="k" wide>See the Playbook</Btn>
            </div></div>
            <div className="bez"><div className="in price">
              <h3 className="mono">Connect 1:1</h3>
              <p className="amt"><b className={connect?.minPrice ? "" : "sm"}>{connect?.minPrice ? <><small>₹</small>{connect.minPrice}</> : "Per senior"}</b>{connect?.minPrice && <span>and up, per call</span>}</p>
              <ul className="ticks">
                <li>A 20-minute live call</li>
                <li>With someone recently placed</li>
                <li>You see the price before you pay</li>
                <li>Booked separately from Premium</li>
              </ul>
              <Btn to="/connect" kind="k" wide>See who is available</Btn>
            </div></div>
          </div>
          <p className="small" style={{ marginTop: 24, fontSize: "0.875rem" }}>
            Community-reported practice material, not official. Not affiliated with Infosys, Accenture or Cognizant.
          </p>
        </section>

        <Faq />

        <section className="closer" aria-labelledby="closer-title">
          <div className="wrap head">
            <Lines id="closer-title" className="h1" lines={["Your test date", <>is <em>already set.</em></>]} />
            <Btn to="/coding-questions">Try {FREE_COUNT} questions free</Btn>
          </div>
          <div className="word" aria-hidden>
            <svg viewBox="0 0 1440 290"><text data-draw x="720" y="216" textAnchor="middle" fontSize="256" textLength="1380" lengthAdjust="spacingAndGlyphs">Harry The Blaze</text></svg>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div className="inst">
            <p className="small">Install it on your phone. Practise from your home screen, no app store needed.</p>
            <InstallAppButton variant="outline" className="gap-2 px-6 font-semibold" />
          </div>
          <nav className="x" aria-label="Explore">
            <Link to="/infosys-se">Infosys System Engineer</Link>
            <Link to="/infosys-sp-dse">Infosys SP and DSE hiring</Link>
            <Link to="/infosys-sp-dse#taster">5-minute taster</Link>
            <Link to="/coding-questions">Infosys coding questions</Link>
            <Link to="/hackwithinfy">HackWithInfy prep hub</Link>
            <Link to="/blog">Placement blog</Link>
          </nav>
          <nav aria-label="Footer">
            <Link to="/about">About</Link>
            <Link to="/placed-guru">Be a Guru</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/refund">Refund policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
