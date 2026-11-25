import { LIST_PRICE, PROMO_ACTIVE, PROMO_PRICE, REGULAR_PRICE } from "@/lib/promo";
import { CODING_TOPICS } from "@/pages/coding-questions/data";

// Counted from the data, so the page can never drift from the product.
export const CQ = (() => {
  const diff = { Easy: 0, Medium: 0, Hard: 0 };
  CODING_TOPICS.forEach((t) => t.problems.forEach((p) => { diff[p.difficulty]++; }));
  const sizes = CODING_TOPICS.map((t) => t.problems.length);
  return { diff, sizes, max: Math.max(...sizes), topics: CODING_TOPICS.length };
})();

/** A few real question titles, one from each of the first topics, for the hero film. */
export const SAMPLE_QUESTIONS = CODING_TOPICS.slice(0, 5).map((t) => t.problems[0]);

export const PREMIUM_PRICE = PROMO_ACTIVE ? PROMO_PRICE : REGULAR_PRICE;
export const SHOW_LIST_PRICE = PREMIUM_PRICE < LIST_PRICE;

// Mirrors the Cognitive Games page: three in the Accenture set, nine in the Cognizant set.
export const GAMES = [
  { id: "matrix", name: "Matrix Flow", company: "Accenture", line: "Rotate and flip the tiles until a path runs from start to end." },
  { id: "balloon", name: "Balloon Math", company: "Accenture", line: "Pop the bubbles in order, from the lowest answer to the highest." },
  { id: "maze", name: "Hidden Maze", company: "Accenture", line: "Find a way through walls you cannot see, and remember them." },
  { id: "geo", name: "Geo-Sudo", company: "Cognizant", line: "Fill a 4×4 grid so each row and column has all four shapes." },
  { id: "grid", name: "Grid Challenge", company: "Cognizant", line: "Spot the rule in a 3×3 matrix and pick the missing piece." },
  { id: "motion", name: "Motion Challenge", company: "Cognizant", line: "Tap the coloured targets before they shrink away." },
  { id: "switch", name: "Switch Challenge", company: "Cognizant", line: "Odd or even, vowel or consonant. The task switches on you." },
  { id: "digit", name: "Digit Challenge", company: "Cognizant", line: "Watch the digits flash past, then type the whole sequence." },
  { id: "bart", name: "BART", company: "Cognizant", line: "Pump for points and stop before the balloon pops." },
  { id: "mapping", name: "Mapping Challenge", company: "Cognizant", line: "Decode the output order back to the input positions." },
  { id: "dual", name: "Dual Task", company: "Cognizant", line: "Remember the circle that blinked while you judge symmetry." },
  { id: "inductive", name: "Inductive Challenge", company: "Cognizant", line: "Two grids hide one rule. Find the two that follow it too." },
] as const;

/** Fixed pseudo-random heights (no Math.random, so server and client agree). */
export const waveHeights = (n: number) =>
  Array.from({ length: n }, (_, i) => 0.18 + 0.82 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43 + 1)));
