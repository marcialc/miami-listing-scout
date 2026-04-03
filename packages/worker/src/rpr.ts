import type { BridgeListing, RprData } from "@miami-listing-scout/shared";

const RPR_API_BASE = "https://api.narrpr.com/v2";
const BATCH_SIZE = 10;
const KV_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

async function fetchRprData(
  token: string,
  listing: BridgeListing,
): Promise<RprData> {
  const params = new URLSearchParams({
    address: listing.address.full,
    lat: String(listing.geo.lat),
    lng: String(listing.geo.lng),
  });

  const res = await fetch(`${RPR_API_BASE}/property?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RPR API error ${res.status}: ${body.substring(0, 300)}`);
  }

  const data = await res.json() as {
    valuation: RprData["valuation"];
    neighborhood: RprData["neighborhood"];
    schools: RprData["schools"];
    floodZone: RprData["floodZone"];
    taxHistory: RprData["taxHistory"];
    investmentMetrics: RprData["investmentMetrics"];
  };

  return {
    listingId: listing.listingId,
    valuation: {
      ...data.valuation,
      priceToValueRatio: listing.listPrice / data.valuation.estimatedValue,
    },
    neighborhood: data.neighborhood,
    schools: data.schools,
    floodZone: data.floodZone,
    taxHistory: data.taxHistory,
    investmentMetrics: data.investmentMetrics,
    fetchedAt: new Date().toISOString(),
  };
}

export async function enrichWithRpr(
  token: string,
  listings: BridgeListing[],
  kv: KVNamespace,
): Promise<Map<string, RprData>> {
  const result = new Map<string, RprData>();

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(listings.length / BATCH_SIZE);
    console.log(`[rpr] Processing batch ${batchNum}/${totalBatches} (${batch.length} listings)`);

    const settled = await Promise.allSettled(
      batch.map(async (listing) => {
        // Check KV cache first
        const cacheKey = `rpr:${listing.listingId}`;
        const cached = await kv.get(cacheKey, "json") as RprData | null;
        if (cached) {
          console.log(`[rpr] Cache hit for ${listing.listingId}`);
          return cached;
        }

        // Fetch from RPR API
        const data = await fetchRprData(token, listing);

        // Cache the result
        await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: KV_TTL_SECONDS });

        return data;
      }),
    );

    for (let j = 0; j < settled.length; j++) {
      const outcome = settled[j];
      if (outcome.status === "fulfilled") {
        result.set(batch[j].listingId, outcome.value);
      } else {
        console.error(`[rpr] Failed to enrich listing ${batch[j].listingId}: ${outcome.reason}`);
      }
    }
  }

  console.log(`[rpr] Completed — ${result.size}/${listings.length} enriched`);
  return result;
}
