import { describe, expect, it } from "vitest";
import { CODING_Q, INTERVIEW_Q, P1, P2, P3, PROBLEMS, TASTER, questionFacts, scoreTaster, topicFor, type Answers } from "./data";

// Independent brute-force solutions: the answer key must agree with them.
const countPairs = (a: number[], t: number) => {
  let n = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) n++;
  return n;
};
const longestTwoDistinct = (s: string) => {
  let best = 0;
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
    if (new Set(s.slice(i, j + 1)).size <= 2) best = Math.max(best, j - i + 1);
  }
  return best;
};
const greedyCoins = (coins: number[], amt: number) => {
  let n = 0;
  for (const c of [...coins].sort((a, b) => b - a)) { n += Math.floor(amt / c); amt %= c; }
  return n;
};
const minCoins = (coins: number[], amt: number) => {
  const best = Array(amt + 1).fill(Infinity); best[0] = 0;
  for (let a = 1; a <= amt; a++) for (const c of coins) if (c <= a) best[a] = Math.min(best[a], best[a - c] + 1);
  return best[amt];
};

const key = (id: string) => { const q = TASTER.find((x) => x.id === id)!; return q.options[q.answer]; };

describe("taster answer key", () => {
  it("problem 1 trace matches brute force", () => {
    expect(countPairs(P1.nums, P1.target)).toBe(4);
    expect(key("p1-trace")).toBe(String(countPairs(P1.nums, P1.target)));
  });
  it("problem 2 trace matches brute force", () => {
    expect(longestTwoDistinct(P2.s)).toBe(6);
    expect(key("p2-trace")).toBe(String(longestTwoDistinct(P2.s)));
  });
  it("problem 3 trace matches the greedy and optimal answers", () => {
    const g = greedyCoins(P3.coins, P3.amount), m = minCoins(P3.coins, P3.amount);
    expect([g, m]).toEqual([3, 2]);
    expect(key("p3-trace")).toBe(`${g} coins, and the minimum is ${m}`);
  });
  it("greedy really is wrong for the coin set used", () => {
    expect(greedyCoins(P3.coins, P3.amount)).toBeGreaterThan(minCoins(P3.coins, P3.amount));
  });
  it("trace questions have exactly one option equal to the right answer", () => {
    for (const id of ["p1-trace", "p2-trace", "p3-trace"]) {
      const q = TASTER.find((x) => x.id === id)!;
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});

describe("taster shape", () => {
  it("has 6 coding (2 per problem) and 3 interview questions, all with a valid answer index", () => {
    expect(CODING_Q).toHaveLength(6);
    expect(INTERVIEW_Q).toHaveLength(3);
    for (const p of [1, 2, 3]) expect(CODING_Q.filter((q) => q.problem === p)).toHaveLength(2);
    for (const q of TASTER) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.why.length).toBeGreaterThan(40);
    }
  });
  it("does not always put the right answer in the same slot", () => {
    const slots = new Set(TASTER.map((q) => q.answer));
    expect(slots.size).toBeGreaterThanOrEqual(3);
    const counts = [0, 1, 2, 3].map((i) => TASTER.filter((q) => q.answer === i).length);
    expect(Math.max(...counts)).toBeLessThanOrEqual(4);
  });
  it("each problem maps to a real topic in the coding set", () => {
    for (const p of PROBLEMS) {
      const t = topicFor(p);
      expect(t, p.topic).not.toBeNull();
      expect(t!.count).toBeGreaterThan(0);
    }
  });
});

describe("scoreTaster", () => {
  const all: Answers = Object.fromEntries(TASTER.map((q) => [q.id, q.answer]));
  it("all correct: SP band, 6 coding and 3 interview points", () => {
    const r = scoreTaster(all);
    expect(r).toMatchObject({ perProblem: [2, 2, 2], fullProblems: 3, codingPoints: 6, interviewPoints: 3, band: "sp" });
  });
  it("two full problems: DSE band", () => {
    expect(scoreTaster({ ...all, "p3-approach": 3, "p3-trace": 0 }).band).toBe("dse");
  });
  it("partial credit: one right answer on a problem gives 1 point but is not a full problem", () => {
    const r = scoreTaster({ ...all, "p3-approach": 3 });
    expect(r.perProblem).toEqual([2, 2, 1]);
    expect(r.band).toBe("dse");
  });
  it("only one full problem or none: warm-up band", () => {
    expect(scoreTaster({ "p1-approach": 1, "p1-trace": 2 }).band).toBe("warmup");
    expect(scoreTaster({}).band).toBe("warmup");
  });
  it("treats skipped (null/undefined) as wrong and ignores unknown ids", () => {
    const r = scoreTaster({ "p1-approach": null, "p1-trace": undefined, nope: 1 });
    expect(r.codingPoints).toBe(0);
  });
});

describe("questionFacts", () => {
  const f = questionFacts();
  it("adds up: difficulty, sources and topics all total the whole set", () => {
    expect(f.diff.Easy + f.diff.Medium + f.diff.Hard).toBe(f.total);
    expect(f.leetcode + f.gfg).toBe(f.total);
    expect(f.topics.reduce((n, t) => n + t.count, 0)).toBe(f.total);
  });
  it("matches the figures the creator scripts and home page quote", () => {
    expect(f.total).toBe(327);
    expect(f.free).toBe(50);
    expect(f.topics).toHaveLength(17);
    expect(f.diff).toEqual({ Easy: 82, Medium: 176, Hard: 69 });
    expect(f.hardOrMediumPct).toBe(75);
    expect(f.topics[0]).toMatchObject({ title: "Dynamic Programming", count: 47 });
    expect(f.topics[1]).toMatchObject({ title: "Graphs", count: 44 });
  });
  it("topics are sorted largest first, and every sample is a real free question with a link", () => {
    for (let i = 1; i < f.topics.length; i++) expect(f.topics[i - 1].count).toBeGreaterThanOrEqual(f.topics[i].count);
    expect(f.samples.length).toBeGreaterThan(0);
    for (const s of f.samples) { expect(s.link).toMatch(/^https:\/\//); expect(s.title.length).toBeGreaterThan(2); }
  });
});
