"use client";

import { useMemo, useReducer, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { combatReducer } from "@/lib/combat/engine";
import { ENEMY_TEMPLATES, getEnemy } from "@/lib/combat/enemies";
import { STARTER_DECK } from "@/lib/combat/starter-deck";
import { pickTwoRewards } from "@/lib/combat/reward-pool";
import { addEarnedCard } from "@/lib/run/deck-storage";
import type { CombatCard, CombatState, EnemyBehavior } from "@/lib/combat/types";

type EnemyKey = keyof typeof ENEMY_TEMPLATES;

function resolveEnemyFromQuery(param: string | null, fallback: EnemyKey): EnemyKey {
  if (!param) return fallback;
  if (param in ENEMY_TEMPLATES) return param as EnemyKey;
  // 別名：方便用行為名指定
  const aliasToKey: Record<string, EnemyKey> = {
    charging: "silentPassenger",
    cursing: "whisperingChild",
    dialoguing: "drunkSalaryman",
  };
  return aliasToKey[param] ?? fallback;
}

type InitOptions = { stress?: boolean };

function makeInitialState(enemyKey: EnemyKey, options: InitOptions = {}): CombatState {
  // 直接呼叫 reducer 完成首回合抽牌＋能量，避免在 useEffect 觸發、躲過 Strict Mode 雙呼叫
  const baseEnemy = getEnemy(enemyKey);
  const enemy = options.stress ? { ...baseEnemy, hp: 2, maxHp: 2 } : baseEnemy;
  const seed: CombatState = {
    player: { fuel: 100, fuelMax: 100, mind: 50, mindMax: 50, energy: 0, energyMax: 3 },
    enemy,
    deck: shuffleDeck(STARTER_DECK),
    hand: [],
    discard: [],
    turn: 0,
    phase: "player-turn",
    outcome: null,
  };
  return combatReducer(seed, { type: "start-combat" });
}

function shuffleDeck(deck: CombatCard[]): CombatCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

const BEHAVIOR_LABEL: Record<EnemyBehavior, string> = {
  charging: "衝撞",
  cursing: "詛咒",
  dialoguing: "對話",
};

const OUTCOME_LABEL: Record<NonNullable<CombatState["outcome"]>, string> = {
  victory: "今晚活著回家了。",
  subdued: "你勸住了他。送下車時，他向你深深一鞠躬。",
  breakdown: "油錶見底，車子拋錨在山道。",
  vanished: "你看著後照鏡，認不出鏡中的自己。",
};

type Props = {
  initialEnemy?: EnemyKey;
};

export default function CombatScreen({ initialEnemy = "silentPassenger" }: Props) {
  const params = useSearchParams();
  const queriedEnemy = resolveEnemyFromQuery(params.get("enemy"), initialEnemy);
  const stress = params.get("stress") === "true";
  const [enemyKey, setEnemyKey] = useState<EnemyKey>(queriedEnemy);
  const [state, dispatch] = useReducer(
    combatReducer,
    null,
    () => makeInitialState(queriedEnemy, { stress }),
  );

  const canEndTurn = state.phase === "player-turn" && state.outcome === null;
  const fuelPct = useMemo(() => (state.player.fuel / state.player.fuelMax) * 100, [state.player.fuel, state.player.fuelMax]);
  const mindPct = useMemo(() => (state.player.mind / state.player.mindMax) * 100, [state.player.mind, state.player.mindMax]);
  const enemyPct = useMemo(() => (state.enemy.hp / state.enemy.maxHp) * 100, [state.enemy.hp, state.enemy.maxHp]);

  function restart(nextEnemyKey: EnemyKey) {
    // 帶上 query 讓刷新後也會用同一個敵人
    const url = new URL(window.location.href);
    url.searchParams.set("enemy", nextEnemyKey);
    window.location.href = url.toString();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-surface-night px-6 py-8 text-text-primary">
      {/* 敵人 */}
      <section className="rounded-sharp border border-surface-elevated bg-surface-elevated/60 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-text-muted">
              夜班 · 第 {state.turn} 回合 · 行為：{BEHAVIOR_LABEL[state.enemy.behavior]}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{state.enemy.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">HP</p>
            <p className="text-2xl font-mono">{state.enemy.hp} / {state.enemy.maxHp}</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-surface-sunken">
          <div className="h-full bg-accent-blood transition-all" style={{ width: `${enemyPct}%` }} />
        </div>
      </section>

      {/* 結局畫面 */}
      {state.outcome ? (
        <section className="flex flex-col items-center gap-4 rounded-sharp border border-accent-blood/60 bg-surface-elevated p-10 text-center">
          <p className="text-xs tracking-[0.4em] text-text-muted uppercase">夜班結束</p>
          <p className="max-w-md text-lg leading-relaxed">{OUTCOME_LABEL[state.outcome]}</p>

          {/* 勝利或收服 → 給獎勵 */}
          {state.outcome === "victory" || state.outcome === "subdued" ? (
            <RewardSelection />
          ) : null}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {(Object.keys(ENEMY_TEMPLATES) as EnemyKey[]).map((k) => (
              <button
                key={k}
                onClick={() => restart(k)}
                className="rounded-sharp border border-accent-blood/40 bg-accent-blood/10 px-4 py-2 text-sm tracking-wider transition hover:bg-accent-blood/25"
              >
                再來一晚 · {ENEMY_TEMPLATES[k].name}
              </button>
            ))}
          </div>
          <Link
            href="/deck"
            className="mt-2 text-xs tracking-widest text-text-secondary underline-offset-4 hover:underline"
          >
            查看目前牌組 →
          </Link>
        </section>
      ) : null}

      {/* 玩家資源條 */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ResourceBar label="油錶（FUEL）" current={state.player.fuel} max={state.player.fuelMax} pct={fuelPct} color="bg-accent-amber" />
        <ResourceBar label="精神（MIND）" current={state.player.mind} max={state.player.mindMax} pct={mindPct} color="bg-accent-neon" />
        <div className="flex items-center justify-between rounded-sharp border border-surface-elevated bg-surface-elevated/60 px-4 py-3">
          <span className="text-xs tracking-widest text-text-muted">神識（ENERGY）</span>
          <span className="font-mono text-xl">{state.player.energy} / {state.player.energyMax}</span>
        </div>
      </section>

      {/* 手牌 */}
      <section className="flex flex-1 flex-col gap-3">
        <p className="text-xs tracking-widest text-text-muted">手牌（{state.hand.length}） · 牌庫 {state.deck.length} · 棄牌 {state.discard.length}</p>
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

      {/* 結束回合 */}
      <section className="flex items-center justify-end gap-3">
        <button
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "end-turn" })}
          className="rounded-sharp border border-accent-blood/60 bg-accent-blood/10 px-6 py-3 text-sm tracking-widest transition hover:bg-accent-blood/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          結束回合 →
        </button>
      </section>
    </div>
  );
}

