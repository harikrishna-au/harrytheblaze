import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TOTAL_PROBLEMS } from "@/pages/coding-questions/data";
import { GAMES, SAMPLE_QUESTIONS, waveHeights } from "./facts";
import { useInView } from "./useInView";

const SCENE_MS = 4200;
const v = (o: Record<string, string | number>) => o as CSSProperties;
const WAVE = waveHeights(34);

const SCENES = [
  {
    label: "Cognitive games", k: `${GAMES.length} games`, t: ["Lowest first.", "Keep moving."],
    art: (
      <div className="bal">
        {[["12 ÷ 3", "1", "1.5s"], ["2 × 7", "3", "2.7s"], ["15 − 6", "2", "2.1s"]].map(([q, n, h], i) => (
          <div key={q} data-n={n} className="pop" style={v({ "--d": `${0.3 + i * 0.12}s`, "--h": h })}>{q}</div>
        ))}
      </div>
    ),
  },
  {
    label: "Infosys SP and DSE", k: `${TOTAL_PROBLEMS} coding questions`, t: ["Solve it.", "Tick it off."],
    art: (
      <ul className="qlist">
        {SAMPLE_QUESTIONS.map((q, i) => (
          <li key={q.id} className="pop" style={v({ "--d": `${0.25 + i * 0.1}s`, "--h": `${1.2 + i * 0.42}s` })}>
            <span>{q.title.trim()}</span><small>{q.difficulty}</small>
          </li>
        ))}
      </ul>
    ),
  },
  {
    label: "Communication rounds", k: "Accenture and Cognizant patterns", t: ["Read it aloud.", "Beat the clock."],
    art: <div className="wave">{WAVE.map((h, i) => <span key={i} style={v({ "--h": h.toFixed(2), "--d": `${-i * 0.09}s` })} />)}</div>,
  },
  {
    label: "Connect 1:1", k: "A 20-minute live call", t: ["Ask someone", "who sat it."],
    art: (
      <div className="callbox">
        <div className="pop" style={v({ "--c": "#f4581f", "--d": "0.2s" })}>You</div>
        <div className="pop" style={v({ "--c": "#f3eee3", "--d": "0.35s" })}>Placed senior</div>
      </div>
    ),
  },
];

/** The "film": four short scenes of what is inside, drawn in code. It stops off screen, and can be paused. */
export default function Film() {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [paused, setPaused] = useState(still);
  const [i, setI] = useState(0);
  const elapsed = useRef(0);
  const running = inView && !paused;

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      elapsed.current += Math.min(now - last, 100);
      last = now;
      const total = elapsed.current % (SCENE_MS * SCENES.length);
      setI(Math.floor(total / SCENE_MS));
      if (clock.current) {
        const s = Math.floor(total / 1000);
        const f = Math.floor((total % 1000) / (1000 / 24));
        clock.current.textContent = `00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const s = SCENES[i];
  return (
    <section className="film" aria-label="What is inside, in four short scenes">
      <div className="stage-o" data-grow>
        <div ref={ref} className={`stage${running ? "" : " paused"}`} style={v({ "--scene": `${SCENE_MS}ms` })}>
          <div className="stage-bar t"><span className="rec">{s.label}</span><span ref={clock} aria-hidden>00:00:00</span></div>
          <div className="scene" key={i}>
            <div>
              <p className="scene-k">{s.k}</p>
              <p className="scene-t"><span><b>{s.t[0]}</b></span> <span><b>{s.t[1]}</b></span></p>
            </div>
            <div aria-hidden>{s.art}</div>
          </div>
          <div className="stage-bar b">
            <button type="button" className="ghost" onClick={() => setPaused((p) => !p)}>{paused ? "Play" : "Pause"}</button>
            <span className="dots" aria-hidden>
              {SCENES.map((x, n) => <span key={x.label} className={n < i ? "done" : n === i ? "now" : ""} />)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
