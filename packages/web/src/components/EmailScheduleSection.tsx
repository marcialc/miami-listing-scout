import type { ScoutConfig, ScanFrequency } from "@miami-listing-scout/shared";
import { SectionCard } from "./SectionCard";
import { useI18n } from "../i18n";

interface Props {
  config: ScoutConfig;
  updateConfig: (fn: (prev: ScoutConfig) => ScoutConfig) => void;
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Pacific/Honolulu",
];

export function EmailScheduleSection({ config, updateConfig }: Props) {
  const { t } = useI18n();

  const hours = Array.from({ length: 24 }, (_, i) => {
    const ampm = i >= 12 ? t("email.pm") : t("email.am");
    const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
    return { value: i, label: `${h12}:00 ${ampm}` };
  });

  return (
    <SectionCard
      title={t("email.title")}
      description={t("email.description")}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.reportLanguage")}</label>
          <div className="flex rounded-md overflow-hidden border border-stone-300 text-sm w-fit">
            <button
              type="button"
              onClick={() => updateConfig((prev) => ({ ...prev, locale: "en" }))}
              className={`px-4 py-1.5 cursor-pointer transition-colors ${(config.locale ?? "en") === "en" ? "bg-accent-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => updateConfig((prev) => ({ ...prev, locale: "es" }))}
              className={`px-4 py-1.5 cursor-pointer transition-colors ${config.locale === "es" ? "bg-accent-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}
            >
              ES
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-400">{t("email.reportLanguageHelp")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.name")}</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateConfig((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t("email.namePlaceholder")}
            className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 placeholder:text-stone-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.address")}</label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => updateConfig((prev) => ({ ...prev, email: e.target.value }))}
            placeholder={t("email.addressPlaceholder")}
            className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 placeholder:text-stone-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors"
          />
          <p className="mt-1 text-xs text-stone-400">{t("email.addressHelp")}</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.frequency")}</label>
            <select
              value={config.schedule.frequency}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, frequency: e.target.value as ScanFrequency },
                }))
              }
              className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
            >
              <option value="daily">{t("email.frequencyDaily")}</option>
              <option value="twice_daily">{t("email.frequencyTwiceDaily")}</option>
              <option value="weekdays_only">{t("email.frequencyWeekdays")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.maxListings")}</label>
            <select
              value={config.maxListingsPerReport}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  maxListingsPerReport: Number(e.target.value),
                }))
              }
              className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.timezone")}</label>
            <select
              value={config.schedule.timezone}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, timezone: e.target.value },
                }))
              }
              className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("America/", "").replace("Pacific/", "").replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("email.sendTime")}</label>
            <select
              value={config.schedule.hour}
              onChange={(e) =>
                updateConfig((prev) => ({
                  ...prev,
                  schedule: { ...prev.schedule, hour: Number(e.target.value) },
                }))
              }
              className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
            >
              {hours.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
