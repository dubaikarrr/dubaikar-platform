"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import { AREAS, DENSITY_COLOR, rentColor, type MapArea } from "@/lib/map/areas";
import { POIS, POI_COLOR, type PoiType, type MapPoi } from "@/lib/map/pois";
import { METRO_LINES, METRO_STATIONS, DUBAI_CENTER, DUBAI_ZOOM } from "@/lib/map/metro";
import { AREA_BOUNDARIES } from "@/lib/map/boundaries";
import { toggleBookmark } from "@/lib/actions/bookmarks";
import { LayerToggle, type LayerKey } from "@/components/map/layer-toggle";
import { AreaCard } from "@/components/map/area-card";
import { ComparePanel } from "@/components/map/compare-panel";
import { PoiCard } from "@/components/map/poi-card";
import { AreaFinder } from "@/components/map/area-finder";
import { MapTour } from "@/components/map/map-tour";
import { Map as MapIcon, Star } from "lucide-react";

const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

/* ----------------------------- geojson sources ----------------------------- */
const areasFC: FeatureCollection = {
  type: "FeatureCollection",
  features: AREAS.map((a) => ({
    type: "Feature",
    properties: { slug: a.slug, name: a.name, color: DENSITY_COLOR[a.indianDensity], rentColor: rentColor(a.rent.oneBhk) },
    geometry: { type: "Point", coordinates: [a.lng, a.lat] },
  })),
};

