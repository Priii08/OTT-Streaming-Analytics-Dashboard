import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { KpiCards } from "./components/KpiCards";
import { StandardAnalytics } from "./components/StandardAnalytics";
import { AdvancedAnalytics } from "./components/AdvancedAnalytics";
import { DEFAULT_FILTERS, filterTitles, deriveChartData, type Filters } from "./data/derive";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Recompute every time filters change
  const chartData = useMemo(() => {
    const filtered = filterTitles(filters);
    return deriveChartData(filtered);
  }, [filters]);

  const accent = isDark ? "#E50914" : "#2563EB";

  return (
    <div className={isDark ? "dark" : ""} style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-background flex flex-col" style={{ minHeight: "100vh" }}>
        <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />

        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
          {/* Sidebar — fully controlled */}
          <Sidebar filters={filters} onChange={setFilters} isDark={isDark} />

          {/* Main scrollable area */}
          <main className="flex-1 overflow-y-auto" style={{ padding: "20px 24px 36px" }}>

            {/* Page heading */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.2 }}>
                  OTT Streaming Analytics
                </h1>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.76rem" }}>
                  Netflix · Prime Video · Disney+ · Hulu — Qlik Sense Mashup
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground" style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  {chartData.kpi.totalTitles} titles shown
                </span>
                {chartData.kpi.totalTitles < 170 && (
                  <span className="px-3 py-1.5 rounded-lg" style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", backgroundColor: `${accent}15`, color: accent }}>
                    Filters active
                  </span>
                )}
              </div>
            </div>

            {/* KPI Cards */}
            <KpiCards kpi={chartData.kpi} isDark={isDark} />

            <div className="border-t border-border my-6" />

            {/* Standard Charts */}
            <StandardAnalytics data={chartData} isDark={isDark} />

            <div className="border-t border-border my-6" />

            {/* Advanced Charts */}
            <AdvancedAnalytics data={chartData} isDark={isDark} />

            {/* Footer */}
            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <div className="text-muted-foreground" style={{ fontSize: "0.68rem", fontFamily: "'Inter', sans-serif" }}>
                OTT Streaming Analytics Dashboard
                <span className="font-semibold" style={{ color: accent }}>Qlik Sense</span>
                
              </div>
              <div className="flex items-center gap-5">
                {[
                  { label: "Data Source", value: "Kaggle OTT Dataset" },
                  { label: "Showing", value: `${chartData.kpi.totalTitles} titles` },
                  { label: "Platforms", value: String(chartData.kpi.totalPlatforms) },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-muted-foreground" style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                    <div className="text-foreground" style={{ fontSize: "0.7rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
