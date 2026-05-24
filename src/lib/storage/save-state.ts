// High-level save API。Game logic 只該透過這層存取資料，不該 import indexed-db.ts。
// Shape 對齊 design.md：RunState + CodexEntry 為當前 design 約定的最小欄位，
// 後續 task（run-flow、card-combat）會擴充欄位，這層保持 Pass-through。

import {
  appendCodexRecord,
  clearRun,
  getRun,
  listCodexRecords,
  putRun,
  StorageUnavailableError,
} from "./indexed-db";

export type EndingType = "cleared" | "breakdown" | "vanished";

export type RunState = {
  runId: string;
  startedAt: number;
  currentTime: string;
  currentNodeIndex: number;
  resources: { fuel: number; mind: number };
} & Record<string, unknown>;

export type CodexEntry = {
  id?: number;
  endingType: EndingType;
  endingText: string;
  timestamp: number;
} & Record<string, unknown>;

export async function loadRun(): Promise<RunState | null> {
  return getRun<RunState>();
}

export async function saveRun(state: RunState): Promise<void> {
  await putRun(state);
}

export async function deleteRun(): Promise<void> {
  await clearRun();
}

export async function appendCodex(entry: CodexEntry): Promise<void> {
  await appendCodexRecord(entry);
}

export async function listCodex(): Promise<CodexEntry[]> {
  const all = await listCodexRecords<CodexEntry>();
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export { StorageUnavailableError };
