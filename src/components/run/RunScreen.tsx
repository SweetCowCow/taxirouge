"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useState } from "react";

import { CardArt } from "@/components/cards/CardArt";
import CombatView, { type CombatEnemyKey } from "@/components/combat/CombatView";
import EventView from "@/components/run/EventView";
import { NodeMap } from "@/components/run/NodeMap";
import { TimeAxis } from "@/components/run/TimeAxis";
import { getRewardPool, type Card } from "@/lib/cards/catalog";
import { addEarnedCard } from "@/lib/run/deck-storage";
import { pickEndingText } from "@/lib/run/ending-text";
import { generateRunMap } from "@/lib/run/map-generator";
import { makeInitialRun, runReducer } from "@/lib/run/state-machine";
import type { CombatOutcome, RunModel } from "@/lib/run/types";
import { appendCodex, loadRun, saveRun, type CodexEntry, type EndingType, type RunState } from "@/lib/storage/save-state";

type Stored = RunState & RunModel;

function newRun(): RunModel {
  const id = `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return makeInitialRun(id, generateRunMap());
}

async function trySaveRun(model: RunModel): Promise<void> {
  try {
    const flat: Stored = {
      ...model,
      currentNodeIndex: model.currentNodeIndex,
      currentTime: model.currentTime,
      resources: model.resources,
      runId: model.runId,
      startedAt: model.startedAt,
    };
    await saveRun(flat);
  } catch (e) {
    console.warn("[run] saveRun failed:", e);
  }
}

function pickTwoRewards(): Card[] {
  const pool = [...getRewardPool()];
  const out: Card[] = [];
  for (let i = 0; i < 2 && pool.length > 0; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(idx, 1);
    if (card) out.push(card);
  }
  return out;
}

export default function RunScreen() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [state, dispatch] = useReducer(runReducer, undefined, () => newRun());
  const [reportSent, setReportSent] = useState<string | null>(null);
  const [pendingReward, setPendingReward] = useState<{ outcome: CombatOutcome; rewards: Card[] } | null>(null);

  // boot：嘗試恢復；失敗則維持新局
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = (await loadRun()) as Stored | null;
        if (
          !cancelled &&
          stored &&
          Array.isArray((stored as RunModel).nodes) &&
          stored.nodes.length > 0 &&
          stored.phase !== "ending"
        ) {
          // 完整恢復：若中途進到 in-event / in-combat，退回 at-node 重新進入該節點（spec: 中斷不汙染狀態）
          const safePhase =
            stored.phase === "in-event" || stored.phase === "in-combat"
              ? "at-node"
              : stored.phase;
          dispatch({ type: "replace-state", snapshot: { ...stored, phase: safePhase } });
        }
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 自動 transition：idle / driving → 下一步
  useEffect(() => {
    if (!bootstrapped) return;
    if (state.phase === "idle") {
      dispatch({ type: "depart" });
    } else if (state.phase === "driving") {
      // 加一點延遲讓玩家看到「行進中」氣氛
      const t = setTimeout(() => dispatch({ type: "arrive-node" }), 350);
      return () => clearTimeout(t);
    }
  }, [state.phase, bootstrapped]);

  // 任何狀態變化都持久化（task 3.5 resume 要求每節點都存）
  useEffect(() => {
    if (!bootstrapped) return;
    trySaveRun(state);
  }, [state, bootstrapped]);

  // 寫 codex when run ends
  useEffect(() => {
    if (state.phase !== "ending" || !state.endingType) return;
    const text = pickEndingText(state.endingType);
    const entry: CodexEntry = {
      endingType: state.endingType as EndingType,
      endingText: text,
      timestamp: Date.now(),
      runId: state.runId,
      nodesCompleted: state.currentNodeIndex,
    };
    appendCodex(entry).catch((e) => console.warn("[run] appendCodex failed:", e));
    trySaveRun(state);
  }, [state.phase]);

  const currentNode = state.nodes[state.currentNodeIndex];
  const isMixedSecondHalf = currentNode?.type === "passenger-mixed" && state.phase === "in-combat";

  function handleCombatResolve(outcome: CombatOutcome) {
    if (outcome === "victory" || outcome === "subdued") {
      setPendingReward({ outcome, rewards: pickTwoRewards() });
    } else {
      dispatch({ type: "resolve-combat", outcome });
    }
  }

  async function handleClaimReward(card: Card | null) {
    if (!pendingReward) return;
    if (card) {
      try {
        await addEarnedCard(card.id);
      } catch (e) {
        console.warn("[run] addEarnedCard failed:", e);
      }
    }
    dispatch({ type: "resolve-combat", outcome: pendingReward.outcome, earnedCardId: card?.id });
    setPendingReward(null);
  }

  function handleEventResolve(args: { outcome: "ok" | "to-combat"; delta?: import("@/lib/run/types").ResourceDelta; rewardCardId?: string }) {
    dispatch({ type: "resolve-event", outcome: args.outcome, delta: args.delta, rewardCardId: args.rewardCardId });
  }

  function handleContinue() {
    dispatch({ type: "continue" });
  }

  function handleReport(context: object) {
    const payload = {
      kind: "player-report",
      runId: state.runId,
      phase: state.phase,
      currentTime: state.currentTime,
      currentNodeIndex: state.currentNodeIndex,
      timestamp: Date.now(),
      ...context,
    };
    console.log("[player-report]", payload);
    setReportSent("已收到。我們會看的。");
    setTimeout(() => setReportSent(null), 2500);
  }

  if (!bootstrapped) {
    return <div className="flex min-h-screen items-center justify-center bg-surface-night text-text-muted">夜班載入中…</div>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-surface-night px-6 py-6 text-text-primary">
      {/* Top bar：time + 節點地圖 */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-elevated pb-3">
        <TimeAxis current={state.currentTime} />
        <div className="text-xs tracking-widest text-text-muted">
          老黃 · Fuel {state.resources.fuel} · Mind {state.resources.mind}
        </div>
      </header>

      <NodeMap nodes={state.nodes} currentIndex={state.currentNodeIndex} />

      {/* 主畫面切換 */}
      {state.phase === "driving" ? (
        <PhaseCard label="夜班行進中">
          <p className="text-text-secondary">街燈一盞一盞滑過車窗。下一段路有人在叫車。</p>
        </PhaseCard>
      ) : null}

      {state.phase === "at-node" ? (
        <PhaseCard label={`抵達節點 ${state.currentNodeIndex + 1} / ${state.nodes.length}`}>
          <p className="text-text-secondary">
            {currentNode ? describeNode(currentNode.type) : ""}
          </p>
          <button
            onClick={() => dispatch({ type: "enter-node" })}
            className="rounded-sharp border border-accent-blood/60 bg-accent-blood/15 px-5 py-2 text-sm tracking-widest hover:bg-accent-blood/30"
          >
            進入 →
          </button>
        </PhaseCard>
      ) : null}

      {state.phase === "in-event" ? (
        <EventView
          eventId={currentNode?.eventId}
          pool={currentNode?.type === "boss" ? "boss" : "narrative"}
          onResolve={handleEventResolve}
          onReport={handleReport}
        />
      ) : null}

      {state.phase === "in-combat" && currentNode ? (
        pendingReward ? (
          <RewardChoice
            outcome={pendingReward.outcome}
            rewards={pendingReward.rewards}
            onPick={handleClaimReward}
          />
        ) : (
          <CombatView
            enemyKey={(currentNode.enemyKey ?? "silentPassenger") as CombatEnemyKey}
            earnedCardIds={state.earnedCardIds}
            onResolve={handleCombatResolve}
          />
        )
      ) : null}

      {state.phase === "node-result" ? (
        <PhaseCard label="節點結算">
          <p className="text-text-secondary">
            目前資源：油錶 {state.resources.fuel} / 100 · 精神 {state.resources.mind} / 50
          </p>
          {state.pendingRewardCardId ? (
            <p className="text-sm text-accent-jade">取得新卡：{state.pendingRewardCardId}</p>
          ) : null}
          <button
            onClick={handleContinue}
            className="self-start rounded-sharp border border-accent-blood/60 bg-accent-blood/15 px-5 py-2 text-sm tracking-widest hover:bg-accent-blood/30"
          >
            繼續 →
          </button>
        </PhaseCard>
      ) : null}

      {state.phase === "ending" && state.endingType ? (
        <EndingScreen ending={state.endingType} runId={state.runId} onReport={handleReport} />
      ) : null}

      {reportSent ? (
        <div className="fixed bottom-6 right-6 rounded-sharp border border-accent-jade/60 bg-surface-elevated px-4 py-2 text-sm text-accent-jade shadow-card">
          {reportSent}
        </div>
      ) : null}

      {/* 防呆：mixed 節點戰鬥中時提示 */}
      {isMixedSecondHalf ? null : null}
    </main>
  );
}

function RewardChoice({
  outcome,
  rewards,
  onPick,
}: {
  outcome: CombatOutcome;
  rewards: Card[];
  onPick: (card: Card | null) => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-sharp border border-accent-jade/40 bg-surface-elevated/60 p-6">
      <header>
        <p className="text-xs tracking-[0.4em] text-text-muted uppercase">節點獎勵 · 三選一</p>
        <p className="mt-1 text-sm text-text-secondary">
          {outcome === "subdued" ? "你勸住了他，他向你深深一鞠躬，遞給你一張卡。" : "戰利品。挑一張收進牌組，或略過繼續上路。"}
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {rewards.map((card) => (
          <CardArt key={card.id} card={card} variant="reward" onClick={() => onPick(card)} />
        ))}
        <button
          onClick={() => onPick(null)}
          className="flex h-[calc(11rem+2.5rem)] w-44 flex-col items-center justify-center gap-1 rounded-sharp border border-dashed border-text-muted px-3 py-4 text-sm text-text-muted hover:text-text-secondary"
        >
          <span className="tracking-widest text-[10px] uppercase">略過</span>
          <span>不拿這張牌</span>
        </button>
      </div>
    </section>
  );
}

function PhaseCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-sharp border border-surface-elevated bg-surface-elevated/60 p-5">
      <p className="text-xs tracking-[0.4em] text-text-muted uppercase">{label}</p>
      {children}
    </section>
  );
}

function describeNode(type: string): string {
  switch (type) {
    case "passenger-narrative": return "有人在路邊揮手。看起來像是要說話。";
    case "passenger-combat": return "車門被拍了一下。後座坐進來的人，呼吸聲不太對。";
    case "passenger-mixed": return "一個熟客。一開始很正常，但越聊越不對勁。";
    case "gas-station": return "深夜的加油站。順便修整一下行頭。";
    case "boss": return "凌晨四點半。最後一單。地址你從來沒去過。";
    default: return "前方有狀況。";
  }
}

function EndingScreen({ ending, runId, onReport }: { ending: EndingType; runId: string; onReport: (c: object) => void }) {
  const [text] = useState(() => pickEndingText(ending));
  const titles: Record<EndingType, string> = { cleared: "今晚活著回家了", breakdown: "失蹤", vanished: "瘋了" };
  return (
    <section className="flex flex-col items-center gap-5 rounded-sharp border border-accent-blood/60 bg-surface-elevated p-10 text-center">
      <p className="text-xs tracking-[0.4em] text-text-muted uppercase">夜班結束</p>
      <h2 className="text-2xl font-semibold tracking-tight">{titles[ending]}</h2>
      <p className="max-w-xl text-base leading-loose text-text-secondary">{text}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-sharp border border-accent-blood/60 bg-accent-blood/15 px-5 py-2 text-sm tracking-widest hover:bg-accent-blood/30"
        >
          回車行 · 開新局
        </Link>
        <Link
          href="/codex"
          className="rounded-sharp border border-surface-elevated px-4 py-2 text-xs tracking-widest text-text-secondary hover:text-text-primary"
        >
          看車行紀事
        </Link>
        <button
          onClick={() => onReport({ endingType: ending, runId })}
          className="rounded-sharp border border-text-muted/40 px-4 py-2 text-xs tracking-widest text-text-muted hover:text-text-secondary"
        >
          我有話想說
        </button>
      </div>
    </section>
  );
}
