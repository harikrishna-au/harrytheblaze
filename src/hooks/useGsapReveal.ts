import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll/entrance motion for the card look. Mark elements inside `scope`:
 *   data-intro            plays once on mount, staggered in DOM order (hero, header)
 *   data-reveal           rises in when it scrolls into view
 *   data-reveal-group     its direct children rise in one after another
 *   data-drop             a card that scales up as it rises in
 *   data-parallax="40"    drifts by that many px while scrolling
 * Does nothing under prefers-reduced-motion, so content is never left hidden.
 */
export function useGsapReveal(scope: RefObject<HTMLElement>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const intro = gsap.utils.toArray<HTMLElement>("[data-intro]");
      // Re-runs (new deps, e.g. data finished loading) must not replay the entrance.
      if (intro.length && !root.dataset.introDone) {
        root.dataset.introDone = "1";
        gsap.from(intro, { y: 36, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, clearProps: "transform,opacity" });
      }

      const at = { start: "top 88%", once: true } as const;

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 44, opacity: 0, duration: 0.8, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, ...at } });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((el) => {
        gsap.from(Array.from(el.children), {
          y: 36, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, ...at },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-drop]").forEach((el) => {
        gsap.from(el, { y: 54, scale: 0.96, opacity: 0, duration: 1.1, ease: "expo.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, ...at } });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          y: Number(el.dataset.parallax) || 40, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, root);

    // Late content (roster, images) shifts layout; keep trigger positions honest.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
