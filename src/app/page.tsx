import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-surface-night px-8 py-16 text-text-primary">
      <header className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs tracking-[0.4em] text-text-muted uppercase">
          Taipei · 23:00 — 05:00
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          台灣怪奇夜行錄
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-text-secondary">
          老黃今晚開夜班，無線電裡有人在叫車。
          <br />
          上車的客人，不見得是人。
        </p>
      </header>

      <nav className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/play"
          className="flex h-12 min-w-[160px] items-center justify-center rounded-sharp border border-accent-blood/60 bg-accent-blood/10 px-6 text-sm font-medium tracking-widest text-text-primary transition hover:bg-accent-blood/25 hover:shadow-glow-blood"
        >
          開始夜班
        </Link>
        <Link
          href="/codex"
          className="flex h-12 min-w-[160px] items-center justify-center rounded-sharp border border-surface-elevated bg-surface-elevated px-6 text-sm font-medium tracking-widest text-text-secondary transition hover:text-text-primary"
        >
          車行紀事
        </Link>
      </nav>

      <footer className="text-[10px] text-text-muted">
        MVP · Friend Playtest Build
      </footer>
    </main>
  );
}
