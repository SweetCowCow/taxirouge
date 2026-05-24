// Pure combat reducer. (state, action) => newState
// 所有規則寫在這層，不依賴 React 或 DOM。輸入 state 不被改寫。

import {
  CombatAction,
  CombatCard,
  CombatState,
  Enemy,
  ENERGY_PER_TURN,
  HAND_SIZE,
} from "./types";

// ---- 工具函數 ----

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// 把 from 抽 count 張到 hand；不夠時自動把 discard 重洗回 deck。回傳新 deck/discard/hand。
function draw(
  deck: CombatCard[],
  discard: CombatCard[],
  hand: CombatCard[],
  count: number,
): { deck: CombatCard[]; discard: CombatCard[]; hand: CombatCard[] } {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];
  const nextHand = [...hand];

  for (let i = 0; i < count; i += 1) {
    if (nextDeck.length === 0) {
      if (nextDiscard.length === 0) break;
      // 為了 reducer 純粹，避免 Math.random — 直接搬回（順序保留）。
      // 真正的洗牌應該在更上層（dispatch 前）以可控 seed 處理。
      nextDeck = [...nextDiscard];
      nextDiscard = [];
    }
    const card = nextDeck.shift();
    if (card) nextHand.push(card);
  }

  return { deck: nextDeck, discard: nextDiscard, hand: nextHand };
}

function applyCardEffects(state: CombatState, card: CombatCard): CombatState {
  let enemy: Enemy = state.enemy;
  let fuel = state.player.fuel;
  let mind = state.player.mind;
  let outcome = state.outcome;
  let phase = state.phase;

  for (const effect of card.effects) {
    switch (effect.type) {
      case "damage": {
        enemy = { ...enemy, hp: Math.max(0, enemy.hp - effect.amount) };
        if (enemy.hp <= 0 && outcome === null) {
          outcome = "victory";
          phase = "ended";
        }
        break;
      }
      case "heal-fuel": {
        fuel = clamp(fuel + effect.amount, 0, state.player.fuelMax);
        break;
      }
      case "heal-mind": {
        mind = clamp(mind + effect.amount, 0, state.player.mindMax);
        break;
      }
      case "subdue": {
        if (
          card.school === "dialogue" &&
          enemy.behavior === "dialoguing" &&
          enemy.subdueThreshold !== undefined &&
          effect.threshold >= enemy.subdueThreshold &&
          outcome === null
        ) {
          outcome = "subdued";
          phase = "ended";
        }
        break;
      }
    }
  }

  return {
    ...state,
    enemy,
    player: { ...state.player, fuel, mind },
    outcome,
    phase,
  };
}

function checkPlayerDefeat(state: CombatState): CombatState {
  if (state.outcome !== null) return state;
  if (state.player.fuel <= 0) {
    return { ...state, phase: "ended", outcome: "breakdown" };
  }
  if (state.player.mind <= 0) {
    return { ...state, phase: "ended", outcome: "vanished" };
  }
  return state;
}

function resolveEnemyAction(state: CombatState): CombatState {
  const { enemy } = state;
  let fuel = state.player.fuel;
  let mind = state.player.mind;

  switch (enemy.behavior) {
    case "charging":
      fuel = Math.max(0, fuel - enemy.attack);
      break;
    case "cursing":
      mind = Math.max(0, mind - enemy.attack);
      break;
    case "dialoguing":
      // 對話型敵人攻擊輕微，平均分配到 mind
      mind = Math.max(0, mind - Math.max(1, Math.floor(enemy.attack / 2)));
      break;
  }

  return checkPlayerDefeat({
    ...state,
    player: { ...state.player, fuel, mind },
  });
}

// ---- 主 reducer ----

export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  if (state.phase === "ended") return state;

  switch (action.type) {
    case "start-combat": {
      const drawn = draw(state.deck, state.discard, [], HAND_SIZE);
      return {
        ...state,
        deck: drawn.deck,
        discard: drawn.discard,
        hand: drawn.hand,
        player: { ...state.player, energy: ENERGY_PER_TURN },
        turn: 1,
        phase: "player-turn",
        outcome: null,
      };
    }

    case "play-card": {
      if (state.phase !== "player-turn") return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card) return state;
      if (card.cost > state.player.energy) return state;

      const afterEffects = applyCardEffects(state, card);
      const newHand = afterEffects.hand.filter((c) => c.id !== card.id);
      const newDiscard = [...afterEffects.discard, card];

      return {
        ...afterEffects,
        hand: newHand,
        discard: newDiscard,
        player: {
          ...afterEffects.player,
          energy: afterEffects.player.energy - card.cost,
        },
      };
    }

    case "end-turn": {
      if (state.phase !== "player-turn") return state;

      // 1. 棄掉剩餘手牌
      const discardedHand: CombatCard[] = [...state.discard, ...state.hand];

      // 2. 敵人行動
      const enemyTurnState: CombatState = resolveEnemyAction({
        ...state,
        hand: [],
        discard: discardedHand,
        phase: "enemy-turn",
      });
      if (enemyTurnState.phase === "ended") return enemyTurnState;

      // 3. 重抽手牌、重置能量、回到玩家回合
      const drawn = draw(
        enemyTurnState.deck,
        enemyTurnState.discard,
        [],
        HAND_SIZE,
      );
      return {
        ...enemyTurnState,
        deck: drawn.deck,
        discard: drawn.discard,
        hand: drawn.hand,
        player: { ...enemyTurnState.player, energy: ENERGY_PER_TURN },
        turn: enemyTurnState.turn + 1,
        phase: "player-turn",
      };
    }
  }
}
