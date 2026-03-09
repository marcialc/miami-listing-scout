import { useCallback } from "react";
import type { AnalysisModule, ScoutConfig } from "@miami-listing-scout/shared";
import { ANALYSIS_MODULES } from "@miami-listing-scout/shared";
import { SectionCard } from "./SectionCard";

interface Props {
  config: ScoutConfig;
  updateConfig: (fn: (prev: ScoutConfig) => ScoutConfig) => void;
}

const MODULE_INFO: Record<AnalysisModule, { label: string; description: string }> = {
  investment_potential: {
    label: "Investment Potential",
    description: "ROI estimate, rental yield, appreciation potential",
  },
  price_vs_comps: {
    label: "Price vs Comps",
    description: "Comparison to similar recent sales nearby",
  },
  red_flags: {
    label: "Red Flags",
    description: "Structural issues, DOM anomalies, price drops, HOA concerns",
  },
  neighborhood_insights: {
    label: "Neighborhood Insights",
    description: "Schools, crime, walkability, nearby development",
  },
  rental_analysis: {
    label: "Rental Analysis",
    description: "Monthly rent estimate, occupancy, STR vs LTR",
  },
  flip_potential: {
    label: "Flip Potential",
    description: "Rehab cost estimate and after-repair value (ARV)",
  },
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-accent-600" : "bg-stone-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
          enabled ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function AnalysisSection({ config, updateConfig }: Props) {
  const toggleModule = useCallback(
    (mod: AnalysisModule, enabled: boolean) => {
      updateConfig((prev) => ({
        ...prev,
        analysisModules: enabled
          ? [...prev.analysisModules, mod]
          : prev.analysisModules.filter((m) => m !== mod),
      }));
    },
    [updateConfig],
  );

  const updateRequirement = useCallback(
    (index: number, value: string) => {
      updateConfig((prev) => ({
        ...prev,
        customRequirements: prev.customRequirements.map((r, i) => (i === index ? value : r)),
      }));
    },
    [updateConfig],
  );

  const removeRequirement = useCallback(
    (index: number) => {
      updateConfig((prev) => ({
        ...prev,
        customRequirements: prev.customRequirements.filter((_, i) => i !== index),
      }));
    },
    [updateConfig],
  );

  const addRequirement = useCallback(() => {
    updateConfig((prev) => ({
      ...prev,
      customRequirements: [...prev.customRequirements, ""],
    }));
  }, [updateConfig]);

  return (
    <SectionCard
      title="AI Analysis"
      description="Configure what Claude analyzes for each matching listing"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-sm font-medium text-stone-700 mb-3">Analysis Modules</h4>
          <div className="flex flex-col gap-1">
            {ANALYSIS_MODULES.map((mod) => {
              const info = MODULE_INFO[mod];
              const enabled = config.analysisModules.includes(mod);
              return (
                <div
                  key={mod}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="pr-4">
                    <div className="text-sm font-medium text-stone-800">{info.label}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{info.description}</div>
                  </div>
                  <Toggle enabled={enabled} onChange={(v) => toggleModule(mod, v)} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <h4 className="text-sm font-medium text-stone-700 mb-1">Custom Requirements</h4>
          <p className="text-xs text-stone-400 mb-3">
            Add plain-English questions for the AI to answer about each listing
          </p>

          <div className="flex flex-col gap-2">
            {config.customRequirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(i, e.target.value)}
                  placeholder="Is this property good for Airbnb/short-term rental?"
                  className="flex-1 text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 placeholder:text-stone-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(i)}
                  className="p-2.5 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRequirement}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Add requirement
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
