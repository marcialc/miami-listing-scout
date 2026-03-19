import type { BridgeListing, ListingAnalysis } from "@miami-listing-scout/shared";
import { ScoreBadge } from "./ScoreBadge";
import { RecommendationBadge } from "./RecommendationBadge";

interface ListingCardProps {
  listing: BridgeListing;
  analysis: ListingAnalysis;
  reportKey: string;
}

export function ListingCard({ listing, analysis, reportKey }: ListingCardProps) {
  const photo = listing.photos[0];
  const price = listing.listPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
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
          <span>{bedrooms} bd</span>
          <span>{bathrooms} ba</span>
          <span>{sqft.toLocaleString()} sqft</span>
          {yearBuilt > 0 && <span>Built {yearBuilt}</span>}
          {pool && (
            <span className="inline-flex items-center gap-1 text-blue-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>
              Pool
            </span>
          )}
          {waterfront && (
            <span className="inline-flex items-center gap-1 text-cyan-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></svg>
              Waterfront
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
