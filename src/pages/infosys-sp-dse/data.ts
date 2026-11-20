// Content for the public /infosys-sp-dse page.
// Rounds, roles and the scoring advice come from the HackWithInfy pages already on the site (candidate reports).
// The taster questions are original; every number in them is checked by brute force in data.test.ts.

import { CODING_TOPICS, FREE_COUNT, FREE_IDS, TOTAL_PROBLEMS, type Difficulty } from "@/pages/coding-questions/data";

export const ROLES = [
  { label: "DSE", lpa: "₹7 LPA", sub: "6.25L + ₹75K joining" },
  { label: "SP L1", lpa: "₹11 LPA", sub: "10L + ₹1L joining. Campus offers vary", hero: true },
  { label: "SP L2", lpa: "₹16 LPA", sub: "After probation (6 months)" },
  { label: "SP L3", lpa: "₹21 LPA", sub: "After probation (6 months)" },
];

export const ROUNDS = [
  {
    num: "01",
    title: "Online coding test",
    badge: "3 questions · 3 hours · virtual",
    shortlists: "Shortlists for DSE and SP",
    desc: "Three questions in three hours, easy to hard. Languages: C, C++, Java, Python, JavaScript.",
  },
  {
    num: "02",
    title: "Advanced coding test",
    badge: "4 questions, pick 3 · 3 hours · on-site",
    shortlists: "Shortlists for SP",
    desc: "Four questions (easy, medium, hard, complex). You choose any three to solve in three hours.",
  },
  {
    num: "03",
    title: "Interview",
    badge: "About 1 hour · technical + HR",
    shortlists: "Decides the offer",
    desc: "CS and IT: DSA, automata, compilers, OS, networks, OOP. Other streams: DSA, digital electronics, maths, control systems.",
  },
];

/** How candidates report the first round is scored and how to spend the three hours. */
export const TIME_SPLIT = [
  { p: "Problem 1 · Easy", plan: "Under 25 minutes", note: "A warm-up with guaranteed points. Do not over-engineer it." },
  { p: "Problem 2 · Medium", plan: "50 to 60 minutes", note: "Most of the shortlisting marks are decided here." },
  { p: "Problem 3 · Hard", plan: "Whatever is left", note: "A partial solution that passes some test cases still earns marks." },
];

export const SCORING_NOTES = [
  "Marks follow the test cases you pass, so a brute-force answer that passes some cases beats a blank one. Candidates report there is no negative marking.",
  "Read all the problems in the first five minutes and choose your order. The hard one sometimes hides a clever observation that makes it medium.",
  "Candidates report DSE shortlisting from solving the first two problems well, and SP from solving all three, or nearly.",
  "Check the constraints before you code. An O(n²) answer with n = 10⁵ times out. Test n = 0, n = 1 and all-equal inputs.",
];

// ─── The taster ───────────────────────────────────────────────────────────────

export type TasterQ = {
  id: string;
  stage: "coding" | "interview";
  /** Which of the three coding problems this belongs to (coding only). */
  problem?: 1 | 2 | 3;
  prompt: string;
  /** A short statement shown above the prompt (the problem). */
  context?: string;
  options: string[];
  answer: number;
  why: string;
};

export const PROBLEMS = [
  {
    n: 1 as const,
    level: "Easy",
    title: "Count the pairs",
    statement: "You get an array of n integers and a target. Count the pairs (i, j) with i < j and nums[i] + nums[j] = target. n goes up to 100,000.",
    topic: "Arrays",
  },
  {
    n: 2 as const,
    level: "Medium",
    title: "Longest two-letter stretch",
    statement: "Given a string of length up to 200,000, find the length of the longest substring that has at most 2 distinct characters.",
    topic: "Sliding Window & Two Pointers",
  },
  {
    n: 3 as const,
    level: "Hard",
    title: "Fewest coins",
    statement: "You have coin values and an amount up to 10,000. Find the fewest coins that add up to the amount. Each coin can be used any number of times.",
    topic: "Dynamic Programming",
  },
];

// The numbers used below, kept as data so the test can re-derive them.
export const P1 = { nums: [1, 5, 3, 3, 3], target: 6 };
export const P2 = { s: "aabacbebebe" };
export const P3 = { coins: [1, 3, 4], amount: 6 };

