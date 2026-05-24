"use client";

import dynamic from "next/dynamic";

// CombatScreen 在 init 階段做隨機洗牌，無法在 server / client 對齊；故跳過 SSR。
const CombatScreen = dynamic(() => import("@/components/combat/CombatScreen"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-surface-night text-text-muted">
      <p className="text-xs tracking-widest">夜班載入中…</p>
    </main>
  ),
});

export default function PlayPage() {
  return <CombatScreen initialEnemy="silentPassenger" />;
}
