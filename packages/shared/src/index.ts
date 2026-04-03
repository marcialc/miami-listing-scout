// ── Analysis Modules ──────────────────────────────────────────────

export const ANALYSIS_MODULES = [
  "investment_potential",
  "price_vs_comps",
  "red_flags",
  "neighborhood_insights",
  "rental_analysis",
  "flip_potential",
] as const;

export type AnalysisModule = (typeof ANALYSIS_MODULES)[number];

export type ScanFrequency = "daily" | "twice_daily" | "weekdays_only";

// ── Listing Filters ──────────────────────────────────────────────

export interface ListingFilters {
  cities: string[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  propertyTypes: string[];
  minSqft?: number;
  maxSqft?: number;
  keywords: string[];
}

// ── Scout Config ─────────────────────────────────────────────────

export type Locale = "en" | "es";

export interface ScoutConfig {
  id: string;
  email: string;
  name: string;
  locale: Locale;
  baseFilters: ListingFilters;
  analysisModules: AnalysisModule[];
  customRequirements: string[];
  schedule: {
    timezone: string;
    hour: number;
    frequency: ScanFrequency;
  };
  maxListingsPerReport: number;
  rprEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Bridge Listing ───────────────────────────────────────────────

export interface BridgeListing {
  listingId: string;
  mlsId: string;
  listPrice: number;
  listDate: string;
  status: string;
  address: {
    full: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    county: string;
  };
  property: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    bathsFull: number;
    bathsHalf: number;
    sqft: number;
    lotSize: number;
    yearBuilt: number;
    stories: number;
    garage: number;
    pool: boolean;
    waterfront: boolean;
    description: string;
  };
  photos: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
    office: string;
  };
  geo: {
    lat: number;
    lng: number;
  };
  dates: {
    listed: string;
    modified: string;
    contractDate?: string;
    closeDate?: string;
  };
  financial: {
    hoaFee?: number;
    taxAmount?: number;
    taxYear?: number;
  };
}

// ── Listing Analysis ─────────────────────────────────────────────

export type Recommendation = "strong_buy" | "buy" | "watch" | "pass";

export interface ModuleResult {
  score: number;
  analysis: string;
  highlights: string[];
}

export interface ListingAnalysis {
  listingId: string;
  overallScore: number;
  summary: string;
  moduleResults: Record<AnalysisModule, ModuleResult>;
  customResults: Record<string, string>;
  recommendation: Recommendation;
  analyzedAt: string;
}

// ── RPR Data ────────────────────────────────────────────────────

export interface RprValuation {
  estimatedValue: number;
  valuationDate: string;
  confidenceScore: number;       // 0-100
  priceToValueRatio: number;     // listPrice / estimatedValue
}

export interface RprNeighborhood {
  appreciationRate1Yr: number;
  appreciationRate5Yr: number;
  medianHomeValue: number;
  medianHouseholdIncome: number;
}

export interface RprSchool {
  name: string;
  type: "elementary" | "middle" | "high";
  rating: number;                // 1-10
  distanceMiles: number;
}

export interface RprFloodZone {
  zone: string;                  // e.g. "AE", "X"
  isHighRisk: boolean;
  description: string;
}

export interface RprTaxHistory {
  year: number;
  assessedValue: number;
  taxAmount: number;
}

export interface RprInvestmentMetrics {
  estimatedCapRate: number;
  estimatedMonthlyCashFlow: number;
  estimatedMonthlyRent: number;
  grossRentMultiplier: number;
}

export interface RprData {
  listingId: string;
  valuation: RprValuation;
  neighborhood: RprNeighborhood;
  schools: RprSchool[];
  floodZone: RprFloodZone;
  taxHistory: RprTaxHistory[];
  investmentMetrics: RprInvestmentMetrics;
  fetchedAt: string;
}

// ── Daily Report ─────────────────────────────────────────────────

export interface DailyReport {
  date: string;
  totalNewListings: number;
  totalMatches: number;
  totalAnalyzed: number;
  failedAnalysisCount: number;
  listings: Array<{
    listing: BridgeListing;
    analysis: ListingAnalysis;
    rprData?: RprData;
  }>;
  generatedAt: string;
}

