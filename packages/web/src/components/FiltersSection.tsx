import type { ScoutConfig } from "@miami-listing-scout/shared";
import { TagInput } from "./TagInput";
import { SectionCard } from "./SectionCard";

interface Props {
  config: ScoutConfig;
  updateConfig: (fn: (prev: ScoutConfig) => ScoutConfig) => void;
}

const PROPERTY_TYPES = ["Single Family", "Condo", "Townhouse", "Multi-Family", "Land"];

function NumberInput({
  value,
  onChange,
  placeholder,
  prefix,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder: string;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        value={value != null ? value.toLocaleString("en-US") : ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          onChange(raw ? parseInt(raw, 10) : undefined);
        }}
        placeholder={placeholder}
        className={`w-full text-sm border border-stone-300 rounded-lg py-2.5 bg-white text-stone-800 placeholder:text-stone-400 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors ${prefix ? "pl-7 pr-3" : "px-3"}`}
      />
    </div>
  );
}

function RangeSelect({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  options,
}: {
  label: string;
  min: number | undefined;
  max: number | undefined;
  onMinChange: (v: number | undefined) => void;
  onMaxChange: (v: number | undefined) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={min ?? ""}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
          className="text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
        >
          <option value="">No min</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={max ?? ""}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          className="text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
        >
          <option value="">No max</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const BED_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: `${n}${n === 6 ? "+" : ""}` }));
const BATH_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}${n === 5 ? "+" : ""}` }));

export function FiltersSection({ config, updateConfig }: Props) {
  const f = config.baseFilters;

  function updateFilter<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    updateConfig((prev) => ({
      ...prev,
      baseFilters: { ...prev.baseFilters, [key]: value },
    }));
  }

  return (
    <SectionCard
      title="Search Filters"
      description="Define what listings to scout for you each day"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Cities</label>
          <TagInput
            tags={f.cities}
            onChange={(v) => updateFilter("cities", v)}
            placeholder="Type a city and press Enter..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Price Range</label>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              value={f.minPrice}
              onChange={(v) => updateFilter("minPrice", v)}
              placeholder="Min"
              prefix="$"
            />
            <NumberInput
              value={f.maxPrice}
              onChange={(v) => updateFilter("maxPrice", v)}
              placeholder="Max"
              prefix="$"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <RangeSelect
            label="Bedrooms"
            min={f.minBeds}
            max={f.maxBeds}
            onMinChange={(v) => updateFilter("minBeds", v)}
            onMaxChange={(v) => updateFilter("maxBeds", v)}
            options={BED_OPTIONS}
          />
          <RangeSelect
            label="Bathrooms"
            min={f.minBaths}
            max={f.maxBaths}
            onMinChange={(v) => updateFilter("minBaths", v)}
            onMaxChange={(v) => updateFilter("maxBaths", v)}
            options={BATH_OPTIONS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Square Footage</label>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              value={f.minSqft}
              onChange={(v) => updateFilter("minSqft", v)}
              placeholder="Min sqft"
            />
            <NumberInput
              value={f.maxSqft}
              onChange={(v) => updateFilter("maxSqft", v)}
              placeholder="Max sqft"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Property Types</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => {
              const active = f.propertyTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    updateFilter(
                      "propertyTypes",
                      active
                        ? f.propertyTypes.filter((t) => t !== type)
                        : [...f.propertyTypes, type],
                    );
                  }}
                  className={`px-3.5 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? "bg-accent-50 border-accent-300 text-accent-700 font-medium"
                      : "bg-white border-stone-300 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Keywords</label>
          <TagInput
            tags={f.keywords}
            onChange={(v) => updateFilter("keywords", v)}
            placeholder="Search terms for MLS remarks..."
          />
          <p className="mt-1 text-xs text-stone-400">Matches against the listing's public remarks</p>
        </div>
      </div>
    </SectionCard>
  );
}
