import { describe, expect, it } from "vitest";

import { combatReducer } from "./engine";
import type { CombatCard, CombatState, Enemy } from "./types";

const baseCards: CombatCard[] = [
  { id: "c1", name: "急踩煞車・鎖喉式", school: "vehicle", cost: 1, effects: [{ type: "damage", amount: 4 }] },
  { id: "c2", name: "破口大罵・霸王訣", school: "dialogue", cost: 2, effects: [{ type: "damage", amount: 6 }] },
  { id: "c3", name: "順風路況・行雲流水", school: "route", cost: 0, effects: [{ type: "heal-fuel", amount: 5 }] },
  { id: "c4", name: "深呼吸・養氣式", school: "gear", cost: 1, effects: [{ type: "heal-mind", amount: 3 }] },
  { id: "c5", name: "閃光燈・離魂式", school: "vehicle", cost: 2, effects: [{ type: "damage", amount: 5 }] },
  { id: "c6", name: "備用油・續命式", school: "gear", cost: 1, effects: [{ type: "heal-fuel", amount: 4 }] },
];

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: "e1",
    name: "面無表情的乘客",
    hp: 20,
    maxHp: 20,
    behavior: "charging",
    attack: 5,
    ...overrides,
  };
}

function makeInitialState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 0, energyMax: 3 },
    enemy: makeEnemy(),
    deck: [...baseCards],
    hand: [],
    discard: [],
    turn: 0,
    phase: "player-turn",
    outcome: null,
    ...overrides,
  };
}

describe("combatReducer", () => {
  it("draws 5 cards and sets energy to 3 on start-combat", () => {
    const state = makeInitialState();
    const next = combatReducer(state, { type: "start-combat" });

    expect(next.hand).toHaveLength(5);
    expect(next.deck).toHaveLength(1);
    expect(next.player.energy).toBe(3);
    expect(next.turn).toBe(1);
    expect(next.phase).toBe("player-turn");
  });

  it("deducts cost, moves card to discard, and applies damage on play-card", () => {
    const state = combatReducer(makeInitialState(), { type: "start-combat" });
    const cardInHand = state.hand[0];
    const before = { energy: state.player.energy, enemyHp: state.enemy.hp };

    const next = combatReducer(state, { type: "play-card", cardId: cardInHand.id });

    expect(next.player.energy).toBe(before.energy - cardInHand.cost);
    expect(next.hand.find((c) => c.id === cardInHand.id)).toBeUndefined();
    expect(next.discard.map((c) => c.id)).toContain(cardInHand.id);

    const damage = cardInHand.effects
      .filter((e) => e.type === "damage")
      .reduce((s, e) => s + (e as { amount: number }).amount, 0);
    expect(next.enemy.hp).toBe(before.enemyHp - damage);
  });

  it("rejects play-card when energy is insufficient", () => {
    const state = makeInitialState({
      hand: [baseCards[1]], // cost 2
      player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 1, energyMax: 3 },
    });
    const next = combatReducer(state, { type: "play-card", cardId: "c2" });

    expect(next).toEqual(state); // 完全不變
  });

  it("charging enemy reduces fuel on end-turn", () => {
    const state = combatReducer(makeInitialState(), { type: "start-combat" });
    const fuelBefore = state.player.fuel;
    const enemyAttack = state.enemy.attack;

    const next = combatReducer(state, { type: "end-turn" });

    expect(next.player.fuel).toBe(fuelBefore - enemyAttack);
    expect(next.player.mind).toBe(state.player.mind);
    expect(next.turn).toBe(state.turn + 1);
    expect(next.hand).toHaveLength(5); // 重抽
    expect(next.player.energy).toBe(3); // 重置
  });

  it("cursing enemy reduces mind on end-turn", () => {
    const state = combatReducer(
      makeInitialState({ enemy: makeEnemy({ behavior: "cursing", attack: 4 }) }),
      { type: "start-combat" },
    );
    const mindBefore = state.player.mind;

    const next = combatReducer(state, { type: "end-turn" });

    expect(next.player.mind).toBe(mindBefore - 4);
    expect(next.player.fuel).toBe(state.player.fuel);
  });

  it("does not mutate input state (purity)", () => {
    const state = combatReducer(makeInitialState(), { type: "start-combat" });
    const snapshot = JSON.stringify(state);
    combatReducer(state, { type: "play-card", cardId: state.hand[0].id });
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it("victory ends combat when enemy hp reaches 0", () => {
    const state = makeInitialState({
      hand: [baseCards[1]], // damage 6
      enemy: makeEnemy({ hp: 4 }),
      player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 3, energyMax: 3 },
    });
    const next = combatReducer(state, { type: "play-card", cardId: "c2" });

    expect(next.enemy.hp).toBe(0);
    expect(next.phase).toBe("ended");
    expect(next.outcome).toBe("victory");
  });

  it("breakdown ending when fuel reaches 0 via charging enemy", () => {
    const state = makeInitialState({
      enemy: makeEnemy({ behavior: "charging", attack: 10 }),
      player: { fuel: 8, fuelMax: 100, mind: 50, mindMax: 50, energy: 3, energyMax: 3 },
    });
    const next = combatReducer(state, { type: "end-turn" });

    expect(next.player.fuel).toBe(0);
    expect(next.phase).toBe("ended");
    expect(next.outcome).toBe("breakdown");
  });

  it("vanished ending when mind reaches 0 via cursing enemy", () => {
    const state = makeInitialState({
      enemy: makeEnemy({ behavior: "cursing", attack: 8 }),
      player: { fuel: 100, fuelMax: 100, mind: 5, mindMax: 50, energy: 3, energyMax: 3 },
    });
    const next = combatReducer(state, { type: "end-turn" });

    expect(next.player.mind).toBe(0);
    expect(next.phase).toBe("ended");
    expect(next.outcome).toBe("vanished");
  });

  it("subdued ending when dialogue card meets threshold against dialoguing enemy", () => {
    const subdueCard = {
      id: "d-sub",
      name: "代念阿彌陀・送行式",
      school: "dialogue" as const,
      cost: 2,
      effects: [{ type: "subdue" as const, threshold: 2 }, { type: "damage" as const, amount: 3 }],
    };
    const state = makeInitialState({
      hand: [subdueCard],
      enemy: makeEnemy({ behavior: "dialoguing", hp: 20, subdueThreshold: 2 }),
      player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 3, energyMax: 3 },
    });
    const next = combatReducer(state, { type: "play-card", cardId: "d-sub" });

    expect(next.phase).toBe("ended");
    expect(next.outcome).toBe("subdued");
  });

  it("does not subdue when threshold is too low", () => {
    const weakSubdue = {
      id: "d-weak",
      name: "你還好嗎",
      school: "dialogue" as const,
      cost: 1,
      effects: [{ type: "subdue" as const, threshold: 1 }, { type: "damage" as const, amount: 2 }],
    };
    const state = makeInitialState({
      hand: [weakSubdue],
      enemy: makeEnemy({ behavior: "dialoguing", hp: 20, subdueThreshold: 3 }),
      player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 3, energyMax: 3 },
    });
    const next = combatReducer(state, { type: "play-card", cardId: "d-weak" });

    expect(next.outcome).toBeNull();
    expect(next.phase).toBe("player-turn");
    expect(next.enemy.hp).toBe(18); // 傷害仍生效
  });
});
