interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  badgeColor?: string;
}

export function ChartCard({ title, subtitle, children, className = "", badge, badgeColor }: ChartCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-card-foreground font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "0.75rem" }}>
              {subtitle}
            </p>
          )}
        </div>
        {badge && (
          <span
            className="px-2 py-0.5 rounded-full shrink-0"
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              backgroundColor: badgeColor ? `${badgeColor}20` : "#2563EB20",
              color: badgeColor ?? "#2563EB",
              letterSpacing: "0.02em",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
