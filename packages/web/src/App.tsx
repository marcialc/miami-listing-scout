import { useState, useEffect, useCallback } from "react";
import type { ScoutConfig } from "@miami-listing-scout/shared";
import { DEFAULT_CONFIG } from "@miami-listing-scout/shared";
import { fetchConfig, saveConfig as apiSaveConfig, fetchHealth, triggerTestRun } from "./api";
import type { HealthStatus } from "./api";
import { useI18n } from "./i18n";
import type { Locale } from "./i18n";
import { Header } from "./components/Header";
import { RunModal } from "./components/RunModal";
import { FiltersSection } from "./components/FiltersSection";
import { AnalysisSection } from "./components/AnalysisSection";
import { EmailScheduleSection } from "./components/EmailScheduleSection";
import { SaveBar } from "./components/SaveBar";
import { Toast } from "./components/Toast";
import { ReportsPage } from "./components/ReportsPage";
import { ReportDetail } from "./components/ReportDetail";
import { ListingDetailPage } from "./components/ListingDetailPage";

type Page =
  | { name: "settings" }
  | { name: "reports" }
  | { name: "report-detail"; key: string }
  | { name: "listing-detail"; key: string; listingId: string };

function parseHash(): Page {
  const hash = window.location.hash;
  if (hash.startsWith("#/reports?")) {
    const params = new URLSearchParams(hash.slice("#/reports?".length));
    const key = params.get("key");
    const listing = params.get("listing");
    if (key && listing) return { name: "listing-detail", key, listingId: listing };
    if (key) return { name: "report-detail", key };
  }
  if (hash === "#/reports") {
    return { name: "reports" };
  }
  return { name: "settings" };
}

function getDefaultConfig(): ScoutConfig {
  const now = new Date().toISOString();
  return {
    id: "default",
    email: "",
    name: "",
    ...DEFAULT_CONFIG,
    createdAt: now,
    updatedAt: now,
  };
}

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const [page, setPage] = useState<Page>(parseHash);
  const [config, setConfig] = useState<ScoutConfig>(getDefaultConfig);
  const [savedConfig, setSavedConfig] = useState<ScoutConfig>(getDefaultConfig);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningTest, setRunningTest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  useEffect(() => {
    const onHashChange = () => setPage(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    Promise.all([
      fetchConfig(),
      fetchHealth().catch(() => null),
    ]).then(([cfg, h]) => {
      setConfig(cfg);
      setSavedConfig(cfg);
      if (cfg.locale && (cfg.locale === "en" || cfg.locale === "es")) {
        setLocale(cfg.locale as Locale);
      }
      setHealth(h);
      setLoading(false);
    });
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const configWithLocale = { ...config, locale };
      await apiSaveConfig(configWithLocale);
      setConfig(configWithLocale);
      setSavedConfig(configWithLocale);
      showToast(t("toast.saveSuccess"), "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [config, locale, showToast, t]);

  const handleRunNow = useCallback(async (date: string | null, runLocale: Locale) => {
    setShowRunModal(false);
    setRunningTest(true);
    try {
      const result = await triggerTestRun(date ?? undefined, runLocale);
      const message = result === "No new listings found" ? t("toast.noNewListings") : result;
      showToast(message, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : t("toast.scanFailed"), "error");
    } finally {
      setRunningTest(false);
    }
  }, [showToast, t]);

  const updateConfig = useCallback((updater: (prev: ScoutConfig) => ScoutConfig) => {
    setConfig(updater);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-sm">{t("loading.config")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Header
        health={health}
        runningTest={runningTest}
        onRunClick={() => setShowRunModal(true)}
        schedule={config.schedule}
        currentPage={page.name === "settings" ? "settings" : "reports"}
      />

      <RunModal
        open={showRunModal}
        onClose={() => setShowRunModal(false)}
        onRun={handleRunNow}
        runningTest={runningTest}
        defaultLocale={config.locale as Locale ?? locale}
      />

      {health?.mockMode && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 text-amber-800 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <strong>{t("mock.label")}</strong> — {t("mock.description")}
            </span>
          </div>
        </div>
      )}

      <main className={`${page.name === "listing-detail" ? "max-w-5xl" : "max-w-3xl"} mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8`}>
        {page.name === "settings" && (
          <>
            <FiltersSection config={config} updateConfig={updateConfig} />
            <AnalysisSection config={config} updateConfig={updateConfig} />
            <EmailScheduleSection config={config} updateConfig={updateConfig} />
          </>
        )}
        {page.name === "reports" && <ReportsPage onDelete={showToast} />}
        {page.name === "report-detail" && <ReportDetail reportKey={page.key} onDelete={showToast} />}
        {page.name === "listing-detail" && <ListingDetailPage reportKey={page.key} listingId={page.listingId} />}
      </main>

      {page.name === "settings" && (
        <SaveBar
          hasChanges={hasChanges}
          saving={saving}
          onSave={handleSave}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
