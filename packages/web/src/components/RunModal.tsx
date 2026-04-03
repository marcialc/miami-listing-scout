import { useState, useEffect } from "react";
import { useI18n } from "../i18n";
import type { Locale } from "../i18n";

interface RunModalProps {
  open: boolean;
  onClose: () => void;
  onRun: (date: string | null, locale: Locale) => void;
  runningTest: boolean;
  defaultLocale: Locale;
}

export function RunModal({ open, onClose, onRun, runningTest, defaultLocale }: RunModalProps) {
  const { t } = useI18n();
  const [date, setDate] = useState<string>("");
  const [reportLocale, setReportLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    if (open) {
      setDate("");
      setReportLocale(defaultLocale);
    }
  }, [open, defaultLocale]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-stone-900">{t("runModal.title")}</h2>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("runModal.dateLabel")}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full h-9 px-2 text-sm border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
          />
          <p className="mt-1 text-xs text-stone-400">{t("runModal.dateHelp")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("runModal.languageLabel")}</label>
          <div className="flex rounded-md overflow-hidden border border-stone-300 text-sm w-fit">
            <button
              type="button"
              onClick={() => setReportLocale("en")}
              className={`px-4 py-1.5 cursor-pointer transition-colors ${reportLocale === "en" ? "bg-accent-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              {t("lang.en")}
            </button>
            <button
              type="button"
              onClick={() => setReportLocale("es")}
              className={`px-4 py-1.5 cursor-pointer transition-colors ${reportLocale === "es" ? "bg-accent-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              {t("lang.es")}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={runningTest}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {t("runModal.cancel")}
          </button>
          <button
            type="button"
            onClick={() => onRun(date || null, reportLocale)}
            disabled={runningTest}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {runningTest ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("header.running")}
              </span>
            ) : (
              t("runModal.run")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
