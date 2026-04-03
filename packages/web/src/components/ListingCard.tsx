import type { AnalysisModule, BridgeListing, ListingAnalysis, RprData } from "@miami-listing-scout/shared";
import { ScoreBadge } from "./ScoreBadge";
import { RecommendationBadge } from "./RecommendationBadge";
import { useI18n, formatCurrency, formatNumber } from "../i18n";

const INVESTOR_MODULES: AnalysisModule[] = ["investment_potential", "rental_analysis", "flip_potential"];

interface ListingCardProps {
  listing: BridgeListing;
  analysis: ListingAnalysis;
  reportKey: string;
  rprData?: RprData;
}

export function ListingCard({ listing, analysis, reportKey, rprData }: ListingCardProps) {
  const { locale, t } = useI18n();
  const photo = listing.photos[0];
  const price = formatCurrency(listing.listPrice, locale);
  const { bedrooms, bathrooms, sqft, yearBuilt, pool, waterfront } = listing.property;
  const href = `#/reports?key=${encodeURIComponent(reportKey)}&listing=${encodeURIComponent(listing.listingId)}`;

  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 overflow-hidden block transition-shadow hover:shadow-md hover:ring-stone-300"
    >
      {/* Hero photo */}
      <div className="aspect-[16/9] bg-stone-100 relative overflow-hidden">
        {photo ? (
          <img src={photo} alt={listing.address.full} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <RecommendationBadge rec={analysis.recommendation} />
        </div>
        <div className="absolute top-3 right-3">
          <ScoreBadge score={analysis.overallScore} />
        </div>
        {rprData && (
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-semibold bg-sky-100 text-sky-700 rounded-full px-2.5 py-1 shadow-sm">
              RVM: {formatCurrency(rprData.valuation.estimatedValue, locale)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-lg font-semibold text-stone-900">{price}</p>
            <p className="text-sm text-stone-500">{listing.address.full}</p>
          </div>
        </div>

        {/* Property details */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
          <span>{t("listing.bd", { count: bedrooms })}</span>
          <span>{t("listing.ba", { count: bathrooms })}</span>
          <span>{t("listing.sqft", { count: formatNumber(sqft, locale) })}</span>
          {yearBuilt > 0 && <span>{t("listing.built", { year: yearBuilt })}</span>}
          {pool && (
            <span className="inline-flex items-center gap-1 text-blue-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>
              {t("listing.pool")}
            </span>
          )}
          {waterfront && (
            <span className="inline-flex items-center gap-1 text-cyan-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>
              {t("listing.waterfront")}
            </span>
          )}
        </div>

        {/* Investment highlights */}
        {(() => {
          const pills = INVESTOR_MODULES.flatMap((mod) => {
            const result = analysis.moduleResults[mod];
            return result && result.score > 0 && result.highlights.length > 0
              ? [result.highlights[0]]
              : [];
          });
          if (pills.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1.5 mt-2" aria-label={t("listing.investmentHighlights")}>
              {pills.map((text) => (
                <span
                  key={text}
                  className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 inline-flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {text}
                </span>
              ))}
            </div>
          );
        })()}
      </div>
    </a>
  );
}
