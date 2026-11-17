// Content for the Infosys System Engineer (SE) section.
// Source: "Infosys Ultimate Prep Guide 2026-27", chapters 1-4, 21 and 30.
// Figures marked "reported" are candidate reports, not published by Infosys —
// the page says so where it matters.

// ─── The paid guide ───────────────────────────────────────────────────────────
// The PDF itself is never on this page. It is emailed to the buyer when they pay and can be
// downloaded again from the se-premium-content edge function (a private storage bucket).

export const SE_GUIDE = {
  title: "The Infosys SE Playbook",
  pages: 53,
  note: "Formulas and questions ranked by how often each type is tested.",
};

// What the Playbook holds, counted from the PDF itself.
export const GUIDE_INSIDE: { n: string; label: string }[] = [
  { n: "53", label: "pages in one PDF" },
  { n: "30", label: "formula cards, ranked P1 to P3" },
  { n: "86", label: "original questions with worked solutions" },
  { n: "24", label: "SE interview answers you can say aloud" },
  { n: "2", label: "timed half-mocks inside the PDF" },
  { n: "4", label: "week study plan for the SE test" },
];

// Where to find things in the PDF.
export const SE_GUIDE_MAP: { part: string; what: string; pages: string }[] = [
  { part: "Start here", what: "The test map, the P1 / P2 / P3 priority system and the routine that works", pages: "p. 2" },
  { part: "Part 1 · Formula vault", what: "30 ranked formula cards for maths, reasoning, verbal, pseudocode and puzzles, plus the one-page P1 cheat sheet", pages: "p. 3–17" },
  { part: "Part 2 · Question bank", what: "86 original questions, the most-tested types first. Try before you peek", pages: "p. 18–36" },
  { part: "Part 3 · Answers & solutions", what: "A worked method for every question, not just the letter", pages: "p. 37–44" },
  { part: "Part 4 · Interview & essay kit", what: "24 SE interview answers, an essay template and a sample", pages: "p. 45–48" },
  { part: "Part 5 · Mocks, plan & checklist", what: "Two timed half-mocks, a 4-week plan, a test-day checklist and an error log", pages: "p. 49–51" },
];

// ─── Snapshot ─────────────────────────────────────────────────────────────────
export const SNAPSHOT = [
  { label: "2026 package", value: "₹3.6 LPA", sub: "Offer-letter annexure is the only figure that counts" },
  { label: "Online test", value: "54 Q · ~100 min", sub: "5 sections, each with its own timer and cut-off" },
  { label: "Interview", value: "15–30 min", sub: "One round: technical + HR together" },
  { label: "Training", value: "4–6 months", sub: "Global Education Centre, Mysuru, then a project" },
];

// ─── 1. Eligibility ───────────────────────────────────────────────────────────
export const ELIGIBILITY: { title: string; body: string }[] = [
  {
    title: "Marks",
    body: "60% or 6.0 CGPA in 10th, 12th/diploma and graduation, as stated in the 2026 drive notices. Always read your own drive's notice — the cut-off is printed there.",
  },
  {
    title: "Degrees",
    body: "B.E./B.Tech from any branch. Drives also list M.E./M.Tech, MCA and M.Sc when they are open to them. Non-CS branches are hired for SE.",
  },
  {
    title: "Backlogs",
    body: "No active backlog at the time of joining, and every exam including viva must be cleared before your joining date.",
  },
  {
    title: "Education gap",
    body: "Drives usually state a maximum gap. Check your notice and keep proof of the reason for any gap.",
  },
  {
    title: "Location",
    body: "Residing in India for the India roles, and not employed elsewhere at the time of joining.",
  },
  {
    title: "Batches",
    body: "Each drive states the graduating batches it is open to. The 2026 SP/DSE drives took 2026 and 2027 graduates — confirm yours in the notice.",
  },
];

export const DOCUMENTS = [
  "10th and 12th/diploma mark sheets and certificates; all semester mark sheets; provisional/degree certificate when issued",
  "Aadhaar and PAN",
  "A passport — or apply now. Without one, Infosys runs a criminal-record check instead",
  "A one-page résumé (PDF) with the same details you put on the application",
  "At least four passport-size photos (you need them at joining)",
  "Working webcam, microphone and stable internet for proctored online tests",
  "An e-mail ID and phone number you will keep for at least a year — all offer communication goes there",
];

