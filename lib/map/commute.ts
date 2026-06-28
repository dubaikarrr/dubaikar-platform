/**
 * Curated commute estimates (minutes, typical morning peak) from each area to
 * Dubai's main job hubs. Approximations for orientation, editable by the team.
 * `metro` is null where there's no practical metro route today.
 */

export interface CommuteHub {
  key: string;
  label: string;
}

export const HUBS: CommuteHub[] = [
  { key: "downtown", label: "Downtown / DIFC" },
  { key: "marina", label: "Marina / JLT" },
  { key: "media", label: "Internet / Media City" },
  { key: "jebelali", label: "Jebel Ali / JAFZA" },
  { key: "airport", label: "DXB Airport area" },
];

export type CommuteEntry = { car: number; metro: number | null };
type AreaCommute = Record<string, CommuteEntry>;

export const COMMUTE: Record<string, AreaCommute> = {
  "bur-dubai":          { downtown: { car: 15, metro: 15 }, marina: { car: 30, metro: 40 }, media: { car: 28, metro: 38 }, jebelali: { car: 40, metro: 55 }, airport: { car: 15, metro: 20 } },
  "karama":             { downtown: { car: 14, metro: 14 }, marina: { car: 30, metro: 38 }, media: { car: 28, metro: 36 }, jebelali: { car: 40, metro: 52 }, airport: { car: 15, metro: 18 } },
  "al-nahda-dubai":     { downtown: { car: 30, metro: 35 }, marina: { car: 45, metro: 60 }, media: { car: 45, metro: 58 }, jebelali: { car: 55, metro: 75 }, airport: { car: 12, metro: 15 } },
  "international-city": { downtown: { car: 30, metro: null }, marina: { car: 45, metro: null }, media: { car: 45, metro: null }, jebelali: { car: 50, metro: null }, airport: { car: 20, metro: null } },
  "deira":              { downtown: { car: 20, metro: 18 }, marina: { car: 35, metro: 45 }, media: { car: 35, metro: 42 }, jebelali: { car: 45, metro: 60 }, airport: { car: 10, metro: 10 } },
  "discovery-gardens":  { downtown: { car: 32, metro: 40 }, marina: { car: 15, metro: 18 }, media: { car: 18, metro: 22 }, jebelali: { car: 15, metro: 15 }, airport: { car: 40, metro: 55 } },
  "jlt":                { downtown: { car: 25, metro: 28 }, marina: { car: 8, metro: 5 }, media: { car: 12, metro: 10 }, jebelali: { car: 20, metro: 18 }, airport: { car: 35, metro: 45 } },
  "dubai-marina":       { downtown: { car: 25, metro: 30 }, marina: { car: 5, metro: 5 }, media: { car: 10, metro: 8 }, jebelali: { car: 20, metro: 20 }, airport: { car: 35, metro: 48 } },
  "silicon-oasis":      { downtown: { car: 25, metro: null }, marina: { car: 35, metro: null }, media: { car: 35, metro: null }, jebelali: { car: 40, metro: null }, airport: { car: 20, metro: null } },
  "mirdif":             { downtown: { car: 25, metro: null }, marina: { car: 40, metro: null }, media: { car: 40, metro: null }, jebelali: { car: 50, metro: null }, airport: { car: 12, metro: null } },
  "business-bay":       { downtown: { car: 8, metro: 5 },  marina: { car: 22, metro: 25 }, media: { car: 20, metro: 22 }, jebelali: { car: 35, metro: 40 }, airport: { car: 20, metro: 25 } },
  "al-barsha":          { downtown: { car: 18, metro: 18 }, marina: { car: 15, metro: 15 }, media: { car: 12, metro: 12 }, jebelali: { car: 25, metro: 28 }, airport: { car: 28, metro: 35 } },
  "satwa":              { downtown: { car: 10, metro: 12 }, marina: { car: 25, metro: 32 }, media: { car: 22, metro: 30 }, jebelali: { car: 38, metro: 48 }, airport: { car: 18, metro: 22 } },
  "al-qusais":          { downtown: { car: 28, metro: 32 }, marina: { car: 45, metro: 58 }, media: { car: 42, metro: 55 }, jebelali: { car: 55, metro: 72 }, airport: { car: 10, metro: 12 } },
  "muhaisnah":          { downtown: { car: 30, metro: null }, marina: { car: 48, metro: null }, media: { car: 45, metro: null }, jebelali: { car: 55, metro: null }, airport: { car: 15, metro: null } },
};
