// 時間軸：23:00 → 05:00，越深夜視覺強調越重。每個節點推進顯示。

type Props = {
  current: string;
  className?: string;
};

function pickTimeColor(time: string): string {
  // 簡化：用小時推顏色（design token 已定義 --color-time-2300/0100/0300/0500）
  const hour = parseInt(time.split(":")[0] ?? "23", 10);
  if (hour >= 23 || hour < 1) return "var(--color-time-2300)";
  if (hour < 3) return "var(--color-time-0100)";
  if (hour < 5) return "var(--color-time-0300)";
  return "var(--color-time-0500)";
}

export function TimeAxis({ current, className = "" }: Props) {
  const color = pickTimeColor(current);
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label={`目前時間 ${current}`}>
      <span className="text-[10px] tracking-[0.4em] text-text-muted uppercase">Now</span>
      <span
        className="font-mono text-lg tracking-widest"
        style={{ color, textShadow: `0 0 12px ${color}` }}
      >
        {current}
      </span>
      <span className="text-[10px] tracking-[0.4em] text-text-muted uppercase">/ 05:00</span>
    </div>
  );
}
