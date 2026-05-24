// 初版起始牌組（12 張）。task 5.5 會被正式 catalog 取代，這裡先給戰鬥迴圈一個可玩的牌庫。

import type { CombatCard } from "./types";

export const STARTER_DECK: CombatCard[] = [
  // === 車技（vehicle）：穩定輸出 ===
  { id: "v-brake", name: "急踩煞車・鎖喉式", school: "vehicle", cost: 1, effects: [{ type: "damage", amount: 4 }] },
  { id: "v-swerve", name: "甩尾轉向・回馬槍", school: "vehicle", cost: 2, effects: [{ type: "damage", amount: 7 }] },
  { id: "v-light", name: "閃光遠燈・離魂式", school: "vehicle", cost: 2, effects: [{ type: "damage", amount: 6 }] },
  { id: "v-horn", name: "猛按喇叭・震天響", school: "vehicle", cost: 0, effects: [{ type: "damage", amount: 2 }] },

  // === 行頭（gear）：補資源 ===
  { id: "g-oil", name: "備用汽油・續命式", school: "gear", cost: 1, effects: [{ type: "heal-fuel", amount: 8 }] },
  { id: "g-amulet", name: "媽祖香火・定神咒", school: "gear", cost: 1, effects: [{ type: "heal-mind", amount: 5 }] },
  { id: "g-coffee", name: "提神蠻牛・清醒拳", school: "gear", cost: 0, effects: [{ type: "heal-mind", amount: 2 }] },

  // === 路況（route）：混合 ===
  { id: "r-shortcut", name: "繞小巷・遁地術", school: "route", cost: 1, effects: [{ type: "damage", amount: 3 }, { type: "heal-fuel", amount: 3 }] },
  { id: "r-mainroad", name: "上快速道・直破竹", school: "route", cost: 2, effects: [{ type: "damage", amount: 5 }, { type: "heal-fuel", amount: 2 }] },

  // === 話術（dialogue）：對話收服 ===
  { id: "d-listen", name: "你還好嗎・傾聽訣", school: "dialogue", cost: 1, effects: [{ type: "subdue", threshold: 1 }, { type: "damage", amount: 2 }] },
  { id: "d-pray", name: "代念阿彌陀・送行式", school: "dialogue", cost: 2, effects: [{ type: "subdue", threshold: 2 }, { type: "damage", amount: 3 }] },
  { id: "d-curse", name: "破口大罵・霸王訣", school: "dialogue", cost: 2, effects: [{ type: "damage", amount: 6 }] },
];
