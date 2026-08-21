/** Tamil planet short labels for South Indian charts */
export const PLANETS = [
  { code: "சூ", label: "சூரியன்" },
  { code: "சந்", label: "சந்திரன்" },
  { code: "செ", label: "செவ்வாய்" },
  { code: "புத", label: "புதன்" },
  { code: "குரு", label: "குரு" },
  { code: "சுக்", label: "சுக்ரன்" },
  { code: "சனி", label: "சனி" },
  { code: "ரா", label: "ராகு" },
  { code: "கே", label: "கேது" },
] as const;

export type PlanetCode = (typeof PLANETS)[number]["code"];

export const PLANET_CODES = PLANETS.map((p) => p.code);

/** Empty 12-house chart (index 0 = house 1 … index 11 = house 12) */
export function emptyChart(): string[][] {
  return Array.from({ length: 12 }, () => []);
}

export function normalizeChart(input: unknown): string[][] {
  const allowed = new Set(PLANET_CODES);
  const chart = emptyChart();
  if (!Array.isArray(input)) return chart;
  for (let i = 0; i < 12; i++) {
    const house = input[i];
    if (!Array.isArray(house)) continue;
    chart[i] = house
      .map((p) => String(p).trim())
      .filter((p) => allowed.has(p as PlanetCode));
  }
  return chart;
}

export function formatRegistrationDate(d = new Date()): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatRegistrationNumber(seq: number): string {
  return `SEKM${String(seq).padStart(2, "0")}`;
}

/**
 * South Indian chart cell → house index (0–11), or null for center.
 * Grid positions row*4+col:
 *  12 | 1 | 2 | 3
 *  11 | C | C | 4
 *  10 | C | C | 5
 *   9 | 8 | 7 | 6
 */
export const SI_CELL_TO_HOUSE: (number | null)[] = [
  11, 0, 1, 2, // houses 12, 1, 2, 3
  10, null, null, 3, // 11, center, center, 4
  9, null, null, 4, // 10, center, center, 5
  8, 7, 6, 5, // 9, 8, 7, 6
];

export const BIODATA_THEME = {
  blue: "#0056b3",
  red: "#d93025",
  cream: "#fffef8",
  border: "#0056b3",
} as const;
