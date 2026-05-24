"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CardArt } from "@/components/cards/CardArt";
import { CATALOG, getStartingDeck, type Card } from "@/lib/cards/catalog";
import { loadEarnedCardIds, resetEarnedCards } from "@/lib/run/deck-storage";

const CARDS_BY_ID = new Map<string, Card>(CATALOG.map((c) => [c.id, c]));

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
    .map((id) => CARDS_BY_ID.get(id))
    .filter((c): c is Card => Boolean(c));

  const starter = getStartingDeck();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-surface-night px-6 py-8 text-text-primary">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] text-text-muted uppercase">老黃的牌組</p>
          <h1 className="text-2xl font-semibold tracking-tight">目前牌組</h1>
        </div>
        <Link href="/" className="text-xs tracking-widest text-text-secondary underline-offset-4 hover:underline">
          ← 回到車行
        </Link>
      </header>

      {loading ? (
        <p className="text-text-muted">讀取中…</p>
      ) : (
        <>
          <DeckSection
            title={`本局戰利品（${earnedCards.length} 張）`}
            cards={earnedCards}
            empty="尚未拿到新卡。打贏一場就會出現。"
          />
          <DeckSection title={`起始牌組（${starter.length} 張）`} cards={starter} />
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

function DeckSection({ title, cards, empty }: { title: string; cards: Card[]; empty?: string }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs tracking-widest text-text-muted">{title}</p>
      {cards.length === 0 && empty ? (
        <p className="text-sm text-text-muted">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {cards.map((card, idx) => (
            <CardArt key={`${card.id}-${idx}`} card={card} variant="deck" />
          ))}
        </div>
      )}
    </section>
  );
}
