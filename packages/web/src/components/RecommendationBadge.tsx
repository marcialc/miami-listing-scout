import type { Recommendation } from "@miami-listing-scout/shared";

const STYLES: Record<Recommendation, string> = {
  strong_buy: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  buy: "bg-blue-100 text-blue-800 ring-blue-300",
  watch: "bg-amber-100 text-amber-800 ring-amber-300",
  pass: "bg-red-100 text-red-800 ring-red-300",
};

const LABELS: Record<Recommendation, string> = {
  strong_buy: "Strong Buy",
  buy: "Buy",
  watch: "Watch",
  pass: "Pass",
};

export function RecommendationBadge({ rec }: { rec: Recommendation }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${STYLES[rec]}`}>
      {LABELS[rec]}
    </span>
  );
}
