/**
 * Curated Dubai/Sharjah neighbourhoods relevant to Indian movers.
 * Coordinates + rent bands are approximate (2024) and editable by the team.
 * Rent in AED/month; convert to ₹ at display time via lib/currency.
 */

export type IndianDensity = "very-high" | "high" | "medium" | "low";

export interface MapArea {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  indianDensity: IndianDensity;
  rent: { sharing: number; studio: number; oneBhk: number };
  vibe: string;
  community: string;
  transport: string;
  commute: string;
  tags: string[];
}

export const AREAS: MapArea[] = [
  { slug: "bur-dubai", name: "Bur Dubai", lat: 25.255, lng: 55.297, indianDensity: "very-high",
    rent: { sharing: 1200, studio: 4500, oneBhk: 6500 },
    vibe: "Old Dubai, dense, walkable, very Indian", community: "Huge Indian/South-Asian population; temples & Indian eateries everywhere",
    transport: "Al Fahidi & BurJuman metro (Red/Green)", commute: "10–20 min to Downtown/DIFC",
    tags: ["budget", "metro", "indian-hub", "walkable"] },
  { slug: "karama", name: "Al Karama", lat: 25.246, lng: 55.305, indianDensity: "very-high",
    rent: { sharing: 1300, studio: 4500, oneBhk: 6500 },
    vibe: "Foodie, affordable, classic expat-Indian", community: "Iconic Indian neighbourhood, Saravana Bhavan, Al Adil",
    transport: "ADCB & BurJuman metro", commute: "10–15 min to Downtown",
    tags: ["budget", "metro", "indian-hub", "food"] },
  { slug: "al-nahda-dubai", name: "Al Nahda", lat: 25.288, lng: 55.371, indianDensity: "very-high",
    rent: { sharing: 1000, studio: 3800, oneBhk: 5500 },
    vibe: "Value-for-money, parks, families", community: "Very high Indian/Filipino density on the Dubai–Sharjah border",
    transport: "Stadium & Al Nahda metro (Green)", commute: "25–35 min to Downtown",
    tags: ["budget", "metro", "indian-hub", "family"] },
  { slug: "international-city", name: "International City", lat: 25.166, lng: 55.408, indianDensity: "very-high",
    rent: { sharing: 700, studio: 3000, oneBhk: 4200 },
    vibe: "Cheapest rents, bachelor-friendly", community: "Dense Indian/Pakistani community; will get a Blue Line 2029 station",
    transport: "Bus today; Blue Line metro by 2029", commute: "30–40 min, limited transit",
    tags: ["cheapest", "bachelor", "blue-line-2029"] },
  { slug: "deira", name: "Deira", lat: 25.271, lng: 55.31, indianDensity: "high",
    rent: { sharing: 900, studio: 3500, oneBhk: 5000 },
    vibe: "Historic trading hub, busy, affordable", community: "Long-standing Indian trading community; gold souk",
    transport: "Multiple Red/Green stations", commute: "15–25 min to Downtown",
    tags: ["budget", "metro", "indian-hub"] },
  { slug: "discovery-gardens", name: "Discovery Gardens", lat: 25.041, lng: 55.146, indianDensity: "high",
    rent: { sharing: 1200, studio: 4200, oneBhk: 6000 },
    vibe: "Green, quiet, mid-budget", community: "Strong Indian family presence near JLT",
    transport: "The Gardens / metro link to Ibn Battuta", commute: "30–40 min to Downtown",
    tags: ["family", "value", "metro"] },
  { slug: "jlt", name: "Jumeirah Lakes Towers (JLT)", lat: 25.069, lng: 55.143, indianDensity: "high",
    rent: { sharing: 1800, studio: 6000, oneBhk: 8500 },
    vibe: "Modern towers, lakes, young professionals", community: "Mixed; popular with Indian professionals",
    transport: "DMCC metro (Red)", commute: "25–30 min to Downtown",
    tags: ["modern", "metro", "professional"] },
  { slug: "dubai-marina", name: "Dubai Marina", lat: 25.08, lng: 55.139, indianDensity: "medium",
    rent: { sharing: 2200, studio: 7000, oneBhk: 10000 },
    vibe: "Premium waterfront, nightlife", community: "Cosmopolitan; pricier",
    transport: "Marina & DMCC metro + tram", commute: "25–35 min to Downtown",
    tags: ["premium", "metro", "lifestyle"] },
  { slug: "silicon-oasis", name: "Dubai Silicon Oasis", lat: 25.121, lng: 55.378, indianDensity: "high",
    rent: { sharing: 1000, studio: 3800, oneBhk: 5500 },
    vibe: "Tech free-zone, families, value", community: "Growing Indian family community; Blue Line 2029",
    transport: "Bus today; Blue Line by 2029", commute: "30–40 min, car-friendly",
    tags: ["value", "family", "blue-line-2029"] },
  { slug: "mirdif", name: "Mirdif", lat: 25.216, lng: 55.42, indianDensity: "medium",
    rent: { sharing: 1200, studio: 4200, oneBhk: 6000 },
    vibe: "Suburban, villas, family-first", community: "Family-heavy; near schools; Blue Line 2029",
    transport: "Bus; Blue Line by 2029", commute: "25–35 min, car needed",
    tags: ["family", "villas", "blue-line-2029"] },
  { slug: "business-bay", name: "Business Bay", lat: 25.186, lng: 55.262, indianDensity: "medium",
    rent: { sharing: 2000, studio: 6500, oneBhk: 9000 },
    vibe: "Central, high-rise, professional", community: "Mixed professionals; next to Downtown",
    transport: "Business Bay metro (Red)", commute: "5–10 min to Downtown/DIFC",
    tags: ["central", "premium", "metro", "professional"] },
  { slug: "al-barsha", name: "Al Barsha", lat: 25.113, lng: 55.196, indianDensity: "high",
    rent: { sharing: 1400, studio: 4800, oneBhk: 7000 },
    vibe: "Central, near Mall of the Emirates, schools", community: "Popular with Indian families; many CBSE schools nearby",
    transport: "Mall of Emirates & Sharaf DG metro", commute: "20–25 min to Downtown",
    tags: ["central", "family", "metro", "schools"] },
  { slug: "satwa", name: "Al Satwa", lat: 25.23, lng: 55.277, indianDensity: "high",
    rent: { sharing: 1100, studio: 4000, oneBhk: 6000 },
    vibe: "Old, central, affordable, foodie", community: "Strong South-Asian presence near Downtown",
    transport: "Near World Trade Centre metro", commute: "10–15 min to Downtown",
    tags: ["budget", "central", "food"] },
  { slug: "al-qusais", name: "Al Qusais", lat: 25.281, lng: 55.388, indianDensity: "high",
    rent: { sharing: 900, studio: 3500, oneBhk: 5000 },
    vibe: "Affordable, residential, Green-line end", community: "High Indian density; near Etisalat metro",
    transport: "Etisalat & Al Qusais metro (Green)", commute: "30–35 min to Downtown",
    tags: ["budget", "metro", "indian-hub"] },
  { slug: "muhaisnah", name: "Muhaisnah", lat: 25.287, lng: 55.412, indianDensity: "high",
    rent: { sharing: 800, studio: 3200, oneBhk: 4500 },
    vibe: "Very affordable, labour/family mix", community: "Dense South-Asian community; Blue Line 2029",
    transport: "Bus; Blue Line by 2029", commute: "35–40 min to Downtown",
    tags: ["cheapest", "blue-line-2029"] },
];

export const DENSITY_COLOR: Record<IndianDensity, string> = {
  "very-high": "#DC2626",
  high: "#EA580C",
  medium: "#D97706",
  low: "#16A34A",
};

export const DENSITY_LABEL: Record<IndianDensity, string> = {
  "very-high": "Very high Indian community",
  high: "High Indian community",
  medium: "Mixed community",
  low: "Lower Indian density",
};

/** Colour for the rent heatmap based on 1BHK rent band. */
export function rentColor(oneBhk: number): string {
  if (oneBhk <= 4500) return "#16A34A";
  if (oneBhk <= 6000) return "#84CC16";
  if (oneBhk <= 7500) return "#D97706";
  return "#DC2626";
}
