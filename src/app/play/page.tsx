import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-night px-8 py-16 text-text-primary">
      <h1 className="text-3xl font-semibold tracking-tight">夜班待命中</h1>
      <p className="text-sm text-text-muted">
        （戰鬥與節點系統將於 Task 2 起逐步上線）
      </p>
      <Link
        href="/"
        className="text-xs tracking-widest text-text-secondary underline-offset-4 hover:underline"
      >
        ← 回到車行
      </Link>
    </main>
  );
}
