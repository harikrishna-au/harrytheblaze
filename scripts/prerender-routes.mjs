// Runs after `vite build`. The app is a single-page app, so every URL used to get the same index.html:
// same <title>, same description, same canonical link. Google then sees one page, not a site, and has
// nothing distinct to show as sitelinks. This writes a real HTML file for each public route (and every
// published blog post) with its own title, description, canonical URL and heading, and rebuilds the sitemap.
//
// It must never break a deploy: any failure is logged and the plain build is left as it was.

import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.harrytheblaze.site";
const DIST = path.resolve("dist");
const BRAND = "Harry The Blaze";

// Public pages only. Anything behind a login (dashboard, games, Connect) is not listed: Google would
// just see the login screen.
export const ROUTES = [
  {
    path: "/",
    title: "Harry The Blaze | Placement Practice for Infosys and Accenture",
    description: "Practise real placement rounds: cognitive games, communication tests, AI mock interviews and Infosys coding questions. Then book a 1:1 with someone just placed.",
    h1: "Practise the real placement rounds, then talk to someone who just got placed",
    blurb: "Cognitive games, communication rounds, AI mock interviews, Infosys coding questions and 20-minute calls with recently placed seniors, for engineering students in India.",
    priority: "1.0", freq: "weekly",
  },
  {
    path: "/infosys-se",
    title: "Infosys System Engineer: Eligibility, Test Pattern and SE Playbook",
    description: "Who can apply for Infosys SE, every hiring stage, what the test and interview ask, and a 53-page playbook with a full 54-question timed mock. ₹99.",
    h1: "Infosys System Engineer: eligibility, hiring stages, test topics and the SE Playbook",
    blurb: "Eligibility rules, the hiring stages from test to offer, the five-section online test, interview questions, and a prep playbook with formulas, solved questions and a full timed mock.",
    priority: "0.9", freq: "weekly",
  },
  {
    path: "/infosys-se/mock",
    title: "Infosys SE Mock Test: 54 Questions with Real Section Timers",
    description: "A full-length Infosys System Engineer mock: maths, reasoning, verbal, pseudocode and puzzles, each section on its own timer, with explanations.",
    h1: "Infosys System Engineer mock test",
    blurb: "54 questions in the real pattern with a separate timer for each section and a score against the reported cut-offs.",
    priority: "0.7", freq: "monthly",
  },
  {
    path: "/coding-questions",
    title: "Infosys SP and DSE Coding Questions | Harry The Blaze",
    description: "Hundreds of coding questions collected from people who got the Infosys SP and DSE roles, section by section. Open 50 free and track your progress.",
    h1: "Infosys SP and DSE coding questions",
    blurb: "Coding questions reported by candidates who got the Infosys Specialist Programmer and Digital Specialist Engineer roles, grouped by topic with a progress checklist.",
    priority: "0.9", freq: "weekly",
  },
  {
    path: "/infosys-sp-dse",
    title: "Infosys SP and DSE: Hiring Rounds, Scoring and Coding Questions",
    description: "How Infosys SP and DSE hiring works: the rounds, how the coding test is scored, a free 5-minute taster, and 327 coding questions collected from people who got the roles.",
    h1: "Infosys SP and DSE: the hiring rounds, how the coding test is scored and 327 coding questions",
    blurb: "The online and advanced coding rounds and the interview, how candidates say the first round is scored, a free taster you can sit without an account, and the question set.",
    priority: "0.9", freq: "weekly",
  },
  {
    path: "/hackwithinfy",
    title: "Infosys HackWithInfy Prep: SP and DSE | Harry The Blaze",
    description: "Syllabus by role, previous-year questions, strategy and study resources for HackWithInfy and the Infosys SP and DSE coding tests.",
    h1: "HackWithInfy and Infosys SP and DSE preparation hub",
    blurb: "What each round tests, the syllabus by role, previous-year questions, tips and study resources for HackWithInfy and the Infosys coding tests.",
    priority: "0.8", freq: "monthly",
  },
  {
    path: "/blog",
    title: "Placement Blog: Infosys Roles, Salary and Interview Guides",
    description: "Guides on Infosys SE, DSE and SP roles, salary structure, test patterns, eligibility and interview experiences from students.",
    h1: "Campus placement blog",
    blurb: "Guides and experiences about Infosys roles, packages, test patterns, eligibility and interviews.",
    priority: "0.8", freq: "daily",
  },
  {
    path: "/about",
    title: "About Harry The Blaze | Campus Placement Prep",
    description: "Why we built Harry The Blaze: real placement-round practice and 1:1 calls with recently placed seniors, for engineering students in India.",
    h1: "About Harry The Blaze",
    blurb: "Real placement-round practice and live calls with recently placed seniors, built for engineering students in India.",
    priority: "0.5", freq: "monthly",
  },
  { path: "/login", title: "Sign up free | Harry The Blaze", description: "Create a free account in under a minute. Practise placement rounds and book a 1:1 with someone who just got placed.", h1: "Create your free account", blurb: "Free account in under a minute. No credit card.", priority: null },
  { path: "/terms", title: "Terms of Service | Harry The Blaze", description: "The terms for using Harry The Blaze.", h1: "Terms of service", blurb: "The terms for using Harry The Blaze.", priority: "0.2", freq: "yearly" },
  { path: "/refund", title: "Refund Policy | Harry The Blaze", description: "How refunds work for Harry The Blaze purchases.", h1: "Refund policy", blurb: "How refunds work for Harry The Blaze purchases.", priority: "0.2", freq: "yearly" },
];

