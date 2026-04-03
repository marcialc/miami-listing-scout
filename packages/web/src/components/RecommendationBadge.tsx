import type { Recommendation } from "@miami-listing-scout/shared";
import { useI18n } from "../i18n";
import type { TranslationKey } from "../i18n";

const STYLES: Record<Recommendation, string> = {
  strong_buy: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  buy: "bg-blue-100 text-blue-800 ring-blue-300",
  watch: "bg-amber-100 text-amber-800 ring-amber-300",
  pass: "bg-red-100 text-red-800 ring-red-300",
};

export function RecommendationBadge({ rec }: { rec: Recommendation }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${STYLES[rec]}`}>
      {t(`rec.${rec}` as TranslationKey)}
    </span>
  );
}
