import { describe, expect, it } from "vitest";

import {
  CATALOG,
  REWARD_POOL_IDS,
  STARTING_DECK_IDS,
  getStartingDeck,
  validateCatalog,
} from "./catalog";

describe("card catalog", () => {
  it("passes the full validateCatalog() check", () => {
    const result = validateCatalog();
    if (!result.ok) {
      throw new Error(`catalog invalid:\n  - ${result.errors.join("\n  - ")}`);
    }
    expect(result.ok).toBe(true);
  });

  it("has exactly 18 cards with the correct school distribution", () => {
    expect(CATALOG).toHaveLength(18);
    const counts = CATALOG.reduce<Record<string, number>>((acc, c) => {
      acc[c.school] = (acc[c.school] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({ vehicle: 5, gear: 5, route: 4, dialogue: 4 });
  });

  it("every card has unique id and full required fields", () => {
    const ids = new Set(CATALOG.map((c) => c.id));
    expect(ids.size).toBe(CATALOG.length);
    for (const c of CATALOG) {
      expect(c.id).toBeTruthy();
      expect(c.name).toContain("・");
      expect(c.school).toBeTruthy();
      expect(typeof c.cost).toBe("number");
      expect(c.effects.length).toBeGreaterThan(0);
      expect(c.flavorText.length).toBeGreaterThan(0);
      expect(c.artPath).toMatch(/^\/cards\/.+\.(webp|png|jpg)$/);
    }
  });

  it("starting deck has 12 cards spanning all 4 schools", () => {
    const deck = getStartingDeck();
    expect(deck).toHaveLength(12);
    const schools = new Set(deck.map((c) => c.school));
    expect(schools.has("vehicle")).toBe(true);
    expect(schools.has("gear")).toBe(true);
    expect(schools.has("route")).toBe(true);
    expect(schools.has("dialogue")).toBe(true);
  });

  it("reward pool is disjoint from starting deck", () => {
    const startSet = new Set(STARTING_DECK_IDS);
    for (const id of REWARD_POOL_IDS) {
      expect(startSet.has(id)).toBe(false);
    }
    // 12 in starter + 6 in reward = 18 total
    expect(STARTING_DECK_IDS.length + REWARD_POOL_IDS.length).toBe(18);
  });
});
