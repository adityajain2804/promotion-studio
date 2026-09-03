// ---------------- Unified Campaign Studio (3-vertical workspace) ----------------

export const STUDIO_CAMPAIGNS = ["Mid-Year", "OTC Boost", "Beauty Week", "Wellness Reset"];
export const STUDIO_CAMPAIGN_TYPES = ["Shot", "BigMoment", "RX Replenishment"];
export const STUDIO_CHANNELS = ["Digital CRM", "In-Store POS", "App / Web"];

export const STUDIO_CLUSTERS = [
  { id: "A", label: "Cluster A — High Frequency", tilt: 0.92 },
  { id: "B", label: "Cluster B — Category Explorer", tilt: 1.14 },
  { id: "C", label: "Cluster C — Reactivation", tilt: 1.32 },
  { id: "D", label: "Cluster D — Price Sensitive", tilt: 1.21 },
  { id: "E", label: "Cluster E — Replenishment", tilt: 0.78 },
  { id: "F", label: "Cluster F — Premium Loyal", tilt: 0.68 },
  { id: "G", label: "Cluster G — Occasional Basket", tilt: 1.05 },
] as const;

export const PRIME_TIERS = ["All", "Prime Loyalty Only", "Non-Prime"] as const;
export type PrimeTier = (typeof PRIME_TIERS)[number];

export const BASELINE = {
  organicRevenue: "$248.5K",
  repurchaseRate: "64.2%",
  runRate: "1,200 units/week",
  redemption: "28.4%",
  note: "Baseline organic demand established. Ready to evaluate causal lift.",
};

export const OVERRIDE_REASON_CODES = [
  { code: "clearance", label: "clearance — inventory clearance" },
  { code: "competitive_response", label: "competitive_response — competitor move" },
  { code: "supplier_agreement", label: "supplier_agreement — funded by supplier" },
  { code: "commercial_judgment", label: "commercial_judgment — planner discretion" },
];

export type StudioProduct = {
  sku: string;
  name: string;
  category: string;
  cluster: string;
  prime: boolean;
  baseUnits: number;
  price: number;
  marginRate: number;
  categoryCap: number;
  elasticity: number;
  organicIntent: number; // share of buyers who would buy anyway
  plateau: number;
};

export const STUDIO_PRODUCTS: StudioProduct[] = [
  { sku: "SKU-4412", name: "Nivea Soft 200ml", category: "Personal Care", cluster: "B", prime: true, baseUnits: 1200, price: 34, marginRate: 0.34, categoryCap: 30, elasticity: 1.35, organicIntent: 0.28, plateau: 22 },
  { sku: "SKU-7823", name: "Dove Beauty Bar", category: "Personal Care", cluster: "A", prime: false, baseUnits: 1850, price: 12, marginRate: 0.29, categoryCap: 30, elasticity: 1.12, organicIntent: 0.41, plateau: 18 },
  { sku: "SKU-1034", name: "Teragrip RX", category: "RX", cluster: "E", prime: true, baseUnits: 640, price: 46, marginRate: 0.41, categoryCap: 25, elasticity: 0.72, organicIntent: 0.66, plateau: 14 },
  { sku: "SKU-9901", name: "Advil Max 20s", category: "OTC", cluster: "C", prime: false, baseUnits: 980, price: 26, marginRate: 0.37, categoryCap: 30, elasticity: 1.24, organicIntent: 0.33, plateau: 20 },
  { sku: "SKU-6620", name: "La Roche-Posay Anthelios", category: "Dermocosmetics", cluster: "F", prime: true, baseUnits: 420, price: 88, marginRate: 0.46, categoryCap: 20, elasticity: 0.94, organicIntent: 0.52, plateau: 16 },
];

export type StudioRow = {
  p: StudioProduct;
  regular: number;
  prime: number;
  clamped: boolean;
  baseUnits: number;
  liftUnits: number;
  pullForward: number;
  cannibal: number;
  nim: number;
  decision: boolean;
  exposureLift: number;
  doseLift: number;
  cate: number;
  confidence: number;
};