// ─── 2. Hiring stages ─────────────────────────────────────────────────────────
export const ROUTES = [
  {
    title: "Campus drive",
    steps: "Your college's training & placement office (TPO) sends the eligibility list to Infosys → you get a test invitation by e-mail → online test → interview → result through the TPO and by e-mail.",
    note: "Same-day results are common: one 2025 campus report had the test on day 1, results that evening, interviews on day 2.",
  },
  {
    title: "Off-campus drive",
    steps: "Register on the Infosys careers portal with an e-mail ID you check daily → test invitation from an @infosys.com address (check spam) → take the test from home with a webcam, or at a test centre → shortlisted candidates get an interview slot, online or at the nearest Infosys centre.",
    note: "Expect 1–3 weeks for the test result and several weeks for the selection list.",
  },
];

export const STAGES: { n: string; title: string; detail: string; gap: string; meanwhile: string }[] = [
  {
    n: "1",
    title: "Online test",
    detail: "54 questions in about 100 minutes (about 2 hours on drives that add the essay). Five timed sections.",
    gap: "Result: same evening on some campuses, 1–3 weeks off-campus",
    meanwhile: "Prepare your project explanation and a 1-minute introduction. Revise one language and DBMS.",
  },
  {
    n: "2",
    title: "Interview",
    detail: "15–30 minutes, technical and HR together. Usually resume-driven.",
    gap: "Often the next day on campus; up to 2 weeks otherwise",
    meanwhile: "Re-read your résumé line by line. Prepare “Why Infosys?” and your relocation answer.",
  },
  {
    n: "3",
    title: "Selection list",
    detail: "Selected candidates are announced through the TPO or by e-mail.",
    gap: "1–2 days on campus; up to 4 weeks off-campus",
    meanwhile: "Finish your degree. No active backlogs at joining.",
  },
  {
    n: "4",
    title: "Letter of Intent → offer letter",
    detail: "A Letter of Intent (LOI) confirms you are selected and that a formal offer will follow once a joining batch is planned. The offer letter with the salary annexure comes through the onboarding portal.",
    gap: "Several weeks to a few months",
    meanwhile: "Watch your mail and spam for the onboarding portal invite. Apply for a passport.",
  },
  {
    n: "5",
    title: "Onboarding & joining",
    detail: "Upload documents, complete verification, then report to the Mysuru campus when your batch is scheduled.",
    gap: "Depends on training-batch capacity",
    meanwhile: "Start the generic-training syllabus: Java basics, OOP, SQL.",
  },
];

export const WHAT_DECIDES: { stage: string; measured: string; how: string }[] = [
  {
    stage: "SE test",
    measured: "Every section must cross its own cut-off (reported at about 60–75%)",
    how: "Don't sacrifice any section; follow the time plan for each section.",
  },
  {
    stage: "Technical interview",
    measured: "Fundamentals, projects, clarity, honesty",
    how: "Answer in structure: definition → example → trade-off.",
  },
  {
    stage: "HR",
    measured: "Communication, flexibility (location, technology, shifts), motivation",
    how: "Short, honest answers. Never refuse relocation.",
  },
];

// ─── 3. The online test ───────────────────────────────────────────────────────
export const TEST_SECTIONS: { name: string; q: number; min: number; level: string }[] = [
  { name: "Mathematical ability", q: 10, min: 35, level: "Moderate–high · long multi-step questions" },
  { name: "Logical reasoning", q: 15, min: 25, level: "Moderate–high · puzzles, data sufficiency, syllogisms" },
  { name: "Verbal ability", q: 20, min: 20, level: "Moderate · grammar, vocabulary, reading" },
  { name: "Pseudocode", q: 5, min: 10, level: "High · loops, recursion, bitwise operators" },
  { name: "Puzzle solving", q: 4, min: 10, level: "Moderate · numerical and logic puzzles" },
];

export const CAMPUS_VARIANT =
  "Some campus drives in 2024–25 ran a seven-section, two-hour test, sometimes on offline computers at the college: numerical ability, logical reasoning, English grammar, pseudocode, puzzles, verbal ability and a 200-word essay. Interviewers have later asked candidates about the essay they wrote — write something you can talk about.";

