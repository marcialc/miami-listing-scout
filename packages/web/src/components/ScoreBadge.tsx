interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const color =
    score >= 8 ? "text-emerald-700 bg-emerald-50 ring-emerald-200" :
    score >= 5 ? "text-amber-700 bg-amber-50 ring-amber-200" :
    "text-red-700 bg-red-50 ring-red-200";

  const dims = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  return (
    <div className={`${dims} rounded-full ring-1 font-semibold flex items-center justify-center ${color}`}>
      {score.toFixed(1)}
    </div>
  );
}
