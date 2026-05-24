"use client";

import dynamic from "next/dynamic";

const RunScreen = dynamic(() => import("@/components/run/RunScreen"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-surface-night text-text-muted">
      <p className="text-xs tracking-widest">夜班載入中…</p>
    </main>
  ),
});

export default function PlayPage() {
  return <RunScreen />;
}
