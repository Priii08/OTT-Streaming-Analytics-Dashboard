import { Sun, Moon, RefreshCw, Activity } from "lucide-react";

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  const now = new Date();
  const formatted = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className="border-b border-border bg-card shrink-0 z-10"
      style={{ height: "60px" }}
    >
      <div className="flex items-center justify-between h-full px-5 gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: isDark ? "#E50914" : "#2563EB" }}
          >
            <Activity size={16} color="#fff" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-card-foreground leading-none"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              Stream<span style={{ color: isDark ? "#E50914" : "#2563EB" }}>Metrics</span>
            </span>
            <span
              className="text-muted-foreground"
              style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              OTT Analytics Dashboard
            </span>
          </div>

          {/* Qlik badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border ml-2"
            style={{ fontSize: "0.68rem" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Qlik Sense Connected</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "0.72rem", fontFamily: "'Inter', sans-serif" }}>
            <RefreshCw size={11} />
            <span>Updated {formatted}</span>
          </div>

          {/* Platform pills */}
          <div className="hidden lg:flex items-center gap-1.5">
            {[
              { name: "N", color: "#E50914" },
              { name: "P", color: "#00A8E0" },
              { name: "D+", color: "#1A78C2" },
              { name: "H", color: "#1CE783" },
            ].map((p) => (
              <div
                key={p.name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: p.color, fontSize: "0.6rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {p.name}
              </div>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border transition-all duration-200 hover:shadow-sm"
            style={{
              backgroundColor: isDark ? "#334155" : "#F1F5F9",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
            }}
          >
            {isDark ? (
              <>
                <Sun size={13} className="text-card-foreground" />
                <span className="text-card-foreground hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-card-foreground" />
                <span className="text-card-foreground hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
