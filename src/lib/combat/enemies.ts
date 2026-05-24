// 三種敵人 archetype（task 2.3）。每個 archetype 都對應一種 behavior。

import type { Enemy } from "./types";

export const ENEMY_TEMPLATES: Record<string, Enemy> = {
  silentPassenger: {
    id: "silent-passenger",
    name: "面無表情的乘客",
    hp: 22,
    maxHp: 22,
    behavior: "charging",
    attack: 4,
  },
  whisperingChild: {
    id: "whispering-child",
    name: "後座的小女孩",
    hp: 18,
    maxHp: 18,
    behavior: "cursing",
    attack: 3,
  },
  drunkSalaryman: {
    id: "drunk-salaryman",
    name: "醉得想哭的上班族",
    hp: 16,
    maxHp: 16,
    behavior: "dialoguing",
    attack: 2,
    subdueThreshold: 2,
  },
};

export function getEnemy(key: keyof typeof ENEMY_TEMPLATES): Enemy {
  return { ...ENEMY_TEMPLATES[key] };
}
