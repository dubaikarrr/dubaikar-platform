import type { FeatureCollection } from "geojson";

/**
 * Simplified, curated Dubai Metro geometry for orientation (not survey-grade).
 * Red + Green lines (operational) and a dashed Blue Line 2029 overlay through
 * Indian-dense areas (International City, Silicon Oasis, Mirdif).
 */

export const METRO_LINES: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { line: "red", color: "#E2231A" },
      geometry: {
        type: "LineString",
        coordinates: [
          [55.395, 25.282], [55.353, 25.252], [55.330, 25.273], [55.304, 25.255],
          [55.282, 25.226], [55.274, 25.214], [55.264, 25.197], [55.262, 25.186],
          [55.196, 25.112], [55.143, 25.069], [55.118, 25.044], [55.073, 24.984],
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "green", color: "#009639" },
      geometry: {
        type: "LineString",
        coordinates: [
          [55.388, 25.281], [55.371, 25.288], [55.345, 25.281], [55.330, 25.273],
          [55.304, 25.255], [55.318, 25.225], [55.331, 25.213],
        ],
      },
    },
    {
      type: "Feature",
      properties: { line: "blue", color: "#1E6FE0", future: true },
      geometry: {
        type: "LineString",
        coordinates: [
          [55.353, 25.252], [55.412, 25.287], [55.420, 25.216], [55.378, 25.121], [55.408, 25.166],
        ],
      },
    },
  ],
};

export const METRO_STATIONS: FeatureCollection = {
  type: "FeatureCollection",
  features: (
    [
      ["Union", 55.330, 25.273], ["BurJuman", 55.304, 25.255], ["WTC", 55.282, 25.226],
      ["Financial Centre", 55.274, 25.214], ["Burj Khalifa / Dubai Mall", 55.264, 25.197],
      ["Business Bay", 55.262, 25.186], ["Mall of the Emirates", 55.196, 25.112],
      ["DMCC (JLT)", 55.143, 25.069], ["Ibn Battuta", 55.118, 25.044], ["Airport T1", 55.353, 25.252],
      ["Etisalat", 55.388, 25.281], ["Al Nahda", 55.371, 25.288], ["Oud Metha", 55.318, 25.225],
      ["Stadium", 55.345, 25.281],
    ] as [string, number, number][]
  ).map(([name, lng, lat]) => ({
    type: "Feature" as const,
    properties: { name },
    geometry: { type: "Point" as const, coordinates: [lng, lat] },
  })),
};

export const DUBAI_CENTER: [number, number] = [55.27, 25.2];
export const DUBAI_ZOOM = 10.3;
