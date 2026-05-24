"use client";

// 受控戰鬥子畫面。由 RunScreen 提供敵人，戰鬥結束時 emit onResolve。

import { useMemo, useReducer } from "react";

import { CardArt } from "@/components/cards/CardArt";
import { combatReducer } from "@/lib/combat/engine";
import { ENEMY_TEMPLATES } from "@/lib/combat/enemies";
import type { CombatCard, CombatOutcome, CombatState } from "@/lib/combat/types";
import { CATALOG, getStartingDeck, type Card } from "@/lib/cards/catalog";

export type CombatEnemyKey = keyof typeof ENEMY_TEMPLATES;

type Props = {
  enemyKey: CombatEnemyKey;
  earnedCardIds?: string[];
  onResolve: (outcome: CombatOutcome) => void;
};

function shuffleDeck<T>(deck: T[]): T[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck(earnedCardIds: string[]): CombatCard[] {
  const starter = getStartingDeck();
  const extras = earnedCardIds
    .map((id) => CATALOG.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c));
  return shuffleDeck<CombatCard>([...starter, ...extras]);
}

function makeInitialState(enemyKey: CombatEnemyKey, earnedCardIds: string[]): CombatState {
  const enemy = { ...ENEMY_TEMPLATES[enemyKey] };
  const seed: CombatState = {
    player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 0, energyMax: 3 },
    enemy,
    deck: buildDeck(earnedCardIds),
    hand: [],
    discard: [],
    turn: 0,
    phase: "player-turn",
    outcome: null,
  };
  return combatReducer(seed, { type: "start-combat" });
}

export default function CombatView({ enemyKey, earnedCardIds = [], onResolve }: Props) {
  const [state, dispatch] = useReducer(
    combatReducer,
    null,
    () => makeInitialState(enemyKey, earnedCardIds),
  );

  const canEndTurn = state.phase === "player-turn" && state.outcome === null;
  const handCards = useMemo(
    () =>
      state.hand.map((c) => CATALOG.find((cc) => cc.id === c.id)).filter((c): c is Card => Boolean(c)),
    [state.hand],
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-sharp border border-surface-elevated bg-surface-elevated/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-text-muted">第 {state.turn} 回合</p>
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

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Bar label="油錶" current={state.player.fuel} max={state.player.fuelMax} color="bg-accent-amber" />
        <Bar label="精神" current={state.player.mind} max={state.player.mindMax} color="bg-accent-neon" />
        <div className="flex items-center justify-between rounded-sharp border border-surface-elevated bg-surface-elevated/60 px-4 py-3">
          <span className="text-xs tracking-widest text-text-muted">神識</span>
          <span className="font-mono text-lg">{state.player.energy} / {state.player.energyMax}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-xs tracking-widest text-text-muted">
          手牌 {state.hand.length} · 牌庫 {state.deck.length} · 棄牌 {state.discard.length}
        </p>
        <div className="flex flex-wrap gap-3">
          {handCards.map((card) => {
            const tooCostly = card.cost > state.player.energy;
            const disabled = tooCostly || state.phase !== "player-turn" || state.outcome !== null;
            return (
              <CardArt
                key={card.id}
                card={card}
                disabled={disabled}
                onClick={() => dispatch({ type: "play-card", cardId: card.id })}
              />
            );
          })}
        </div>
      </section>

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
