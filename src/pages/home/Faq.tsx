import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FREE_COUNT, TOTAL_PROBLEMS } from "@/pages/coding-questions/data";
import { SE_PRICE } from "@/lib/sePremium";
import { PREMIUM_PRICE } from "./facts";
import { Lines } from "./ui";

const QA: Array<[string, ReactNode]> = [
  ["What can I use for free?", <>{FREE_COUNT} coding questions open with no sign-up. With a free account you also get the Cognizant games, the first two levels of Matrix Flow and Hidden Maze, and three rounds of Balloon Math.</>],
  ["What does Premium add?", <>All {TOTAL_PROBLEMS} Infosys SP and DSE questions, levels 3 to 6 in Matrix Flow and Hidden Maze, every Balloon Math round, the full Accenture and Cognizant communication rounds, the AI mock interview, the resume builder and job match. ₹{PREMIUM_PRICE}, once.</>],
  ["Is it a subscription?", <>No. You pay once. Nothing renews.</>],
  ["Is this official Infosys, Accenture or Cognizant material?", <>No. It is practice built around the rounds students report, and we are not affiliated with any of these companies.</>],
  ["How does a Connect call work?", <>Pick a senior, choose a 20-minute slot and pay. Our team confirms the slot by hand and sends one meeting link to both of you. It is not instant.</>],
  ["Is the Infosys SE Playbook part of Premium?", <>No, it is a separate ₹{SE_PRICE} payment for the System Engineer test. The PDF comes to your inbox and the full mock opens online.</>],
  ["Can I get a refund?", <>If you have not opened any premium content yet, yes, on request. The details are in the <Link to="/refund">refund policy</Link>.</>],
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="sec wrap faq" aria-labelledby="faq-title">
      <div className="head">
        <span className="tag">Questions</span>
        <Lines id="faq-title" lines={["Before you", <em key="e">start.</em>]} />
      </div>
      <div>
        {QA.map(([q, a], i) => (
          <div className="qa" key={q}>
            <h3><button type="button" id={`q${i}`} aria-expanded={open === i} aria-controls={`a${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}<i aria-hidden /></button></h3>
            <div id={`a${i}`} role="region" aria-labelledby={`q${i}`} className={`ans${open === i ? " on" : ""}`}><div><p className="small">{a}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  );
}