export const TASTER: TasterQ[] = [
  {
    id: "p1-approach",
    stage: "coding",
    problem: 1,
    prompt: "n can be 100,000. Which approach is fast enough?",
    options: [
      "Two nested loops over every pair",
      "One pass, keeping a hash map of how many times each value has appeared so far",
      "Try every subset of the array",
      "Recursion that picks or skips each element",
    ],
    answer: 1,
    why: "Nested loops are about 10¹⁰ steps at n = 100,000, which times out. For each element, look up how many earlier elements equal target minus that element. One pass, O(n).",
  },
  {
    id: "p1-trace",
    stage: "coding",
    problem: 1,
    context: "nums = [1, 5, 3, 3, 3] and target = 6",
    prompt: "How many pairs add up to 6?",
    options: ["3", "5", "4", "6"],
    answer: 2,
    why: "(1, 5) is one pair. The three 3s make three pairs between themselves (3 + 3 = 6). That is 4 in total. Duplicates are exactly what a hash map of counts handles and a set does not.",
  },
  {
    id: "p2-approach",
    stage: "coding",
    problem: 2,
    prompt: "The string is up to 200,000 characters. What is the right idea?",
    options: [
      "Check every substring and count its distinct letters",
      "Sort the characters and group them",
      "A window that grows on the right and shrinks from the left whenever it holds more than 2 distinct characters",
      "Recursion on every split point",
    ],
    answer: 2,
    why: "Every substring is about 2 × 10¹⁰ checks. A sliding window moves each end at most n times, so it is O(n). Keep a small count of each character inside the window.",
  },
  {
    id: "p2-trace",
    stage: "coding",
    problem: 2,
    context: 's = "aabacbebebe"',
    prompt: "What is the length of the longest substring with at most 2 distinct characters?",
    options: ["4", "7", "5", "6"],
    answer: 3,
    why: 'The stretch "bebebe" has only b and e and is 6 long. Adding the c before it brings in a third letter, and "aaba" is only 4.',
  },
  {
    id: "p3-approach",
    stage: "coding",
    problem: 3,
    prompt: "Amount up to 10,000. Which idea gives the true minimum?",
    options: [
      "DP over amounts: best[a] = 1 + the smallest best[a − coin] over all coins",
      "Always take the largest coin that still fits",
      "Try every combination with plain recursion and no memo",
      "Sort the coins and binary search the amount",
    ],
    answer: 0,
    why: "Taking the largest coin first is the trap: it is fast but wrong for some coin sets. The DP builds the answer for every smaller amount once, O(amount × coins).",
  },
  {
    id: "p3-trace",
    stage: "coding",
    problem: 3,
    context: "coins = [1, 3, 4] and amount = 6",
    prompt: "The largest-coin-first idea uses how many coins, and what is the true minimum?",
    options: ["2 coins, and the minimum is 2", "3 coins, and the minimum is 3", "3 coins, and the minimum is 2", "2 coins, and the minimum is 1"],
    answer: 2,
    why: "Largest first takes 4, then 1, then 1, which is 3 coins. The best is 3 + 3, which is 2 coins. That gap is why this question is in the hard slot.",
  },
  {
    id: "i-deadlock",
    stage: "interview",
    prompt: "Which of these is NOT needed for a deadlock to happen?",
    options: [
      "Mutual exclusion",
      "Hold and wait",
      "Circular wait",
      "Resources can be forcibly taken away from a process",
    ],
    answer: 3,
    why: "The four conditions are mutual exclusion, hold and wait, no preemption and circular wait. If resources can be taken away, that breaks one of them, so it is not a condition for deadlock.",
  },
  {
    id: "i-thread",
    stage: "interview",
    prompt: "What mainly separates a thread from a process?",
    options: [
      "Threads of one process share its memory but each has its own stack and registers",
      "Every thread gets a completely separate address space",
      "Threads cannot run on more than one core",
      "Threads can only talk to each other through pipes",
    ],
    answer: 0,
    why: "Threads inside one process share the code, data and heap, and each keeps its own stack and registers. Processes have separate address spaces. Interviewers like an example, so say it with a real one.",
  },
  {
    id: "i-udp",
    stage: "interview",
    prompt: "Which of these is connectionless and does not guarantee delivery or order?",
    options: ["TCP", "HTTP", "SMTP", "UDP"],
    answer: 3,
    why: "UDP sends datagrams with no handshake and no retransmission, so it is fast but unreliable. TCP is connection-based and reliable, and HTTP and SMTP are application protocols that usually run on top of TCP.",
  },
];

