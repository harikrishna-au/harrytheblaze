// Facts about the Connect seniors for the home page, derived from the same public rows the Connect
// page lists. It deliberately keeps only totals: no names or photos on a public marketing page.

export interface ExpertRow { company: string | null; price_inr: number | null }
export interface ConnectFacts { count: number; companies: string[]; minPrice: number | null }

export function summariseExperts(rows: ExpertRow[]): ConnectFacts {
  const clean = rows.filter((r) => r && typeof r === "object");
  const byCompany = new Map<string, number>();
  let min: number | null = null;
  for (const r of clean) {
    const c = (r.company ?? "").trim();
    if (c) byCompany.set(c, (byCompany.get(c) ?? 0) + 1);
    const p = Number(r.price_inr);
    if (Number.isFinite(p) && p > 0 && (min === null || p < min)) min = p;
  }
  const companies = [...byCompany.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([name]) => name);
  return { count: clean.length, companies, minPrice: min };
}

/** "Infosys, Cognizant and Amazon Web Services" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
