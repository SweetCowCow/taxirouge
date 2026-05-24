"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { STARTER_DECK } from "@/lib/combat/starter-deck";
import { REWARD_POOL } from "@/lib/combat/reward-pool";
import { loadEarnedCardIds, resetEarnedCards } from "@/lib/run/deck-storage";
import type { CombatCard } from "@/lib/combat/types";

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

const ALL_CARDS_BY_ID = new Map<string, CombatCard>(
  [...STARTER_DECK, ...REWARD_POOL].map((c) => [c.id, c]),
);

export default function DeckPage() {
  const [earnedIds, setEarnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnedCardIds().then((ids) => {
      setEarnedIds(ids);
      setLoading(false);
    });
  }, []);

  const earnedCards = earnedIds
    .map((id) => ALL_CARDS_BY_ID.get(id))
    .filter((c): c is CombatCard => Boolean(c));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-surface-night px-6 py-8 text-text-primary">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] text-text-muted uppercase">老黃的牌組</p>
          <h1 className="text-2xl font-semibold tracking-tight">目前牌組</h1>
        </div>
        <Link
          href="/"
          className="text-xs tracking-widest text-text-secondary underline-offset-4 hover:underline"
        >
          ← 回到車行
        </Link>
      </header>

      {loading ? (
        <p className="text-text-muted">讀取中…</p>
      ) : (
        <>
          <DeckGrid title={`本局戰利品（${earnedCards.length} 張）`} cards={earnedCards} empty="尚未拿到新卡。打贏一場就會出現。" />
          <DeckGrid title={`起始牌組（${STARTER_DECK.length} 張）`} cards={STARTER_DECK} />
          <div className="pt-4">
            <button
              onClick={async () => {
                await resetEarnedCards();
                setEarnedIds([]);
              }}
              className="rounded-sharp border border-text-muted/40 px-3 py-2 text-xs tracking-widest text-text-muted hover:text-text-secondary"
            >
              清除本局戰利品
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function DeckGrid({ title, cards, empty }: { title: string; cards: CombatCard[]; empty?: string }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs tracking-widest text-text-muted">{title}</p>
      {cards.length === 0 && empty ? (
        <p className="text-sm text-text-muted">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {cards.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              className={`flex w-44 flex-col gap-2 rounded-sharp border bg-surface-elevated p-3 text-left ${SCHOOL_COLOR[card.school]}`}
            >
              <div className="flex items-center justify-between text-[10px] tracking-widest opacity-70">
                <span>{SCHOOL_LABEL[card.school]}</span>
                <span>COST {card.cost}</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{card.name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
