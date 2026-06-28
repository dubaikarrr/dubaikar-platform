/** Dubai Metro pass calculator, ported from Website/index.html ~5133–5277. */

export interface Station {
  name: string;
  zone: number;
}

export const METRO_STATIONS: Station[] = [
  { name: "Danube", zone: 1 },
  { name: "Dubai Investment Park", zone: 1 },
  { name: "EXPO 2020", zone: 1 },
  { name: "Life Pharmacy (UAE Exchange)", zone: 1 },
  { name: "Al Fardan Exchange (Al Khail)", zone: 2 },
  { name: "Al Furjan", zone: 2 },
  { name: "Discovery Gardens", zone: 2 },
  { name: "DMCC (JLT)", zone: 2 },
  { name: "Dubai Internet City", zone: 2 },
  { name: "Energy", zone: 2 },
  { name: "Equiti (Umm Al Sheif)", zone: 2 },
  { name: "Ibn Battuta", zone: 2 },
  { name: "InsuranceMarket (Mashreq)", zone: 2 },
  { name: "Mall of the Emirates", zone: 2 },
  { name: "National Paints (Jebel Ali)", zone: 2 },
  { name: "ONPASSIVE (Al Safa)", zone: 2 },
  { name: "Sobha Realty (Dubai Marina)", zone: 2 },
  { name: "The Gardens", zone: 2 },
  { name: "Abu Baker Al Siddique", zone: 5 },
  { name: "Abu Hail", zone: 5 },
  { name: "Airport Terminal 1", zone: 5 },
  { name: "Airport Terminal 3", zone: 5 },
  { name: "Al Garhoud (GGICO)", zone: 5 },
  { name: "Al Nahda", zone: 5 },
  { name: "Al Qiyadah", zone: 5 },
  { name: "Al Qusais", zone: 5 },
  { name: "Al Ras", zone: 5 },
  { name: "Al Rigga", zone: 5 },
  { name: "Baniyas Square", zone: 5 },
  { name: "Centrepoint (Rashidiya)", zone: 5 },
  { name: "City Centre Deira", zone: 5 },
  { name: "Dubai Airport Free Zone", zone: 5 },
  { name: "e& (Etisalat)", zone: 5 },
  { name: "Emirates", zone: 5 },
  { name: "Gold Souq (Palm Deira)", zone: 5 },
  { name: "Salah Al Din", zone: 5 },
  { name: "Stadium", zone: 5 },
  { name: "Union (Interchange)", zone: 5 },
  { name: "ADCB", zone: 6 },
  { name: "Al Jadaf", zone: 6 },
  { name: "Burj Khalifa / Dubai Mall", zone: 6 },
  { name: "BurJuman", zone: 6 },
  { name: "Business Bay", zone: 6 },
  { name: "Creek", zone: 6 },
  { name: "Dubai Healthcare City", zone: 6 },
  { name: "Emirates Towers", zone: 6 },
  { name: "Financial Centre", zone: 6 },
  { name: "max", zone: 6 },
  { name: "Oud Metha", zone: 6 },
  { name: "Sharaf DG", zone: 6 },
  { name: "World Trade Centre", zone: 6 },
  { name: "Al Ghubaiba", zone: 6 },
];

/** Geographic order along the Red Line for distance calc. */
const ZONE_ORDER: Record<number, number> = { 1: 1, 2: 2, 6: 3, 5: 4 };

type FareTier = { single: number; pass30: number; pass90: number };
export const FARE_TABLE: Record<"silver" | "gold", Record<number, FareTier>> = {
  silver: {
    1: { single: 3, pass30: 140, pass90: 330 },
    2: { single: 5, pass30: 230, pass90: 550 },
    3: { single: 7.5, pass30: 350, pass90: 830 },
  },
  gold: {
    1: { single: 6, pass30: 280, pass90: 660 },
    2: { single: 10, pass30: 460, pass90: 1100 },
    3: { single: 15, pass30: 700, pass90: 1660 },
  },
};

export type MetroClass = "silver" | "gold";

export interface MetroResult {
  zonesTravelled: number;
  singleFare: number;
  dailyCost: number;
  monthlyNoPass: number;
  pass30Cost: number;
  pass90Monthly: number;
  saving30: number;
  saving90Monthly: number;
  best: "ppr" | "pass30" | "pass90";
  bestLabel: string;
}

export function calculateMetro(
  fromZone: number,
  toZone: number,
  cls: MetroClass,
  days: number,
): MetroResult {
  const zonesTravelled = Math.min(
    3,
    Math.abs(ZONE_ORDER[toZone] - ZONE_ORDER[fromZone]) + 1,
  );
  const fares = FARE_TABLE[cls][zonesTravelled];
  const singleFare = fares.single;
  const dailyCost = singleFare * 2;
  const monthlyNoPass = dailyCost * days;

  const pass30Cost = fares.pass30;
  const pass90Cost = fares.pass90;
  const pass90Monthly = Math.round((pass90Cost / 3) * 100) / 100;

  const saving30 = monthlyNoPass - pass30Cost;
  const saving90Monthly = Math.round(((monthlyNoPass * 3 - pass90Cost) / 3) * 100) / 100;

  const perDayNoPass = dailyCost;
  const perDay30 = pass30Cost / 30;
  const perDay90 = pass90Cost / 90;

  let best: MetroResult["best"];
  let bestLabel: string;
  if (perDay90 <= perDay30 && perDay90 <= perDayNoPass) {
    best = "pass90";
    bestLabel = "90-day pass is your best deal";
  } else if (perDay30 <= perDayNoPass) {
    best = "pass30";
    bestLabel = "30-day pass is your best deal";
  } else {
    best = "ppr";
    bestLabel = "Pay-per-ride is cheapest for you";
  }

  return {
    zonesTravelled,
    singleFare,
    dailyCost,
    monthlyNoPass,
    pass30Cost,
    pass90Monthly,
    saving30,
    saving90Monthly,
    best,
    bestLabel,
  };
}
