import { describe, expect, it } from "vitest";
import { joinNames, summariseExperts } from "./connectStats";

describe("summariseExperts", () => {
  it("counts seniors, finds the cheapest call and the most common companies", () => {
    const f = summariseExperts([
      { company: "Infosys", price_inr: 299 },
      { company: "Infosys", price_inr: 199 },
      { company: "Cognizant", price_inr: 249 },
      { company: " ", price_inr: 150 },
      { company: null, price_inr: null },
    ]);
    expect(f.count).toBe(5);
    expect(f.minPrice).toBe(150);
    expect(f.companies).toEqual(["Infosys", "Cognizant"]);
  });
  it("ignores zero, negative and non-numeric prices and caps companies at three", () => {
    const f = summariseExperts([
      { company: "A", price_inr: 0 }, { company: "B", price_inr: -5 },
      { company: "C", price_inr: Number("x") }, { company: "D", price_inr: 99 },
    ]);
    expect(f.minPrice).toBe(99);
    expect(f.companies).toHaveLength(3);
  });
  it("is safe on an empty list", () => {
    expect(summariseExperts([])).toEqual({ count: 0, companies: [], minPrice: null });
  });
});

describe("joinNames", () => {
  it("joins in plain English", () => {
    expect(joinNames([])).toBe("");
    expect(joinNames(["A"])).toBe("A");
    expect(joinNames(["A", "B"])).toBe("A and B");
    expect(joinNames(["A", "B", "C"])).toBe("A, B and C");
  });
});