export const CODING_Q = TASTER.filter((q) => q.stage === "coding");
export const INTERVIEW_Q = TASTER.filter((q) => q.stage === "interview");

/** Seconds on the clock for the coding part of the taster. The real round is three hours. */
export const CODING_SECONDS = 240;

// ─── Scoring ──────────────────────────────────────────────────────────────────

export type Answers = Record<string, number | null | undefined>;

export type TasterResult = {
  /** Points (0 to 2) for each of the three coding problems. */
  perProblem: [number, number, number];
  fullProblems: number;
  codingPoints: number;
  interviewPoints: number;
  band: "sp" | "dse" | "warmup";
};

export function scoreTaster(answers: Answers): TasterResult {
  const per: [number, number, number] = [0, 0, 0];
  let interview = 0;
  for (const q of TASTER) {
    if (answers[q.id] !== q.answer) continue;
    if (q.stage === "coding" && q.problem) per[q.problem - 1]++;
    else interview++;
  }
  const full = per.filter((p) => p === 2).length;
  const band = full >= 3 ? "sp" : full === 2 ? "dse" : "warmup";
  return { perProblem: per, fullProblems: full, codingPoints: per[0] + per[1] + per[2], interviewPoints: interview, band };
}

/** The topic card from the real question set that matches a taster problem. */
export function topicFor(problem: (typeof PROBLEMS)[number]) {
  const t = CODING_TOPICS.find((x) => x.title === problem.topic);
  return t ? { title: t.title, count: t.problems.length } : null;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const FAQ = [
  {
    q: "Are these the exact questions Infosys asks?",
    a: "No one outside Infosys can promise that, and we do not. The set was collected from a survey of people who got the SP and DSE roles, section by section, with a reference for each. Use it to learn the patterns the tests lean on, not to bet on one question appearing.",
  },
  {
    q: "Do I need to sign up to try it?",
    a: "No. You can open 50 questions without an account, and take the taster above without one. Signing in only saves your progress, and Premium unlocks the rest.",
  },
  {
    q: "What does the full set cost?",
    a: "One payment, lifetime Premium, no renewal. It opens all the coding questions and the rest of the practice suite.",
  },
  {
    q: "Which language should I use?",
    a: "The online test accepts C, C++, Java, Python and JavaScript. Pick the one you can write fastest without looking things up. Every question links to a judge where you can use any of them.",
  },
  {
    q: "Is this affiliated with Infosys?",
    a: "No. It is independent prep material built from candidate reports. Infosys changes its process from year to year, so check the official notice for your drive.",
  },
];

// ─── Facts about the real question set (counted, never typed) ─────────────────

export function questionFacts() {
  const diff: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  let leetcode = 0, gfg = 0;
  for (const t of CODING_TOPICS) for (const p of t.problems) {
    diff[p.difficulty]++;
    const link = p.link ?? "";
    if (link.includes("leetcode.com")) leetcode++;
    else if (link.includes("geeksforgeeks.org")) gfg++;
  }
  const topics = CODING_TOPICS
    .map((t) => ({ id: t.id, title: t.title, count: t.problems.length }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
  // One free question from each of the biggest topics: a real taste of what the 50 look like.
  const samples = topics.slice(0, 6).flatMap((tp) => {
    const t = CODING_TOPICS.find((x) => x.id === tp.id)!;
    // Prefer a real problem over a topic primer ("Introduction to ...") so the sample shows what the questions are like.
    const free = t.problems.filter((x) => FREE_IDS.has(x.id) && x.link);
    const p = free.find((x) => !/^introduction/i.test(x.title)) ?? free[0];
    return p && p.link ? [{ topic: t.title, title: p.title, difficulty: p.difficulty, link: p.link }] : [];
  });
  return {
    total: TOTAL_PROBLEMS,
    free: FREE_COUNT,
    topics,
    diff,
    leetcode,
    gfg,
    hardOrMediumPct: Math.round(((diff.Medium + diff.Hard) / TOTAL_PROBLEMS) * 100),
    samples,
  };
}
