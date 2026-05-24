// 台灣怪奇夜行錄 — 完整 18 張卡牌目錄。
// 分布：5 vehicle / 5 gear / 4 route / 4 dialogue
// 此檔為唯一卡牌來源；starter-deck 與 reward-pool 都從這裡 reference id。

import type { CombatCard } from "@/lib/combat/types";

export type Card = CombatCard & {
  flavorText: string;
  artPath: string;
};

export const CATALOG: Card[] = [
  // === 車技 vehicle (5) ===
  {
    id: "v-brake",
    name: "急踩煞車・鎖喉式",
    school: "vehicle",
    cost: 1,
    effects: [{ type: "damage", amount: 4 }],
    flavorText: "你聽見鞋底滑過柏油的聲音。剎那間，他離保險桿只剩三公分。",
    artPath: "/cards/v-brake.webp",
  },
  {
    id: "v-swerve",
    name: "甩尾轉向・回馬槍",
    school: "vehicle",
    cost: 2,
    effects: [{ type: "damage", amount: 7 }],
    flavorText: "後輪打橫的瞬間，你才想起這是一條單行道。",
    artPath: "/cards/v-swerve.webp",
  },
  {
    id: "v-light",
    name: "閃光遠燈・離魂式",
    school: "vehicle",
    cost: 2,
    effects: [{ type: "damage", amount: 6 }],
    flavorText: "兩道白光照穿後座。後座沒有東西，但有東西不見了。",
    artPath: "/cards/v-light.webp",
  },
  {
    id: "v-horn",
    name: "猛按喇叭・震天響",
    school: "vehicle",
    cost: 0,
    effects: [{ type: "damage", amount: 2 }],
    flavorText: "深夜的喇叭聲特別有用。對活的、對死的都有用。",
    artPath: "/cards/v-horn.webp",
  },
  {
    id: "v-nitro",
    name: "踩到底・破甲式",
    school: "vehicle",
    cost: 3,
    effects: [{ type: "damage", amount: 11 }],
    flavorText: "Toyota Wish 1.8 引擎在凌晨四點半發出它這輩子最大的聲音。",
    artPath: "/cards/v-nitro.webp",
  },

  // === 行頭 gear (5) ===
  {
    id: "g-oil",
    name: "備用汽油・續命式",
    school: "gear",
    cost: 1,
    effects: [{ type: "heal-fuel", amount: 8 }],
    flavorText: "後車廂那桶是上禮拜放的。當時你沒想到會用上。",
    artPath: "/cards/g-oil.webp",
  },
  {
    id: "g-amulet",
    name: "媽祖香火・定神咒",
    school: "gear",
    cost: 1,
    effects: [{ type: "heal-mind", amount: 5 }],
    flavorText: "後照鏡上掛了三年，從來沒拿下來過。",
    artPath: "/cards/g-amulet.webp",
  },
  {
    id: "g-coffee",
    name: "提神蠻牛・清醒拳",
    school: "gear",
    cost: 0,
    effects: [{ type: "heal-mind", amount: 2 }],
    flavorText: "便利商店店員看你三天沒換衣服，特別多送了一瓶。",
    artPath: "/cards/g-coffee.webp",
  },
  {
    id: "g-talisman",
    name: "計程車香火袋・護身符",
    school: "gear",
    cost: 2,
    effects: [{ type: "heal-mind", amount: 8 }],
    flavorText: "車行老闆說：「拿一個吧，不收錢，後座有人下車時要記得拍三下方向盤。」",
    artPath: "/cards/g-talisman.webp",
  },
  {
    id: "g-radio",
    name: "車隊頻道・呼救式",
    school: "gear",
    cost: 1,
    effects: [{ type: "heal-fuel", amount: 5 }, { type: "heal-mind", amount: 2 }],
    flavorText: "「老黃你還在跑？早點回吧。」對講機那頭，是不知道哪個前輩。",
    artPath: "/cards/g-radio.webp",
  },

  // === 路況 route (4) ===
  {
    id: "r-shortcut",
    name: "繞小巷・遁地術",
    school: "route",
    cost: 1,
    effects: [{ type: "damage", amount: 3 }, { type: "heal-fuel", amount: 3 }],
    flavorText: "這條巷子地圖上沒有。開久了你才知道為什麼。",
    artPath: "/cards/r-shortcut.webp",
  },
  {
    id: "r-mainroad",
    name: "上快速道・直破竹",
    school: "route",
    cost: 2,
    effects: [{ type: "damage", amount: 5 }, { type: "heal-fuel", amount: 2 }],
    flavorText: "建國高架的凌晨四點，只剩你和遠處不會結束的車陣。",
    artPath: "/cards/r-mainroad.webp",
  },
  {
    id: "r-tunnel",
    name: "穿過隧道・閉關式",
    school: "route",
    cost: 2,
    effects: [{ type: "heal-fuel", amount: 6 }, { type: "heal-mind", amount: 4 }],
    flavorText: "進隧道前後座有人。出隧道後座沒人。中間發生了什麼，你不想知道。",
    artPath: "/cards/r-tunnel.webp",
  },
  {
    id: "r-detour",
    name: "繞遠路躲檢查・隱身術",
    school: "route",
    cost: 1,
    effects: [{ type: "damage", amount: 2 }, { type: "heal-fuel", amount: 4 }],
    flavorText: "警察攔檢就算了，路邊那個沒臉的人不是警察。",
    artPath: "/cards/r-detour.webp",
  },

  // === 話術 dialogue (4) ===
  {
    id: "d-listen",
    name: "你還好嗎・傾聽訣",
    school: "dialogue",
    cost: 1,
    effects: [{ type: "subdue", threshold: 1 }, { type: "damage", amount: 2 }],
    flavorText: "「我沒事。」乘客說。你看了後照鏡一眼，繼續開。",
    artPath: "/cards/d-listen.webp",
  },
  {
    id: "d-pray",
    name: "代念阿彌陀・送行式",
    school: "dialogue",
    cost: 2,
    effects: [{ type: "subdue", threshold: 2 }, { type: "damage", amount: 3 }],
    flavorText: "你不是和尚，但今晚你是。",
    artPath: "/cards/d-pray.webp",
  },
  {
    id: "d-curse",
    name: "破口大罵・霸王訣",
    school: "dialogue",
    cost: 2,
    effects: [{ type: "damage", amount: 6 }],
    flavorText: "三字經是台灣司機的祖傳口訣。據說對某些東西特別有效。",
    artPath: "/cards/d-curse.webp",
  },
  {
    id: "d-lullaby",
    name: "哼一段恆春民謠・撫心訣",
    school: "dialogue",
    cost: 2,
    effects: [{ type: "subdue", threshold: 2 }, { type: "heal-mind", amount: 3 }],
    flavorText: "你媽媽以前哼給你聽的調子。後座的東西也聽過。",
    artPath: "/cards/d-lullaby.webp",
  },
];

