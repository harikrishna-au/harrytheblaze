// Mock test for the Infosys System Engineer online test.
// 54 questions in the real pattern: 10 + 15 + 20 + 5 + 4, with a separate timer per section.
// These are original practice questions, none of them taken from the Playbook PDF.
// Generated and answer-checked by PRODUCT/guides/mock/author.py: edit there, not here.

export type MockQuestion = {
  id: string;
  topic: string;
  stem: string;
  options: string[];
  answer: number;
  explain: string;
  code?: string;
  context?: string;
  contextTitle?: string;
};

export type MockSection = {
  id: string;
  name: string;
  minutes: number;
  /** Free sample for everyone; the other sections need Premium. */
  free?: boolean;
  blurb: string;
  questions: MockQuestion[];
};

export const MOCK_SECTIONS: MockSection[] = [
  {
    "id": "maths",
    "name": "Mathematical ability",
    "minutes": 35,
    "free": true,
    "blurb": "Long, multi-step questions. Bank the sure ones first.",
    "questions": [
      {
        "id": "maths-1",
        "topic": "Series",
        "stem": "What comes next?  2, 6, 12, 20, 30, 42, ?",
        "options": [
          "54",
          "56",
          "58",
          "60"
        ],
        "answer": 1,
        "explain": "Each term is n(n + 1): 1·2, 2·3, 3·4 … 6·7. The next term is 7·8 = 56."
      },
      {
        "id": "maths-2",
        "topic": "Series",
        "stem": "What comes next?  7, 9, 16, 25, 41, 66, ?",
        "options": [
          "97",
          "103",
          "107",
          "112"
        ],
        "answer": 2,
        "explain": "Each term is the sum of the two before it: 41 + 66 = 107."
      },
      {
        "id": "maths-3",
        "topic": "Percentages",
        "stem": "A number is increased by 20 % and then decreased by 25 %. The result is 450. What was the original number?",
        "options": [
          "400",
          "450",
          "500",
          "540"
        ],
        "answer": 2,
        "explain": "Net factor = 1.2 × 0.75 = 0.9. So 0.9x = 450 and x = 500."
      },
      {
        "id": "maths-4",
        "topic": "Mixtures",
        "stem": "A 60-litre mixture contains milk and water in the ratio 7 : 3. How many litres of water must be added to make the ratio 7 : 5?",
        "options": [
          "10",
          "12",
          "15",
          "18"
        ],
        "answer": 1,
        "explain": "Milk = 42 L, water = 18 L. For 7 : 5, water must be 42 × 5/7 = 30 L, so add 12 L."
      },
      {
        "id": "maths-5",
        "topic": "Time & work",
        "stem": "4 men and 6 women can finish a job in 10 days. 3 men and 7 women can also finish it in 10 days. How many days will one man take to finish it alone?",
        "options": [
          "80",
          "100",
          "120",
          "150"
        ],
        "answer": 1,
        "explain": "Same work, same time, so 4m + 6w = 3m + 7w, which gives m = w. Ten workers finish in 10 days, so one worker takes 100 days."
      },
      {
        "id": "maths-6",
        "topic": "Trains",
        "stem": "A 200 m long train passes a man walking at 6 km/h in the same direction in 12 seconds. What is the speed of the train?",
        "options": [
          "60 km/h",
          "64 km/h",
          "66 km/h",
          "72 km/h"
        ],
        "answer": 2,
        "explain": "Relative speed = 200/12 m/s = 60 km/h. The train is faster than the man, so its speed = 60 + 6 = 66 km/h."
      },
      {
        "id": "maths-7",
        "topic": "Ages",
        "stem": "The ages of two brothers are in the ratio 3 : 5. Five years ago the sum of their ages was 30. What is the present age of the elder brother?",
        "options": [
          "20",
          "25",
          "30",
          "35"
        ],
        "answer": 1,
        "explain": "Present sum = 30 + 5 + 5 = 40 = 8x, so x = 5. Elder = 5x = 25."
      },
      {
        "id": "maths-8",
        "topic": "Counting",
        "stem": "A committee of 3 is chosen from 5 men and 4 women, with at least one woman. In how many ways can it be chosen?",
        "options": [
          "64",
          "70",
          "74",
          "84"
        ],
        "answer": 2,
        "explain": "Total = 9C3 = 84. All men = 5C3 = 10. At least one woman = 84 − 10 = 74."
      },
      {
        "id": "maths-9",
        "topic": "LCM",
        "stem": "What is the smallest 4-digit number divisible by 12, 15 and 18?",
        "options": [
          "1008",
          "1080",
          "1140",
          "1260"
        ],
        "answer": 1,
        "explain": "LCM(12, 15, 18) = 180. 180 × 5 = 900 has only 3 digits, so the answer is 180 × 6 = 1080."
      },
      {
        "id": "maths-10",
        "topic": "Probability",
        "stem": "Two cards are drawn one after the other, without replacement, from a standard deck of 52. What is the probability that both are aces?",
        "options": [
          "1/221",
          "1/169",
          "1/13",
          "4/221"
        ],
        "answer": 0,
        "explain": "4/52 × 3/51 = 12/2652 = 1/221."
      }
    ]
  },
  {
    "id": "reasoning",
    "name": "Logical reasoning",
    "minutes": 25,
    "free": false,
    "blurb": "Sets first: one diagram pays 3–5 marks.",
    "questions": [
      {
        "id": "reasoning-1",
        "topic": "Seating (row)",
        "stem": "Who sits at the extreme right end?",
        "options": [
          "G",
          "E",
          "D",
          "F"
        ],
        "answer": 0,
        "explain": "B is at 2 and C at 3, so D must be at 1 (left of B), which puts G at the right end. Order left to right: D B C F A E G.",
        "context": "Seven friends A, B, C, D, E, F and G sit in a row facing north. C sits third from the left end. F sits immediately to the right of C. A sits second to the right of C. E sits immediately to the right of A. B sits immediately to the left of C. G sits at one of the two ends. D sits somewhere to the left of B.",
        "contextTitle": "Set 1 · Row seating"
      },
      {
        "id": "reasoning-2",
        "topic": "Seating (row)",
        "stem": "How many people sit between D and F?",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "answer": 1,
        "explain": "Order: D B C F A E G. D is seat 1 and F is seat 4, so B and C sit between them: 2.",
        "context": "Seven friends A, B, C, D, E, F and G sit in a row facing north. C sits third from the left end. F sits immediately to the right of C. A sits second to the right of C. E sits immediately to the right of A. B sits immediately to the left of C. G sits at one of the two ends. D sits somewhere to the left of B.",
        "contextTitle": "Set 1 · Row seating"
      },
      {
        "id": "reasoning-3",
        "topic": "Seating (row)",
        "stem": "Who sits third from the right end?",
        "options": [
          "C",
          "F",
          "E",
          "A"
        ],
        "answer": 3,
        "explain": "Order: D B C F A E G. Third from the right is seat 5, which is A.",
        "context": "Seven friends A, B, C, D, E, F and G sit in a row facing north. C sits third from the left end. F sits immediately to the right of C. A sits second to the right of C. E sits immediately to the right of A. B sits immediately to the left of C. G sits at one of the two ends. D sits somewhere to the left of B.",
        "contextTitle": "Set 1 · Row seating"
      },
      {
        "id": "reasoning-4",
        "topic": "Seating (circle)",
        "stem": "Who sits immediately to the right of H?",
        "options": [
          "M",
          "K",
          "J",
          "N"
        ],
        "answer": 3,
        "explain": "Number seats clockwise with H at 0. L is opposite at 3. M is second to H's left: 2. J is immediately left of H: 1. K is immediately left of L: 4. N takes seat 5. Clockwise: H J M L K N. H's right is the anticlockwise neighbour, seat 5 = N.",
        "context": "Six people H, J, K, L, M and N sit around a circular table facing the centre. H sits opposite L. M sits second to the left of H. K sits immediately to the left of L. J sits immediately to the left of H. (Facing the centre, your left is the clockwise direction.)",
        "contextTitle": "Set 2 · Circular seating"
      },
      {
        "id": "reasoning-5",
        "topic": "Seating (circle)",
        "stem": "Who sits opposite N?",
        "options": [
          "M",
          "J",
          "L",
          "K"
        ],
        "answer": 0,
        "explain": "Clockwise order: H J M L K N (seats 0 to 5). N is at seat 5, so the opposite seat is 2, which is M.",
        "context": "Six people H, J, K, L, M and N sit around a circular table facing the centre. H sits opposite L. M sits second to the left of H. K sits immediately to the left of L. J sits immediately to the left of H. (Facing the centre, your left is the clockwise direction.)",
        "contextTitle": "Set 2 · Circular seating"
      },
      {
        "id": "reasoning-6",
        "topic": "Syllogism",
        "stem": "Which conclusions follow?",
        "options": [
          "II and IV only",
          "I and II only",
          "All four",
          "I, II and III"
        ],
        "answer": 1,
        "explain": "Some cats are dogs and all dogs are birds, so some cats are birds (I), and its converse is II. III fails: the fish-birds need not be dogs. IV fails: only some cats are dogs.",
        "context": "Statements: Some cats are dogs. All dogs are birds. Some birds are fish.\nI. Some cats are birds.  II. Some birds are cats.  III. Some dogs are fish.  IV. All cats are birds.",
        "contextTitle": "Statements and conclusions"
      },
      {
        "id": "reasoning-7",
        "topic": "Syllogism",
        "stem": "Which conclusions follow?",
        "options": [
          "I and III only",
          "III and IV only",
          "I and II only",
          "II and IV only"
        ],
        "answer": 2,
        "explain": "All rivers are lakes and no lake is a pond, so no river is a pond (I). The streams that are ponds cannot be lakes, so some streams are not lakes (II). III and IV do not follow.",
        "context": "Statements: All rivers are lakes. No lake is a pond. Some ponds are streams.\nI. No river is a pond.  II. Some streams are not lakes.  III. Some rivers are streams.  IV. Some lakes are not streams.",
        "contextTitle": "Statements and conclusions"
      },
      {
        "id": "reasoning-8",
        "topic": "Blood relations",
        "stem": "P is the brother of Q. Q is the mother of R. S is the father of P. How is S related to R?",
        "options": [
          "Paternal grandfather",
          "Father",
          "Uncle",
          "Maternal grandfather"
        ],
        "answer": 3,
        "explain": "S is the father of P and P's sister Q, so S is Q's father. Q is R's mother, so S is R's maternal grandfather."
      },
      {
        "id": "reasoning-9",
        "topic": "Blood relations",
        "stem": "Pointing to a woman, Dev says, “She is the wife of my father's only brother.” How is the woman related to Dev?",
        "options": [
          "Aunt",
          "Mother",
          "Sister-in-law",
          "Grandmother"
        ],
        "answer": 0,
        "explain": "Father's brother is Dev's paternal uncle, so his wife is Dev's aunt."
      },
      {
        "id": "reasoning-10",
        "topic": "Coding–decoding",
        "stem": "In a certain code, MOBILE is written as NNCHMD. How is SYSTEM written in that code?",
        "options": [
          "TXTRFL",
          "TXTSFL",
          "RXRSFL",
          "TZTSFL"
        ],
        "answer": 1,
        "explain": "Letters alternate +1, −1, +1, −1 … (M→N, O→N, B→C, I→H, L→M, E→D). SYSTEM: S→T, Y→X, S→T, T→S, E→F, M→L = TXTSFL."
      },
      {
        "id": "reasoning-11",
        "topic": "Directions",
        "stem": "Arun walks 10 km north, turns right and walks 6 km, then turns right again and walks 2 km. How far, and in which direction, is he from the starting point?",
        "options": [
          "8 km north-east",
          "10 km south-east",
          "10 km north-east",
          "12 km north-east"
        ],
        "answer": 2,
        "explain": "North 10, east 6, south 2 leaves him 6 km east and 8 km north of the start. Distance = √(6² + 8²) = 10 km, north-east."
      },
      {
        "id": "reasoning-12",
        "topic": "Ranking",
        "stem": "In a class of 45 students, Arjun ranks 18th from the top. What is his rank from the bottom?",
        "options": [
          "26",
          "27",
          "28",
          "29"
        ],
        "answer": 2,
        "explain": "Rank from the bottom = 45 − 18 + 1 = 28."
      },
      {
        "id": "reasoning-13",
        "topic": "Data sufficiency",
        "stem": "What is the integer n?\n(1) n² = 25\n(2) n is positive",
        "options": [
          "Even together they are not enough",
          "Statement 2 alone is enough",
          "Statement 1 alone is enough",
          "Both statements together are needed"
        ],
        "answer": 3,
        "explain": "(1) alone allows 5 or −5. (2) alone only says positive. Together n = 5."
      },
      {
        "id": "reasoning-14",
        "topic": "Data interpretation",
        "stem": "By what percentage did sales rise from March to April?",
        "options": [
          "25 %",
          "30 %",
          "33⅓ %",
          "35 %"
        ],
        "answer": 2,
        "explain": "Rise = 180 − 135 = 45. 45/135 = 1/3 = 33⅓ %.",
        "context": "January 120   ·   February 150   ·   March 135   ·   April 180",
        "contextTitle": "Monthly sales (units)"
      },
      {
        "id": "reasoning-15",
        "topic": "Letter series",
        "stem": "What comes next?  AZ, BY, CX, DW, ?",
        "options": [
          "EV",
          "EU",
          "FV",
          "DV"
        ],
        "answer": 0,
        "explain": "The first letters go forward (A, B, C, D, E) and the second letters go backward (Z, Y, X, W, V). Next: EV."
      }
    ]
  },
  {
    "id": "verbal",
    "name": "Verbal ability",
    "minutes": 20,
    "free": false,
    "blurb": "About a minute a question. Reading comes last.",
    "questions": [
      {
        "id": "verbal-1",
        "topic": "Subject–verb agreement",
        "stem": "Either the manager or his assistants ____ responsible for the delay.",
        "options": [
          "is",
          "are",
          "was",
          "has been"
        ],
        "answer": 1,
        "explain": "With either … or, the verb agrees with the nearer subject. “Assistants” is plural, so use “are”."
      },
      {
        "id": "verbal-2",
        "topic": "Subject–verb agreement",
        "stem": "Choose the correct sentence.",
        "options": [
          "Each of the participants have received a certificate.",
          "Each participants has received a certificate.",
          "Each of the participant has received a certificate.",
          "Each of the participants has received a certificate."
        ],
        "answer": 3,
        "explain": "“Each” is singular, so it takes “has”, and “of the participants” needs the plural noun."
      },
      {
        "id": "verbal-3",
        "topic": "Spot the error",
        "stem": "The principal along with (A) the teachers (B) were (C) present at the function. (D)\nWhich part has the error?",
        "options": [
          "A",
          "B",
          "C",
          "D"
        ],
        "answer": 2,
        "explain": "“Along with” does not make the subject plural. The subject is “principal”, so use “was”."
      },
      {
        "id": "verbal-4",
        "topic": "Spot the error",
        "stem": "(A) She is senior than (B) me by (C) three years. (D) No error\nWhich part has the error?",
        "options": [
          "A",
          "B",
          "C",
          "D"
        ],
        "answer": 0,
        "explain": "“Senior” and “junior” take “to”, not “than”: She is senior to me."
      },
      {
        "id": "verbal-5",
        "topic": "Tenses",
        "stem": "By the time the police arrived, the thief ____.",
        "options": [
          "will escape",
          "has escaped",
          "is escaping",
          "had escaped"
        ],
        "answer": 3,
        "explain": "An action that finished before another past action takes the past perfect: had escaped."
      },
      {
        "id": "verbal-6",
        "topic": "Tenses",
        "stem": "I ____ in this city since 2020.",
        "options": [
          "have been living",
          "lived",
          "live",
          "am living"
        ],
        "answer": 0,
        "explain": "“Since” with a point in time and an action that continues to now takes the present perfect (continuous)."
      },
      {
        "id": "verbal-7",
        "topic": "Conditionals",
        "stem": "If it ____ tomorrow, we will cancel the picnic.",
        "options": [
          "rain",
          "rains",
          "rained",
          "will rain"
        ],
        "answer": 1,
        "explain": "Type 1 conditional: if + present simple, will + verb."
      },
      {
        "id": "verbal-8",
        "topic": "Prepositions",
        "stem": "He has been absent ____ Monday.",
        "options": [
          "from",
          "by",
          "since",
          "for"
        ],
        "answer": 2,
        "explain": "Use “since” with a starting point in time."
      },
      {
        "id": "verbal-9",
        "topic": "Prepositions",
        "stem": "She is very good ____ solving puzzles.",
        "options": [
          "with",
          "on",
          "in",
          "at"
        ],
        "answer": 3,
        "explain": "“Good at” is the fixed pair."
      },
      {
        "id": "verbal-10",
        "topic": "Prepositions",
        "stem": "He was accused ____ stealing the money.",
        "options": [
          "of",
          "with",
          "for",
          "about"
        ],
        "answer": 0,
        "explain": "We accuse someone “of” something."
      },
      {
        "id": "verbal-11",
        "topic": "Active → passive",
        "stem": "Change to the passive voice: “The committee will announce the results tomorrow.”",
        "options": [
          "The results would be announced by the committee tomorrow.",
          "The results will be announced by the committee tomorrow.",
          "The results are announced by the committee tomorrow.",
          "The results will announce by the committee tomorrow."
        ],
        "answer": 1,
        "explain": "Future simple: will + be + V3."
      },
      {
        "id": "verbal-12",
        "topic": "Passive → active",
        "stem": "Change to the active voice: “The bridge was built by the workers.”",
        "options": [
          "The workers were building the bridge.",
          "The workers build the bridge.",
          "The workers built the bridge.",
          "The workers have built the bridge."
        ],
        "answer": 2,
        "explain": "Simple past passive (was built) becomes simple past active (built)."
      },
      {
        "id": "verbal-13",
        "topic": "Direct → indirect",
        "stem": "Change to indirect speech: She said, “I am working on a project now.”",
        "options": [
          "She said that she is working on a project now.",
          "She said that I was working on a project then.",
          "She said that she was working on a project now.",
          "She said that she was working on a project then."
        ],
        "answer": 3,
        "explain": "Present continuous shifts to past continuous, “I” becomes “she”, and “now” becomes “then”."
      },
      {
        "id": "verbal-14",
        "topic": "Direct → indirect",
        "stem": "Change to indirect speech: He said to me, “Close the door.”",
        "options": [
          "He told me to close the door.",
          "He told me that close the door.",
          "He said me to close the door.",
          "He asked me that I close the door."
        ],
        "answer": 0,
        "explain": "A command becomes: told + person + to + verb."
      },
      {
        "id": "verbal-15",
        "topic": "Articles",
        "stem": "He bought ____ umbrella and ____ pair of shoes.",
        "options": [
          "an … an",
          "an … a",
          "a … a",
          "a … an"
        ],
        "answer": 1,
        "explain": "“Umbrella” starts with a vowel sound (an). “Pair” starts with a consonant sound (a)."
      },
      {
        "id": "verbal-16",
        "topic": "Sentence improvement",
        "stem": "Choose the best replacement for “were selected”: Neither of the two candidates were selected.",
        "options": [
          "No improvement",
          "are selected",
          "was selected",
          "have been selected"
        ],
        "answer": 2,
        "explain": "“Neither” is singular, so the verb is “was”."
      },
      {
        "id": "verbal-17",
        "topic": "Para-jumble",
        "stem": "Arrange in order:\nP. Unfortunately, the bus broke down halfway.\nQ. We left home early to catch the morning bus.\nR. So we reached the venue two hours late.\nS. We had planned everything carefully for the trip.",
        "options": [
          "QSPR",
          "SPQR",
          "SQRP",
          "SQPR"
        ],
        "answer": 3,
        "explain": "S sets the scene, Q follows (left early), P (Unfortunately) is the problem, R (So …) is the result."
      },
      {
        "id": "verbal-18",
        "topic": "Reading comprehension",
        "stem": "What is the main idea of the passage?",
        "options": [
          "Open-source software thrives on shared effort but needs steady maintenance",
          "Volunteers write better code than companies",
          "Companies should never use open-source tools",
          "Open-source software is always free of bugs"
        ],
        "answer": 0,
        "explain": "The passage praises the shared effort and then points out the need for continued maintenance.",
        "context": "Open-source software is built by communities of volunteers and companies who share the source code freely. Anyone can read, fix or improve it. This openness helps bugs get found quickly, because many people examine the code. However, it also needs people to maintain it, and popular projects sometimes struggle when volunteers become too busy to keep up. Many companies now pay developers to maintain the tools they depend on.",
        "contextTitle": "Passage for the next three questions"
      },
      {
        "id": "verbal-19",
        "topic": "Reading comprehension",
        "stem": "According to the passage, why are bugs found quickly in open-source projects?",
        "options": [
          "Companies test every release",
          "Many people examine the code",
          "The code is hidden",
          "Volunteers are paid"
        ],
        "answer": 1,
        "explain": "Stated directly: “because many people examine the code”.",
        "context": "Open-source software is built by communities of volunteers and companies who share the source code freely. Anyone can read, fix or improve it. This openness helps bugs get found quickly, because many people examine the code. However, it also needs people to maintain it, and popular projects sometimes struggle when volunteers become too busy to keep up. Many companies now pay developers to maintain the tools they depend on.",
        "contextTitle": "Passage for the next three questions"
      },
      {
        "id": "verbal-20",
        "topic": "Reading comprehension",
        "stem": "Which challenge does the passage mention?",
        "options": [
          "Companies refuse to take part",
          "The source code cannot be read",
          "Busy volunteers cannot always maintain popular projects",
          "Nobody can fix the bugs"
        ],
        "answer": 2,
        "explain": "The “However” sentence names the challenge: volunteers become too busy to keep up.",
        "context": "Open-source software is built by communities of volunteers and companies who share the source code freely. Anyone can read, fix or improve it. This openness helps bugs get found quickly, because many people examine the code. However, it also needs people to maintain it, and popular projects sometimes struggle when volunteers become too busy to keep up. Many companies now pay developers to maintain the tools they depend on.",
        "contextTitle": "Passage for the next three questions"
      }
    ]
  },
  {
    "id": "pseudocode",
    "name": "Pseudocode",
    "minutes": 10,
    "free": false,
    "blurb": "Trace each program with a table of variables.",
    "questions": [
      {
        "id": "pseudocode-1",
        "topic": "Variables",
        "stem": "What is printed?",
        "options": [
          "3 5",
          "5 8",
          "8 3",
          "5 3"
        ],
        "answer": 3,
        "explain": "a = 8, then b = 8 − 5 = 3, then a = 8 − 3 = 5. The two values are swapped: 5 3.",
        "code": "Integer a = 3, b = 5\na = a + b\nb = a − b\na = a − b\nPrint a, b"
      },
      {
        "id": "pseudocode-2",
        "topic": "Nested loops",
        "stem": "What is printed?",
        "options": [
          "7",
          "8",
          "9",
          "10"
        ],
        "answer": 2,
        "explain": "Count pairs (i, j) with j ≤ i and i + j even: i=1 → 1, i=2 → 1, i=3 → 2, i=4 → 2, i=5 → 3. Total 9.",
        "code": "Integer i, j, s = 0\nfor i = 1 to 5\n  for j = 1 to i\n    if ((i + j) MOD 2 == 0)\n      s = s + 1\n    end if\n  end for\nend for\nPrint s"
      },
      {
        "id": "pseudocode-3",
        "topic": "While loop",
        "stem": "What is printed?",
        "options": [
          "6",
          "7",
          "8",
          "9"
        ],
        "answer": 2,
        "explain": "6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1 takes 8 steps.",
        "code": "Integer n = 6, c = 0\nwhile (n != 1)\n  if (n MOD 2 == 0)\n    n = n / 2\n  else\n    n = 3 * n + 1\n  end if\n  c = c + 1\nend while\nPrint c"
      },
      {
        "id": "pseudocode-4",
        "topic": "Recursion",
        "stem": "What is printed?",
        "options": [
          "8",
          "11",
          "13",
          "21"
        ],
        "answer": 2,
        "explain": "h(1) = 1, h(2) = 2, h(3) = 3, h(4) = 5, h(5) = 8, h(6) = 13.",
        "code": "Function h(Integer n)\n  if (n ≤ 2) return n\n  return h(n − 1) + h(n − 2)\nPrint h(6)"
      },
      {
        "id": "pseudocode-5",
        "topic": "Bitwise",
        "stem": "What is printed?",
        "options": [
          "12 29 17",
          "29 12 17",
          "8 29 17",
          "12 17 29"
        ],
        "answer": 0,
        "explain": "29 = 11101₂ and 12 = 01100₂. AND = 01100 = 12. OR = 11101 = 29. XOR = 10001 = 17.",
        "code": "Integer x = 29, y = 12\nPrint (x & y), (x | y), (x ^ y)"
      }
    ]
  },
  {
    "id": "puzzles",
    "name": "Puzzle solving",
    "minutes": 10,
    "free": false,
    "blurb": "Start with the puzzle you recognise.",
    "questions": [
      {
        "id": "puzzles-1",
        "topic": "Cryptarithmetic",
        "stem": "BTH + TRH = HRYY. Each letter stands for a different digit. What is the value of HRYY?",
        "options": [
          "1322",
          "1422",
          "1442",
          "1522"
        ],
        "answer": 1,
        "explain": "Thousands: H = 1, so units H + H = Y = 2 with no carry. Tens: T + R = 12 (carry 1). Hundreds: B + T + 1 = R + 10, which with T + R = 12 gives B = 21 − 2T. Only T = 8, B = 5, R = 4 keeps every digit different: 581 + 841 = 1422."
      },
      {
        "id": "puzzles-2",
        "topic": "Digit puzzle",
        "stem": "A two-digit number has digit sum 9. When its digits are reversed, the number becomes 27 less. What is the number?",
        "options": [
          "45",
          "54",
          "63",
          "72"
        ],
        "answer": 2,
        "explain": "Numbers with digit sum 9: 18, 27, 36, 45, 54, 63, 72, 81. Number − reverse = 9(a − b) = 27 → a − b = 3 → 63 (63 − 36 = 27)."
      },
      {
        "id": "puzzles-3",
        "topic": "Truth & lies",
        "stem": "On an island, knights always tell the truth and knaves always lie. A says, “B is a knave.” B says, “C is a knave.” C says, “A and B are both knaves.” Who is the knight?",
        "options": [
          "Only B",
          "B and C",
          "Only C",
          "Only A"
        ],
        "answer": 0,
        "explain": "Suppose A is a knight. Then B is a knave, so B's claim “C is a knave” is false, which makes C a knight. But then C's claim “A and B are both knaves” would be true, and A is a knight. Contradiction. So A is a knave: B is not a knave (A lied), so B is a knight. B truthfully says C is a knave, and C's claim is false, as it should be. Only B is a knight."
      },
      {
        "id": "puzzles-4",
        "topic": "Sets",
        "stem": "In a group of 40 people, 25 play cricket, 20 play football and 5 play neither. How many play both?",
        "options": [
          "5",
          "10",
          "15",
          "20"
        ],
        "answer": 1,
        "explain": "35 people play at least one game. Both = 25 + 20 − 35 = 10."
      }
    ]
  }
];
