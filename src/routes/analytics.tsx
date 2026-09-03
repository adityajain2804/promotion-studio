import { createFileRoute } from "@tanstack/react-router";
import { Activity, MapPin } from "lucide-react";
import { KpiCard, Panel, StatusPill } from "@/components/common/primitives";
import { ANALYTICS_KPIS, ONGOING_PROMOS, REGIONS } from "@/data/analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — FarmaTodo Promotion Intelligence Studio" },
      {
        name: "description",
        content:
          "Historical baselines, live promotional telemetry and regional performance across Bogotá, Medellín, Cali and Caracas/Maracaibo.",
      },
      { property: "og:title", content: "Analytics — FarmaTodo Promotion Intelligence Studio" },
      { property: "og:description", content: "Baseline demand, ongoing promotions and regional cannibalization risk." },
    ],
  }),
  component: AnalyticsPage,
});

const RISK_TONE = { Low: "pass", Moderate: "warn", High: "fail" } as const;
const STATUS_TONE = { Live: "pass", Ramping: "info", "Ending Soon": "warn" } as const;
const REGION_ACCENT: Record<string, string> = {
  "Bogotá": "border-l-success",
  "Medellín": "border-l-primary",
  Cali: "border-l-danger",
  "Caracas / Maracaibo": "border-l-warning",
};

function AnalyticsPage() {
  return (
    <div className="space-y-3">
      <h1 className="sr-only">Promotion analytics and regional performance</h1>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {ANALYTICS_KPIS.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} tip={k.tip} compact />
        ))}
      </div>

      <Panel
        title="Ongoing Promotions"
        subtitle="Live campaigns currently executing in market"
        bodyClassName="p-0"
        right={
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
            <Activity className="h-3.5 w-3.5" /> {ONGOING_PROMOS.length} active
          </span>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[820px] border-collapse text-[11px]">
            <thead className="bg-surface-muted/70">
              <tr>
                {["Campaign & ID", "Duration", "Distribution Channel", "Category Scope", "Discount Depths (Reg / Prime)", "Status"].map((h) => (
                  <th key={h} className="border-b border-border px-3 py-2 text-left font-medium whitespace-nowrap text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ONGOING_PROMOS.map((p) => (
                <tr key={p.id} className="border-b border-border/70 last:border-0 hover:bg-info-soft/50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.campaignId}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums text-muted-foreground">{p.duration}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{p.channel}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{p.scope}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium tabular-nums text-primary">
                    {p.regular}% / {p.prime}%
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill tone={STATUS_TONE[p.status]}>{p.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Regional Performance Breakdown" subtitle="Colour by region · baseline vs. active promo velocity" bodyClassName="p-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {REGIONS.map((r) => (
            <div
              key={r.region}
              className={`rounded-lg border border-border border-l-4 bg-surface p-3 shadow-card ${REGION_ACCENT[r.region] ?? "border-l-primary"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {r.region}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.regime} {r.cap}% cap
                  </div>
                </div>
                <StatusPill tone={RISK_TONE[r.risk]}>{r.risk} risk</StatusPill>
              </div>

              <dl className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Baseline run rate</dt>
                  <dd className="font-medium tabular-nums">{r.baseline}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Active promo velocity</dt>
                  <dd className="font-semibold tabular-nums text-success">
                    {r.promoVelocity} <span className="font-medium">(+{r.velocityDelta}%)</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Avg. discount depth</dt>
                  <dd className={`font-medium tabular-nums ${r.avgDepth > r.cap ? "text-danger" : "text-foreground"}`}>{r.avgDepth}%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Cannibalization risk</dt>
                  <dd className="font-medium">{r.risk}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