export const CARDS_BY_ID = new Map<string, Card>(CATALOG.map((c) => [c.id, c]));

export function getCard(id: string): Card | undefined {
  return CARDS_BY_ID.get(id);
}

// === 起始牌組（task 5.5）— 12 張，跨四系 ===
export const STARTING_DECK_IDS: readonly string[] = [
  // vehicle x4
  "v-brake", "v-swerve", "v-light", "v-horn",
  // gear x3
  "g-oil", "g-amulet", "g-coffee",
  // route x2
  "r-shortcut", "r-mainroad",
  // dialogue x3
  "d-listen", "d-pray", "d-curse",
];

export function getStartingDeck(): Card[] {
  return STARTING_DECK_IDS.map((id) => {
    const c = getCard(id);
    if (!c) throw new Error(`Starting deck references unknown card: ${id}`);
    return c;
  });
}

// === 獎勵候選卡池（task 2.5 / 5.x）— catalog 中不屬於起始牌組者 ===
export const REWARD_POOL_IDS: readonly string[] = CATALOG
  .filter((c) => !STARTING_DECK_IDS.includes(c.id))
  .map((c) => c.id);

export function getRewardPool(): Card[] {
  return REWARD_POOL_IDS.map((id) => getCard(id)!);
}

// === Build-time / runtime catalog validation ===

export type CatalogValidation = { ok: boolean; errors: string[] };

export function validateCatalog(): CatalogValidation {
  const errors: string[] = [];

  if (CATALOG.length !== 18) {
    errors.push(`expected 18 cards, got ${CATALOG.length}`);
  }

  const ids = new Set<string>();
  for (const card of CATALOG) {
    if (ids.has(card.id)) errors.push(`duplicate id: ${card.id}`);
    ids.add(card.id);

    if (!card.id || !card.name || !card.school || card.cost == null || !card.effects || !card.flavorText || !card.artPath) {
      errors.push(`card ${card.id} missing required field`);
    }
    if (!card.name.includes("・")) {
      errors.push(`card ${card.id} name not in dual-name format (missing "・"): ${card.name}`);
    }
    if (card.cost < 0 || card.cost > 3) {
      errors.push(`card ${card.id} cost out of [0,3]: ${card.cost}`);
    }
  }

  const counts: Record<string, number> = {};
  for (const card of CATALOG) counts[card.school] = (counts[card.school] ?? 0) + 1;
  const expected = { vehicle: 5, gear: 5, route: 4, dialogue: 4 };
  for (const [school, want] of Object.entries(expected)) {
    if ((counts[school] ?? 0) !== want) {
      errors.push(`school ${school} count mismatch: want ${want}, got ${counts[school] ?? 0}`);
    }
  }

  if (STARTING_DECK_IDS.length !== 12) {
    errors.push(`starting deck must be 12 cards, got ${STARTING_DECK_IDS.length}`);
  }
  for (const id of STARTING_DECK_IDS) {
    if (!CARDS_BY_ID.has(id)) errors.push(`starting deck references missing card: ${id}`);
  }
  const startSchools = new Set(STARTING_DECK_IDS.map((id) => getCard(id)?.school));
  for (const s of ["vehicle", "gear", "route", "dialogue"]) {
    if (!startSchools.has(s as CombatCard["school"])) {
      errors.push(`starting deck missing school: ${s}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
