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

export interface ScoutConfig {
  id: string;
  email: string;
  name: string;
  baseFilters: ListingFilters;
  analysisModules: AnalysisModule[];
  customRequirements: string[];
  schedule: {
    timezone: string;
    hour: number;
  };
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
  }>;
  generatedAt: string;
}

// ── Default Config ───────────────────────────────────────────────

export const DEFAULT_CONFIG: Omit<ScoutConfig, "id" | "email" | "name" | "createdAt" | "updatedAt"> = {
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
  },
};