function poiFC(types: PoiType[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: POIS.filter((p) => types.includes(p.type)).map((p) => ({
      type: "Feature",
      properties: { slug: p.slug, name: p.name, ptype: p.type, color: POI_COLOR[p.type] },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}
const communityFC = poiFC(["grocery", "temple", "school"]);
const restaurantsFC = poiFC(["restaurant"]);
const landmarksFC = poiFC(["landmark"]);

/* ------------------------------- poi icons ------------------------------- */
const POI_EMOJI: Record<PoiType, string> = {
  grocery: "🛒",
  temple: "🛕",
  school: "🎓",
  restaurant: "🍽️",
  landmark: "📍",
};

function makePoiIcon(emoji: string, ring: string): ImageData | null {
  const size = 56;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = ring;
  ctx.stroke();
  ctx.font = "26px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2 + 2);
  return ctx.getImageData(0, 0, size, size);
}

const LAYER_IDS: Record<LayerKey, string[]> = {
  neighbourhoods: ["area-fill", "area-border", "area-label", "areas-circle"],
  rent: ["rent-heat"],
  metro: ["metro-solid", "metro-blue", "metro-stations"],
  community: ["poi-community", "poi-community-label"],
  restaurants: ["poi-restaurants", "poi-restaurants-label"],
  landmarks: ["poi-landmarks", "poi-landmarks-label"],
};

/** Switch every base-style symbol layer to English names. */
function applyEnglishLabels(map: maplibregl.Map) {
  const english: maplibregl.ExpressionSpecification = [
    "coalesce",
    ["get", "name:en"],
    ["get", "name:latin"],
    ["get", "name"],
  ];
  for (const layer of map.getStyle().layers) {
    if (layer.type === "symbol") {
      try {
        if (map.getLayoutProperty(layer.id, "text-field")) {
          map.setLayoutProperty(layer.id, "text-field", english);
        }
      } catch {
        /* some layers have no text-field; ignore */
      }
    }
  }
}

export function DubaiMap({ initialShortlist = [] }: { initialShortlist?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<MapArea | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<MapPoi | null>(null);
  const [compareA, setCompareA] = useState<MapArea | null>(null);
  const [highlightSlugs, setHighlightSlugs] = useState<string[]>([]);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set(initialShortlist));
  const [, startTransition] = useTransition();
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    neighbourhoods: true, rent: false, metro: true, community: true, restaurants: false, landmarks: true,
  });
  const layersRef = useRef(layers);
  layersRef.current = layers;

  function flyToArea(area: MapArea, open = true) {
    mapRef.current?.flyTo({ center: [area.lng, area.lat], zoom: 12.6, duration: 900 });
    if (open) {
      setSelectedPoi(null);
      setSelected(area);
    }
  }

  /* ------------------------------ map setup ------------------------------ */
  useEffect(() => {
    if (!KEY || !containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${KEY}`,
      center: DUBAI_CENTER,
      zoom: DUBAI_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      applyEnglishLabels(map);

      map.addSource("boundaries", { type: "geojson", data: AREA_BOUNDARIES, promoteId: "slug" });
      map.addSource("areas", { type: "geojson", data: areasFC });
      map.addSource("metro-lines", { type: "geojson", data: METRO_LINES });
      map.addSource("metro-stations", { type: "geojson", data: METRO_STATIONS });
      map.addSource("poi-community", { type: "geojson", data: communityFC });
      map.addSource("poi-restaurants", { type: "geojson", data: restaurantsFC });
      map.addSource("poi-landmarks", { type: "geojson", data: landmarksFC });

      for (const t of Object.keys(POI_EMOJI) as PoiType[]) {
        const img = makePoiIcon(POI_EMOJI[t], POI_COLOR[t]);
        if (img) map.addImage(`poi-${t}`, img);
      }

      const densityMatch = (fallback: string) =>
        ["match", ["get", "slug"], ...AREAS.flatMap((a) => [a.slug, DENSITY_COLOR[a.indianDensity]]), fallback] as unknown as maplibregl.ExpressionSpecification;

      /* --- area polygons: soft fill + dotted border + selected highlight --- */
      map.addLayer({
        id: "area-fill", type: "fill", source: "boundaries",
        paint: {
          "fill-color": densityMatch("#EA580C"),
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.18, 0.07],
        },
      });
      map.addLayer({
        id: "area-border", type: "line", source: "boundaries",
        paint: {
          "line-color": densityMatch("#EA580C"),
          "line-width": 1.6,
          "line-dasharray": [2, 2],
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "area-border-selected", type: "line", source: "boundaries",
        filter: ["in", ["get", "slug"], ["literal", []]],
        paint: { "line-color": "#FF6B35", "line-width": 3.2, "line-dasharray": [1.5, 1.5] },
      });

      map.addLayer({
        id: "rent-heat", type: "circle", source: "areas",
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 26, 13, 70], "circle-color": ["get", "rentColor"], "circle-opacity": 0.4, "circle-blur": 0.8 },
        layout: { visibility: "none" },
      });

      map.addLayer({
        id: "metro-solid", type: "line", source: "metro-lines",
        filter: ["!=", ["get", "future"], true],
        paint: { "line-color": ["get", "color"], "line-width": 4, "line-opacity": 0.9 },
      });
      map.addLayer({
        id: "metro-blue", type: "line", source: "metro-lines",
        filter: ["==", ["get", "future"], true],
        paint: { "line-color": ["get", "color"], "line-width": 3.5, "line-dasharray": [2, 2], "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "metro-stations", type: "circle", source: "metro-stations",
        paint: { "circle-radius": 4, "circle-color": "#fff", "circle-stroke-color": "#15182e", "circle-stroke-width": 2 },
      });

      const poiLayer = (id: string, source: string) => {
        map.addLayer({
          id, type: "symbol", source,
          layout: {
            "icon-image": ["concat", "poi-", ["get", "ptype"]],
            "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.42, 14, 0.62],
            "icon-allow-overlap": true,
          },
        });
        map.addLayer({
          id: `${id}-label`, type: "symbol", source,
          minzoom: 12.5,
          layout: {
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-offset": [0, 1.6],
            "text-anchor": "top",
            "text-optional": true,
          },
          paint: { "text-color": "#1f2328", "text-halo-color": "#ffffff", "text-halo-width": 1.4 },
        });
      };
      poiLayer("poi-landmarks", "poi-landmarks");
      poiLayer("poi-community", "poi-community");
      poiLayer("poi-restaurants", "poi-restaurants");

      map.addLayer({
        id: "areas-circle", type: "circle", source: "areas",
        paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 6, 13, 10], "circle-color": ["get", "color"], "circle-stroke-color": "#fff", "circle-stroke-width": 2 },
      });
      map.addLayer({
        id: "area-label", type: "symbol", source: "areas",
        layout: {
          "text-field": ["get", "name"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 13, 14],
          "text-offset": [0, 1.1],
          "text-anchor": "top",
        },
        paint: { "text-color": "#7c2d12", "text-halo-color": "#ffffff", "text-halo-width": 1.6 },
      });

      (Object.keys(LAYER_IDS) as LayerKey[]).forEach((k) => {
        LAYER_IDS[k].forEach((id) => {
          if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", layersRef.current[k] ? "visible" : "none");
        });
      });

      /* ------------------------- unified click handling ------------------------- */
      const clickableLayers = ["poi-community", "poi-restaurants", "poi-landmarks", "areas-circle", "area-label", "area-fill"];
      map.on("click", (e) => {
        const feats = map.queryRenderedFeatures(e.point, { layers: clickableLayers.filter((l) => map.getLayer(l)) });
        if (!feats.length) return;
        const poiFeat = feats.find((f) => f.layer.id.startsWith("poi-"));
        if (poiFeat) {
          const poi = POIS.find((p) => p.slug === poiFeat.properties?.slug);
          if (poi) {
            setSelected(null);
            setCompareA(null);
            setSelectedPoi(poi);
            return;
          }
        }
        const areaFeat = feats.find((f) => f.layer.id === "areas-circle" || f.layer.id === "area-label" || f.layer.id === "area-fill");
        if (areaFeat) {
          const area = AREAS.find((a) => a.slug === areaFeat.properties?.slug);
          if (area) {
            setSelectedPoi(null);
            setSelected(area);
          }
        }
      });

      let hovered: string | null = null;
      map.on("mousemove", (e) => {
        const feats = map.queryRenderedFeatures(e.point, { layers: clickableLayers.filter((l) => map.getLayer(l)) });
        map.getCanvas().style.cursor = feats.length ? "pointer" : "";
        const fill = feats.find((f) => f.layer.id === "area-fill");
        const slug = (fill?.properties?.slug as string) ?? null;
        if (hovered && hovered !== slug) {
          map.setFeatureState({ source: "boundaries", id: hovered }, { hover: false });
          hovered = null;
        }
        if (slug && hovered !== slug) {
          hovered = slug;
          map.setFeatureState({ source: "boundaries", id: slug }, { hover: true });
        }
      });

      setReady(true);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  /* ---------------------------- layer visibility ---------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (Object.keys(LAYER_IDS) as LayerKey[]).forEach((k) => {
      LAYER_IDS[k].forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", layers[k] ? "visible" : "none");
      });
    });
  }, [layers, ready]);

  /* ----------------- selected + finder highlight border sync ----------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("area-border-selected")) return;
    const slugs = [...new Set([selected?.slug, ...highlightSlugs].filter(Boolean))] as string[];
    map.setFilter("area-border-selected", ["in", ["get", "slug"], ["literal", slugs]]);
  }, [selected, highlightSlugs, ready]);

  function onToggleBookmark(area: MapArea) {
    setShortlist((s) => {
      const next = new Set(s);
      if (next.has(area.slug)) next.delete(area.slug);
      else next.add(area.slug);
      return next;
    });
    startTransition(() => toggleBookmark("area", area.slug).then(() => {}));
  }

  if (!KEY) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text-subtle"><MapIcon className="h-6 w-6" /></span>
        <h2 className="text-text">Map needs a MapTiler key</h2>
        <p className="max-w-sm text-sm text-text-muted">Add a free <code>NEXT_PUBLIC_MAPTILER_KEY</code> (from maptiler.com) to <code>.env.local</code> and restart to load the Dubai map.</p>
      </div>
    );
  }

  const shortlisted = AREAS.filter((a) => shortlist.has(a.slug));

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-card)] border border-border">
      <div ref={containerRef} className="h-full w-full" />

      <LayerToggle
        value={layers}
        onToggle={(k) => setLayers((s) => ({ ...s, [k]: !s[k] }))}
        onJump={(slug) => {
          const area = AREAS.find((a) => a.slug === slug);
          if (area) flyToArea(area);
        }}
        onRetakeTour={() => { try { localStorage.removeItem("dk-map-tour-v1"); } catch {} window.location.reload(); }}
      />

      <AreaFinder
        onResults={(slugs) => {
          setHighlightSlugs(slugs);
          const map = mapRef.current;
          if (map && slugs.length) {
            const first = AREAS.find((a) => a.slug === slugs[0]);
            if (first) map.flyTo({ center: [first.lng, first.lat], zoom: 11.2, duration: 900 });
          }
        }}
        onOpenArea={(slug) => {
          const area = AREAS.find((a) => a.slug === slug);
          if (area) flyToArea(area);
        }}
        onShortlist={(slug) => {
          const area = AREAS.find((a) => a.slug === slug);
          if (area && !shortlist.has(slug)) onToggleBookmark(area);
        }}
        shortlist={shortlist}
      />

      {/* Shortlist chips */}
      {shortlisted.length ? (
        <div className="pointer-events-auto absolute bottom-3 left-3 z-20 flex max-w-[70%] flex-wrap items-center gap-1.5 rounded-[var(--radius-card)] border border-border bg-surface/95 p-2 shadow-card backdrop-blur">
          <span className="flex items-center gap-1 px-1 text-[11px] font-medium uppercase tracking-wide text-text-subtle">
            <Star className="h-3 w-3 fill-current text-warning" /> Shortlist
          </span>
          {shortlisted.map((a) => (
            <button key={a.slug} onClick={() => flyToArea(a)} className="pill hover:bg-brand-soft hover:text-brand" style={{ fontSize: 11 }}>
              {a.name}
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <AreaCard
          area={selected}
          onClose={() => setSelected(null)}
          bookmarked={shortlist.has(selected.slug)}
          onToggleBookmark={() => onToggleBookmark(selected)}
          onCompare={() => { setCompareA(selected); setSelected(null); }}
          onSelectPoi={(poi) => {
            setSelected(null);
            setSelectedPoi(poi);
            mapRef.current?.flyTo({ center: [poi.lng, poi.lat], zoom: 13.5, duration: 800 });
          }}
        />
      ) : null}

      {selectedPoi ? (
        <PoiCard
          poi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          onOpenArea={(areaName) => {
            const area = AREAS.find((a) => a.name === areaName);
            if (area) { setSelectedPoi(null); flyToArea(area); }
          }}
        />
      ) : null}

      {compareA ? <ComparePanel a={compareA} onClose={() => setCompareA(null)} /> : null}

      {ready ? (
        <MapTour
          onStep={(step) => {
            const map = mapRef.current;
            if (!map) return;
            if (step.flyTo) map.flyTo({ center: step.flyTo, zoom: step.zoom ?? 11, duration: 1000 });
            if (step.demoArea) {
              const area = AREAS.find((a) => a.slug === step.demoArea);
              if (area) { setSelected(area); }
            } else {
              setSelected(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
