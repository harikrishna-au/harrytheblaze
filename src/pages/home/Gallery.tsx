import { useEffect, useRef, useState, type CSSProperties } from "react";
import { GAMES } from "./facts";
import { ART } from "./gameArt";
import { Lines } from "./ui";
import { useInView } from "./useInView";

/** All the games. On a desktop the row slides sideways as you scroll; on a phone you swipe it. */
export default function Gallery() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null); // null = not pinned
  const inView = useInView(ref, "200px");

  useEffect(() => {
    const el = ref.current, row = track.current;
    if (!el || !row) return;
    const mq = window.matchMedia("(min-width: 1000px) and (min-height: 620px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let dist = 0, raf = 0;
    const paint = () => {
      raf = 0;
      if (!mq.matches) { row.style.transform = ""; return; }
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / Math.max(1, dist)));
      row.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      bar.current?.style.setProperty("--p", p.toFixed(4));
    };
    const measure = () => {
      dist = Math.max(0, row.scrollWidth - document.documentElement.clientWidth);
      setHeight(mq.matches ? dist + window.innerHeight : null);
      paint();
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("scroll", on); window.removeEventListener("resize", measure); mq.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section id="rounds" ref={ref} className={`gal${height ? " pinned" : ""}${inView ? "" : " paused"}`} style={height ? { height } : undefined} aria-labelledby="gal-title">
      <div className="gal-pin">
        <div className="wrap head">
          <span className="tag">Cognitive games</span>
          <Lines id="gal-title" lines={[<>Twelve games. <em>Meet them now.</em></>]} />
        </div>
        <div className="gal-view" {...(height ? {} : { tabIndex: 0, role: "region", "aria-label": "All games, scroll sideways" })}>
          <div ref={track} className="gal-track">
            {GAMES.map((g) => (
              <article key={g.id} className="bez gcard">
                <div className="in">
                  <div className={`art ${ART[g.id].bg}`}>{ART[g.id].el}</div>
                  <div className="cap">
                    <div><h3 className="h3">{g.name}</h3><span className="mono">{g.company}</span></div>
                    <p className="small">{g.line}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="wrap"><div ref={bar} className="prog" aria-hidden style={{ "--p": 0 } as CSSProperties}><span /></div></div>
      </div>
    </section>
  );
}
