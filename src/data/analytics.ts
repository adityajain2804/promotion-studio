export const ANALYTICS_KPIS = [
  { label: "90-Day Organic Baseline Revenue", value: "$248.5K", sub: "No promotion applied", tip: "Organic revenue over the last 90 days with no promotional treatment." },
  { label: "Historical Coupon Redemption", value: "28.4%", sub: "Trailing 4 campaigns", tip: "Average redemption rate across recent coupon campaigns." },
  { label: "Steady-State Organic Run Rate", value: "1,200 units/week", sub: "Baseline velocity", tip: "Units per week sold without promotional support." },
  { label: "Active Ongoing Promos", value: "4 Live Campaigns", sub: "Across 3 channels", tip: "Campaigns currently executing in market." },
];

export type OngoingPromo = {
  id: string;
  name: string;
  campaignId: string;
  duration: string;
  channel: string;
  scope: string;
  regular: number;
  prime: number;
  status: "Live" | "Ramping" | "Ending Soon";
};

export const ONGOING_PROMOS: OngoingPromo[] = [
  { id: "1", name: "Mid-Year", campaignId: "AWARE-2025-VIT", duration: "01 Jun – 30 Jun", channel: "Digital CRM", scope: "Vitamins · Personal Care", regular: 15, prime: 20, status: "Live" },
  { id: "2", name: "OTC Boost", campaignId: "OTC-2025-ANLG", duration: "10 Jun – 24 Jun", channel: "In-Store POS", scope: "OTC Analgesics", regular: 12, prime: 18, status: "Ramping" },
  { id: "3", name: "Beauty Week", campaignId: "BTY-2025-DERM", duration: "05 Jun – 12 Jun", channel: "App / Web", scope: "Dermocosmetics", regular: 20, prime: 25, status: "Ending Soon" },
  { id: "4", name: "Wellness Reset", campaignId: "WLN-2025-RSET", duration: "01 Jun – 15 Jul", channel: "Digital CRM", scope: "Wellness · Supplements", regular: 10, prime: 14, status: "Live" },
];

export type RegionRow = {
  region: string;
  regime: string;
  cap: number;
  baseline: string;
  promoVelocity: string;
  velocityDelta: number;
  avgDepth: number;
  risk: "Low" | "Moderate" | "High";
};

export const REGIONS: RegionRow[] = [
  { region: "Bogotá", regime: "INVIMA", cap: 30, baseline: "1,420 u/wk", promoVelocity: "1,905 u/wk", velocityDelta: 34.2, avgDepth: 17.4, risk: "Low" },
  { region: "Medellín", regime: "INVIMA", cap: 30, baseline: "980 u/wk", promoVelocity: "1,244 u/wk", velocityDelta: 26.9, avgDepth: 19.1, risk: "Moderate" },
  { region: "Cali", regime: "INVIMA", cap: 30, baseline: "760 u/wk", promoVelocity: "868 u/wk", velocityDelta: 14.2, avgDepth: 22.6, risk: "High" },
  { region: "Caracas / Maracaibo", regime: "SUNDDE", cap: 25, baseline: "540 u/wk", promoVelocity: "651 u/wk", velocityDelta: 20.5, avgDepth: 15.8, risk: "Moderate" },
];
