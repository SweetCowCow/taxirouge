// 戰鬥獎勵候選卡池。task 5.x card-catalog 完成後會被官方目錄取代，
// 現在先放幾張不在起始牌組裡的卡，讓「拿到新卡」的反饋成立。

import type { CombatCard } from "./types";

export const REWARD_POOL: CombatCard[] = [
  { id: "v-nitro", name: "踩到底・破甲式", school: "vehicle", cost: 3, effects: [{ type: "damage", amount: 11 }] },
  { id: "v-uturn", name: "硬切違規迴轉・斷魂式", school: "vehicle", cost: 1, effects: [{ type: "damage", amount: 3 }, { type: "heal-mind", amount: 2 }] },
  { id: "g-talisman", name: "計程車香火袋・護身符", school: "gear", cost: 2, effects: [{ type: "heal-mind", amount: 8 }] },
  { id: "g-radio", name: "車隊頻道・呼救式", school: "gear", cost: 1, effects: [{ type: "heal-fuel", amount: 5 }, { type: "heal-mind", amount: 2 }] },
  { id: "r-tunnel", name: "穿過隧道・閉關式", school: "route", cost: 2, effects: [{ type: "heal-fuel", amount: 6 }, { type: "heal-mind", amount: 4 }] },
  { id: "r-detour", name: "繞遠路躲檢查・隱身術", school: "route", cost: 1, effects: [{ type: "damage", amount: 2 }, { type: "heal-fuel", amount: 4 }] },
  { id: "d-confess", name: "說出自己的事・推心式", school: "dialogue", cost: 3, effects: [{ type: "subdue", threshold: 3 }, { type: "damage", amount: 5 }] },
  { id: "d-lullaby", name: "哼一段恆春民謠・撫心訣", school: "dialogue", cost: 2, effects: [{ type: "subdue", threshold: 2 }, { type: "heal-mind", amount: 3 }] },
];

export function pickTwoRewards(rand: () => number = Math.random): CombatCard[] {
  const pool = [...REWARD_POOL];
  const a = Math.floor(rand() * pool.length);
  const [pickA] = pool.splice(a, 1);
  const b = Math.floor(rand() * pool.length);
  const [pickB] = pool.splice(b, 1);
  return [pickA, pickB];
}
