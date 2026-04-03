import type { ScoutConfig } from "@miami-listing-scout/shared";
import { TagInput } from "./TagInput";
import { CityAutocomplete } from "./CityAutocomplete";
import { SectionCard } from "./SectionCard";
import { useI18n } from "../i18n";
import type { TranslationKey } from "../i18n";

interface Props {
  config: ScoutConfig;
  updateConfig: (fn: (prev: ScoutConfig) => ScoutConfig) => void;
}

const PROPERTY_TYPES: { value: string; labelKey: TranslationKey }[] = [
  { value: "Single Family", labelKey: "propertyType.singleFamily" },
  { value: "Condo", labelKey: "propertyType.condo" },
  { value: "Townhouse", labelKey: "propertyType.townhouse" },
  { value: "Multi-Family", labelKey: "propertyType.multiFamily" },
  { value: "Land", labelKey: "propertyType.land" },
];

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
  noMinLabel,
  noMaxLabel,
}: {
  label: string;
  min: number | undefined;
  max: number | undefined;
  onMinChange: (v: number | undefined) => void;
  onMaxChange: (v: number | undefined) => void;
  options: { value: number; label: string }[];
  noMinLabel: string;
  noMaxLabel: string;
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
          <option value="">{noMinLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={max ?? ""}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          className="text-sm border border-stone-300 rounded-lg py-2.5 px-3 bg-white text-stone-800 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none transition-colors cursor-pointer"
        >
          <option value="">{noMaxLabel}</option>
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
  const { t } = useI18n();
  const f = config.baseFilters;

  function updateFilter<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    updateConfig((prev) => ({
      ...prev,
      baseFilters: { ...prev.baseFilters, [key]: value },
    }));
  }

  return (
    <SectionCard
      title={t("filters.title")}
      description={t("filters.description")}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("filters.cities")}</label>
          <CityAutocomplete
            selected={f.cities}
            onChange={(v) => updateFilter("cities", v)}
            placeholder={t("filters.searchCityPlaceholder")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("filters.priceRange")}</label>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              value={f.minPrice}
              onChange={(v) => updateFilter("minPrice", v)}
              placeholder={t("filters.min")}
              prefix="$"
            />
            <NumberInput
              value={f.maxPrice}
              onChange={(v) => updateFilter("maxPrice", v)}
              placeholder={t("filters.max")}
              prefix="$"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <RangeSelect
            label={t("filters.bedrooms")}
            min={f.minBeds}
            max={f.maxBeds}
            onMinChange={(v) => updateFilter("minBeds", v)}
            onMaxChange={(v) => updateFilter("maxBeds", v)}
            options={BED_OPTIONS}
            noMinLabel={t("filters.noMin")}
            noMaxLabel={t("filters.noMax")}
          />
          <RangeSelect
            label={t("filters.bathrooms")}
            min={f.minBaths}
            max={f.maxBaths}
            onMinChange={(v) => updateFilter("minBaths", v)}
            onMaxChange={(v) => updateFilter("maxBaths", v)}
            options={BATH_OPTIONS}
            noMinLabel={t("filters.noMin")}
            noMaxLabel={t("filters.noMax")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("filters.sqft")}</label>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              value={f.minSqft}
              onChange={(v) => updateFilter("minSqft", v)}
              placeholder={t("filters.minSqft")}
            />
            <NumberInput
              value={f.maxSqft}
              onChange={(v) => updateFilter("maxSqft", v)}
              placeholder={t("filters.maxSqft")}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("filters.propertyTypes")}</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(({ value, labelKey }) => {
              const active = f.propertyTypes.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    updateFilter(
                      "propertyTypes",
                      active
                        ? f.propertyTypes.filter((t) => t !== value)
                        : [...f.propertyTypes, value],
                    );
                  }}
                  className={`px-3.5 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? "bg-accent-50 border-accent-300 text-accent-700 font-medium"
                      : "bg-white border-stone-300 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{t("filters.keywords")}</label>
          <TagInput
            tags={f.keywords}
            onChange={(v) => updateFilter("keywords", v)}
            placeholder={t("filters.keywordsPlaceholder")}
          />
          <p className="mt-1 text-xs text-stone-400">{t("filters.keywordsHelp")}</p>
        </div>
      </div>
    </SectionCard>
  );
}