export function computeRows(opts: {
  regular: number;
  prime: number;
  cluster: string;
  tier: PrimeTier;
  channelIndex: number;
}): StudioRow[] {
  const { regular, prime, cluster, tier, channelIndex } = opts;
  const channelFactor = [1, 0.93, 1.07][channelIndex] ?? 1;

  return STUDIO_PRODUCTS.filter((p) => (cluster === "All" ? true : p.cluster === cluster))
    .filter((p) => (tier === "All" ? true : tier === "Prime Loyalty Only" ? p.prime : !p.prime))
    .map((p) => {
      const cap = p.categoryCap;
      const reg = Math.min(regular, cap);
      const pri = Math.min(Math.max(prime, reg), cap + 5);
      const clamped = regular > cap;

      const effective = p.prime ? pri : reg;
      const tilt = STUDIO_CLUSTERS.find((c) => c.id === p.cluster)?.tilt ?? 1;
      const saturation = 1 - Math.exp(-effective / p.plateau);
      const exposureLift = 0.06 * tilt;
      const doseLift = p.elasticity * tilt * saturation * 0.9;
      const cate = exposureLift + doseLift;

      const baseUnits = Math.round(p.baseUnits * channelFactor);
      const liftUnits = Math.round(baseUnits * cate * 0.4);
      const discountCost = baseUnits * (1 + cate * 0.4) * p.price * (effective / 100);
      const grossMargin = (baseUnits * cate * 0.4) * p.price * p.marginRate;
      const pullForward = -(baseUnits * p.organicIntent * p.price * p.marginRate * (effective / 100) * 0.55);
      const cannibal = -(baseUnits * p.price * p.marginRate * saturation * 0.05);
      const giveaway = -(baseUnits * p.organicIntent * p.price * (effective / 100) * 0.4);
      const nim = grossMargin + pullForward + cannibal + giveaway * 0.35;
      const decision = nim > 0 && effective > 0 && cate > 0;

      return {
        p,
        regular: reg,
        prime: pri,
        clamped,
        baseUnits,
        liftUnits,
        pullForward,
        cannibal,
        nim,
        decision,
        exposureLift,
        doseLift,
        cate,
        confidence: Math.round(72 + saturation * 20),
        discountCost,
      } as StudioRow & { discountCost: number };
    });
}

export function responseCurveFor(p: StudioProduct) {
  return Array.from({ length: 11 }, (_, i) => {
    const depth = i * 5;
    const saturation = 1 - Math.exp(-depth / p.plateau);
    return { depth, units: Number((p.elasticity * saturation).toFixed(3)) };
  });
}

// ---------------- Blueprint 4.2 — Governed audience selection ----------------

export const AUDIENCE_TYPES = [
  { id: "mass_general", label: "Mass / General", desc: "All identifiable store & digital shoppers" },
  { id: "personalized_segment", label: "Personalized Segment", desc: "Targeted by affinity rank & Prime tier" },
  { id: "reactivation", label: "Reactivation", desc: "Lapsed buyers outside repurchase cycle" },
  { id: "cyclical_replenishment_rx", label: "Cyclical Replenishment (RX)", desc: "Contacted via replenishment cadence" },
] as const;

export type AudienceTypeId = (typeof AUDIENCE_TYPES)[number]["id"];

export const CLUSTER_META = [
  { id: "A", n: 1, short: "Cluster 1", name: "Champions / High Frequency" },
  { id: "B", n: 2, short: "Cluster 2", name: "Loyalists / Category Explorers" },
  { id: "C", n: 3, short: "Cluster 3", name: "Promising / Growth" },
  { id: "D", n: 4, short: "Cluster 4", name: "At Risk / Price Sensitive" },
  { id: "E", n: 5, short: "Cluster 5", name: "Reactivation / Lapsed" },
  { id: "F", n: 6, short: "Cluster 6", name: "Replenishment / High Habit" },
  { id: "G", n: 7, short: "Cluster 7", name: "Low Engagement / Occasional Basket" },
] as const;

export const CAMPAIGN_IDS: Record<string, string> = {
  "Mid-Year": "AWARE-2025-VIT",
  "OTC Boost": "OTC-2025-ANLG",
  "Beauty Week": "BTY-2025-DERM",
  "Wellness Reset": "WLN-2025-RSET",
};

export const EXEC_KPIS = [
  { label: "Incremental Overall Revenue", value: "$1.24M", delta: 17.3, tip: "Causally attributed revenue above organic baseline." },
  { label: "Incremental Units", value: "30.7K units", delta: 15.4, tip: "Units sold that would not have sold without the promotion." },
  { label: "Customer Targeted Count", value: "67.5K", delta: 8.2, tip: "Distinct customers contacted in this campaign cohort." },
  { label: "True Promo ROI", value: "186% / 2.86x", delta: 12.1, tip: "Net incremental margin per unit of promotional spend." },
  { label: "Net Incremental Margin (NIM)", value: "$126.2K", delta: 17.3, tip: "Margin after giveaway, pull-forward and cannibalization." },
  { label: "Promo Spend (Discount Cost)", value: "$432K", delta: -3.2, positiveIsGood: false, tip: "Total funded discount cost across approved offers." },
  { label: "Discount Efficiency Ratio (DER)", value: "1.41x", sub: "Target > 1.5x", tip: "Incremental revenue per unit of discount cost." },
  { label: "Giveaway Margin Saved", value: "$8.2K", sub: "Suppressed high-intent buyers", tip: "Margin protected by not discounting organic buyers." },
];

