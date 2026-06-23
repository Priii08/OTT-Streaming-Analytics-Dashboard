import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { KpiCards } from "./components/KpiCards";
import { StandardAnalytics } from "./components/StandardAnalytics";
import { AdvancedAnalytics } from "./components/AdvancedAnalytics";
import { DEFAULT_FILTERS, deriveChartData, type Filters } from "./data/derive";
import { titles as fallbackTitles, type Title } from "./data/dataset";
import { fetchQlikDashboardData, type QlikFilterOptions } from "../qlik/dashboard";
import { buildQlikLoginUrl, ensureQlikAuthenticated } from "../qlik/auth";
import { qlikConfig } from "../qlik/config";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [liveTitles, setLiveTitles] = useState<Title[]>(fallbackTitles);
  const [liveOptions, setLiveOptions] = useState<QlikFilterOptions | undefined>(undefined);
  const [qlikReady, setQlikReady] = useState(false);
  const [qlikError, setQlikError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadQlikData() {
      try {
        setQlikError(null);
        const auth = await ensureQlikAuthenticated();
        if (!auth.authenticated || auth.redirected) {
          return;
        }

        const data = await fetchQlikDashboardData();
        if (!active) {
          return;
        }

        setLiveTitles(data.titles.length > 0 ? data.titles : fallbackTitles);
        setLiveOptions(data.options);
        setQlikReady(true);
      } catch (error) {
        if (!active) {
          return;
        }

        setQlikError(error instanceof Error ? error.message : "Failed to load Qlik data");
        setQlikReady(false);
      }
    }

    void loadQlikData();

    return () => {
      active = false;
    };
  }, []);

  // Recompute every time filters change
  const chartData = useMemo(() => {
    return deriveChartData(liveTitles.filter((title) => {
      if (filters.platforms.length && !filters.platforms.includes(title.platform)) return false;
      if (filters.contentType !== "all" && title.type !== filters.contentType) return false;
      if (filters.genres.length && !filters.genres.includes(title.genre)) return false;
      if (filters.countries.length && !filters.countries.includes(title.country)) return false;
      if (title.releaseYear < filters.releaseYearFrom || title.releaseYear > filters.releaseYearTo) return false;
      if (filters.ageRatings.length && !filters.ageRatings.includes(title.ageRating)) return false;
      return true;
    }));
  }, [filters, liveTitles]);

  const accent = isDark ? "#E50914" : "#2563EB";

  return (
    <div className={isDark ? "dark" : ""} style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-background flex flex-col" style={{ minHeight: "100vh" }}>
        <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />

        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
          {/* Sidebar — fully controlled */}
          <Sidebar filters={filters} onChange={setFilters} isDark={isDark} liveOptions={liveOptions} />

          {/* Main scrollable area */}
          <main className="flex-1 overflow-y-auto" style={{ padding: "20px 24px 36px" }}>

            {/* Page heading */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.2 }}>
                  OTT Streaming Analytics
                </h1>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.76rem" }}>
                  {qlikReady ? "Live Qlik Cloud data from the OTT app" : "Qlik Cloud session required to load live data"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground" style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  {chartData.kpi.totalTitles} titles shown
                </span>
                {chartData.kpi.totalTitles < 170 && (
                  <span className="px-3 py-1.5 rounded-lg" style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", backgroundColor: `${accent}15`, color: accent }}>
                    {qlikReady ? "Filters active" : "Fallback data"}
                  </span>
                )}
              </div>
            </div>

            {!qlikReady && !qlikError && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-600" style={{ fontSize: "0.78rem" }}>
                Live Qlik data is not available yet. Sign in to Qlik Cloud using the web integration allowed origin, then reload the app.
                <div className="mt-2">
                  <a
                    href={buildQlikLoginUrl()}
                    className="inline-flex items-center rounded-lg border border-amber-400/40 px-3 py-1.5 font-semibold text-amber-600 hover:bg-amber-500/20"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Qlik login
                  </a>
                </div>
              </div>
            )}

            {qlikError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200" style={{ fontSize: "0.78rem" }}>
                Qlik connection failed, showing bundled sample data instead. {qlikError}
              </div>
            )}

            {/* Debug Panel */}
            <details className="mb-4 rounded-xl border border-border bg-accent/5 px-4 py-3" style={{ fontSize: "0.75rem" }}>
              <summary className="cursor-pointer font-semibold text-foreground hover:text-accent">Debug Info</summary>
              <div className="mt-3 space-y-2 font-mono text-muted-foreground">
                <div>
                  <span className="text-foreground">Window origin:</span>
                  <br />
                  <code className="text-foreground">{window.location.origin}</code>
                </div>
                <div>
                  <span className="text-foreground">Qlik app origin (env var):</span>
                  <br />
                  <code className="text-foreground">{qlikConfig.appOrigin || "(not set)"}</code>
                </div>
                <div>
                  <span className="text-foreground">Qlik host:</span>
                  <br />
                  <code className="text-foreground">{qlikConfig.host}</code>
                </div>
                <div>
                  <span className="text-foreground">Qlik web integration ID:</span>
                  <br />
                  <code className="text-foreground">{qlikConfig.webIntegrationId}</code>
                </div>
                <div>
                  <span className="text-foreground">Qlik login return target:</span>
                  <br />
                  <code className="block break-all text-foreground">{new URL(buildQlikLoginUrl()).searchParams.get("returnto")}</code>
                </div>
                <div>
                  <span className="text-foreground">Full Qlik login URL:</span>
                  <br />
                  <code className="block break-all text-foreground">{buildQlikLoginUrl()}</code>
                </div>
              </div>
            </details>

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
                  { label: "Data Source", value: qlikReady ? "Qlik Cloud App" : "Bundled Sample Data" },
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
