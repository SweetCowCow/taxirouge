// 產生一條完整的一局節點地圖：5-6 個中間節點 + 1 個王戰。
// 約束：
//   - 至少 1 個 gas-station
//   - 至少 2 個 combat-bearing（passenger-combat | passenger-mixed | boss）
//   - 至少 2 個 narrative-bearing（passenger-narrative | passenger-mixed）
//   - 第一個節點通常給敘事，最後是 boss
//
// rand 可注入以利測試。

import type { NodeType, RunNode } from "./types";

const ENEMY_KEYS_COMBAT = ["silentPassenger", "whisperingChild"];
const ENEMY_KEYS_BOSS = ["drunkSalaryman"];

export type MapGenOptions = {
  rand?: () => number;
  intermediateMin?: number;
  intermediateMax?: number;
};

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function shuffle<T>(rand: () => number, arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function isCombatBearing(t: NodeType): boolean {
  return t === "passenger-combat" || t === "passenger-mixed" || t === "boss";
}

function isNarrativeBearing(t: NodeType): boolean {
  return t === "passenger-narrative" || t === "passenger-mixed";
}

/**
 * Build the intermediate sequence so that all constraints are satisfied
 * BEFORE considering the boss. Strategy: start from a guaranteed quota set,
 * then fill the remaining slots with random intermediate types.
 */
function buildIntermediates(rand: () => number, count: number): NodeType[] {
  // 保底：1 個 gas-station、1 個 passenger-combat、1 個 passenger-narrative。
  // 首節點固定再加 1 個 passenger-narrative，確保 narrative-bearing ≥ 2。
  // boss 本身已提供 1 個 combat-bearing，因此中間段只需保底 1 個 combat 即可達 ≥2。
  const guaranteed: NodeType[] = ["gas-station", "passenger-combat", "passenger-narrative"];
  const remainingSlots = count - guaranteed.length - 1; // -1 for the fixed first narrative
  const fillerPool: NodeType[] = [
    "passenger-narrative",
    "passenger-combat",
    "passenger-mixed",
    "gas-station",
  ];
  const filler: NodeType[] = [];
  for (let i = 0; i < remainingSlots; i += 1) {
    filler.push(pick(rand, fillerPool));
  }
  // 第一節點固定 narrative；其後把保底 + filler 洗牌
  return ["passenger-narrative", ...shuffle(rand, [...guaranteed, ...filler])];
}

export function generateRunMap(options: MapGenOptions = {}): RunNode[] {
  const rand = options.rand ?? Math.random;
  const min = options.intermediateMin ?? 5;
  const max = options.intermediateMax ?? 6;
  const intermediateCount = randInt(rand, min, max);

  const types = buildIntermediates(rand, intermediateCount);
  const intermediates: RunNode[] = types.map((type, i) => ({
    index: i,
    type,
    enemyKey: type === "passenger-combat" || type === "passenger-mixed" ? pick(rand, ENEMY_KEYS_COMBAT) : undefined,
  }));
  const boss: RunNode = {
    index: intermediateCount,
    type: "boss",
    enemyKey: pick(rand, ENEMY_KEYS_BOSS),
  };
  return [...intermediates, boss];
}

// 驗證 helper：檢查地圖是否符合所有 spec constraint
export type MapValidation = {
  ok: boolean;
  errors: string[];
};

export function validateRunMap(nodes: RunNode[]): MapValidation {
  const errors: string[] = [];
  const last = nodes[nodes.length - 1];
  const intermediates = nodes.slice(0, -1);

  if (!last || last.type !== "boss") {
    errors.push("last node must be boss");
  }
  if (intermediates.length < 5 || intermediates.length > 6) {
    errors.push(`intermediate count out of [5, 6]: got ${intermediates.length}`);
  }
  const gasStations = nodes.filter((n) => n.type === "gas-station").length;
  if (gasStations < 1) errors.push("must contain at least 1 gas-station");
  const combatBearing = nodes.filter((n) => isCombatBearing(n.type)).length;
  if (combatBearing < 2) errors.push(`combat-bearing nodes must be >= 2, got ${combatBearing}`);
  const narrativeBearing = nodes.filter((n) => isNarrativeBearing(n.type)).length;
  if (narrativeBearing < 2) errors.push(`narrative-bearing nodes must be >= 2, got ${narrativeBearing}`);

  return { ok: errors.length === 0, errors };
}
