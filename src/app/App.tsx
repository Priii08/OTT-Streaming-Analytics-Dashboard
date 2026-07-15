import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { KpiCards } from "./components/KpiCards";
import { StandardAnalytics } from "./components/StandardAnalytics";
import { AdvancedAnalytics } from "./components/AdvancedAnalytics";
import { DEFAULT_FILTERS, deriveChartData, type Filters } from "./data/derive";
import { titles as fallbackTitles, type Title } from "./data/dataset";
import { fetchQlikDashboardData, type QlikFilterOptions } from "../qlik/dashboard";
import {
  hasQlikSession,
  isQlikReturnRedirect,
  cleanUpReturnMarker,
  redirectToQlikLogin,
  buildQlikLoginUrl,
  debugReturnToUrl,
  resolvedAppOrigin,
} from "../qlik/auth";
import { qlikConfig } from "../qlik/config";

type QlikStatus = "idle" | "checking" | "connected" | "loading" | "fallback" | "error";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [liveTitles, setLiveTitles] = useState<Title[]>(fallbackTitles);
  const [liveOptions, setLiveOptions] = useState<QlikFilterOptions | undefined>(undefined);
  const [qlikStatus, setQlikStatus] = useState<QlikStatus>("checking");
  const [qlikError, setQlikError] = useState<string | null>(null);

  // On mount: silently check for an existing Qlik session.
  // We NEVER auto-redirect — the dashboard always loads first.
  useEffect(() => {
    let active = true;

    async function initQlik() {
      // If we're returning from a Qlik login redirect, clean up the URL marker first.
      const returningFromLogin = isQlikReturnRedirect();
      if (returningFromLogin) cleanUpReturnMarker();

      // Check silently for an existing session.
      setQlikStatus("checking");
      const hasSession = await hasQlikSession();

      if (!active) return;

      if (!hasSession) {
        // No session — show the dashboard with fallback data.
        // User can click "Connect to Qlik Cloud" when ready.
        setQlikStatus("fallback");
        return;
      }

      // Session exists — load live data.
      setQlikStatus("loading");
      try {
        const data = await fetchQlikDashboardData();
        if (!active) return;
        setLiveTitles(data.titles.length > 0 ? data.titles : fallbackTitles);
        setLiveOptions(data.options);
        setQlikStatus("connected");
      } catch (err) {
        if (!active) return;
        setQlikError(err instanceof Error ? err.message : "Failed to load Qlik data");
        setQlikStatus("error");
      }
    }

    void initQlik();
    return () => { active = false; };
  }, []);

  const qlikReady = qlikStatus === "connected";
  const accent = isDark ? "#E50914" : "#2563EB";

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

  return (
    <div className={isDark ? "dark" : ""} style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-background flex flex-col" style={{ minHeight: "100vh" }}>
        <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} qlikReady={qlikReady} />

        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 60px)" }}>
          <Sidebar filters={filters} onChange={setFilters} isDark={isDark} liveOptions={liveOptions} />

          <main className="flex-1 overflow-y-auto" style={{ padding: "20px 24px 36px" }}>

            {/* Page heading */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.2 }}>
                  OTT Streaming Analytics
                </h1>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.76rem" }}>
                  {qlikReady
                    ? "Live Qlik Cloud data"
                    : qlikStatus === "checking" || qlikStatus === "loading"
                    ? "Connecting to Qlik Cloud…"
                    : "Showing bundled sample data"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground" style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  {chartData.kpi.totalTitles} titles shown
                </span>
                {!qlikReady && (
                  <span className="px-3 py-1.5 rounded-lg" style={{ fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", backgroundColor: `${accent}15`, color: accent }}>
                    Fallback data
                  </span>
                )}
              </div>
            </div>

            {/* ── Qlik Connection Banner ── */}
            {(qlikStatus === "fallback" || qlikStatus === "error") && (
              <div
                className="mb-4 rounded-xl border px-4 py-3 flex items-start justify-between gap-4 flex-wrap"
                style={{
                  borderColor: qlikStatus === "error" ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.35)",
                  backgroundColor: qlikStatus === "error" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                }}
              >
                <div>
                  <p className="font-semibold" style={{ fontSize: "0.82rem", color: qlikStatus === "error" ? "#f87171" : "#f59e0b" }}>
                    {qlikStatus === "error" ? "⚠ Qlik data load failed" : "🔌 Not connected to Qlik Cloud"}
                  </p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.73rem" }}>
                    {qlikStatus === "error"
                      ? `Using sample data. Error: ${qlikError}`
                      : "The dashboard is showing bundled sample data. Click to sign in to Qlik Cloud and load live data."}
                  </p>
                </div>
                <button
                  onClick={() => redirectToQlikLogin()}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    background: accent,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Connect to Qlik Cloud →
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {(qlikStatus === "checking" || qlikStatus === "loading") && (
              <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/8 px-4 py-3 text-blue-400" style={{ fontSize: "0.78rem" }}>
                {qlikStatus === "checking" ? "Checking Qlik Cloud session…" : "Loading live Qlik data…"}
              </div>
            )}

            {/* Debug Panel */}
            <details className="mb-4 rounded-xl border border-border bg-accent/5 px-4 py-3" style={{ fontSize: "0.75rem" }}>
              <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">🔍 Auth Debug Info</summary>
              <div className="mt-3 space-y-2 font-mono text-muted-foreground">
                <div>
                  <span className="text-foreground font-bold">Origin sent as returnto (must be in Qlik whitelist):</span>
                  <br />
                  <code className="text-amber-400" style={{ fontSize: "0.85rem" }}>{resolvedAppOrigin()}</code>
                </div>
                <div>
                  <span className="text-foreground">Full returnto URL:</span>
                  <br />
                  <code className="block break-all text-foreground">{debugReturnToUrl()}</code>
                </div>
                <div>
                  <span className="text-foreground">Browser window.location.origin:</span>
                  <br />
                  <code style={{ color: resolvedAppOrigin() === window.location.origin ? "#22c55e" : "#f87171" }}>
                    {window.location.origin}
                    {resolvedAppOrigin() !== window.location.origin && " ← differs from VITE_APP_ORIGIN"}
                  </code>
                </div>
                <div>
                  <span className="text-foreground">VITE_APP_ORIGIN:</span>
                  <br />
                  <code>{qlikConfig.appOrigin || "(not set)"}</code>
                </div>
                <div>
                  <span className="text-foreground">Qlik status:</span>{" "}
                  <code className="text-foreground">{qlikStatus}</code>
                </div>
                <div>
                  <span className="text-foreground">Web integration ID:</span>
                  <br />
                  <code>{qlikConfig.webIntegrationId}</code>
                </div>
                <div>
                  <span className="text-foreground">Full login URL (for manual test):</span>
                  <br />
                  <code className="block break-all text-foreground">{buildQlikLoginUrl()}</code>
                </div>
              </div>
            </details>

            {/* KPI Cards */}
            <KpiCards kpi={chartData.kpi} isDark={isDark} />

            <div className="border-t border-border my-6" />

            <StandardAnalytics data={chartData} isDark={isDark} />

            <div className="border-t border-border my-6" />

            <AdvancedAnalytics data={chartData} isDark={isDark} />

            {/* Footer */}
            <div className="mt-8 pt-5 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <div className="text-muted-foreground" style={{ fontSize: "0.68rem", fontFamily: "'Inter', sans-serif" }}>
                OTT Streaming Analytics Dashboard ·{" "}
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
