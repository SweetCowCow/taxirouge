"use client";

import { useMemo, useState } from "react";

import {
  BOSS_EVENTS,
  NARRATIVE_EVENTS,
  findEventById,
  pickRandomBossEvent,
  pickRandomNarrativeEvent,
  type EventChoice,
} from "@/lib/events/pool";
import type { ResourceDelta } from "@/lib/run/types";

type Props = {
  eventId?: string;
  pool?: "narrative" | "boss";
  onResolve: (args: { outcome: "ok" | "to-combat"; delta?: ResourceDelta; rewardCardId?: string }) => void;
  onReport: (context: { eventId: string; choiceLabel?: string }) => void;
};

export default function EventView({ eventId, pool = "narrative", onResolve, onReport }: Props) {
  const event = useMemo(() => {
    if (eventId) {
      const found = findEventById(eventId);
      if (found) return found;
    }
    return pool === "boss" ? pickRandomBossEvent() : pickRandomNarrativeEvent();
  }, [eventId, pool]);

  const [picked, setPicked] = useState<EventChoice | null>(null);

  return (
    <article className="flex flex-col gap-5 rounded-sharp border border-surface-elevated bg-surface-elevated/60 p-6">
      <header>
        <p className="text-xs tracking-[0.4em] text-text-muted uppercase">敘事節點</p>
        <h2 className="mt-1 text-2xl font-semibold">{event.title}</h2>
      </header>
      <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{event.opening}</p>

      {picked ? (
        <div className="flex flex-col gap-4">
          {picked.resolutionText ? (
            <p className="rounded-sharp border-l-2 border-accent-neon bg-surface-sunken px-4 py-3 text-sm leading-relaxed text-text-primary">
              {picked.resolutionText}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onResolve({ outcome: picked.outcome, delta: picked.delta, rewardCardId: picked.rewardCardId })}
              className="rounded-sharp border border-accent-blood/60 bg-accent-blood/15 px-5 py-2 text-sm tracking-widest hover:bg-accent-blood/30"
            >
              {picked.outcome === "to-combat" ? "進入戰鬥 →" : "繼續夜班 →"}
            </button>
            <button
              onClick={() => onReport({ eventId: event.id, choiceLabel: picked.label })}
              className="rounded-sharp border border-text-muted/40 px-4 py-2 text-xs tracking-widest text-text-muted hover:text-text-secondary"
            >
              我有話想說
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {event.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => setPicked(c)}
              className="rounded-sharp border border-surface-elevated bg-surface-sunken px-4 py-3 text-left text-sm transition hover:border-accent-blood/60 hover:text-text-primary"
            >
              <span className="mr-2 text-text-muted">{i + 1}.</span>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
