import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
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

const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-40 text-muted-foreground" style={{ fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
      No data matches the current filters
    </div>
  );
}

export function StandardAnalytics({ data, isDark }: Props) {
  const accent = isDark ? "#E50914" : "#2563EB";

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader label="Standard Analytics" color={accent} />

      {/* Content Growth Trend */}
      <ChartCard title="Content Growth Trend" subtitle="Cumulative titles added per platform (2015–2023)" badge="LINE" badgeColor={accent}>
        {data.platformData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data.growthData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt(isDark)} formatter={(v: number, n: string) => [v, n]} />
              <Legend wrapperStyle={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif", paddingTop: 8 }} />
              {['Netflix','Prime','Disney+','Hulu'].map((key) => {
                const c = key === 'Prime' ? PLATFORM_COLORS['Prime Video'] : PLATFORM_COLORS[key] ?? "#64748B";
                const visible = data.growthData.some((d) => (d[key] as number) > 0);
                return visible ? <Line key={key} type="monotone" dataKey={key} stroke={c} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} /> : null;
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Platform + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ChartCard title="Platform Distribution" subtitle="Total titles per streaming platform" badge="BAR" badgeColor="#00A8E0">
            {data.platformData.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={data.platformData} layout="vertical" margin={{ top: 4, right: 40, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} horizontal={false} />
                  <XAxis type="number" tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="platform" tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} width={82} />
                  <Tooltip contentStyle={tt(isDark)} formatter={(v: number) => [v.toLocaleString(), "Titles"]} />
                  <Bar dataKey="titles" radius={[0, 6, 6, 0]} maxBarSize={32} label={{ position: "right", fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    {data.platformData.map((d) => <Cell key={d.platform} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
        <div className="lg:col-span-2">
          <ChartCard title="Movies vs TV Shows" subtitle="Content type split across platforms" badge="DONUT" badgeColor="#8B5CF6">
            {data.contentTypeData.length === 0 ? <Empty /> : (
              <div className="flex flex-col items-center gap-2">
                <ResponsiveContainer width="100%" height={165}>
                  <PieChart>
                    <Pie data={data.contentTypeData} cx="50%" cy="50%" innerRadius={48} outerRadius={74}
                      paddingAngle={4} dataKey="value" labelLine={false} label={<PieLabel />}>
                      {data.contentTypeData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tt(isDark)} formatter={(v: number) => [v.toLocaleString(), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-5 justify-center">
                  {data.contentTypeData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                      <div>
                        <div className="text-card-foreground" style={{ fontSize: "0.7rem", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{d.name}</div>
                        <div className="text-muted-foreground" style={{ fontSize: "0.64rem", fontFamily: "'JetBrains Mono', monospace" }}>{d.value.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Genre + Country */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Genre Analysis" subtitle="Top genres by total titles across all platforms" badge="BAR" badgeColor="#10B981">
          {data.genreData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.genreData} layout="vertical" margin={{ top: 4, right: 36, left: 52, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} horizontal={false} />
                <XAxis type="number" tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="genre" tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} width={72} />
                <Tooltip contentStyle={tt(isDark)} formatter={(v: number) => [v, "Titles"]} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22} label={{ position: "right", fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  {data.genreData.map((d) => <Cell key={d.genre} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Country-wise Content Analysis" subtitle="Total titles by country of origin" badge="BAR" badgeColor="#F59E0B">
          {data.countryData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.countryData} layout="vertical" margin={{ top: 4, right: 36, left: 56, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid(isDark)} horizontal={false} />
                <XAxis type="number" tick={{ fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fill: tick(isDark), fontSize: 10.5, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} width={92} />
                <Tooltip contentStyle={tt(isDark)} formatter={(v: number) => [v, "Titles"]} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22} label={{ position: "right", fill: tick(isDark), fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  {data.countryData.map((d) => <Cell key={d.country} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function SectionHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-card-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </h2>
    </div>
  );
}
