import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";

type BtnProps = { to: string; kind?: "p" | "s" | "k"; wide?: boolean; down?: boolean; children: ReactNode };

/** Pill button with the arrow in its own circle. "#id" links scroll, everything else routes. */
export const Btn = ({ to, kind = "p", wide, down, children }: BtnProps) => {
  const cls = `btn ${kind}${wide ? " w" : ""}`;
  const inner = (
    <>
      {children}
      <i aria-hidden>{down ? <ArrowDown className="down" /> : <ArrowUpRight />}</i>
    </>
  );
  return to.startsWith("#") ? <a href={to} className={cls}>{inner}</a> : <Link to={to} className={cls}>{inner}</Link>;
};

/** Headline whose lines rise out of a mask. */
export const Lines = ({ lines, as: Tag = "h2", className = "h2", id, intro }: {
  lines: ReactNode[]; as?: "h1" | "h2"; className?: string; id?: string; intro?: boolean;
}) => (
  <Tag id={id} className={className} {...(intro ? { "data-intro-lines": "" } : { "data-lines": "" })}>
    {lines.map((l, i) => <span className="ln" key={i}><span>{l}{i < lines.length - 1 ? " " : ""}</span></span>)}
  </Tag>
);
