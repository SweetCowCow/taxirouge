"use client";

// 受控戰鬥子畫面。由 RunScreen 提供敵人，戰鬥結束時 emit onResolve。
// 不處理獎勵、不處理 restart、不存 IDB — 那些都由 parent 負責。

import { useMemo, useReducer } from "react";

import { combatReducer } from "@/lib/combat/engine";
import { ENEMY_TEMPLATES } from "@/lib/combat/enemies";
import { STARTER_DECK } from "@/lib/combat/starter-deck";
import type { CombatCard, CombatOutcome, CombatState } from "@/lib/combat/types";

export type CombatEnemyKey = keyof typeof ENEMY_TEMPLATES;

type Props = {
  enemyKey: CombatEnemyKey;
  extraDeckCardIds?: string[];
  onResolve: (outcome: CombatOutcome) => void;
};

const SCHOOL_LABEL: Record<CombatCard["school"], string> = {
  vehicle: "車技",
  gear: "行頭",
  route: "路況",
  dialogue: "話術",
};
const SCHOOL_COLOR: Record<CombatCard["school"], string> = {
  vehicle: "border-school-vehicle text-school-vehicle",
  gear: "border-school-gear text-school-gear",
  route: "border-school-road text-school-road",
  dialogue: "border-school-talk text-school-talk",
};

function shuffleDeck(deck: CombatCard[]): CombatCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeInitialState(enemyKey: CombatEnemyKey, extra: CombatCard[]): CombatState {
  const enemy = { ...ENEMY_TEMPLATES[enemyKey] };
  const seed: CombatState = {
    player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 0, energyMax: 3 },
    enemy,
    deck: shuffleDeck([...STARTER_DECK, ...extra]),
    hand: [],
    discard: [],
    turn: 0,
    phase: "player-turn",
    outcome: null,
  };
  return combatReducer(seed, { type: "start-combat" });
}

export default function CombatView({ enemyKey, extraDeckCardIds = [], onResolve }: Props) {
  const extra = useMemo(() => {
    // 從 REWARD_POOL 拿到 extra cards
    // 簡化：忽略 — 牌組整合在 task 5.x 處理；現在用起始牌組即可
    return [] as CombatCard[];
  }, [extraDeckCardIds]);

  const [state, dispatch] = useReducer(combatReducer, null, () => makeInitialState(enemyKey, extra));

  const canEndTurn = state.phase === "player-turn" && state.outcome === null;

  return (
    <div className="flex flex-col gap-5">
      {/* 敵人 */}
      <section className="rounded-sharp border border-surface-elevated bg-surface-elevated/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-text-muted">
              第 {state.turn} 回合
            </p>
            <h2 className="mt-1 text-xl font-semibold">{state.enemy.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">HP</p>
            <p className="font-mono text-xl">{state.enemy.hp} / {state.enemy.maxHp}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface-sunken">
          <div className="h-full bg-accent-blood transition-all" style={{ width: `${(state.enemy.hp / state.enemy.maxHp) * 100}%` }} />
        </div>
      </section>

      {/* 玩家資源條 */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Bar label="油錶" current={state.player.fuel} max={state.player.fuelMax} color="bg-accent-amber" />
        <Bar label="精神" current={state.player.mind} max={state.player.mindMax} color="bg-accent-neon" />
        <div className="flex items-center justify-between rounded-sharp border border-surface-elevated bg-surface-elevated/60 px-4 py-3">
          <span className="text-xs tracking-widest text-text-muted">神識</span>
          <span className="font-mono text-lg">{state.player.energy} / {state.player.energyMax}</span>
        </div>
      </section>

      {/* 手牌 */}
      <section className="flex flex-col gap-3">
        <p className="text-xs tracking-widest text-text-muted">
          手牌 {state.hand.length} · 牌庫 {state.deck.length} · 棄牌 {state.discard.length}
        </p>
        <div className="flex flex-wrap gap-3">
          {state.hand.map((card) => {
            const tooCostly = card.cost > state.player.energy;
            const disabled = tooCostly || state.phase !== "player-turn" || state.outcome !== null;
            return (
              <button
                key={card.id}
                disabled={disabled}
                onClick={() => dispatch({ type: "play-card", cardId: card.id })}
                className={`flex w-44 flex-col gap-2 rounded-sharp border bg-surface-elevated p-3 text-left transition ${SCHOOL_COLOR[card.school]} ${disabled ? "opacity-40 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-card"}`}
              >
                <div className="flex items-center justify-between text-[10px] tracking-widest opacity-70">
                  <span>{SCHOOL_LABEL[card.school]}</span>
                  <span>COST {card.cost}</span>
                </div>
                <p className="text-sm font-medium text-text-primary">{card.name}</p>
                <ul className="space-y-0.5 text-[11px] text-text-secondary">
                  {card.effects.map((e, i) => (
                    <li key={i}>{renderEffect(e)}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* 結束回合 / 結算 */}
      <section className="flex items-center justify-end gap-3">
        {state.outcome ? (
          <button
            onClick={() => onResolve(state.outcome!)}
            className="rounded-sharp border border-accent-blood/60 bg-accent-blood/15 px-6 py-3 text-sm tracking-widest transition hover:bg-accent-blood/30"
          >
            繼續 →
          </button>
        ) : (
          <button
            disabled={!canEndTurn}
            onClick={() => dispatch({ type: "end-turn" })}
            className="rounded-sharp border border-accent-blood/60 bg-accent-blood/10 px-6 py-3 text-sm tracking-widest transition hover:bg-accent-blood/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            結束回合 →
          </button>
        )}
      </section>
    </div>
  );
}

function Bar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  return (
    <div className="rounded-sharp border border-surface-elevated bg-surface-elevated/60 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest text-text-muted">{label}</span>
        <span className="font-mono text-sm">{current} / {max}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-sunken">
        <div className={`h-full transition-all ${color}`} style={{ width: `${(current / max) * 100}%` }} />
      </div>
    </div>
  );
}

function renderEffect(e: CombatCard["effects"][number]): string {
  switch (e.type) {
    case "damage": return `造成 ${e.amount} 傷害`;
    case "heal-fuel": return `補油 +${e.amount}`;
    case "heal-mind": return `回神 +${e.amount}`;
    case "subdue": return `話術收服 lv${e.threshold}`;
  }
}