// ─── 4. Topics ────────────────────────────────────────────────────────────────
export const TOPICS: { section: string; topics: string[]; tip: string }[] = [
  {
    section: "Mathematical ability",
    topics: [
      "Number system & series",
      "Percentages, profit & loss",
      "Ratio & mixtures (repeated replacement)",
      "Time & work",
      "Speed & distance (trains, boats, escalators)",
      "Ages",
      "Permutations, combinations, probability",
      "Clocks, cubes, mensuration",
    ],
    tip: "Long, wordy and logical rather than formula-heavy. You can afford about 3.5 minutes per question — do the sure ones first, then the long ones.",
  },
  {
    section: "Logical reasoning",
    topics: [
      "Seating arrangements (rows, circles, square tables)",
      "Data sufficiency",
      "Syllogisms",
      "Statement–conclusion / assumption",
      "Blood relations",
      "Coding–decoding",
      "Directions",
      "Letter & number series",
      "Data interpretation",
    ],
    tip: "Do set-based puzzles first — one diagram carries 3–5 questions. Solve the diagram once, carefully, and the follow-ups are free.",
  },
  {
    section: "Verbal ability",
    topics: [
      "Prepositions & articles",
      "Tenses",
      "Active / passive voice",
      "Direct / indirect speech",
      "Sentence correction",
      "Fill in the blanks",
      "Vocabulary in context",
      "Para-jumbles & theme detection",
      "Reading comprehension",
    ],
    tip: "One minute per question. Grammar first, reading comprehension last. A 2018 candidate report had about 7 preposition and 7–8 voice/speech questions.",
  },
  {
    section: "Pseudocode",
    topics: [
      "Loops and nested loops",
      "MOD and integer division",
      "Recursion",
      "Arrays",
      "Bitwise AND / OR / XOR and shifts",
      "String operations",
    ],
    tip: "Draw a trace table — one column per variable, one row per loop iteration. Slower on the first question, faster on the rest.",
  },
  {
    section: "Puzzle solving",
    topics: [
      "Cryptarithmetic",
      "Number puzzles",
      "Age and money puzzles",
      "Logical deduction (“who stole what”)",
      "Clocks and calendars",
    ],
    tip: "Four questions in ten minutes. Start with the one you recognise.",
  },
  {
    section: "Essay (some campus drives)",
    topics: ["200 words", "Topic given on the day", "Sometimes asked about in the interview"],
    tip: "Practise three timed essays. Write something you would be happy to discuss.",
  },
];

export const TEST_RULES = [
  "No negative marking has been reported for the SE test — never leave a question blank. Guess smartly in the last 30 seconds of every section.",
  "Every section is timed separately and unused time does not carry over. In maths, check the timer after question 3 (should be ≤ 11 min) and after question 7 (≤ 25 min).",
  "Neighbouring candidates often get different question papers — there is no point copying.",
  "Before the test: ID, webcam, quiet room, and check whether rough sheets are allowed.",
];

// ─── 5. The interview ─────────────────────────────────────────────────────────
export const INTERVIEW_CHECKS = {
  trainable: [
    "Clear fundamentals in one language — not five half-known ones",
    "You can explain your own project and code",
    "You think aloud and admit what you don't know",
  ],
  fit: [
    "Ready to relocate and work in any technology, any shift",
    "Communication good enough for client calls",
    "Genuine interest in Infosys, not a generic “good company”",
  ],
};

export const INTRO_TEMPLATE =
  "Who — “I’m Priya, a final-year B.Tech CSE student from XYZ Institute, Hyderabad, CGPA 8.1.” → What I build — “I work mainly in Java and SQL; my final-year project is a library management system with Spring Boot and MySQL used by about 600 students.” → Proof — “I did a two-month internship fixing bugs in a billing module and I’ve solved about 250 problems on LeetCode.” → Why here — “I want to start my career in a company that trains freshers properly and works on large client systems — that’s why Infosys.”";

