// 玩家自選卡片的持久化。B 階段沒有完整 RunState（task 3.1 才補），
// 先用 IndexedDB 直接存「目前已賺到的卡 id 清單」與 starter deck 合併。

import { loadRun, saveRun, type RunState } from "@/lib/storage/save-state";

const DEFAULT_RUN_ID = "current";

type DeckRunState = RunState & {
  earnedCardIds: string[];
};

function makeEmptyRun(): DeckRunState {
  return {
    runId: DEFAULT_RUN_ID,
    startedAt: Date.now(),
    currentTime: "23:00",
    currentNodeIndex: 0,
    resources: { fuel: 100, mind: 50 },
    earnedCardIds: [],
  };
}

export async function loadEarnedCardIds(): Promise<string[]> {
  const run = (await loadRun()) as DeckRunState | null;
  return run?.earnedCardIds ?? [];
}

export async function addEarnedCard(cardId: string): Promise<void> {
  const existing = ((await loadRun()) as DeckRunState | null) ?? makeEmptyRun();
  const next: DeckRunState = {
    ...existing,
    earnedCardIds: [...(existing.earnedCardIds ?? []), cardId],
  };
  await saveRun(next);
}

export async function resetEarnedCards(): Promise<void> {
  await saveRun(makeEmptyRun());
}
