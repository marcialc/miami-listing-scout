import { useState, useEffect } from "react";
import type { ReportSummary } from "@miami-listing-scout/shared";
import { fetchReports } from "../api";

export function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-stone-200 animate-pulse">
            <div className="h-5 bg-stone-100 rounded w-40 mb-2" />
            <div className="h-4 bg-stone-100 rounded w-64" />
          </div>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <p className="text-stone-600 font-medium">No reports yet</p>
        <p className="text-stone-400 text-sm mt-1">Reports will appear here after your first scan runs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const date = new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const time = new Date(r.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

        return (
          <a
            key={r.key}
            href={`#/reports?key=${encodeURIComponent(r.key)}`}
            className="block bg-white rounded-xl p-5 shadow-sm ring-1 ring-stone-200 hover:ring-accent-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-medium text-stone-900 group-hover:text-accent-700 transition-colors">{date}</h3>
              <span className="text-xs text-stone-400">{time}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
              <span>{r.totalNewListings} new</span>
              <span>{r.totalMatches} matched</span>
              <span>{r.totalAnalyzed} analyzed</span>
              <span className="font-medium text-stone-700">{r.listingsCount} in report</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
