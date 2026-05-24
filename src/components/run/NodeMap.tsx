// 簡易節點地圖：水平排列，目前節點高亮，已完成節點打勾。

import type { NodeType, RunNode } from "@/lib/run/types";

const TYPE_LABEL: Record<NodeType, string> = {
  "passenger-narrative": "怪客",
  "passenger-combat": "惡客",
  "passenger-mixed": "熟客",
  "gas-station": "加油",
  boss: "王戰",
};

const TYPE_ICON: Record<NodeType, string> = {
  "passenger-narrative": "❓",
  "passenger-combat": "⚠️",
  "passenger-mixed": "✦",
  "gas-station": "⛽",
  boss: "☠",
};

type Props = {
  nodes: RunNode[];
  currentIndex: number;
};

export function NodeMap({ nodes, currentIndex }: Props) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {nodes.map((node, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={i} className="flex items-center gap-2">
            <div
              className={[
                "flex h-9 min-w-[80px] items-center justify-center gap-1 rounded-sharp border px-3",
                done && "border-accent-jade/60 bg-accent-jade/10 text-accent-jade",
                current && "border-accent-blood/80 bg-accent-blood/20 text-text-primary shadow-glow-blood",
                !done && !current && "border-surface-elevated text-text-muted",
              ].filter(Boolean).join(" ")}
            >
              <span>{TYPE_ICON[node.type]}</span>
              <span className="tracking-widest">{TYPE_LABEL[node.type]}</span>
            </div>
            {i < nodes.length - 1 ? <span className="text-text-muted">—</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
