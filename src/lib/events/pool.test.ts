import { describe, expect, it } from "vitest";

import { BOSS_EVENTS, NARRATIVE_EVENTS } from "./pool";

describe("event pool", () => {
  it("has 5-7 narrative events", () => {
    expect(NARRATIVE_EVENTS.length).toBeGreaterThanOrEqual(5);
    expect(NARRATIVE_EVENTS.length).toBeLessThanOrEqual(7);
  });

  it("has 2 boss events", () => {
    expect(BOSS_EVENTS.length).toBe(2);
  });

  it("event ids are globally unique across pools", () => {
    const all = [...NARRATIVE_EVENTS, ...BOSS_EVENTS];
    const ids = new Set(all.map((e) => e.id));
    expect(ids.size).toBe(all.length);
  });

  it("every event has at least one combat-bearing or resource-modifying choice", () => {
    for (const e of [...NARRATIVE_EVENTS, ...BOSS_EVENTS]) {
      const hasCombat = e.choices.some((c) => c.outcome === "to-combat");
      const hasResourceMod = e.choices.some((c) => c.delta && (c.delta.fuelDelta || c.delta.mindDelta));
      const hasReward = e.choices.some((c) => c.rewardCardId);
      const meaningful = hasCombat || hasResourceMod || hasReward;
      if (!meaningful) {
        throw new Error(`event ${e.id} has no meaningful choice (combat / resource / reward)`);
      }
      expect(meaningful).toBe(true);
    }
  });

  it("collectively covers all four outcome kinds (resource-change / give-card / to-combat / no-delta-progress)", () => {
    const all = [...NARRATIVE_EVENTS, ...BOSS_EVENTS];
    const flat = all.flatMap((e) => e.choices);

    expect(flat.some((c) => c.delta && (c.delta.fuelDelta || c.delta.mindDelta))).toBe(true);
    expect(flat.some((c) => c.rewardCardId)).toBe(true);
    expect(flat.some((c) => c.outcome === "to-combat")).toBe(true);
    expect(flat.some((c) => c.outcome === "ok" && !c.delta && !c.rewardCardId)).toBe(true);
  });

  it("every choice has a non-empty label", () => {
    for (const e of [...NARRATIVE_EVENTS, ...BOSS_EVENTS]) {
      for (const c of e.choices) {
        expect(c.label.length).toBeGreaterThan(0);
      }
    }
  });
});
