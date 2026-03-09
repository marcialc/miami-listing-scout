import type { ScoutConfig } from "@miami-listing-scout/shared";
import { SectionCard } from "./SectionCard";

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

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
  return { value: i, label: `${h12}:00 ${ampm}` };
});

export function EmailScheduleSection({ config, updateConfig }: Props) {
  return (
    <SectionCard
      title="Email & Schedule"
      description="Where and when to send your daily report"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Your Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateConfig((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="John Smith"
            className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 placeholder:text-stone-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Email Address</label>
          <input
            type="email"
            value={config.email}
            onChange={(e) => updateConfig((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 placeholder:text-stone-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors"
          />
          <p className="mt-1 text-xs text-stone-400">Daily reports will be sent to this address</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Timezone</label>
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
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Send Time</label>
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
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
