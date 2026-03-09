import type { BridgeListing, ListingFilters } from "@miami-listing-scout/shared";

const BRIDGE_BASE = "https://api.bridgedataoutput.com/api/v2/OData/miamire/Property";

interface BridgeResponse {
  value: BridgeRecord[];
  "@odata.nextLink"?: string;
}

interface BridgeRecord {
  ListingKey: string;
  ListingId: string;
  ListPrice: number;
  ListingContractDate?: string;
  StandardStatus: string;
  UnparsedAddress?: string;
  StreetNumber?: string;
  StreetName?: string;
  StreetSuffix?: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  CountyOrParish?: string;
  PropertyType?: string;
  PropertySubType?: string;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  BathroomsFull?: number;
  BathroomsHalf?: number;
  LivingArea?: number;
  LotSizeSquareFeet?: number;
  YearBuilt?: number;
  StoriesTotal?: number;
  GarageSpaces?: number;
  PoolPrivateYN?: boolean;
  WaterfrontYN?: boolean;
  PublicRemarks?: string;
  Media?: Array<{ MediaURL: string; Order: number }>;
  ListAgentFullName?: string;
  ListAgentDirectPhone?: string;
  ListAgentEmail?: string;
  ListOfficeName?: string;
  Latitude?: number;
  Longitude?: number;
  OnMarketDate?: string;
  ModificationTimestamp?: string;
  CloseDate?: string;
  AssociationFee?: number;
  TaxAnnualAmount?: number;
  TaxYear?: number;
}

function buildFilter(filters: ListingFilters, since: string): string {
  const clauses: string[] = [];

  clauses.push(`ModificationTimestamp gt ${since}`);
  clauses.push("StandardStatus eq 'Active'");

  if (filters.cities.length > 0) {
    const cityFilter = filters.cities
      .map((c) => `City eq '${c}'`)
      .join(" or ");
    clauses.push(`(${cityFilter})`);
  }

  if (filters.minPrice != null) {
    clauses.push(`ListPrice ge ${filters.minPrice}`);
  }
  if (filters.maxPrice != null) {
    clauses.push(`ListPrice le ${filters.maxPrice}`);
  }
  if (filters.minBeds != null) {
    clauses.push(`BedroomsTotal ge ${filters.minBeds}`);
  }
  if (filters.maxBeds != null) {
    clauses.push(`BedroomsTotal le ${filters.maxBeds}`);
  }
  if (filters.minBaths != null) {
    clauses.push(`BathroomsTotalInteger ge ${filters.minBaths}`);
  }
  if (filters.maxBaths != null) {
    clauses.push(`BathroomsTotalInteger le ${filters.maxBaths}`);
  }
  if (filters.minSqft != null) {
    clauses.push(`LivingArea ge ${filters.minSqft}`);
  }
  if (filters.maxSqft != null) {
    clauses.push(`LivingArea le ${filters.maxSqft}`);
  }
  if (filters.propertyTypes.length > 0) {
    const typeFilter = filters.propertyTypes
      .map((t) => `PropertySubType eq '${t}'`)
      .join(" or ");
    clauses.push(`(${typeFilter})`);
  }

  return clauses.join(" and ");
}

function mapRecord(r: BridgeRecord): BridgeListing {
  const street = [r.StreetNumber, r.StreetName, r.StreetSuffix]
    .filter(Boolean)
    .join(" ");

  const photos = (r.Media ?? [])
    .sort((a, b) => a.Order - b.Order)
    .map((m) => m.MediaURL);

  return {
    listingId: r.ListingKey,
    mlsId: r.ListingId,
    listPrice: r.ListPrice,
    listDate: r.OnMarketDate ?? r.ListingContractDate ?? "",
    status: r.StandardStatus,
    address: {
      full: r.UnparsedAddress ?? `${street}, ${r.City}, ${r.StateOrProvince} ${r.PostalCode}`,
      street,
      city: r.City,
      state: r.StateOrProvince,
      zip: r.PostalCode,
      county: r.CountyOrParish ?? "",
    },
    property: {
      type: r.PropertySubType ?? r.PropertyType ?? "",
      bedrooms: r.BedroomsTotal ?? 0,
      bathrooms: r.BathroomsTotalInteger ?? 0,
      bathsFull: r.BathroomsFull ?? 0,
      bathsHalf: r.BathroomsHalf ?? 0,
      sqft: r.LivingArea ?? 0,
      lotSize: r.LotSizeSquareFeet ?? 0,
      yearBuilt: r.YearBuilt ?? 0,
      stories: r.StoriesTotal ?? 0,
      garage: r.GarageSpaces ?? 0,
      pool: r.PoolPrivateYN ?? false,
      waterfront: r.WaterfrontYN ?? false,
      description: r.PublicRemarks ?? "",
    },
    photos,
    agent: {
      name: r.ListAgentFullName ?? "",
      phone: r.ListAgentDirectPhone ?? "",
      email: r.ListAgentEmail ?? "",
      office: r.ListOfficeName ?? "",
    },
    geo: {
      lat: r.Latitude ?? 0,
      lng: r.Longitude ?? 0,
    },
    dates: {
      listed: r.OnMarketDate ?? "",
      modified: r.ModificationTimestamp ?? "",
      contractDate: r.ListingContractDate,
      closeDate: r.CloseDate,
    },
    financial: {
      hoaFee: r.AssociationFee,
      taxAmount: r.TaxAnnualAmount,
      taxYear: r.TaxYear,
    },
  };
}

export async function fetchNewListings(
  token: string,
  filters: ListingFilters,
  since: string,
): Promise<BridgeListing[]> {
  const allListings: BridgeListing[] = [];
  const filterStr = buildFilter(filters, since);

  let url: string | null = `${BRIDGE_BASE}?$filter=${encodeURIComponent(filterStr)}&$top=200&$orderby=ModificationTimestamp desc`;

  console.log(`[bridge] Fetching listings modified since ${since}`);

  while (url) {
    console.log(`[bridge] Requesting: ${url.substring(0, 120)}...`);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 401 || res.status === 403) {
        console.error(`[bridge] Authentication failed (${res.status}). Your BRIDGE_API_TOKEN may be expired or invalid. Visit https://bridgedataoutput.com to refresh your credentials.`);
      }
      console.error(`[bridge] API error ${res.status}: ${body.substring(0, 500)}`);
      throw new Error(`Bridge API returned ${res.status}: ${body.substring(0, 200)}`);
    }

    const data: BridgeResponse = await res.json();
    const mapped = data.value.map(mapRecord);
    allListings.push(...mapped);

    console.log(`[bridge] Got ${data.value.length} records (total: ${allListings.length})`);

    url = data["@odata.nextLink"] ?? null;
  }

  console.log(`[bridge] Finished — ${allListings.length} total listings fetched`);
  return allListings;
}
