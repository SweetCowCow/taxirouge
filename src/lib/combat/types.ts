// 戰鬥型別。Card 借用 card-catalog 的最小子集，避免互相依賴。

export type CardSchool = "vehicle" | "gear" | "route" | "dialogue";

export type CardEffect =
  | { type: "damage"; amount: number }
  | { type: "heal-fuel"; amount: number }
  | { type: "heal-mind"; amount: number }
  | { type: "subdue"; threshold: number };

export type CombatCard = {
  id: string;
  name: string;
  school: CardSchool;
  cost: number;
  effects: CardEffect[];
};

export type EnemyBehavior = "charging" | "cursing" | "dialoguing";

export type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  behavior: EnemyBehavior;
  attack: number;
  subdueThreshold?: number; // dialoguing 專用
};

export type CombatPhase = "player-turn" | "enemy-turn" | "ended";

export type CombatOutcome = "victory" | "subdued" | "breakdown" | "vanished";

export type CombatState = {
  player: {
    fuel: number;
    fuelMax: number;
    mind: number;
    mindMax: number;
    energy: number;
    energyMax: number;
  };
  enemy: Enemy;
  deck: CombatCard[];
  hand: CombatCard[];
  discard: CombatCard[];
  turn: number;
  phase: CombatPhase;
  outcome: CombatOutcome | null;
};

export type CombatAction =
  | { type: "start-combat" }
  | { type: "play-card"; cardId: string }
  | { type: "end-turn" };

export const HAND_SIZE = 5;
export const ENERGY_PER_TURN = 3;
