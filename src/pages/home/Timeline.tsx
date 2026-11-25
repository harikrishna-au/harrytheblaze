import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FREE_COUNT, TOTAL_PROBLEMS } from "@/pages/coding-questions/data";
import { CQ, GAMES, waveHeights } from "./facts";

const VOX = waveHeights(64);
const STEPS = [
  { k: "01 Pick", t: "Start from the test you have.", b: "Infosys SP and DSE, Infosys SE, Accenture or Cognizant. Start there and leave the rest for later." },
  { k: "02 Games", t: `${GAMES.length} games, played like test day.`, b: "Three in the Accenture set and nine in the Cognizant set. Timed, scored, and with your best score kept." },
  { k: "03 Code", t: `${TOTAL_PROBLEMS} questions, topic by topic.`, b: `Reported by people who got the SP and DSE roles. Each bar is one of ${CQ.topics} topics. Open ${FREE_COUNT} free.` },
  { k: "04 Speak", t: "Say it out loud, on the clock.", b: "Reading aloud, repeating, fill in the blank, a spoken topic, an email. Then AI feedback on how it went." },
  { k: "05 Call", t: "Ask someone who sat it.", b: "Book a 20-minute call with a placed senior and ask what the round was really like." },
];
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Pinned section: scrolling moves the playhead, and each track fills as its step comes up. */
export default function Timeline() {
  const ref = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = still ? 1 : clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      panel.current?.style.setProperty("--p", p.toFixed(4));
      panel.current?.querySelectorAll<HTMLElement>(".fill").forEach((f, i) => {
        f.style.setProperty("--w", `${(clamp(p * STEPS.length - i) * 100).toFixed(1)}%`);
      });
      setStep(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);

  const tracks = [
    ["Pick", <div className="tests" key="t">{["SP, DSE", "Infosys SE", "Accenture", "Cognizant"].map((x) => <span key={x}>{x}</span>)}</div>],
    ["Games", <div className="clips" key="g">{GAMES.map((g) => <span key={g.id} className={g.company === "Accenture" ? "a" : ""} />)}</div>],
    ["Code", <div className="bars" key="c">{CQ.sizes.map((n, i) => <span key={i} style={{ height: `${(n / CQ.max) * 100}%` }} />)}</div>],
    ["Speak", <div className="vox" key="v">{VOX.map((h, i) => <span key={i} style={{ height: `${h * 100}%` }} />)}</div>],
    ["Call", <div className="callbar" key="k"><span>You + placed senior</span><span>20 min</span></div>],
  ] as const;

  return (
    <section ref={ref} className="pipe" aria-labelledby="pipe-title">
      <div className="pin">
        <div className="wrap pipe-g">
          <div>
            <h2 id="pipe-title" className="tag">How the prep runs</h2>
            <ol className="pipe-s">
              {STEPS.map((s, i) => (
                <li key={s.k} className={i === step ? "on" : i < step ? "past" : ""}>
                  <p className="mono f">{s.k}</p>
                  <h3 className="h3" style={{ fontSize: "clamp(2rem, 3.8vw, 3.3rem)" }}>{s.t}</h3>
                  <p className="small" style={{ maxWidth: "40ch" }}>{s.b}</p>
                </li>
              ))}
            </ol>
          </div>
          <div ref={panel} className="panel" aria-hidden style={{ "--p": 0 } as CSSProperties}>
            <div className="panel-h"><span>Harry the Blaze, prep timeline</span><span>{step + 1} / {STEPS.length}</span></div>
            <div className="tracks">
              {tracks.map(([label, art]) => (
                <div className="track" key={label}><i>{label}</i><div className="fill">{art}</div></div>
              ))}
              <span className="head-line" />
            </div>
            <div className="panel-f"><span>{STEPS[step].k}</span><span className="rec">{step === STEPS.length - 1 ? "Ready" : "Running"}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