// ---------------- Blueprint 4.5 — Phase 1 customer output rows ----------------

const MECHANICS = ["pct_discount", "coupon", "multibuy"] as const;

const CUSTOMER_SEEDS = [
  { id: "CUST-884210", cluster: "A", prime: true, sku: "SKU-00012", product: "Rexona 012", base: 412, price: 18, flags: ["brand_price_floor"] },
  { id: "CUST-771945", cluster: "B", prime: true, sku: "SKU-04412", product: "Nivea Soft 200ml", base: 388, price: 34, flags: [] },
  { id: "CUST-663102", cluster: "C", prime: false, sku: "SKU-09901", product: "Advil Max 20s", base: 296, price: 26, flags: ["invima_cap_30%"] },
  { id: "CUST-559871", cluster: "D", prime: false, sku: "SKU-07823", product: "Dove Beauty Bar", base: 254, price: 12, flags: ["brand_price_floor", "invima_cap_30%"] },
  { id: "CUST-442380", cluster: "E", prime: false, sku: "SKU-01034", product: "Teragrip RX", base: 188, price: 46, flags: ["rx_cadence_lock"] },
  { id: "CUST-338217", cluster: "F", prime: true, sku: "SKU-06620", product: "La Roche-Posay Anthelios", base: 164, price: 88, flags: ["supplier_cap_20%"] },
  { id: "CUST-226054", cluster: "G", prime: false, sku: "SKU-05517", product: "Cetaphil Gentle 250ml", base: 132, price: 54, flags: [] },
  { id: "CUST-118663", cluster: "B", prime: false, sku: "SKU-03308", product: "Colgate Total 90g", base: 216, price: 9, flags: [] },
  { id: "CUST-905412", cluster: "A", prime: true, sku: "SKU-02211", product: "Centrum Adult 60s", base: 344, price: 62, flags: ["brand_price_floor"] },
  { id: "CUST-810337", cluster: "D", prime: true, sku: "SKU-08814", product: "Eucerin pH5 Lotion", base: 202, price: 71, flags: ["supplier_cap_20%"] },
];

export type CustomerRow = {
  key: string;
  campaign: string;
  campaignId: string;
  customerId: string;
  audience: AudienceTypeId;
  clusterId: string;
  clusterLabel: string;
  prime: boolean;
  sku: string;
  product: string;
  regular: number;
  prime_pct: number;
  mechanic: string;
  incUnits: number;
  discountCost: number;
  flags: string[];
  decision: boolean;
};

export function computeCustomerRows(opts: {
  campaign: string;
  audience: AudienceTypeId;
  clusters: string[];
  tier: PrimeTier;
  regular: number;
  prime: number;
  channelIndex: number;
  regCap: number;
}): CustomerRow[] {
  const { campaign, audience, clusters, tier, regular, prime, channelIndex, regCap } = opts;
  const channelFactor = [1, 0.93, 1.07][channelIndex] ?? 1;
  const audienceFactor =
    audience === "mass_general" ? 0.82 : audience === "reactivation" ? 1.24 : audience === "cyclical_replenishment_rx" ? 0.71 : 1;

  return CUSTOMER_SEEDS.filter((s) => clusters.includes(s.clusterId ?? s.cluster))
    .filter((s) => (tier === "All" ? true : tier === "Prime Loyalty Only" ? s.prime : !s.prime))
    .map((s, i) => {
      const meta = CLUSTER_META.find((c) => c.id === s.cluster)!;
      const tilt = STUDIO_CLUSTERS.find((c) => c.id === s.cluster)?.tilt ?? 1;
      const reg = Math.min(regular, regCap, s.flags.includes("supplier_cap_20%") ? 20 : 99);
      const pri = Math.min(Math.max(prime, reg), regCap + 5);
      const eff = s.prime ? pri : reg;
      const saturation = 1 - Math.exp(-eff / 20);
      const incUnits = s.base * tilt * saturation * channelFactor * audienceFactor * 0.42;
      const discountCost = s.base * s.price * (eff / 100) * channelFactor;
      return {
        key: `${s.id}-${s.sku}`,
        campaign,
        campaignId: CAMPAIGN_IDS[campaign] ?? "CMP-2025-GEN",
        customerId: s.id,
        audience,
        clusterId: s.cluster,
        clusterLabel: `${meta.short} — ${meta.name}`,
        prime: s.prime,
        sku: s.sku,
        product: s.product,
        regular: reg,
        prime_pct: pri,
        mechanic: MECHANICS[i % MECHANICS.length],
        incUnits: Number(incUnits.toFixed(1)),
        discountCost: Math.round(discountCost),
        flags: s.flags,
        decision: incUnits * s.price * 0.34 > discountCost * 0.22 && eff > 0,
      };
    });
}
