/**
 * Move-in budget data + math, ported faithfully from the legacy calculator
 * (Website/index.html ~6159–6482). Amounts in AED/month unless noted.
 */

export interface Option {
  key: string;
  label: string;
  note?: string;
  aed: number;
}

/** Visit-visa cost by duration (one-time). */
export const VISA_COST: Record<number, number> = { 1: 300, 2: 600 };

/** Flight cost by type (one-time). */
export const FLIGHT_COST = { roundtrip: 1200, oneway: 600 } as const;
export type FlightType = keyof typeof FLIGHT_COST;

/** Arrival one-time checklist items. */
export const ARRIVAL_ITEMS: Option[] = [
  { key: "taxi", label: "Airport taxi", note: "Taxi / Careem", aed: 55 },
  { key: "sim", label: "SIM + recharge", note: "Du / Etisalat prepaid", aed: 100 },
  { key: "photocopies", label: "Photocopies", note: "Emirates ID, visa docs", aed: 25 },
  { key: "attestation", label: "Degree attestation", note: "Certificate attestation", aed: 500 },
  { key: "necessities", label: "Basic necessities", note: "Toiletries, basics", aed: 100 },
  { key: "utensils", label: "Utensils starter set", note: "Cooking & eating set", aed: 250 },
  { key: "meals", label: "First days meals", note: "Food for initial days", aed: 100 },
];

/** Temporary stay (per night, one-time × nights). */
export const TEMP_STAY: Option[] = [
  { key: "hostel", label: "Hostel", aed: 80 },
  { key: "budget_hotel", label: "Budget hotel", aed: 120 },
  { key: "airbnb", label: "Airbnb", aed: 200 },
];

/** Housing (monthly rent; deposit ≈ 40% added one-time). */
export const HOUSING: Option[] = [
  { key: "bunk", label: "Bunk bed space", aed: 725 },
  { key: "bed", label: "Bed space", aed: 1200 },
  { key: "partition", label: "Partition", aed: 1700 },
  { key: "room", label: "Private room", aed: 2600 },
  { key: "studio", label: "Studio", aed: 3500 },
  { key: "bhk", label: "1 BHK", aed: 4500 },
];

/** Food (monthly). */
export const FOOD: Option[] = [
  { key: "self_cook", label: "Self cook", note: "Groceries", aed: 400 },
  { key: "tiffin", label: "Cook + tiffin", note: "Mixed", aed: 650 },
  { key: "eat_out", label: "Eat out", note: "Restaurants", aed: 1000 },
];

/** Transport (monthly). */
export const TRANSPORT: Option[] = [
  { key: "metro", label: "Metro / bus", aed: 230 },
  { key: "metro_taxi", label: "Metro + taxi", aed: 600 },
  { key: "rental", label: "Rental car", aed: 2200 },
];

/** Lifestyle add-ons (monthly checklist). */
export const LIFESTYLE_ITEMS: Option[] = [
  { key: "dewa", label: "DEWA (water & electricity)", aed: 500 },
  { key: "internet", label: "Internet", aed: 300 },
  { key: "grooming", label: "Grooming", aed: 35 },
  { key: "laundry", label: "Laundry", aed: 100 },
  { key: "movies", label: "Movies", aed: 100 },
  { key: "outings", label: "Outings", aed: 125 },
  { key: "shopping", label: "Shopping", aed: 200 },
  { key: "cook", label: "Private cook", aed: 450 },
];

export interface BudgetInputs {
  durationMonths: number; // 1 or 2
  flightType: FlightType;
  arrival: string[]; // keys from ARRIVAL_ITEMS
  tempStayKey: string | null;
  tempNights: number;
  housingKey: string | null;
  foodKey: string | null;
  transportKey: string | null;
  lifestyle: string[]; // keys from LIFESTYLE_ITEMS
}

export const DEFAULT_BUDGET_INPUTS: BudgetInputs = {
  durationMonths: 2,
  flightType: "roundtrip",
  arrival: ["taxi", "sim", "necessities", "meals"],
  tempStayKey: "budget_hotel",
  tempNights: 7,
  housingKey: "bed",
  foodKey: "tiffin",
  transportKey: "metro",
  lifestyle: ["dewa", "internet"],
};

export interface BudgetResult {
  oneTimeAed: number;
  monthlyAed: number;
  bufferAed: number;
  totalAed: number;
}

function sumByKey(options: Option[], keys: string[]): number {
  return options
    .filter((o) => keys.includes(o.key))
    .reduce((sum, o) => sum + o.aed, 0);
}

function find(options: Option[], key: string | null): Option | undefined {
  return key ? options.find((o) => o.key === key) : undefined;
}

/**
 * total = one-time + (monthly × duration) + 10% buffer.
 * Housing adds rent to monthly and a ~40% deposit to one-time.
 */
export function calculateBudget(inputs: BudgetInputs): BudgetResult {
  const flight = FLIGHT_COST[inputs.flightType];
  const visa = VISA_COST[inputs.durationMonths] ?? 600;

  let oneTime = flight + visa;
  oneTime += sumByKey(ARRIVAL_ITEMS, inputs.arrival);

  const temp = find(TEMP_STAY, inputs.tempStayKey);
  if (temp && inputs.tempNights > 0) oneTime += temp.aed * inputs.tempNights;

  let monthly = 0;
  const housing = find(HOUSING, inputs.housingKey);
  if (housing) {
    monthly += housing.aed;
    oneTime += Math.round(housing.aed * 0.4); // deposit
  }
  monthly += find(FOOD, inputs.foodKey)?.aed ?? 0;
  monthly += find(TRANSPORT, inputs.transportKey)?.aed ?? 0;
  monthly += sumByKey(LIFESTYLE_ITEMS, inputs.lifestyle);

  const subtotal = oneTime + monthly * inputs.durationMonths;
  const buffer = Math.round(subtotal * 0.1);

  return {
    oneTimeAed: oneTime,
    monthlyAed: monthly,
    bufferAed: buffer,
    totalAed: subtotal + buffer,
  };
}
