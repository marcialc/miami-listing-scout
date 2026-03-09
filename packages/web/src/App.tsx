import { useState, useEffect, useCallback } from "react";
import type { ScoutConfig } from "@miami-listing-scout/shared";
import { DEFAULT_CONFIG } from "@miami-listing-scout/shared";
import { fetchConfig, saveConfig as apiSaveConfig, fetchHealth, triggerTestRun } from "./api";
import type { HealthStatus } from "./api";
import { Header } from "./components/Header";
import { FiltersSection } from "./components/FiltersSection";
import { AnalysisSection } from "./components/AnalysisSection";
import { EmailScheduleSection } from "./components/EmailScheduleSection";
import { SaveBar } from "./components/SaveBar";
import { Toast } from "./components/Toast";

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
  const [config, setConfig] = useState<ScoutConfig>(getDefaultConfig);
  const [savedConfig, setSavedConfig] = useState<ScoutConfig>(getDefaultConfig);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningTest, setRunningTest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  useEffect(() => {
    Promise.all([
      fetchConfig(),
      fetchHealth().catch(() => null),
    ]).then(([cfg, h]) => {
      setConfig(cfg);
      setSavedConfig(cfg);
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
      await apiSaveConfig(config);
      setSavedConfig(config);
      showToast("Settings saved successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }, [config, showToast]);

  const handleRunNow = useCallback(async () => {
    setRunningTest(true);
    try {
      await triggerTestRun();
      showToast("Scan started — check your email shortly", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to trigger scan", "error");
    } finally {
      setRunningTest(false);
    }
  }, [showToast]);

  const updateConfig = useCallback((updater: (prev: ScoutConfig) => ScoutConfig) => {
    setConfig(updater);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-sm">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <Header
        health={health}
        runningTest={runningTest}
        onRunNow={handleRunNow}
        schedule={config.schedule}
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
              <strong>Mock Mode</strong> — Worker is using sample listings instead of the Bridge API.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        <FiltersSection config={config} updateConfig={updateConfig} />
        <AnalysisSection config={config} updateConfig={updateConfig} />
        <EmailScheduleSection config={config} updateConfig={updateConfig} />
      </main>

      <SaveBar
        hasChanges={hasChanges}
        saving={saving}
        onSave={handleSave}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
