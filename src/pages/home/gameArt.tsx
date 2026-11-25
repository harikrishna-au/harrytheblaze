import type { CSSProperties, ReactNode } from "react";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const Svg = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden>{children}</svg>;
const W = "rgba(255,255,255,.14)", F = "#f4581f", S = "#f3eee3", K = "#15140f", P = "#1f4d43";
const cells = (n: number, size: number, gap: number, x0: number, y0: number) =>
  Array.from({ length: n * n }, (_, i) => ({ i, x: x0 + (i % n) * (size + gap), y: y0 + Math.floor(i / n) * (size + gap) }));

const shape = (k: number, cx: number, cy: number, r: number, fill: string) =>
  k === 0 ? <circle cx={cx} cy={cy} r={r} fill={fill} />
  : k === 1 ? <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx="3" fill={fill} />
  : k === 2 ? <path d={`M${cx} ${cy - r}L${cx + r} ${cy + r}H${cx - r}Z`} fill={fill} />
  : <path d={`M${cx} ${cy - r * 1.25}L${cx + r * 1.25} ${cy}L${cx} ${cy + r * 1.25}L${cx - r * 1.25} ${cy}Z`} fill={fill} />;

/** One small looping drawing per game, showing what you actually do in it. */
export const ART: Record<string, { bg: "n" | "sd" | "fl" | "pn"; el: ReactNode }> = {
  matrix: { bg: "n", el: <Svg>{cells(3, 44, 6, 88, 28).map(({ i, x, y }) => (
    <g key={i}><rect x={x} y={y} width="44" height="44" rx="10" fill={W} />
      <g className={i % 2 ? "va turn" : undefined} style={d(i * 0.12)}><rect x={x} y={y} width="44" height="44" fill="none" /><path d={i % 2 ? `M${x + 22} ${y + 34}V${y + 12}m-8 8l8-8 8 8` : `M${x + 10} ${y + 22}h22m-8-8l8 8-8 8`} stroke={i === 0 || i === 8 ? F : "#fff"} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g></g>))}</Svg> },
  balloon: { bg: "fl", el: <Svg>{[["6 − 4", 78, 106, 0], ["3 × 3", 162, 84, 0.5], ["8 + 7", 246, 112, 1]].map(([q, x, y, t]) => (
    <g key={q as string}><circle cx={x as number} cy={y as number} r="38" fill="none" stroke="rgba(21,20,15,.3)" strokeWidth="1.5" strokeDasharray="4 5" /><g className="va hit" style={d(t as number)}><circle cx={x as number} cy={y as number} r="38" fill={S} /><text x={x as number} y={(y as number) + 5} fontSize="16" textAnchor="middle" fill={K}>{q}</text></g></g>))}</Svg> },
  maze: { bg: "sd", el: <Svg>{cells(5, 28, 4, 82, 22).map(({ i, x, y }) => <rect key={i} x={x} y={y} width="28" height="28" rx="7" fill="rgba(21,20,15,.08)" />)}
    <path className="va draw" pathLength={1} d="M96 164V132H128V100H160V68H192V36H224" stroke={F} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="96" cy="164" r="8" fill={K} /><circle cx="224" cy="36" r="8" fill={P} /></Svg> },
  geo: { bg: "pn", el: <Svg>{cells(4, 36, 5, 80, 20).map(({ i, x, y }) => { const k = ((i % 4) + [0, 2, 1, 3][Math.floor(i / 4)]) % 4; const hid = [2, 5, 11, 12].includes(i);
    return <g key={i}><rect x={x} y={y} width="36" height="36" rx="8" fill="rgba(255,255,255,.1)" /><g className={hid ? "va show" : undefined} style={d(i * 0.05)}>{shape(k, x + 18, y + 18, 9, hid ? F : S)}</g></g>; })}</Svg> },
  grid: { bg: "n", el: <Svg>{cells(3, 46, 6, 84, 24).map(({ i, x, y }) => (
    <g key={i}><rect x={x} y={y} width="46" height="46" rx="10" fill={i === 8 ? "none" : W} stroke={i === 8 ? F : "none"} strokeDasharray="5 4" strokeWidth="2" />
      <text className={i === 8 ? "va show" : undefined} x={x + 23} y={y + 29} textAnchor="middle" fontSize="18" fill={i === 8 ? F : "#fff"}>{3 + i * 3}</text></g>))}</Svg> },
  motion: { bg: "sd", el: <Svg>{[[70, 70, 30, F, 0], [160, 120, 38, K, -0.8], [248, 66, 26, P, -1.5], [242, 148, 22, F, -0.4], [88, 148, 20, K, -2]].map(([x, y, r, c, t], i) => (
    <g key={i}><circle cx={x as number} cy={y as number} r={r as number} fill="none" stroke="rgba(21,20,15,.16)" strokeWidth="1.5" /><circle className="va shrink" style={d(t as number)} cx={x as number} cy={y as number} r={r as number} fill={c as string} /></g>))}</Svg> },
  switch: { bg: "fl", el: <Svg><rect x="112" y="28" width="96" height="104" rx="20" fill={S} /><text className="va flip" x="160" y="98" fontSize="54" textAnchor="middle" fill={K}>7</text><text className="va flip" style={d(-2)} x="160" y="98" fontSize="54" textAnchor="middle" fill={K}>A</text>
    <rect x="66" y="148" width="88" height="30" rx="15" fill={K} /><rect x="166" y="148" width="88" height="30" rx="15" fill={K} /><g fontSize="12" textAnchor="middle" fill="#fff"><text className="va flip" x="110" y="167">odd</text><text className="va flip" x="210" y="167">even</text><text className="va flip" style={d(-2)} x="110" y="167">vowel</text><text className="va flip" style={d(-2)} x="210" y="167">consonant</text></g></Svg> },
  digit: { bg: "n", el: <Svg>{["4", "9", "1", "7", "2"].map((n, i) => <text key={i} className="va dig" style={d(i * 0.8)} x="160" y="128" fontSize="92" textAnchor="middle" fill="#fff">{n}</text>)}
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} className="va show" style={d(i * 0.18)} x={108 + i * 22} y="162" width="14" height="4" rx="2" fill={F} />)}</Svg> },
  bart: { bg: "pn", el: <Svg><g className="va pump"><ellipse cx="160" cy="84" rx="62" ry="68" fill={F} /><path d="M152 150h16l-8-10z" fill={F} /></g><path d="M160 158c-6 14 8 18 0 36" stroke={S} strokeWidth="2" fill="none" /></Svg> },
  mapping: { bg: "sd", el: <Svg>{[0, 1, 2, 3].map((i) => <g key={i}>{shape(i, 88 + i * 48, 48, 13, K)}{shape([2, 0, 3, 1][i], 88 + i * 48, 152, 13, F)}<path className="va draw" style={d(i * 0.3)} pathLength={1} d={`M${88 + [2, 0, 3, 1][i] * 48} 68C${88 + [2, 0, 3, 1][i] * 48} 100 ${88 + i * 48} 100 ${88 + i * 48} 130`} stroke="rgba(21,20,15,.55)" strokeWidth="2" fill="none" /></g>)}</Svg> },
  dual: { bg: "n", el: <Svg>{[0, 1, 2, 3, 4].map((i) => <circle key={i} className="va glow" style={d([0, 2.6, 1.3, 3.2, 0.7][i])} cx={80 + i * 40} cy="52" r="14" fill={W} />)}
    {[[0, 0], [1, 0], [1, 1], [0, 2], [2, 1], [2, 2]].map(([a, b], i) => <g key={i} fill="#fff"><rect x={136 - a * 22} y={92 + b * 26} width="18" height="22" rx="4" /><rect x={166 + a * 22} y={92 + b * 26} width="18" height="22" rx="4" /></g>)}<path d="M160 86v86" stroke={F} strokeDasharray="4 5" strokeWidth="2" /></Svg> },
  inductive: { bg: "pn", el: <Svg>{[0, 1].map((g) => <g key={g}>{cells(3, 30, 5, 50 + g * 124, 50).map(({ i, x, y }) => <rect key={i} x={x} y={y} width="30" height="30" rx="7" fill={(g ? [2, 4, 6] : [0, 4, 8]).includes(i) ? S : "rgba(255,255,255,.1)"} />)}</g>)}
    <path className="va draw" pathLength={1} d="M154 178C160 190 168 190 174 178" stroke={F} strokeWidth="4" fill="none" strokeLinecap="round" /><circle className="va show" cx="164" cy="28" r="9" fill={F} /></Svg> },
};