export const INTERVIEW_QA: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Programming fundamentals",
    items: [
      {
        q: "Write a program to check whether a string is a palindrome.",
        a: "Two pointers from both ends, comparing characters until they meet — O(n) time, O(1) extra space. Write the loop on paper: i = 0, j = n − 1; while i < j, if s[i] != s[j] return false; i++, j--; return true.",
      },
      {
        q: "How do you check if a number is prime efficiently?",
        a: "Trial division only up to √n, skipping even numbers after 2. If no divisor ≤ √n exists, n is prime — O(√n). For many numbers up to N, use the sieve of Eratosthenes.",
      },
      {
        q: "Compiler vs interpreter — where does Java fit?",
        a: "A compiler translates the whole program before running; an interpreter executes statement by statement. Java does both: javac compiles to bytecode, then the JVM interprets and JIT-compiles hot code.",
      },
      {
        q: "Array vs linked list?",
        a: "Array: contiguous memory, O(1) access by index, costly insertion in the middle. Linked list: nodes with pointers, O(n) access, O(1) insert/delete once you have the node, extra memory for pointers.",
      },
      {
        q: "Stack vs queue — real examples?",
        a: "Stack is LIFO: undo, function calls, browser back button, bracket matching. Queue is FIFO: printer jobs, BFS, ticket booking, message queues.",
      },
    ],
  },
  {
    group: "Object-oriented programming",
    items: [
      {
        q: "What are the four pillars of OOP?",
        a: "Encapsulation (private fields with getters/setters), abstraction (expose what, hide how), inheritance (SavingsAccount extends Account), polymorphism (calculateInterest() runs the right version at run time).",
      },
      {
        q: "Overloading vs overriding?",
        a: "Overloading: same name, different parameter lists, same class — resolved at compile time. Overriding: a subclass redefines a parent method with the same signature — resolved at run time.",
      },
      {
        q: "Abstract class vs interface?",
        a: "Abstract class can hold fields, constructors and implemented methods; a class extends only one. An interface is a contract with no instance state; a class implements many. Interface for a capability, abstract class for shared base behaviour.",
      },
      {
        q: "Is Java pass-by-value or pass-by-reference?",
        a: "Always pass-by-value. For objects, the value passed is a copy of the reference — a method can change the object's fields but cannot make the caller's variable point to a new object.",
      },
    ],
  },
  {
    group: "DBMS, OS and networks",
    items: [
      {
        q: "What is normalisation? Explain 1NF, 2NF, 3NF.",
        a: "Organising tables to remove redundancy and update anomalies. 1NF: atomic values. 2NF: 1NF + no partial dependency on part of a composite key. 3NF: 2NF + no transitive dependency (non-key → non-key).",
      },
      {
        q: "Write a query for the second-highest salary.",
        a: "SELECT MAX(salary) FROM employee WHERE salary < (SELECT MAX(salary) FROM employee);",
      },
      {
        q: "Process vs thread? What is a deadlock?",
        a: "A process has its own memory space; a thread is a lightweight unit inside a process that shares its memory. Deadlock: processes each wait for a resource another holds. It needs mutual exclusion, hold-and-wait, no pre-emption and circular wait — break any one to prevent it.",
      },
      {
        q: "What happens when you type google.com in a browser?",
        a: "DNS resolves the name to an IP → TCP connection (3-way handshake) → TLS handshake for HTTPS → HTTP GET → server responds with HTML → browser fetches CSS/JS/images and renders.",
      },
    ],
  },
  {
    group: "SDLC, Agile and your project",
    items: [
      {
        q: "What is SDLC? Name some models.",
        a: "Requirements → design → implementation → testing → deployment → maintenance. Models: Waterfall, V-model, Iterative/Spiral, Agile.",
      },
      {
        q: "What is Scrum?",
        a: "An Agile framework with fixed-length sprints (usually 2 weeks). The Product Owner prioritises the backlog, the Scrum Master removes blockers, and the team commits to items in sprint planning. Daily stand-ups, a sprint review and a retrospective follow.",
      },
      {
        q: "Explain your final-year project in two minutes.",
        a: "Problem → users → your role → architecture (front end, back end, database) → one technical challenge and how you solved it → result (numbers if possible) → what you'd improve. Expect cross-questions on every technology you name.",
      },
    ],
  },
  {
    group: "HR questions",
    items: [
      {
        q: "Are you willing to relocate anywhere in India and work in any technology?",
        a: "“Yes.” Infosys allocates location and technology by business need; refusing is one of the few answers that ends an SE interview. Mention a preference only if asked.",
      },
      {
        q: "Are you comfortable with night shifts?",
        a: "Say yes — client time zones sometimes require it. Flexibility matters more than the shift you actually get.",
      },
      {
        q: "Why Infosys?",
        a: "Three specific reasons: (1) training at the Global Education Centre in Mysuru, (2) scale and variety of client projects, (3) something current — Infosys Topaz (AI), the Springboard learning platform, or a course you completed there.",
      },
      {
        q: "Do you have any questions for us?",
        a: "Always ask one: “What does a new Systems Engineer's first project usually look like?” or “How are streams decided during training?”",
      },
    ],
  },
  {
    group: "Puzzles that come up",
    items: [
      {
        q: "Cut a cake into 8 equal pieces with 3 cuts.",
        a: "Two perpendicular vertical cuts through the centre give 4 pieces; one horizontal cut through the middle of the height doubles them to 8.",
      },
      {
        q: "Measure exactly 4 litres with a 3-litre and a 5-litre jug.",
        a: "Fill 5 → pour into 3 (5-litre has 2) → empty 3 → pour the 2 litres into 3 → fill 5 → top up the 3-litre jug (needs 1) → 4 litres remain in the 5-litre jug.",
      },
      {
        q: "8 identical balls, one heavier. Find it in two weighings.",
        a: "Weigh 3 vs 3. If balanced, weigh the remaining 2 against each other. If not, take the heavier group of 3 and weigh 1 vs 1 — if balanced, it's the third.",
      },
    ],
  },
];

