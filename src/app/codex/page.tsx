"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listCodex, type CodexEntry, type EndingType } from "@/lib/storage/save-state";

const ENDING_LABEL: Record<EndingType, string> = {
  cleared: "今晚活著回家了",
  breakdown: "失蹤",
  vanished: "瘋了",
};

const ENDING_COLOR: Record<EndingType, string> = {
  cleared: "border-accent-jade/50 text-accent-jade",
  breakdown: "border-accent-amber/50 text-accent-amber",
  vanished: "border-accent-neon/50 text-accent-neon",
};

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CodexPage() {
  const [entries, setEntries] = useState<CodexEntry[] | null>(null);

  useEffect(() => {
    listCodex().then(setEntries).catch((e) => {
      console.warn("[codex] load failed:", e);
      setEntries([]);
    });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-surface-night px-6 py-10 text-text-primary">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] text-text-muted uppercase">老黃的車行紀事</p>
          <h1 className="text-3xl font-semibold tracking-tight">車行紀事</h1>
        </div>
        <Link href="/" className="text-xs tracking-widest text-text-secondary underline-offset-4 hover:underline">
          ← 回車行
        </Link>
      </header>

      {entries === null ? (
        <p className="text-text-muted">讀取中…</p>
      ) : entries.length === 0 ? (
        <p className="max-w-sm text-sm leading-relaxed text-text-muted">
          還沒有任何紀錄。完成一趟夜班後，這裡會留下今晚發生過的事。
        </p>
      ) : (
        <ol className="flex flex-col gap-5">
          {entries.map((entry) => {
            const ending = (entry.endingType ?? "cleared") as EndingType;
            return (
              <li
                key={entry.id ?? entry.timestamp}
                className={`flex flex-col gap-2 rounded-sharp border-l-2 bg-surface-elevated px-5 py-4 ${ENDING_COLOR[ending]}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="tracking-widest">{ENDING_LABEL[ending]}</span>
                  <time className="font-mono text-text-muted">{formatTimestamp(entry.timestamp)}</time>
                </div>
                <p className="text-sm leading-loose text-text-primary">{entry.endingText}</p>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
