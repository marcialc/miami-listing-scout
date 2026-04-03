import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MLS_CITIES } from "@miami-listing-scout/shared";
import { useI18n } from "../i18n";

interface Props {
  selected: string[];
  onChange: (cities: string[]) => void;
  placeholder?: string;
}

export function CityAutocomplete({ selected, onChange, placeholder }: Props) {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder ?? t("filters.searchCityPlaceholder");
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [warning, setWarning] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const filtered = useMemo(() => {
    const available = MLS_CITIES.filter((c) => !selectedSet.has(c));
    return input.trim()
      ? available
          .filter((c) => c.toLowerCase().includes(input.toLowerCase()))
          .slice(0, 20)
      : available.slice(0, 20);
  }, [input, selectedSet]);

  const addCity = useCallback(
    (city: string) => {
      if (!selected.includes(city)) {
        onChange([...selected, city]);
      }
      setInput("");
      setShowDropdown(false);
      setWarning("");
      setHighlightIndex(0);
    },
    [selected, onChange],
  );

  const removeCity = useCallback(
    (index: number) => {
      onChange(selected.filter((_, i) => i !== index));
    },
    [selected, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0 && highlightIndex < filtered.length) {
        addCity(filtered[highlightIndex]);
      } else if (input.trim()) {
        addCity(input.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setWarning("");
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      removeCity(selected.length - 1);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightIndex(0);
  }, [input]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap gap-2 p-2.5 border border-stone-300 rounded-lg bg-white focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((city, i) => (
          <span
            key={city}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-stone-100 text-stone-700 rounded-md"
          >
            {city}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeCity(i); }}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
            setWarning("");
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? resolvedPlaceholder : ""}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-stone-800 placeholder:text-stone-400"
        />
      </div>

      {warning && (
        <p className="mt-1 text-xs text-amber-600">{warning}</p>
      )}

      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-stone-200 rounded-lg shadow-lg">
          {filtered.map((city, i) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addCity(city); }}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === highlightIndex
                  ? "bg-accent-50 text-accent-700"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