export const UNSURE_ANSWER =
  "If you don't know an answer, say “I'm not sure, but I think…” and reason aloud, or “I haven't worked with that yet; I've used X, which is similar in…”. Infosys interviewers consistently report valuing honesty and approach over memorised answers.";

// ─── 6. Four-week plan ────────────────────────────────────────────────────────
export const PLAN: { week: string; a: string; b: string; c: string }[] = [
  {
    week: "Week 1",
    a: "Maths: series, percentages, mixtures (chapter + 15 extra questions a day)",
    b: "Verbal: prepositions, voice, speech",
    c: "Puzzles: 10 cryptarithms; review mistakes",
  },
  {
    week: "Week 2",
    a: "Maths: time–work, speed, ages, clocks",
    b: "Reasoning: seating arrangements (2 sets a day)",
    c: "Pseudocode: 25 questions with trace tables",
  },
  {
    week: "Week 3",
    a: "Maths: P&C, probability, cubes",
    b: "Reasoning: data sufficiency, syllogisms, DI",
    c: "Timed mini mock + error log",
  },
  {
    week: "Week 4",
    a: "Weakest section from the mock, daily",
    b: "Essay: 3 timed essays",
    c: "Full mini mock again; HR + SE interview chapters",
  },
];

export const PLAN_HEADERS = ["Mon–Wed", "Thu–Fri", "Weekend"];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Can I write both the SE test and the SP/DSE test?",
    a: "Yes, if your college or the off-campus drive offers both. They are separate tests. Many candidates hold an SE offer while waiting for the SP/DSE result, and Infosys upgrades the offer if you are selected for the higher role.",
  },
  {
    q: "If I fail the SE test once, can I try again?",
    a: "Yes, in a later drive. Infosys typically applies a cooling-off period between attempts for the same role; the drive notice states it. Use the gap to fix the section that failed you.",
  },
  {
    q: "I received a Letter of Intent. Is that an offer?",
    a: "An LOI confirms you are selected and that a formal offer will follow once a joining batch is planned. The offer letter with the salary annexure comes through the onboarding portal later.",
  },
  {
    q: "Do they check my CGPA conversion and backlogs?",
    a: "Yes. During onboarding you upload every mark sheet and background verification checks them. A percentage typed wrongly on the application can delay or cancel an offer — use your university's conversion formula and keep the certificate that states it.",
  },
  {
    q: "Is SE the end of the road?",
    a: "No. SEs can take Infosys's internal upgrade tests (DSE / SP and Power Programmer drives) after joining. Many candidates who missed SP in college move up within one to two years.",
  },
];
