import { useState } from "react";
import { ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import type { Filters } from "../data/derive";
import { DEFAULT_FILTERS } from "../data/derive";
import { ALL_PLATFORMS, ALL_GENRES, ALL_RATINGS, KNOWN_COUNTRIES, PLATFORM_COLORS } from "../data/dataset";
import type { QlikFilterOptions } from "../../qlik/dashboard";

interface SidebarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  isDark: boolean;
  liveOptions?: QlikFilterOptions;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2.5 text-card-foreground"
        style={{ cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
      >
        {title}
        <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-3 space-y-1">{children}</div>}
    </div>
  );
}

function CheckRow({
  label, count, checked, color, onChange,
}: { label: string; count: number; checked: boolean; color?: string; onChange: (v: boolean) => void }) {
  const c = color ?? "var(--primary)";
  return (
    <label className="flex items-center gap-2 cursor-pointer group py-0.5">
      <div
        onClick={() => onChange(!checked)}
        className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-all"
        style={{ borderColor: checked ? c : "var(--border)", backgroundColor: checked ? c : "transparent" }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="flex-1 text-card-foreground group-hover:text-primary transition-colors" style={{ fontSize: "0.78rem", fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
      <span className="text-muted-foreground" style={{ fontSize: "0.67rem", fontFamily: "'JetBrains Mono', monospace" }}>
        {count}
      </span>
    </label>
  );
}

export function Sidebar({ filters, onChange, isDark, liveOptions }: SidebarProps) {
  const accent = isDark ? "#E50914" : "#2563EB";
  const platformOptions = liveOptions?.platforms?.length ? liveOptions.platforms : ALL_PLATFORMS;
  const genreOptions = liveOptions?.genres?.length ? liveOptions.genres : ALL_GENRES;
  const countryOptions = liveOptions?.countries?.length ? liveOptions.countries : KNOWN_COUNTRIES;
  const ratingOptions = liveOptions?.ageRatings?.length ? liveOptions.ageRatings : ALL_RATINGS;

  function toggleItem(key: keyof Pick<Filters, 'platforms' | 'genres' | 'ageRatings'>, value: string) {
    const current = filters[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  function setPlatformAll() {
    onChange({ ...filters, platforms: [...ALL_PLATFORMS] });
  }

  const activeFiltersCount = [
    filters.platforms.length < ALL_PLATFORMS.length,
    filters.contentType !== 'all',
    filters.genres.length > 0,
    filters.countries.length > 0,
    filters.releaseYearFrom !== DEFAULT_FILTERS.releaseYearFrom || filters.releaseYearTo !== DEFAULT_FILTERS.releaseYearTo,
    filters.ageRatings.length > 0,
  ].filter(Boolean).length;

  return (
    <aside className="bg-card border-r border-border flex flex-col shrink-0" style={{ width: "248px", overflowY: "auto" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <SlidersHorizontal size={13} style={{ color: accent }} />
        <span className="text-card-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700 }}>
          Filters
        </span>
        {activeFiltersCount > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full" style={{ fontSize: "0.64rem", fontWeight: 700, backgroundColor: `${accent}20`, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
            {activeFiltersCount} active
          </span>
        )}
      </div>

      <div className="px-4 py-1 flex-1 overflow-y-auto">

        {/* Platform */}
        <Section title="Platform">
          <div className="flex gap-1 mb-2">
            <button
              onClick={setPlatformAll}
              className="text-xs px-2 py-0.5 rounded border border-border transition-colors hover:border-primary"
              style={{ fontSize: "0.65rem", fontFamily: "'Inter', sans-serif", color: "var(--muted-foreground)", cursor: "pointer" }}
            >
              All
            </button>
            {platformOptions.map((p) => (
              <button
                key={p}
                onClick={() => onChange({ ...filters, platforms: [p] })}
                className="text-xs px-2 py-0.5 rounded border transition-colors"
                style={{
                  fontSize: "0.65rem",
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  borderColor: filters.platforms.length === 1 && filters.platforms[0] === p ? PLATFORM_COLORS[p] : "var(--border)",
                  color: filters.platforms.length === 1 && filters.platforms[0] === p ? PLATFORM_COLORS[p] : "var(--muted-foreground)",
                }}
              >
                {p === 'Prime Video' ? 'Prime' : p}
              </button>
            ))}
          </div>
          {platformOptions.map((p) => (
            <CheckRow
              key={p}
              label={p}
              count={0}
              checked={filters.platforms.includes(p)}
              color={PLATFORM_COLORS[p]}
              onChange={() => toggleItem('platforms', p)}
            />
          ))}
        </Section>

        {/* Content Type */}
        <Section title="Content Type">
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {(['all', 'Movie', 'TV Show'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onChange({ ...filters, contentType: v })}
                className="px-2.5 py-1 rounded-lg border transition-all"
                style={{
                  fontSize: "0.74rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: filters.contentType === v ? 600 : 400,
                  cursor: "pointer",
                  borderColor: filters.contentType === v ? accent : "var(--border)",
                  backgroundColor: filters.contentType === v ? `${accent}15` : "transparent",
                  color: filters.contentType === v ? accent : "var(--muted-foreground)",
                }}
              >
                {v === 'all' ? 'All' : v}
              </button>
            ))}
          </div>
        </Section>

        {/* Genre */}
        <Section title="Genre" defaultOpen={false}>
          <div className="flex gap-1 mb-1.5">
            <button
              onClick={() => onChange({ ...filters, genres: [] })}
              className="text-xs px-2 py-0.5 rounded border border-border hover:border-primary transition-colors"
              style={{ fontSize: "0.65rem", fontFamily: "'Inter', sans-serif", color: "var(--muted-foreground)", cursor: "pointer" }}
            >
              All genres
            </button>
          </div>
          {genreOptions.map((g) => (
            <CheckRow
              key={g}
              label={g}
              count={0}
              checked={filters.genres.length === 0 || filters.genres.includes(g)}
              onChange={() => {
                if (filters.genres.length === 0) {
                  onChange({ ...filters, genres: ALL_GENRES.filter((x) => x !== g) });
                } else {
                  toggleItem('genres', g);
                }
              }}
            />
          ))}
        </Section>

        {/* Country */}
        <Section title="Country" defaultOpen={false}>
          <div className="flex gap-1 mb-1.5 flex-wrap">
            <button
              onClick={() => onChange({ ...filters, countries: [] })}
              className="text-xs px-2 py-0.5 rounded border transition-colors"
              style={{
                fontSize: "0.65rem", fontFamily: "'Inter', sans-serif", cursor: "pointer",
                borderColor: filters.countries.length === 0 ? accent : "var(--border)",
                color: filters.countries.length === 0 ? accent : "var(--muted-foreground)",
                backgroundColor: filters.countries.length === 0 ? `${accent}15` : "transparent",
              }}
            >
              All
            </button>
          </div>
          {countryOptions.map((c) => (
            <CheckRow
              key={c}
              label={c}
              count={0}
              checked={filters.countries.length === 0 || filters.countries.includes(c)}
              onChange={() => {
                if (filters.countries.length === 0) {
                  onChange({ ...filters, countries: KNOWN_COUNTRIES.filter((x) => x !== c) });
                } else {
                  const next = filters.countries.includes(c)
                    ? filters.countries.filter((x) => x !== c)
                    : [...filters.countries, c];
                  onChange({ ...filters, countries: next });
                }
              }}
            />
          ))}
        </Section>

        {/* Release Year */}
        <Section title="Release Year" defaultOpen={false}>
          <div className="space-y-2 pt-0.5">
            <div>
              <div className="text-muted-foreground mb-1" style={{ fontSize: "0.67rem", fontFamily: "'Inter', sans-serif" }}>From</div>
              <select
                value={filters.releaseYearFrom}
                onChange={(e) => onChange({ ...filters, releaseYearFrom: Number(e.target.value) })}
                className="w-full border border-border rounded-lg px-2 py-1.5 bg-card text-card-foreground"
                style={{ fontSize: "0.76rem", fontFamily: "'Inter', sans-serif", outline: "none", cursor: "pointer" }}
              >
                {(liveOptions?.releaseYears?.length ? liveOptions.releaseYears : [2008, 2010, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-muted-foreground mb-1" style={{ fontSize: "0.67rem", fontFamily: "'Inter', sans-serif" }}>To</div>
              <select
                value={filters.releaseYearTo}
                onChange={(e) => onChange({ ...filters, releaseYearTo: Number(e.target.value) })}
                className="w-full border border-border rounded-lg px-2 py-1.5 bg-card text-card-foreground"
                style={{ fontSize: "0.76rem", fontFamily: "'Inter', sans-serif", outline: "none", cursor: "pointer" }}
              >
                {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Age Rating */}
        <Section title="Age Rating" defaultOpen={false}>
          <div className="flex gap-1 mb-1.5">
            <button
              onClick={() => onChange({ ...filters, ageRatings: [] })}
              className="text-xs px-2 py-0.5 rounded border transition-colors"
              style={{
                fontSize: "0.65rem", fontFamily: "'Inter', sans-serif", cursor: "pointer",
                borderColor: filters.ageRatings.length === 0 ? accent : "var(--border)",
                color: filters.ageRatings.length === 0 ? accent : "var(--muted-foreground)",
                backgroundColor: filters.ageRatings.length === 0 ? `${accent}15` : "transparent",
              }}
            >
              All ratings
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {ratingOptions.map((r) => {
              const active = filters.ageRatings.length === 0 || filters.ageRatings.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => {
                    if (filters.ageRatings.length === 0) {
                      onChange({ ...filters, ageRatings: ALL_RATINGS.filter((x) => x !== r) });
                    } else {
                      toggleItem('ageRatings', r);
                    }
                  }}
                  className="px-2 py-0.5 rounded border transition-all"
                  style={{
                    fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                    borderColor: active ? accent : "var(--border)",
                    backgroundColor: active ? `${accent}12` : "transparent",
                    color: active ? accent : "var(--muted-foreground)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Reset */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-muted-foreground hover:text-card-foreground transition-all"
          style={{ fontSize: "0.74rem", fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
        >
          <RotateCcw size={12} />
          Reset All Filters
        </button>
      </div>
    </aside>
  );
}
