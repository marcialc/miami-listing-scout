import { useState, useEffect } from "react";
import type { ReportSummary } from "@miami-listing-scout/shared";
import { fetchReports, deleteReport } from "../api";
import { useI18n, formatDate, formatTime } from "../i18n";

interface ReportsPageProps {
  onDelete?: (message: string, type: "success" | "error") => void;
}

export function ReportsPage({ onDelete }: ReportsPageProps) {
  const { locale, t } = useI18n();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("report.deleteConfirm"))) return;
    setDeletingKey(key);
    try {
      await deleteReport(key);
      setReports((prev) => prev.filter((r) => r.key !== key));
      onDelete?.(t("toast.deleteSuccess"), "success");
    } catch (err) {
      onDelete?.(err instanceof Error ? err.message : t("toast.deleteFailed"), "error");
    } finally {
      setDeletingKey(null);
    }
  };

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
        <p className="text-stone-600 font-medium">{t("reports.empty")}</p>
        <p className="text-stone-400 text-sm mt-1">{t("reports.emptyDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const date = formatDate(r.date, locale, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        const time = formatTime(r.generatedAt, locale, { hour: "numeric", minute: "2-digit" });

        return (
          <a
            key={r.key}
            href={`#/reports?key=${encodeURIComponent(r.key)}`}
            className="block bg-white rounded-xl p-5 shadow-sm ring-1 ring-stone-200 hover:ring-accent-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-medium text-stone-900 group-hover:text-accent-700 transition-colors">{date}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">{time}</span>
                <button
                  onClick={(e) => handleDelete(e, r.key)}
                  disabled={deletingKey === r.key}
                  className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  title={t("report.delete")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
              <span>{t("reports.new", { count: r.totalNewListings })}</span>
              <span>{t("reports.matched", { count: r.totalMatches })}</span>
              <span>{t("reports.analyzed", { count: r.totalAnalyzed })}</span>
              <span className="font-medium text-stone-700">{t("reports.inReport", { count: r.listingsCount })}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