const NAV = [
  ["/infosys-se", "Infosys System Engineer"],
  ["/coding-questions", "Infosys SP and DSE coding questions"],
  ["/hackwithinfy", "HackWithInfy prep hub"],
  ["/blog", "Placement blog"],
  ["/about", "About"],
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const url = (p) => (p === "/" ? `${SITE}/` : `${SITE}${p}`);

export function renderPage(template, r) {
  const canonical = url(r.path);
  let h = template;
  const swap = (re, to) => { h = h.replace(re, to); };
  swap(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`);
  swap(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(r.description)}" />`);
  swap(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);
  swap(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`);
  swap(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${esc(r.title)}" />`);
  swap(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${esc(r.description)}" />`);
  swap(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${esc(r.title)}" />`);
  swap(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${esc(r.description)}" />`);
  // the hidden crawler heading: one per page, matching what the page really is
  swap(/(<h1 style="[^"]*">)[\s\S]*?(<\/h1>)/, `$1${esc(r.h1)}$2`);
  // plain-HTML version of the page summary and the main links, for crawlers that do not run JavaScript
  const links = NAV.map(([p, t]) => `<li><a href="${p}">${esc(t)}</a></li>`).join("");
  const noscript = `<noscript><main><h1>${esc(r.h1)}</h1><p>${esc(r.blurb)}</p><nav aria-label="Main pages"><ul>${links}</ul></nav></main></noscript>`;
  swap(/<div id="root"><\/div>/, `${noscript}\n  <div id="root"></div>`);
  return h;
}

export function buildSitemap(entries, today) {
  const rows = entries
    .map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod ?? today}</lastmod>\n    <changefreq>${e.freq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

async function fetchPosts() {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) { console.log("[prerender] no Supabase env: skipping blog posts"); return []; }
  const res = await fetch(`${base}/rest/v1/blogs?select=slug,title,excerpt,published_at&status=eq.published&order=published_at.desc&limit=500`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`blogs request failed (${res.status})`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows.filter((p) => p.slug && p.title) : [];
}

async function main() {
  const indexPath = path.join(DIST, "index.html");
  const template = fs.readFileSync(indexPath, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  for (const r of ROUTES) {
    const html = renderPage(template, r);
    if (r.path === "/") fs.writeFileSync(indexPath, html);
    else {
      const dir = path.join(DIST, r.path);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
    }
    if (r.priority) entries.push({ loc: url(r.path), freq: r.freq, priority: r.priority });
  }

  let posts = [];
  try { posts = await fetchPosts(); } catch (e) { console.warn("[prerender] could not load blog posts:", e.message); }
  for (const p of posts) {
    if (!/^[a-z0-9-]+$/i.test(p.slug)) continue;
    const desc = (p.excerpt || `${p.title} on the ${BRAND} placement blog.`).replace(/\s+/g, " ").slice(0, 155);
    const page = { path: `/blog/${p.slug}`, title: `${p.title} | ${BRAND}`, description: desc, h1: p.title, blurb: desc };
    const dir = path.join(DIST, "blog", p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), renderPage(template, page));
    entries.push({ loc: url(page.path), freq: "monthly", priority: "0.6", lastmod: (p.published_at || today).slice(0, 10) });
  }

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(entries, today));
  console.log(`[prerender] ${ROUTES.length} pages, ${posts.length} blog posts, sitemap with ${entries.length} URLs`);
}

// Only run when called as a script (so the helpers can be tested), and never fail the build.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main().catch((e) => { console.warn("[prerender] skipped:", e?.message ?? e); });
}
