// DTDC Express Courier Rates & Delivery Zones for Neel's Designer Studio
// Origin Hub: Moodbidri, Dakshina Kannada, Karnataka - 574227

export const FREE_SHIPPING_THRESHOLD = 8000;

export interface ShippingZone {
  code: "ZONE_1" | "ZONE_2" | "ZONE_3" | "ZONE_4";
  name: string;
  rate: number;
  estimate: string;
  description: string;
}

export const DTDC_ZONES: Record<ShippingZone["code"], ShippingZone> = {
  ZONE_1: {
    code: "ZONE_1",
    name: "Karnataka (Intra-State Express)",
    rate: 80,
    estimate: "2–4 business days",
    description: "DTDC Surface & Air Express within Karnataka",
  },
  ZONE_2: {
    code: "ZONE_2",
    name: "South India (Regional Express)",
    rate: 120,
    estimate: "3–5 business days",
    description: "DTDC Express to Kerala, Tamil Nadu, Andhra Pradesh, Telangana, Goa & Puducherry",
  },
  ZONE_3: {
    code: "ZONE_3",
    name: "Rest of India (National Express)",
    rate: 180,
    estimate: "5–7 business days",
    description: "DTDC National Express to Mumbai, Delhi, Gujarat, Rajasthan & central/northern states",
  },
  ZONE_4: {
    code: "ZONE_4",
    name: "Special / Remote / North-East",
    rate: 250,
    estimate: "7–10 business days",
    description: "DTDC Special Air Express to North-Eastern states, J&K, Himachal Pradesh & islands",
  },
};

// All 28 Indian States & 8 Union Territories categorized by DTDC shipping zone
export const INDIAN_STATES_BY_ZONE: Record<string, ShippingZone["code"]> = {
  // Zone 1: Intra-Karnataka
  "Karnataka": "ZONE_1",

  // Zone 2: South India
  "Andhra Pradesh": "ZONE_2",
  "Goa": "ZONE_2",
  "Kerala": "ZONE_2",
  "Puducherry": "ZONE_2",
  "Tamil Nadu": "ZONE_2",
  "Telangana": "ZONE_2",

  // Zone 3: Rest of India
  "Bihar": "ZONE_3",
  "Chandigarh": "ZONE_3",
  "Chhattisgarh": "ZONE_3",
  "Dadra and Nagar Haveli and Daman and Diu": "ZONE_3",
  "Delhi": "ZONE_3",
  "Gujarat": "ZONE_3",
  "Haryana": "ZONE_3",
  "Jharkhand": "ZONE_3",
  "Madhya Pradesh": "ZONE_3",
  "Maharashtra": "ZONE_3",
  "Odisha": "ZONE_3",
  "Punjab": "ZONE_3",
  "Rajasthan": "ZONE_3",
  "Uttar Pradesh": "ZONE_3",
  "Uttarakhand": "ZONE_3",
  "West Bengal": "ZONE_3",

  // Zone 4: Special & Remote Regions
  "Andaman and Nicobar Islands": "ZONE_4",
  "Arunachal Pradesh": "ZONE_4",
  "Assam": "ZONE_4",
  "Himachal Pradesh": "ZONE_4",
  "Jammu and Kashmir": "ZONE_4",
  "Ladakh": "ZONE_4",
  "Lakshadweep": "ZONE_4",
  "Manipur": "ZONE_4",
  "Meghalaya": "ZONE_4",
  "Mizoram": "ZONE_4",
  "Nagaland": "ZONE_4",
  "Sikkim": "ZONE_4",
  "Tripura": "ZONE_4",
};

export const INDIAN_STATES_LIST = Object.keys(INDIAN_STATES_BY_ZONE).sort();

/**
 * Detect Indian State and DTDC Zone from a 6-digit PIN code
 */
export function detectStateFromPincode(pincode: string): string | null {
  const cleanPin = pincode.replace(/\D/g, "");
  if (cleanPin.length < 2) return null;

  const prefix2 = cleanPin.slice(0, 2);
  const prefix3 = cleanPin.slice(0, 3);

  if (prefix3 === "403") return "Goa";
  if (prefix3 === "737") return "Sikkim";
  if (prefix3 === "744") return "Andaman and Nicobar Islands";
  if (prefix3 === "682") return "Lakshadweep";

  const num = parseInt(prefix2, 10);
  if (num === 11) return "Delhi";
  if (num >= 12 && num <= 13) return "Haryana";
  if (num >= 14 && num <= 16) return "Punjab";
  if (num === 17) return "Himachal Pradesh";
  if (num >= 18 && num <= 19) return "Jammu and Kashmir";
  if (num >= 20 && num <= 28) return "Uttar Pradesh";
  if (num >= 30 && num <= 34) return "Rajasthan";
  if (num >= 36 && num <= 39) return "Gujarat";
  if (num >= 40 && num <= 44) return "Maharashtra";
  if (num >= 45 && num <= 49) return "Madhya Pradesh";
  if (num >= 50 && num <= 53) return "Telangana";
  if (num >= 56 && num <= 59) return "Karnataka";
  if (num >= 60 && num <= 64) return "Tamil Nadu";
  if (num >= 67 && num <= 69) return "Kerala";
  if (num >= 70 && num <= 74) return "West Bengal";
  if (num >= 75 && num <= 77) return "Odisha";
  if (num === 78) return "Assam";
  if (num === 79) return "Meghalaya";
  if (num >= 80 && num <= 85) return "Bihar";

  return null;
}

export interface ShippingRateResult {
  rate: number;
  zoneCode: ShippingZone["code"];
  zoneName: string;
  estimate: string;
  description: string;
  isFree: boolean;
  freeThresholdDiff: number;
  appliedState: string;
}

/**
 * Calculate dynamic DTDC delivery rate based on subtotal, destination state, or pincode
 */
export function calculateDtdcShipping(
  subtotal: number,
  state?: string,
  pincode?: string
): ShippingRateResult {
  // Free shipping on orders >= Rs 8,000 or empty cart
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const freeThresholdDiff = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Normalize state if provided
  let targetState = (state || "").trim();

  // If state is not provided or not in list, attempt auto-detect from pincode
  if (!targetState || !INDIAN_STATES_BY_ZONE[targetState]) {
    const detected = pincode ? detectStateFromPincode(pincode) : null;
    if (detected) {
      targetState = detected;
    }
  }

  // Lookup zone or default to Karnataka / Zone 1
  const zoneCode: ShippingZone["code"] =
    (targetState && INDIAN_STATES_BY_ZONE[targetState]) || "ZONE_1";
  const zoneInfo = DTDC_ZONES[zoneCode];

  return {
    rate: isFree ? 0 : zoneInfo.rate,
    zoneCode,
    zoneName: zoneInfo.name,
    estimate: isFree && subtotal > 0 ? "2–5 business days (Insured Express)" : zoneInfo.estimate,
    description: zoneInfo.description,
    isFree,
    freeThresholdDiff,
    appliedState: targetState || "Karnataka",
  };
}
