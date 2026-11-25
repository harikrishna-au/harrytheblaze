import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Btn } from "./ui";

const LINKS: Array<[string, string]> = [
  ["/infosys-sp-dse", "SP and DSE"],
  ["/infosys-se", "Infosys SE"],
  ["#rounds", "Games"],
  ["#connect", "Connect 1:1"],
  ["#pricing", "Pricing"],
  ["/blog", "Blog"],
];
const NavLink = ({ to, children, onClick }: { to: string; children: string; onClick?: () => void }) =>
  to.startsWith("#") ? <a href={to} onClick={onClick}>{children}</a> : <Link to={to} onClick={onClick}>{children}</Link>;

/** Floating pill. Slips away while scrolling down and comes back on the way up. */
export default function Nav({ isSignedIn, primaryTo }: { isSignedIn: boolean; primaryTo: string }) {
  const [off, setOff] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setOff(y > last && y > 240);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1061px)");
    const close = () => mq.matches && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    mq.addEventListener("change", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", key); mq.removeEventListener("change", close); };
  }, [open]);

  const shut = () => setOpen(false);
  return (
    <>
      <header className={`nav${off && !open ? " off" : ""}`} onFocusCapture={() => setOff(false)}>
        <Link to="/" className="brand" onClick={shut}><img src="/favicon.svg" alt="" />Harry The Blaze</Link>
        <nav className="nav-links" aria-label="Main">{LINKS.map(([to, t]) => <NavLink key={to} to={to}>{t}</NavLink>)}</nav>
        <div className="nav-end">
          {!isSignedIn && <Link to="/login">Sign in</Link>}
          <Btn to={primaryTo}>{isSignedIn ? "Dashboard" : "Get started"}</Btn>
        </div>
        <button type="button" className="burger" aria-expanded={open} aria-controls="hx-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          <span /><span />
        </button>
      </header>
      <div id="hx-menu" className={`sheet${open ? " on" : ""}`}>
        <nav aria-label="Menu">{LINKS.map(([to, t]) => <NavLink key={to} to={to} onClick={shut}>{t}</NavLink>)}</nav>
        <div style={{ display: "grid", gap: 10 }}>
          <Btn to={primaryTo} wide>{isSignedIn ? "Dashboard" : "Get started"}</Btn>
          {!isSignedIn && <Btn to="/login" kind="s" wide>Sign in</Btn>}
        </div>
      </div>
    </>
  );
}
