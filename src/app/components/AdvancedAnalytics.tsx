import {
  Treemap, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartData } from "../data/derive";
import { PLATFORM_COLORS } from "../data/dataset";

interface Props { data: ChartData; isDark: boolean }

const grid = (d: boolean) => d ? "#334155" : "#E2E8F0";
const tick = (d: boolean) => d ? "#94A3B8" : "#64748B";
const tt = (d: boolean) => ({
  backgroundColor: d ? "#1E293B" : "#FFFFFF",
  border: `1px solid ${d ? "#334155" : "#E2E8F0"}`,
  borderRadius: "10px", color: d ? "#F8FAFC" : "#0F172A",
  fontSize: "0.73rem", fontFamily: "'Inter', sans-serif",
  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
});

function Empty() {
  return (
    <div className="flex items-center justify-center h-40 text-muted-foreground" style={{ fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
      No data matches the current filters
    </div>
  );
}

function TreeCell({ x = 0, y = 0, width = 0, height = 0, name = "", fill = "#ccc", root }: any) {
  const entry = root?.find?.((d: any) => d.name === name);
  if (width < 24 || height < 16) return null;
  return (
    <g>
      <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} fill={fill} rx={6} opacity={0.86} />
      {width > 46 && height > 28 && (
        <text x={x + 9} y={y + 17} fill="#fff" style={{ fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {name}
        </text>
      )}
      {width > 46 && height > 40 && entry && (
        <text x={x + 9} y={y + 30} fill="rgba(255,255,255,0.72)" style={{ fontSize: "0.62rem", fontFamily: "'JetBrains Mono', monospace" }}>
          {entry.size}
        </text>
      )}
    </g>
  );
}

export function AdvancedAnalytics({ data, isDark }: Props) {
  const accent = isDark ? "#E50914" : "#2563EB";

  const platformsInScatter = Array.from(new Set(data.scatterData.map((d) => d.platform)));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-purple-500" />
        <h2 className="text-card-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Advanced Analytics
        </h2>
      </div>

      {/* Treemap + Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Genre Treemap" subtitle="Genre dominance across all OTT platforms" badge="TREEMAP" badgeColor="#8B5CF6">
          {data.treemapData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <Treemap data={data.treemapData} dataKey="size" aspectRatio={4 / 3}
                content={(props: any) => <TreeCell {...props} root={data.treemapData} />}>
                <Tooltip contentStyle={tt(isDark)} formatter={(v: number, _: string, p: any) => [v, p?.payload?.name ?? ""]} />
              </Treemap>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="IMDb vs Rotten Tomatoes" subtitle="Rating correlation for filtered titles" badge="SCATTER" badgeColor="#06B6D4">
          {data.scatterData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 16, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} />
                <XAxis dataKey="imdb" name="IMDb" type="number" domain={[5, 10]}
                  tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false} tickLine={false}
                  label={{ value: "IMDb Score", position: "insideBottom", offset: -10, fill: tick(isDark), fontSize: 11 }} />
                <YAxis dataKey="rt" name="RT%" type="number" domain={[30, 100]}
                  tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false} tickLine={false}
                  label={{ value: "RT %", angle: -90, position: "insideLeft", fill: tick(isDark), fontSize: 11 }} />
                <ZAxis dataKey="size" range={[40, 180]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ ...tt(isDark), padding: "8px 12px" }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 180 }}>{d.title}</div>
                        <div style={{ color: PLATFORM_COLORS[d.platform] ?? "#ccc" }}>● {d.platform}</div>
                        <div>IMDb: <strong>{d.imdb}</strong>  ·  RT: <strong>{d.rt}%</strong></div>
                      </div>
                    );
                  }}
                />
                {platformsInScatter.map((p) => (
                  <Scatter key={p} name={p} data={data.scatterData.filter((d) => d.platform === p)}
                    fill={PLATFORM_COLORS[p] ?? "#8B5CF6"} fillOpacity={0.82} />
                ))}
                <Legend formatter={(v) => <span style={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif", color: PLATFORM_COLORS[v] ?? "#8B5CF6" }}>{v}</span>} wrapperStyle={{ paddingTop: 8 }} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Histogram + Directors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Runtime Distribution" subtitle="Titles bucketed by runtime duration" badge="HISTOGRAM" badgeColor={accent}>
          {data.runtimeData.every((d) => d.count === 0) ? <Empty /> : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.runtimeData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: tick(isDark), fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tt(isDark)} formatter={(v: number) => [v, "Titles"]} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
                    {data.runtimeData.map((d, i) => {
                      const peak = data.runtimeData.reduce((a, b) => a.count > b.count ? a : b, data.runtimeData[0]);
                      const isPeak = d === peak && d.count > 0;
                      return <Cell key={d.range} fill={isPeak ? accent : (isDark ? "#334155" : "#BFDBFE")} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-5 mt-1">
                {[{ color: accent, label: "Peak range" }, { color: isDark ? "#334155" : "#BFDBFE", label: "Other ranges" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span className="text-muted-foreground" style={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        <ChartCard title="Top Directors Analysis" subtitle="Most prolific directors in filtered results" badge="BAR" badgeColor="#F97316">
          {data.directorsData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.directorsData} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="director" tick={{ fill: tick(isDark), fontSize: 10.5, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={tt(isDark)} formatter={(v: number) => [v, "Titles"]} />
                <Bar dataKey="titles" radius={[0, 6, 6, 0]} maxBarSize={22}
                  label={{ position: "right", fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  {data.directorsData.map((d) => <Cell key={d.director} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
