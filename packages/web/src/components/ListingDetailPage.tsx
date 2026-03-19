import { useState, useEffect } from "react";
import type { DailyReport, BridgeListing, ListingAnalysis, AnalysisModule } from "@miami-listing-scout/shared";
import { ANALYSIS_MODULES } from "@miami-listing-scout/shared";
import { fetchReport } from "../api";
import { ScoreBadge } from "./ScoreBadge";
import { RecommendationBadge } from "./RecommendationBadge";

const MODULE_LABELS: Record<AnalysisModule, string> = {
  investment_potential: "Investment Potential",
  price_vs_comps: "Price vs Comps",
  red_flags: "Red Flags",
  neighborhood_insights: "Neighborhood",
  rental_analysis: "Rental Analysis",
  flip_potential: "Flip Potential",
};

interface ListingDetailPageProps {
  reportKey: string;
  listingId: string;
}

export function ListingDetailPage({ reportKey, listingId }: ListingDetailPageProps) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchReport(reportKey)
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }, [reportKey]);

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
          Back to report
        </a>
      </div>
    );
  }

  const match = report?.listings.find((l) => l.listing.listingId === listingId);
  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 text-sm">Listing not found in this report.</p>
        <a href={`#/reports?key=${encodeURIComponent(reportKey)}`} className="text-sm text-accent-600 hover:underline mt-2 inline-block">
          Back to report
        </a>
      </div>
    );
  }

  const { listing, analysis } = match;

  return (
    <div className="space-y-8">
      {/* Back nav */}
      <a
        href={`#/reports?key=${encodeURIComponent(reportKey)}`}
        className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        Back to report
      </a>

      {/* Photo gallery */}
      <PhotoGallery photos={listing.photos} address={listing.address.full} activeIndex={activePhoto} onSelect={setActivePhoto} />

      {/* Header */}
      <ListingHeader listing={listing} analysis={analysis} />

      {/* Property details + Financial */}
      <div className="grid gap-6 md:grid-cols-2">
        <PropertyDetailsCard listing={listing} />
        <FinancialCard listing={listing} />
      </div>

      {/* AI Summary */}
      <SummaryCard analysis={analysis} />

      {/* Analysis Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {ANALYSIS_MODULES.map((mod) => {
          const result = analysis.moduleResults[mod];
          if (!result) return null;
          return (
            <div key={mod} className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-stone-800">{MODULE_LABELS[mod]}</h4>
                <ScoreBadge score={result.score} size="sm" />
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{result.analysis}</p>
              {result.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {result.highlights.map((h, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">{h}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Property description */}
      {listing.property.description && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-3">Property Description</h3>
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{listing.property.description}</p>
        </div>
      )}

      {/* Agent info */}
      {listing.agent.name && <AgentCard agent={listing.agent} />}

      {/* Footer metadata */}
      <div className="text-xs text-stone-400 flex flex-wrap gap-x-4 gap-y-1 pb-4">
        <span>MLS# {listing.mlsId}</span>
        <span>Listed {new Date(listing.dates.listed).toLocaleDateString()}</span>
        <span>Modified {new Date(listing.dates.modified).toLocaleDateString()}</span>
        <span>Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

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

function ListingHeader({ listing, analysis }: { listing: BridgeListing; analysis: ListingAnalysis }) {
  const price = listing.listPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
        <span>Listed {new Date(listing.listDate).toLocaleDateString()}</span>
        <span>MLS# {listing.mlsId}</span>
        <span>{listing.property.type}</span>
      </div>
    </div>
  );
}

function PropertyDetailsCard({ listing }: { listing: BridgeListing }) {
  const { bedrooms, bathrooms, bathsFull, bathsHalf, sqft, lotSize, yearBuilt, stories, garage, pool, waterfront, type } = listing.property;

  const rows: [string, string | number][] = [
    ["Bedrooms", bedrooms],
    ["Bathrooms", `${bathrooms} (${bathsFull} full${bathsHalf ? `, ${bathsHalf} half` : ""})`],
    ["Sq Ft", sqft.toLocaleString()],
    ["Lot Size", lotSize > 0 ? `${lotSize.toLocaleString()} sqft` : "N/A"],
    ["Year Built", yearBuilt > 0 ? yearBuilt : "N/A"],
    ["Stories", stories > 0 ? stories : "N/A"],
    ["Garage", garage > 0 ? `${garage} spaces` : "None"],
    ["Pool", pool ? "Yes" : "No"],
    ["Waterfront", waterfront ? "Yes" : "No"],
    ["Type", type],
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-3">Property Details</h3>
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

function FinancialCard({ listing }: { listing: BridgeListing }) {
  const price = listing.listPrice;
  const priceSqft = listing.property.sqft > 0 ? Math.round(price / listing.property.sqft) : null;

  const rows: [string, string][] = [
    ["List Price", price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })],
    ["Price / Sq Ft", priceSqft ? `$${priceSqft.toLocaleString()}` : "N/A"],
    ["HOA Fee", listing.financial.hoaFee != null ? `$${listing.financial.hoaFee.toLocaleString()}/mo` : "N/A"],
    ["Tax Amount", listing.financial.taxAmount != null ? `$${listing.financial.taxAmount.toLocaleString()}${listing.financial.taxYear ? ` (${listing.financial.taxYear})` : ""}/yr` : "N/A"],
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-3">Financial</h3>
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

function SummaryCard({ analysis }: { analysis: ListingAnalysis }) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-800">AI Summary</h3>
        <div className="flex items-center gap-2">
          <RecommendationBadge rec={analysis.recommendation} />
          <ScoreBadge score={analysis.overallScore} size="sm" />
        </div>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed">{analysis.summary}</p>
    </div>
  );
}

function AgentCard({ agent }: { agent: BridgeListing["agent"] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-800 mb-3">Listing Agent</h3>
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
