import { describe, expect, it } from "vitest";

import { generateRunMap, validateRunMap } from "./map-generator";

// 可預測 rand：xorshift32 seed
function makeRand(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

describe("generateRunMap", () => {
  it("10 generated maps all satisfy spec constraints", () => {
    for (let i = 0; i < 10; i += 1) {
      const map = generateRunMap({ rand: makeRand(i + 1) });
      const result = validateRunMap(map);
      if (!result.ok) {
        throw new Error(`seed ${i + 1} produced invalid map: ${result.errors.join(", ")}`);
      }
      expect(result.ok).toBe(true);
    }
  });

  it("last node is always boss", () => {
    for (let i = 100; i < 110; i += 1) {
      const map = generateRunMap({ rand: makeRand(i) });
      expect(map[map.length - 1].type).toBe("boss");
    }
  });

  it("intermediate count is 5 or 6", () => {
    for (let i = 200; i < 210; i += 1) {
      const map = generateRunMap({ rand: makeRand(i) });
      const intermediates = map.length - 1;
      expect(intermediates).toBeGreaterThanOrEqual(5);
      expect(intermediates).toBeLessThanOrEqual(6);
    }
  });

  it("combat nodes are tagged with an enemyKey", () => {
    const map = generateRunMap({ rand: makeRand(42) });
    for (const node of map) {
      if (node.type === "passenger-combat" || node.type === "passenger-mixed" || node.type === "boss") {
        expect(node.enemyKey).toBeTruthy();
      }
    }
  });
});
