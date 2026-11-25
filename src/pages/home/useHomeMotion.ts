import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, Draggable);

/**
 * All scroll and entrance motion for the landing page.
 *   data-intro-lines / data-intro   hero entrance, once the splash screen is gone
 *   data-lines                      headline lines rise out of a mask
 *   data-up / data-up-group         fade up (the element / its children in turn)
 *   data-grow                       the film stage scales up as it arrives
 *   data-fill                       words go from faint to solid while scrolling
 *   data-draw                       the outlined wordmark in the closer
 *   data-chip                       hero chips: pop in, and can be dragged with a mouse
 * Under prefers-reduced-motion it does nothing, so content is never left hidden.
 */
export function useHomeMotion(scope: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let drags: Draggable[] = [];
    let cancelWait = () => {};

    const ctx = gsap.context((self) => {
      const all = (s: string) => gsap.utils.toArray<HTMLElement>(s);

      const intro = gsap.timeline({ paused: true });
      intro
        .from("[data-intro-lines] .ln > span", { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.12 }, 0)
        .from("[data-intro]", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity" }, 0.35)
        .from("[data-chip]", { scale: 0, opacity: 0, rotate: () => gsap.utils.random(-30, 30), duration: 0.9, ease: "back.out(1.9)", stagger: 0.09 }, 0.6);
      intro.progress(0.0001); // put everything in its start position before first paint

      const splash = document.querySelector("[data-splash]");
      if (!splash) intro.play();
      else {
        const t = window.setInterval(() => {
          if (document.querySelector("[data-splash]:not([data-leaving])")) return;
          window.clearInterval(t);
          intro.play();
        }, 60);
        cancelWait = () => window.clearInterval(t);
      }

      all("[data-lines]").forEach((el) => {
        gsap.from(el.querySelectorAll(".ln > span"), {
          yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      all("[data-up]").forEach((el) => {
        gsap.from(el, { y: 34, opacity: 0, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });
      all("[data-up-group]").forEach((el) => {
        gsap.from(Array.from(el.children), { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 86%", once: true } });
      });
      all("[data-grow]").forEach((el) => {
        gsap.fromTo(el, { scale: 0.84 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 98%", end: "top 12%", scrub: 0.4 } });
      });
      all("[data-fill]").forEach((el) => {
        gsap.fromTo(el.querySelectorAll(".w"), { opacity: 0.13 }, { opacity: 1, ease: "none", stagger: 0.5, duration: 1, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 52%", scrub: 0.3 } });
      });
      all("[data-draw]").forEach((el) => {
        gsap.fromTo(el, { strokeDasharray: 1500, strokeDashoffset: 1500 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 100%", end: "bottom 92%", scrub: 0.5 } });
      });

      if (window.matchMedia("(pointer: fine)").matches) {
        self.add(() => {
          drags = Draggable.create(all(".chips [data-chip]"), {
            type: "x,y", bounds: root.querySelector(".hero") as HTMLElement, edgeResistance: 0.7, zIndexBoost: true,
            onDragStart() { gsap.to(this.target, { scale: 1.08, duration: 0.25 }); },
            onDragEnd() { gsap.to(this.target, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" }); },
          });
        });
      }
    }, root);

    // Late content (fonts, the live Connect numbers) shifts layout; keep trigger positions honest.
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 700);
    document.fonts?.ready.then(refresh).catch(() => {});
    return () => {
      window.clearTimeout(t);
      cancelWait();
      drags.forEach((d) => d.kill());
      ctx.revert();
    };
  }, [scope]);
}
