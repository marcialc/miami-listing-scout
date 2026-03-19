import { useState, useEffect } from "react";
import type { DailyReport, Recommendation } from "@miami-listing-scout/shared";
import { fetchReport } from "../api";
import { ListingCard } from "./ListingCard";
import { RecommendationBadge } from "./RecommendationBadge";

interface ReportDetailProps {
  reportKey: string;
}

type SortBy = "score" | "price";

const RECS: Recommendation[] = ["strong_buy", "buy", "watch", "pass"];

export function ReportDetail({ reportKey }: ReportDetailProps) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [filterRec, setFilterRec] = useState<Recommendation | null>(null);

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
      <div className="space-y-4">
        <div className="h-8 bg-stone-200 rounded animate-pulse w-48" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm ring-1 ring-stone-200 overflow-hidden">
              <div className="aspect-[16/9] bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-stone-100 rounded animate-pulse w-24" />
                <div className="h-4 bg-stone-100 rounded animate-pulse w-48" />
                <div className="h-3 bg-stone-100 rounded animate-pulse w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-sm">{error}</p>
        <a href="#/reports" className="text-sm text-accent-600 hover:underline mt-2 inline-block">Back to reports</a>
      </div>
    );
  }

  if (!report) return null;

  const date = new Date(report.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  let listings = [...report.listings];

  if (filterRec) {
    listings = listings.filter((l) => l.analysis.recommendation === filterRec);
  }

  listings.sort((a, b) =>
    sortBy === "score"
      ? b.analysis.overallScore - a.analysis.overallScore
      : b.listing.listPrice - a.listing.listPrice
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <a href="#/reports" className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          Back to reports
        </a>
        <h2 className="text-xl font-semibold text-stone-900">{date}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mt-1">
          <span>{report.totalNewListings} new listings</span>
          <span>{report.totalMatches} matched</span>
          <span>{report.totalAnalyzed} analyzed</span>
          <span>{report.listings.length} in report</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-sm border border-stone-200 rounded-lg px-2 py-1 bg-white text-stone-700"
          >
            <option value="score">Score</option>
            <option value="price">Price</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-stone-500">Filter</label>
          <button
            onClick={() => setFilterRec(null)}
            className={`text-xs px-2 py-1 rounded-full cursor-pointer ${!filterRec ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >
            All
          </button>
          {RECS.map((rec) => (
            <button
              key={rec}
              onClick={() => setFilterRec(filterRec === rec ? null : rec)}
              className={`cursor-pointer rounded-full ${filterRec === rec ? "ring-2 ring-offset-1 ring-stone-400" : ""}`}
            >
              <RecommendationBadge rec={rec} />
            </button>
          ))}
        </div>
      </div>

      {/* Listings grid */}
      {listings.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          No listings match the selected filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {listings.map(({ listing, analysis }) => (
            <ListingCard key={listing.listingId} listing={listing} analysis={analysis} reportKey={reportKey} />
          ))}
        </div>
      )}
    </div>
  );
}