function RewardSelection() {
  const [rewards] = useState(() => pickTwoRewards());
  const [picked, setPicked] = useState<{ id: string | null; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(cardId: string | null, label: string) {
    if (picked || saving) return;
    setSaving(true);
    try {
      if (cardId) await addEarnedCard(cardId);
      setPicked({ id: cardId, label });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (picked) {
    return (
      <div className="mt-2 rounded-sharp border border-accent-jade/40 bg-accent-jade/5 px-4 py-3 text-sm">
        已選擇：<span className="text-accent-jade">{picked.label}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 w-full max-w-2xl">
      <p className="text-xs tracking-[0.3em] text-text-muted uppercase">節點獎勵 · 三選一</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {rewards.map((card) => (
          <button
            key={card.id}
            disabled={saving}
            onClick={() => choose(card.id, card.name)}
            className={`flex w-44 flex-col gap-2 rounded-sharp border bg-surface-elevated p-3 text-left transition ${SCHOOL_COLOR[card.school]} hover:-translate-y-1 hover:shadow-card disabled:opacity-50`}
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
        ))}
        <button
          disabled={saving}
          onClick={() => choose(null, "跳過獎勵（已記為本節點結算）")}
          className="flex w-44 flex-col items-center justify-center gap-1 rounded-sharp border border-dashed border-text-muted px-3 py-4 text-sm text-text-muted hover:text-text-secondary disabled:opacity-50"
        >
          <span className="tracking-widest text-[10px] uppercase">略過</span>
          <span>不拿這張牌</span>
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-text-danger">儲存失敗：{error}</p> : null}
    </div>
  );
}

function ResourceBar({
  label,
  current,
  max,
  pct,
  color,
}: {
  label: string;
  current: number;
  max: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="rounded-sharp border border-surface-elevated bg-surface-elevated/60 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest text-text-muted">{label}</span>
        <span className="font-mono text-sm">{current} / {max}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-sunken">
        <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function renderEffect(e: CombatCard["effects"][number]): string {
  switch (e.type) {
    case "damage":
      return `造成 ${e.amount} 傷害`;
    case "heal-fuel":
      return `補油 +${e.amount}`;
    case "heal-mind":
      return `回神 +${e.amount}`;
    case "subdue":
      return `話術收服 lv${e.threshold}`;
  }
}
