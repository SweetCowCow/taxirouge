"use client";

import { useState } from "react";

import type { Card } from "@/lib/cards/catalog";

type Variant = "hand" | "deck" | "reward";

const SCHOOL_LABEL: Record<Card["school"], string> = {
  vehicle: "車技",
  gear: "行頭",
  route: "路況",
  dialogue: "話術",
};

const SCHOOL_BORDER: Record<Card["school"], string> = {
  vehicle: "border-school-vehicle",
  gear: "border-school-gear",
  route: "border-school-road",
  dialogue: "border-school-talk",
};

const SCHOOL_BG: Record<Card["school"], string> = {
  vehicle: "bg-school-vehicle/15",
  gear: "bg-school-gear/15",
  route: "bg-school-road/15",
  dialogue: "bg-school-talk/15",
};

type Props = {
  card: Card;
  variant?: Variant;
  disabled?: boolean;
  onClick?: () => void;
};

function renderEffect(e: Card["effects"][number]): string {
  switch (e.type) {
    case "damage": return `造成 ${e.amount} 傷害`;
    case "heal-fuel": return `補油 +${e.amount}`;
    case "heal-mind": return `回神 +${e.amount}`;
    case "subdue": return `話術收服 lv${e.threshold}`;
  }
}

/**
 * Card 視覺：上半是場景插圖（artPath 載入失敗自動 fallback 到色塊 + 大名稱）；
 * 下半是名稱 / 學派 / cost / 效果列表。
 */
export function CardArt({ card, variant = "hand", disabled, onClick }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const interactive = Boolean(onClick) && !disabled;
  const Wrap = onClick ? "button" : "div";

  return (
    <Wrap
      onClick={onClick}
      disabled={disabled}
      className={[
        "group relative flex w-44 flex-col overflow-hidden rounded-sharp border bg-surface-elevated text-left transition",
        SCHOOL_BORDER[card.school],
        disabled && "opacity-40 cursor-not-allowed",
        interactive && "hover:-translate-y-1 hover:shadow-card",
      ].filter(Boolean).join(" ")}
    >
      <div className={`relative aspect-[4/3] w-full overflow-hidden border-b border-current/30 ${SCHOOL_BG[card.school]}`}>
        {imgFailed ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
            <span className="text-[10px] tracking-widest text-text-muted">
              {SCHOOL_LABEL[card.school]}
            </span>
            <span className="mt-1 text-base font-semibold leading-tight text-text-primary">
              {card.name}
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.artPath}
            alt={card.name}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-pill bg-surface-night/80 font-mono text-xs">
          {card.cost}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center justify-between text-[10px] tracking-widest opacity-70">
          <span className={`${SCHOOL_BORDER[card.school].replace("border-", "text-")}`}>{SCHOOL_LABEL[card.school]}</span>
          {variant === "hand" ? null : <span className="text-text-muted">COST {card.cost}</span>}
        </div>
        <p className="text-sm font-medium leading-tight text-text-primary">{card.name}</p>
        <ul className="space-y-0.5 text-[11px] text-text-secondary">
          {card.effects.map((e, i) => (
            <li key={i}>{renderEffect(e)}</li>
          ))}
        </ul>
      </div>
    </Wrap>
  );
}
