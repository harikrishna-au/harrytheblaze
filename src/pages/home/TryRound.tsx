import { useCallback, useEffect, useRef, useState } from "react";
import { GAMES } from "./facts";
import { Btn, Lines } from "./ui";

const rand = (n: number) => Math.floor(Math.random() * n);

type GameProps = { onStatus: (s: string) => void };
const Done = ({ title, body, again }: { title: string; body: string; again: () => void }) => (
  <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
    <p className="h3">{title}</p>
    <p className="small">{body}</p>
    <button type="button" className="pick" aria-pressed="true" onClick={again}>Go again</button>
  </div>
);
const Intro = ({ rule, start }: { rule: string; start: () => void }) => (
  <div style={{ display: "grid", gap: 24, justifyItems: "center" }}>
    <p className="h3" style={{ maxWidth: "20ch" }}>{rule}</p>
    <button type="button" className="pick" aria-pressed="true" onClick={start}>Start</button>
  </div>
);

/** Digits flash one by one; type them back. One more digit each time. */
function DigitGame({ onStatus }: GameProps) {
  const [phase, setPhase] = useState<"intro" | "show" | "type" | "done">("intro");
  const [seq, setSeq] = useState<number[]>([]);
  const [at, setAt] = useState(0);
  const [typed, setTyped] = useState<number[]>([]);
  const [best, setBest] = useState(0);

  const deal = useCallback((len: number) => {
    const s: number[] = [];
    while (s.length < len) { const d = rand(10); if (d !== s[s.length - 1]) s.push(d); }
    setSeq(s); setTyped([]); setAt(0); setPhase("show"); onStatus(`${len} digits`);
  }, [onStatus]);

  useEffect(() => {
    if (phase !== "show") return;
    const t = window.setTimeout(() => (at + 1 < seq.length ? setAt(at + 1) : setPhase("type")), 850);
    return () => window.clearTimeout(t);
  }, [phase, at, seq]);

  const press = (d: number) => {
    const next = [...typed, d];
    setTyped(next);
    if (next.length < seq.length) return;
    if (next.every((x, i) => x === seq[i])) {
      setBest(seq.length);
      window.setTimeout(() => deal(seq.length + 1), 420);
    } else window.setTimeout(() => setPhase("done"), 420);
  };

  if (phase === "intro") return <Intro rule="Watch the digits, then type them back in order." start={() => { setBest(0); deal(3); }} />;
  if (phase === "show") return <p className="big" key={at} aria-live="assertive">{seq[at]}</p>;
  if (phase === "done") return <Done title={best ? `You held ${best} digits.` : "That one slipped."} body={`The sequence was ${seq.join(" ")}. It gets one longer each time.`} again={() => { setBest(0); deal(3); }} />;
  const full = typed.length >= seq.length;
  return (
    <div style={{ width: "100%", display: "grid", justifyItems: "center" }}>
      <div className="slots">{seq.map((_, i) => <span key={i} className={i < typed.length ? "on" : ""}>{typed[i] ?? ""}</span>)}</div>
      <div className="keys">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => <button key={d} type="button" disabled={full} onClick={() => press(d)}>{d}</button>)}</div>
    </div>
  );
}

/** Numbers: odd or even. Letters: vowel or consonant. Twenty seconds. */
function SwitchGame({ onStatus }: GameProps) {
  const SECONDS = 20;
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [card, setCard] = useState("7");
  const [n, setN] = useState(0);
  const [score, setScore] = useState({ ok: 0, all: 0 });
  const [left, setLeft] = useState(SECONDS);
  const isNum = /\d/.test(card);

  const next = () => { setCard(Math.random() < 0.5 ? String(1 + rand(9)) : "ABCDEFGHIKLMNOPRSTU"[rand(19)]); setN((x) => x + 1); };
  const start = () => { setScore({ ok: 0, all: 0 }); setLeft(SECONDS); next(); setPhase("play"); };

  useEffect(() => {
    if (phase !== "play") return;
    const end = performance.now() + SECONDS * 1000;
    const t = window.setInterval(() => {
      const l = (end - performance.now()) / 1000;
      if (l <= 0) { setPhase("done"); setLeft(0); } else setLeft(l);
    }, 100);
    return () => window.clearInterval(t);
  }, [phase]);
  useEffect(() => { if (phase === "play") onStatus(`${score.ok} right, ${Math.ceil(left)}s left`); }, [phase, score, left, onStatus]);

  const answer = (first: boolean) => {
    const truth = isNum ? Number(card) % 2 === 1 : "AEIOU".includes(card); // first button: odd / vowel
    setScore((s) => ({ ok: s.ok + (truth === first ? 1 : 0), all: s.all + 1 }));
    next();
  };

  if (phase === "intro") return <Intro rule="Number? Odd or even. Letter? Vowel or consonant. 20 seconds." start={start} />;
  if (phase === "done") return <Done title={`${score.ok} right out of ${score.all}.`} body="The switch is what costs you time, not the question." again={start} />;
  return (
    <div style={{ display: "grid", gap: 30, justifyItems: "center" }}>
      <p className="big" key={n}>{card}</p>
      <div className="g-row">
        <button type="button" className="g-btn" onClick={() => answer(true)}>{isNum ? "Odd" : "Vowel"}</button>
        <button type="button" className="g-btn" onClick={() => answer(false)}>{isNum ? "Even" : "Consonant"}</button>
      </div>
      <span className="bar" style={{ transform: `scaleX(${left / SECONDS})` }} aria-hidden />
    </div>
  );
}