// ── Report Summary (for index/listing) ──────────────────────────

export interface ReportSummary {
  key: string;
  date: string;
  generatedAt: string;
  totalNewListings: number;
  totalMatches: number;
  totalAnalyzed: number;
  listingsCount: number;
}

// ── MLS Cities ──────────────────────────────────────────────────

export const MLS_CITIES: readonly string[] = [
  // Miami-Dade County
  "Aventura",
  "Bal Harbour",
  "Bay Harbor Islands",
  "Biscayne Park",
  "Brickell",
  "Coconut Grove",
  "Coral Gables",
  "Cutler Bay",
  "Doral",
  "Edgewater",
  "El Portal",
  "Florida City",
  "Golden Beach",
  "Hialeah",
  "Hialeah Gardens",
  "Homestead",
  "Indian Creek",
  "Islandia",
  "Key Biscayne",
  "Medley",
  "Miami",
  "Miami Beach",
  "Miami Gardens",
  "Miami Lakes",
  "Miami Shores",
  "Miami Springs",
  "Midtown",
  "North Bay Village",
  "North Miami",
  "North Miami Beach",
  "Opa-locka",
  "Palmetto Bay",
  "Pinecrest",
  "South Miami",
  "Sunny Isles Beach",
  "Surfside",
  "Sweetwater",
  "Virginia Gardens",
  "West Miami",
  "Wynwood",
  // Broward County
  "Coconut Creek",
  "Cooper City",
  "Coral Springs",
  "Dania Beach",
  "Davie",
  "Deerfield Beach",
  "Fort Lauderdale",
  "Hallandale Beach",
  "Hillsboro Beach",
  "Hollywood",
  "Lauderdale Lakes",
  "Lauderdale-by-the-Sea",
  "Lauderhill",
  "Lazy Lake",
  "Lighthouse Point",
  "Margate",
  "Miramar",
  "North Lauderdale",
  "Oakland Park",
  "Parkland",
  "Pembroke Park",
  "Pembroke Pines",
  "Plantation",
  "Pompano Beach",
  "Sea Ranch Lakes",
  "Southwest Ranches",
  "Sunrise",
  "Tamarac",
  "Weston",
  "Wilton Manors",
  // Palm Beach County
  "Atlantis",
  "Belle Glade",
  "Boca Raton",
  "Boynton Beach",
  "Briny Breezes",
  "Cloud Lake",
  "Delray Beach",
  "Glen Ridge",
  "Golf",
  "Greenacres",
  "Gulf Stream",
  "Haverhill",
  "Highland Beach",
  "Hypoluxo",
  "Juno Beach",
  "Jupiter",
  "Jupiter Inlet Colony",
  "Lake Clarke Shores",
  "Lake Park",
  "Lake Worth Beach",
  "Lantana",
  "Loxahatchee Groves",
  "Manalapan",
  "Mangonia Park",
  "North Palm Beach",
  "Ocean Ridge",
  "Pahokee",
  "Palm Beach",
  "Palm Beach Gardens",
  "Palm Beach Shores",
  "Palm Springs",
  "Riviera Beach",
  "Royal Palm Beach",
  "South Bay",
  "South Palm Beach",
  "Tequesta",
  "Wellington",
  "West Palm Beach",
  "Westlake",
] as const;

// ── Default Config ───────────────────────────────────────────────

export const DEFAULT_CONFIG: Omit<ScoutConfig, "id" | "email" | "name" | "createdAt" | "updatedAt"> = {
  locale: "en",
  baseFilters: {
    cities: [
      "Miami",
      "Miami Beach",
      "Coral Gables",
      "Coconut Grove",
      "Brickell",
      "Doral",
      "Aventura",
    ],
    minPrice: 300_000,
    maxPrice: 1_500_000,
    propertyTypes: ["Single Family", "Condo", "Townhouse"],
    keywords: [],
  },
  analysisModules: [...ANALYSIS_MODULES],
  customRequirements: [],
  schedule: {
    timezone: "America/New_York",
    hour: 7,
    frequency: "daily",
  },
  maxListingsPerReport: 25,
  rprEnabled: false,
};
