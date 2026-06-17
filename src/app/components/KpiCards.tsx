import { Film, Tv, Monitor, LayoutGrid } from "lucide-react";

interface KpiData {
  totalTitles: number;
  totalMovies: number;
  totalTVShows: number;
  totalPlatforms: number;
}

interface KpiCardsProps {
  kpi: KpiData;
  isDark: boolean;
}

export function KpiCards({ kpi, isDark }: KpiCardsProps) {
  const cards = [
    { label: "Total Titles", value: kpi.totalTitles, delta: "All platforms", icon: LayoutGrid, color: isDark ? "#E50914" : "#2563EB" },
    { label: "Total Movies", value: kpi.totalMovies, delta: `${kpi.totalTitles ? Math.round(kpi.totalMovies / kpi.totalTitles * 100) : 0}% of titles`, icon: Film, color: "#10B981" },
    { label: "Total TV Shows", value: kpi.totalTVShows, delta: `${kpi.totalTitles ? Math.round(kpi.totalTVShows / kpi.totalTitles * 100) : 0}% of titles`, icon: Tv, color: "#8B5CF6" },
    { label: "Total Platforms", value: kpi.totalPlatforms, delta: "Active platforms", icon: Monitor, color: "#F59E0B" },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-muted-foreground"
                style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif" }}
              >
                {card.label}
              </span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}18` }}>
                <Icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <div>
              <div
                className="text-card-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.05, transition: "all 0.3s ease" }}
              >
                {card.value.toLocaleString()}
              </div>
              <div className="mt-1.5 text-muted-foreground" style={{ fontSize: "0.72rem", fontFamily: "'Inter', sans-serif" }}>
                {card.delta}
              </div>
            </div>
            <div className="h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${card.label === 'Total Platforms' ? (kpi.totalPlatforms / 4) * 100 : kpi.totalTitles ? Math.min(100, (card.value / 170) * 100) : 0}%`, backgroundColor: card.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
