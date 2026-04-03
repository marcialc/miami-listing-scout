import type { HealthStatus } from "../api";
import { useI18n, formatDate } from "../i18n";
import type { Locale, TranslationKey } from "../i18n";

interface HeaderProps {
  health: HealthStatus | null;
  runningTest: boolean;
  onRunClick: () => void;
  schedule: { timezone: string; hour: number };
  currentPage: string;
}

function formatLastRun(iso: string, t: (key: TranslationKey, params?: Record<string, string | number>) => string, locale: Locale): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffM = Math.floor(diffMs / 60_000);

    if (diffM < 1) return t("header.justNow");
    if (diffM < 60) return t("header.minutesAgo", { count: diffM });
    if (diffH < 24) return t("header.hoursAgo", { count: diffH });
    return formatDate(d, locale, { month: "short", day: "numeric" });
  } catch {
    return t("header.unknown");
  }
}

function formatNextRun(schedule: { timezone: string; hour: number }, t: (key: TranslationKey, params?: Record<string, string | number>) => string): string {
  const h = schedule.hour;
  const ampm = h >= 12 ? t("email.pm") : t("email.am");
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:00 ${ampm} ${t("header.daily")}`;
}

const TABS: { id: string; labelKey: TranslationKey; hash: string }[] = [
  { id: "settings", labelKey: "tabs.settings", hash: "#/" },
  { id: "reports", labelKey: "tabs.reports", hash: "#/reports" },
];

export function Header({ health, runningTest, onRunClick, schedule, currentPage }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="bg-white border-b border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <circle cx="12" cy="14" r="3" />
              <path d="M12 11V3" opacity="0.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-900 leading-tight">{t("header.title")}</h1>
            <p className="text-xs text-stone-400">{t("header.tagline")}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <div className="flex rounded-md overflow-hidden border border-stone-200 text-xs">
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-1 cursor-pointer transition-colors ${locale === "en" ? "bg-accent-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              {t("lang.en")}
            </button>
            <button
              onClick={() => setLocale("es")}
              className={`px-2 py-1 cursor-pointer transition-colors ${locale === "es" ? "bg-accent-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              {t("lang.es")}
            </button>
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs text-stone-500">
            {health ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                  {t("header.lastRun", { time: formatLastRun(health.lastRun, t, locale) })}
                </span>
                <span className="text-stone-400">{t("header.next", { time: formatNextRun(schedule, t) })}</span>
              </>
            ) : (
              <span className="text-stone-400">{t("header.workerNotConnected")}</span>
            )}
          </div>

          <button
            onClick={onRunClick}
            disabled={runningTest}
            className="px-3.5 py-2 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
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
              t("header.runNow")
            )}
          </button>
        </div>
      </div>

      <nav className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-6">
        {TABS.map((tab) => {
          const active = tab.id === currentPage;
          return (
            <a
              key={tab.id}
              href={tab.hash}
              className={`text-sm pb-2.5 -mb-px border-b-2 transition-colors ${
                active
                  ? "border-accent-600 text-accent-700 font-medium"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              {t(tab.labelKey)}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
