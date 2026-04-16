"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Search } from "lucide-react";
import { COUNTRY_OPTIONS } from "../app/lib/country-options";

type Tone = "dark" | "light";

type CountryDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  tone?: Tone;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
};

const toneStyles: Record<
  Tone,
  {
    trigger: string;
    popover: string;
    search: string;
    option: string;
    optionActive: string;
    optionSelected: string;
    helper: string;
  }
> = {
  dark: {
    trigger: "border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder:text-slate-600",
    popover: "border-slate-700/70 bg-slate-900/95 text-slate-100 shadow-[0_24px_60px_rgba(2,6,23,0.55)]",
    search: "border-slate-700/70 bg-slate-950/80 text-slate-100 placeholder:text-slate-500",
    option: "text-slate-200 hover:bg-slate-800/90",
    optionActive: "bg-slate-800/90",
    optionSelected: "bg-indigo-500/15 text-white",
    helper: "text-slate-500",
  },
  light: {
    trigger: "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
    popover: "border-slate-200 bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.14)]",
    search: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
    option: "text-slate-700 hover:bg-slate-100",
    optionActive: "bg-slate-100",
    optionSelected: "bg-indigo-500/10 text-slate-950",
    helper: "text-slate-500",
  },
};

export default function CountryDropdown({
  value,
  onChange,
  tone = "dark",
  placeholder = "Select your country",
  searchPlaceholder = "Search countries",
  className = "",
}: CountryDropdownProps) {
  const styles = toneStyles[tone];
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter((option) => option.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (!isOpen || filteredOptions.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const option = filteredOptions[activeIndex];
        if (option) {
          onChange(option);
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, filteredOptions, isOpen, onChange]);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setActiveIndex(0);

    const id = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!value) return;
    const index = filteredOptions.findIndex((option) => option === value);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(index >= 0 ? index : 0);
  }, [filteredOptions, value]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-14 w-full items-center gap-3 rounded-2xl border px-4 text-left outline-none transition focus:border-indigo-500 ${styles.trigger}`}
      >
        <Globe className="h-5 w-5 shrink-0 text-slate-500" />
        <span className={`min-w-0 flex-1 truncate text-sm font-medium ${value ? "" : styles.helper}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-3xl border ${styles.popover}`}
        >
          <div className="border-b border-white/10 p-3">
            <div className="relative">
              <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${styles.helper}`} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder={searchPlaceholder}
                className={`w-full rounded-2xl border py-2.5 pl-10 pr-3 text-sm outline-none transition ${styles.search}`}
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const selected = option === value;
                const active = index === activeIndex;

                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${styles.option} ${
                      active ? styles.optionActive : ""
                    } ${selected ? styles.optionSelected : ""}`}
                  >
                    <span>{option}</span>
                    {selected && <Check className="h-4 w-4 text-indigo-400" />}
                  </button>
                );
              })
            ) : (
              <div className={`px-4 py-5 text-sm ${styles.helper}`}>No countries match your search.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