type Bubble = { q: string; a: number };
function bubbles(): Bubble[] {
  const out: Bubble[] = [];
  while (out.length < 3) {
    const k = rand(4), x = 2 + rand(8), y = 2 + rand(8);
    const b = k === 0 ? { q: `${x} + ${y}`, a: x + y } : k === 1 ? { q: `${x + y} − ${y}`, a: x } : k === 2 ? { q: `${x} × ${y}`, a: x * y } : { q: `${x * y} ÷ ${y}`, a: x };
    if (!out.some((o) => o.a === b.a)) out.push(b);
  }
  return out;
}

/** Pop the bubbles from the lowest answer to the highest. Four rounds. */
function BalloonGame({ onStatus }: GameProps) {
  const ROUNDS = 4;
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [round, setRound] = useState(1);
  const [set, setSet] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [clean, setClean] = useState(0);
  const slipped = useRef(false);
  const startedAt = useRef(0);
  const [secs, setSecs] = useState(0);

  const begin = (r: number) => { slipped.current = false; setRound(r); setSet(bubbles()); setPopped([]); setWrong(null); onStatus(`Round ${r} of ${ROUNDS}`); };
  const start = () => { setClean(0); startedAt.current = performance.now(); begin(1); setPhase("play"); };
  const tap = (i: number) => {
    if (popped.includes(i) || popped.length === set.length) return;
    const min = Math.min(...set.filter((_, n) => !popped.includes(n)).map((b) => b.a));
    if (set[i].a !== min) { slipped.current = true; setWrong(i); window.setTimeout(() => setWrong(null), 420); return; }
    const p = [...popped, i];
    setPopped(p);
    if (p.length < set.length) return;
    if (!slipped.current) setClean((c) => c + 1);
    window.setTimeout(() => {
      if (round < ROUNDS) begin(round + 1);
      else { setSecs((performance.now() - startedAt.current) / 1000); setPhase("done"); }
    }, 480);
  };

  if (phase === "intro") return <Intro rule="Pop the bubbles from the lowest answer to the highest." start={start} />;
  if (phase === "done") return <Done title={`${clean} of ${ROUNDS} clean, in ${secs.toFixed(1)}s.`} body="The real one speeds up as you go." again={start} />;
  return (
    <div className="g-row" key={round}>
      {set.map((b, i) => (
        <button key={b.q} type="button" className={`bub${popped.includes(i) ? " ok" : ""}${wrong === i ? " no" : ""}`} onClick={() => tap(i)}>
          {popped.includes(i) ? b.a : b.q}
        </button>
      ))}
    </div>
  );
}

const TABS = [
  { id: "digit", name: "Digit memory", note: "From the Cognizant set. Tests how much you can hold before it slips.", Game: DigitGame },
  { id: "switch", name: "Switch", note: "From the Cognizant set. Two rules, and you never know which one is next.", Game: SwitchGame },
  { id: "balloon", name: "Balloon math", note: "From the Accenture set. Easy sums, until you have to order them fast.", Game: BalloonGame },
];

export default function TryRound({ startTo }: { startTo: string }) {
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState("Ready");
  const { Game, name, note, id } = TABS[tab];
  return (
    <section id="try" className="sec wrap" aria-labelledby="try-title">
      <div className="head">
        <span className="tag">Try it here</span>
        <Lines id="try-title" lines={["Don't read about it.", <em key="e">Play it.</em>]} />
        <p className="lead" data-up>Short versions of three real rounds, right on this page. No account, nothing to install.</p>
      </div>
      <div className="try" data-up>
        <div className="bez">
          <div className="in play">
            <div className="play-top mono"><span>{name}</span><span aria-live="polite">{status}</span></div>
            <Game key={id} onStatus={setStatus} />
          </div>
        </div>
        <div style={{ display: "grid", gap: 22, alignContent: "start" }}>
          <p className="mono">Pick a round</p>
          <div className="picks" role="group" aria-label="Pick a round">
            {TABS.map((t, i) => (
              <button key={t.id} type="button" className="pick" aria-pressed={i === tab} onClick={() => { setTab(i); setStatus("Ready"); }}>{t.name}</button>
            ))}
          </div>
          <p className="small">{note}</p>
          <p className="small">All {GAMES.length} games are inside, grouped by the company that uses them.</p>
          <div><Btn to={startTo} kind="s">Open all {GAMES.length} games</Btn></div>
        </div>
      </div>
    </section>
  );
}
