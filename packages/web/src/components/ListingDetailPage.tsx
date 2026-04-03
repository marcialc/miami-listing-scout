import { useState, useEffect } from "react";
import type { DailyReport, BridgeListing, ListingAnalysis, AnalysisModule, RprData } from "@miami-listing-scout/shared";
import { ANALYSIS_MODULES } from "@miami-listing-scout/shared";
import { fetchReport } from "../api";
import { ScoreBadge } from "./ScoreBadge";
import { RecommendationBadge } from "./RecommendationBadge";
import { useI18n, formatCurrency, formatNumber, formatDate } from "../i18n";
import type { Locale, TranslationKey } from "../i18n";

interface ListingDetailPageProps {
  reportKey: string;
  listingId: string;
}

export function ListingDetailPage({ reportKey, listingId }: ListingDetailPageProps) {
  const { locale, t } = useI18n();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchReport(reportKey)
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : t("report.loadError")))
      .finally(() => setLoading(false));
  }, [reportKey, t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 bg-stone-200 rounded animate-pulse w-32" />
        <div className="aspect-[2/1] bg-stone-100 rounded-xl animate-pulse" />
        <div className="h-8 bg-stone-100 rounded animate-pulse w-48" />
        <div className="h-4 bg-stone-100 rounded animate-pulse w-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-sm">{error}</p>
        <a href={`#/reports?key=${encodeURIComponent(reportKey)}`} className="text-sm text-accent-600 hover:underline mt-2 inline-block">
          {t("listing.backToReport")}
        </a>
      </div>
    );
  }

  const match = report?.listings.find((l) => l.listing.listingId === listingId);
  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 text-sm">{t("listing.notFound")}</p>
        <a href={`#/reports?key=${encodeURIComponent(reportKey)}`} className="text-sm text-accent-600 hover:underline mt-2 inline-block">
          {t("listing.backToReport")}
        </a>
      </div>
    );
  }

  const { listing, analysis, rprData } = match;

  return (
    <div className="space-y-8">
      {/* Back nav */}
      <a
        href={`#/reports?key=${encodeURIComponent(reportKey)}`}
        className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        {t("listing.backToReport")}
      </a>

      {/* Photo gallery */}
      <PhotoGallery photos={listing.photos} address={listing.address.full} activeIndex={activePhoto} onSelect={setActivePhoto} />

      {/* Header */}
      <ListingHeader listing={listing} analysis={analysis} locale={locale} t={t} />

      {/* Property details + Financial */}
      <div className="grid gap-6 md:grid-cols-2">
        <PropertyDetailsCard listing={listing} locale={locale} t={t} />
        <FinancialCard listing={listing} locale={locale} t={t} />
      </div>

      {/* RPR Data */}
      {rprData && <RprCard rprData={rprData} locale={locale} t={t} />}

      {/* AI Summary */}
      <SummaryCard analysis={analysis} t={t} />

      {/* Analysis Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {ANALYSIS_MODULES.map((mod) => {
          const result = analysis.moduleResults[mod];
          if (!result || result.score === 0) return null;
          const isExpanded = expandedModule === mod;
          const visibleHighlights = isExpanded ? result.highlights : result.highlights.slice(0, 4);
          const hiddenCount = result.highlights.length - 4;
          return (
            <div key={mod} className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-stone-800">{t(`module.${mod}.label` as TranslationKey)}</h4>
                <ScoreBadge score={result.score} size="sm" />
              </div>
              {visibleHighlights.length > 0 && (
                <ul className="space-y-0.5 mb-2">
                  {visibleHighlights.map((h, i) => (
                    <li key={i} className="text-xs text-stone-600 flex items-start gap-2">
                      <span className="text-stone-300 mt-0.5 shrink-0">–</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {!isExpanded && hiddenCount > 0 && (
                <button
                  onClick={() => setExpandedModule(mod)}
                  className="text-xs text-stone-400 hover:text-stone-600 mb-2 cursor-pointer"
                >
                  {t("module.moreHighlights", { count: hiddenCount })}
                </button>
              )}
              {isExpanded ? (
                <>
                  <p className="text-xs text-stone-400 leading-relaxed mb-2">{result.analysis}</p>
                  <button
                    onClick={() => setExpandedModule(null)}
                    className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t("module.hideDetails")}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6" /></svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setExpandedModule(mod)}
                  className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{t("module.showDetails")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Property description */}
      {listing.property.description && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-3">{t("listing.propertyDescription")}</h3>
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{listing.property.description}</p>
        </div>
      )}

      {/* Agent info */}
      {listing.agent.name && <AgentCard agent={listing.agent} t={t} />}

      {/* Footer metadata */}
      <div className="text-xs text-stone-400 flex flex-wrap gap-x-4 gap-y-1 pb-4">
        <span>{t("listing.mls", { id: listing.mlsId })}</span>
        <span>{t("listing.listed", { date: formatDate(listing.dates.listed, locale) })}</span>
        <span>{t("listing.modified", { date: formatDate(listing.dates.modified, locale) })}</span>
        <span>{t("listing.analyzed", { date: formatDate(analysis.analyzedAt, locale) })}</span>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

type TFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

function PhotoGallery({ photos, address, activeIndex, onSelect }: { photos: string[]; address: string; activeIndex: number; onSelect: (i: number) => void }) {
  if (photos.length === 0) {
    return (
      <div className="aspect-[2/1] bg-stone-100 rounded-xl flex items-center justify-center text-stone-300">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-[2/1] bg-stone-100 rounded-xl overflow-hidden">
        <img src={photos[activeIndex]} alt={address} className="w-full h-full object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden ring-2 cursor-pointer ${i === activeIndex ? "ring-accent-500" : "ring-transparent hover:ring-stone-300"}`}
            >
              <img src={url} alt={`${address} photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListingHeader({ listing, analysis, locale, t }: { listing: BridgeListing; analysis: ListingAnalysis; locale: Locale; t: TFn }) {
  const price = formatCurrency(listing.listPrice, locale);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-2xl font-bold text-stone-900">{price}</p>
          <p className="text-stone-600 mt-1">{listing.address.full}</p>
        </div>
        <div className="flex items-center gap-2">
          <RecommendationBadge rec={analysis.recommendation} />
          <ScoreBadge score={analysis.overallScore} />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mt-2">
        <span>{t("listing.listed", { date: formatDate(listing.listDate, locale) })}</span>
        <span>{t("listing.mls", { id: listing.mlsId })}</span>
        <span>{listing.property.type}</span>
      </div>
    </div>
  );
}

function PropertyDetailsCard({ listing, locale, t }: { listing: BridgeListing; locale: Locale; t: TFn }) {
  const { bedrooms, bathrooms, bathsFull, bathsHalf, sqft, lotSize, yearBuilt, stories, garage, pool, waterfront, type } = listing.property;

  const bathDetail = `${bathrooms} (${t("detail.bathsFull", { count: bathsFull })}${bathsHalf ? `, ${t("detail.bathsHalf", { count: bathsHalf })}` : ""})`;

  const rows: [string, string | number][] = [
    [t("detail.bedrooms"), bedrooms],
    [t("detail.bathrooms"), bathDetail],
    [t("detail.sqft"), formatNumber(sqft, locale)],
    [t("detail.lotSize"), lotSize > 0 ? `${formatNumber(lotSize, locale)} ${t("detail.sqftUnit")}` : t("detail.na")],
    [t("detail.yearBuilt"), yearBuilt > 0 ? yearBuilt : t("detail.na")],
    [t("detail.stories"), stories > 0 ? stories : t("detail.na")],
    [t("detail.garage"), garage > 0 ? t("detail.spaces", { count: garage }) : t("detail.none")],
    [t("detail.pool"), pool ? t("detail.yes") : t("detail.no")],
    [t("detail.waterfront"), waterfront ? t("detail.yes") : t("detail.no")],
    [t("detail.type"), type],
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-3">{t("listing.propertyDetails")}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-stone-400 text-xs">{label}</dt>
            <dd className="text-stone-700">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FinancialCard({ listing, locale, t }: { listing: BridgeListing; locale: Locale; t: TFn }) {
  const price = listing.listPrice;
  const priceSqft = listing.property.sqft > 0 ? Math.round(price / listing.property.sqft) : null;

  const rows: [string, string][] = [
    [t("financial.listPrice"), formatCurrency(price, locale)],
    [t("financial.priceSqft"), priceSqft ? formatCurrency(priceSqft, locale) : t("detail.na")],
    [t("financial.hoaFee"), listing.financial.hoaFee != null ? `${formatCurrency(listing.financial.hoaFee, locale)}${t("financial.perMonth")}` : t("detail.na")],
    [t("financial.taxAmount"), listing.financial.taxAmount != null ? `${formatCurrency(listing.financial.taxAmount, locale)}${listing.financial.taxYear ? ` (${listing.financial.taxYear})` : ""}${t("financial.perYear")}` : t("detail.na")],
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-3">{t("listing.financial")}</h3>
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <dt className="text-stone-400">{label}</dt>
            <dd className="text-stone-700 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SummaryCard({ analysis, t }: { analysis: ListingAnalysis; t: TFn }) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-800">{t("listing.aiSummary")}</h3>
        <div className="flex items-center gap-2">
          <RecommendationBadge rec={analysis.recommendation} />
          <ScoreBadge score={analysis.overallScore} size="sm" />
        </div>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed">{analysis.summary}</p>
    </div>
  );
}

function RprCard({ rprData, locale, t }: { rprData: RprData; locale: Locale; t: TFn }) {
  const ratio = rprData.valuation.priceToValueRatio;
  const ratioColor = ratio <= 0.95 ? "text-green-600" : ratio >= 1.05 ? "text-red-600" : "text-amber-600";
  const ratioLabel = ratio <= 0.95 ? t("rpr.underpriced") : ratio >= 1.05 ? t("rpr.overpriced") : t("rpr.fairValue");
  const avgSchoolRating = rprData.schools.length > 0
    ? (rprData.schools.reduce((sum, s) => sum + s.rating, 0) / rprData.schools.length).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-sky-200 p-5">
      <h3 className="text-sm font-semibold text-sky-700 mb-4">{t("rpr.valuation")}</h3>

      {/* Valuation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <dt className="text-xs text-stone-400">{t("rpr.estimatedValue")}</dt>
          <dd className="text-sm font-semibold text-stone-800">{formatCurrency(rprData.valuation.estimatedValue, locale)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">{t("rpr.priceToValue")}</dt>
          <dd className={`text-sm font-semibold ${ratioColor}`}>{(ratio * 100).toFixed(0)}% — {ratioLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">{t("rpr.confidence")}</dt>
          <dd className="text-sm font-semibold text-stone-800">{rprData.valuation.confidenceScore}/100</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-400">{t("rpr.floodZone")}</dt>
          <dd className={`text-sm font-semibold ${rprData.floodZone.isHighRisk ? "text-red-600" : "text-green-600"}`}>
            {rprData.floodZone.zone} — {rprData.floodZone.isHighRisk ? t("rpr.highRisk") : t("rpr.lowRisk")}
          </dd>
        </div>
      </div>

      {/* Neighborhood */}
      <div className="border-t border-stone-100 pt-3 mb-3">
        <h4 className="text-xs font-semibold text-stone-500 mb-2">{t("rpr.neighborhood")}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.appreciation1Yr")}</dt>
            <dd className="text-sm font-medium text-stone-700">{rprData.neighborhood.appreciationRate1Yr.toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.appreciation5Yr")}</dt>
            <dd className="text-sm font-medium text-stone-700">{rprData.neighborhood.appreciationRate5Yr.toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.medianValue")}</dt>
            <dd className="text-sm font-medium text-stone-700">{formatCurrency(rprData.neighborhood.medianHomeValue, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.medianIncome")}</dt>
            <dd className="text-sm font-medium text-stone-700">{formatCurrency(rprData.neighborhood.medianHouseholdIncome, locale)}</dd>
          </div>
        </div>
      </div>

      {/* Schools */}
      {rprData.schools.length > 0 && (
        <div className="border-t border-stone-100 pt-3 mb-3">
          <h4 className="text-xs font-semibold text-stone-500 mb-2">
            {t("rpr.schools")} {avgSchoolRating && <span className="text-stone-400 font-normal">(avg {avgSchoolRating}/10)</span>}
          </h4>
          <div className="flex flex-wrap gap-2">
            {rprData.schools.map((school) => (
              <span key={school.name} className="text-xs bg-stone-50 rounded-full px-2.5 py-1 text-stone-600">
                {school.name} <span className="font-semibold">{school.rating}/10</span> · {school.distanceMiles.toFixed(1)}mi
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Investment Metrics */}
      <div className="border-t border-stone-100 pt-3 mb-3">
        <h4 className="text-xs font-semibold text-stone-500 mb-2">{t("rpr.investmentMetrics")}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.capRate")}</dt>
            <dd className="text-sm font-medium text-stone-700">{rprData.investmentMetrics.estimatedCapRate.toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.monthlyCashFlow")}</dt>
            <dd className="text-sm font-medium text-stone-700">{formatCurrency(rprData.investmentMetrics.estimatedMonthlyCashFlow, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.monthlyRent")}</dt>
            <dd className="text-sm font-medium text-stone-700">{formatCurrency(rprData.investmentMetrics.estimatedMonthlyRent, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-stone-400">{t("rpr.grm")}</dt>
            <dd className="text-sm font-medium text-stone-700">{rprData.investmentMetrics.grossRentMultiplier.toFixed(1)}x</dd>
          </div>
        </div>
      </div>

      {/* Tax History */}
      {rprData.taxHistory.length > 0 && (
        <div className="border-t border-stone-100 pt-3">
          <h4 className="text-xs font-semibold text-stone-500 mb-2">{t("rpr.taxHistory")}</h4>
          <div className="space-y-1">
            {rprData.taxHistory.slice(0, 5).map((tax) => (
              <div key={tax.year} className="flex justify-between text-xs text-stone-600">
                <span>{tax.year}</span>
                <span>Assessed: {formatCurrency(tax.assessedValue, locale)} · Tax: {formatCurrency(tax.taxAmount, locale)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, t }: { agent: BridgeListing["agent"]; t: TFn }) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-3">{t("listing.listingAgent")}</h3>
      <div className="text-sm text-stone-600 space-y-1">
        <p className="font-medium text-stone-700">{agent.name}</p>
        {agent.office && <p>{agent.office}</p>}
        {agent.phone && (
          <p>
            <a href={`tel:${agent.phone}`} className="text-accent-600 hover:underline">{agent.phone}</a>
          </p>
        )}
        {agent.email && (
          <p>
            <a href={`mailto:${agent.email}`} className="text-accent-600 hover:underline">{agent.email}</a>
          </p>
        )}
      </div>
    </div>
  );
}
