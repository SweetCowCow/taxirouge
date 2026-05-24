// Run-flow 型別。State machine 與相關事件。

export type RunPhase =
  | "idle"
  | "driving"
  | "at-node"
  | "in-event"
  | "in-combat"
  | "node-result"
  | "ending";

export type NodeType =
  | "passenger-narrative"
  | "passenger-combat"
  | "passenger-mixed"
  | "gas-station"
  | "boss";

export type EndingType = "cleared" | "breakdown" | "vanished";

export type CombatOutcome = "victory" | "subdued" | "breakdown" | "vanished";

export type RunNode = {
  index: number;
  type: NodeType;
  // 各節點細節先以最小欄位收斂；task 3.2 與 task 6.2 會擴充
  enemyKey?: string;
  eventId?: string;
};

export type RunResources = {
  fuel: number;
  fuelMax: number;
  mind: number;
  mindMax: number;
};

export const FUEL_MAX = 100;
export const MIND_MAX = 50;
export const START_TIME = "23:00";
export const NODE_TIME_STEP_MIN = 30;
export const NODE_TIME_STEP_MAX = 60;

export type RunModel = {
  runId: string;
  startedAt: number;
  phase: RunPhase;
  currentTime: string;
  currentNodeIndex: number;
  nodes: RunNode[];
  resources: RunResources;
  endingType: EndingType | null;
  earnedCardIds: string[];
  /** node-result phase 用：本節點剛取得的卡 id，若有 */
  pendingRewardCardId?: string;
};

export type ResourceDelta = Partial<{
  fuelDelta: number;
  mindDelta: number;
}>;

export type RunEvent =
  | { type: "start-run"; nodes: RunNode[]; runId?: string; startedAt?: number }
  | { type: "depart" } // idle | at-node → driving
  | { type: "arrive-node" } // driving → at-node
  | { type: "enter-node" } // at-node → in-event | in-combat | node-result (gas-station 自動結算)
  | {
      type: "resolve-event";
      outcome: "ok" | "to-combat";
      delta?: ResourceDelta;
      rewardCardId?: string;
    }
  | {
      type: "resolve-combat";
      outcome: CombatOutcome;
      earnedCardId?: string;
    }
  | { type: "continue" }; // node-result → driving | ending
