/**
 * One-off curation script: fetch area boundary polygons from OSM (Nominatim),
 * simplify them, and emit lib/map/boundaries.ts. Run manually:
 *   node scripts/fetch-boundaries.mjs
 * Respects Nominatim's 1 req/sec policy.
 */
import { writeFileSync } from "node:fs";

const AREAS = [
  { slug: "bur-dubai", name: "Bur Dubai", q: "Bur Dubai, Dubai, United Arab Emirates" },
  { slug: "karama", name: "Karama", q: "Al Karama, Dubai, United Arab Emirates" },
  { slug: "al-nahda-dubai", name: "Al Nahda (Dubai)", q: "Al Nahda, Dubai, United Arab Emirates" },
  { slug: "international-city", name: "International City", q: "Al Warsan 1, Dubai, United Arab Emirates" },
  { slug: "deira", name: "Deira", q: "Deira, Dubai, United Arab Emirates" },
  { slug: "discovery-gardens", name: "Discovery Gardens", q: "Discovery Gardens, Dubai, United Arab Emirates" },
  { slug: "jlt", name: "JLT", q: "Jumeirah Lakes Towers, Dubai, United Arab Emirates" },
  { slug: "dubai-marina", name: "Dubai Marina", q: "Dubai Marina, Dubai, United Arab Emirates" },
  { slug: "silicon-oasis", name: "Silicon Oasis", q: "Dubai Silicon Oasis, Dubai, United Arab Emirates" },
  { slug: "mirdif", name: "Mirdif", q: "Mirdif, Dubai, United Arab Emirates" },
  { slug: "business-bay", name: "Business Bay", q: "Business Bay, Dubai, United Arab Emirates" },
  { slug: "al-barsha", name: "Al Barsha", q: "Al Barsha 1, Dubai, United Arab Emirates" },
  { slug: "satwa", name: "Satwa", q: "Al Satwa, Dubai, United Arab Emirates" },
  { slug: "al-qusais", name: "Al Qusais", q: "Al Qusais, Dubai, United Arab Emirates" },
  { slug: "muhaisnah", name: "Muhaisnah", q: "Muhaisnah, Dubai, United Arab Emirates" },
];

// Hand-drawn approximate fallbacks for areas OSM can't supply.
const FALLBACKS = {
  deira: [
    [55.27, 25.272], [55.30, 25.247], [55.327, 25.241], [55.352, 25.252],
    [55.347, 25.278], [55.312, 25.291], [55.281, 25.286], [55.27, 25.272],
  ],
  "international-city": [
    [55.390, 25.162], [55.398, 25.176], [55.414, 25.180], [55.428, 25.174],
    [55.431, 25.158], [55.417, 25.147], [55.399, 25.149], [55.390, 25.162],
  ],
  "dubai-marina": [
    [55.130, 25.083], [55.142, 25.092], [55.152, 25.087], [55.148, 25.073],
    [55.136, 25.067], [55.127, 25.073], [55.130, 25.083],
  ],
  "al-barsha": [
    [55.187, 25.122], [55.205, 25.124], [55.215, 25.113], [55.210, 25.098],
    [55.192, 25.096], [55.183, 25.108], [55.187, 25.122],
  ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Douglas-Peucker simplification on [lng,lat] rings.
function perpDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (!len2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function dp(points, eps) {
  if (points.length < 3) return points;
  let maxD = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > eps) {
    const left = dp(points.slice(0, idx + 1), eps);
    const right = dp(points.slice(idx), eps);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}
function simplifyRing(ring, eps = 0.0006) {
  const out = dp(ring, eps);
  // close the ring
  if (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1]) out.push(out[0]);
  return out.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
}

function largestPolygon(geom) {
  // Returns a single Polygon coordinates array from Polygon/MultiPolygon.
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") {
    let best = null, bestN = 0;
    for (const poly of geom.coordinates) {
      const n = poly[0]?.length ?? 0;
      if (n > bestN) { bestN = n; best = poly; }
    }
    return best;
  }
  return null;
}

const features = [];
for (const a of AREAS) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=5&accept-language=en&q=${encodeURIComponent(a.q)}`;
  let ok = false;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "dubaikar-curation/1.0 (one-off boundary fetch)" } });
    const json = await res.json();
    // Prefer administrative/place polygons; otherwise any polygon that isn't a
    // mall/building/POI footprint.
    const polys = json.filter(
      (r) => r.geojson && (r.geojson.type === "Polygon" || r.geojson.type === "MultiPolygon"),
    );
    const hit =
      polys.find((r) => r.category === "boundary" || r.category === "place") ??
      polys.find((r) => !["shop", "building", "amenity", "tourism", "leisure", "office"].includes(r.category));
    if (hit) {
      const poly = largestPolygon(hit.geojson);
      if (poly) {
        const outer = simplifyRing(poly[0]);
        features.push({
          type: "Feature",
          properties: { slug: a.slug, name: a.name, approximate: false },
          geometry: { type: "Polygon", coordinates: [outer] },
        });
        console.log(`OK   ${a.slug}: ${poly[0].length} -> ${outer.length} pts (${hit.display_name.split(",")[0]}, ${hit.category}/${hit.type})`);
        ok = true;
      }
    }
  } catch (e) {
    console.error(`ERR  ${a.slug}: ${e.message}`);
  }
  if (!ok && FALLBACKS[a.slug]) {
    features.push({
      type: "Feature",
      properties: { slug: a.slug, name: a.name, approximate: true },
      geometry: { type: "Polygon", coordinates: [FALLBACKS[a.slug]] },
    });
    console.log(`FALL ${a.slug} — using hand-drawn polygon`);
    ok = true;
  }
  if (!ok) console.log(`MISS ${a.slug} — needs hand-drawn fallback`);
  await sleep(1200);
}

const ts = `/**
 * Area boundary polygons (GeoJSON), fetched once from OpenStreetMap via
 * Nominatim and simplified (scripts/fetch-boundaries.mjs). Boundaries marked
 * \`approximate: true\` are hand-drawn fallbacks, indicative only.
 * © OpenStreetMap contributors (ODbL).
 */
import type { FeatureCollection, Polygon } from "geojson";

export interface BoundaryProps {
  slug: string;
  name: string;
  approximate: boolean;
}

export const AREA_BOUNDARIES: FeatureCollection<Polygon, BoundaryProps> = ${JSON.stringify(
  { type: "FeatureCollection", features },
  null,
  1,
)};
`;
writeFileSync("lib/map/boundaries.ts", ts);
console.log(`\nWrote lib/map/boundaries.ts with ${features.length}/${AREAS.length} polygons.`);
