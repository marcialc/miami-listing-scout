import type { ScoutConfig } from "@miami-listing-scout/shared";
import { DEFAULT_CONFIG } from "@miami-listing-scout/shared";

const CONFIG_KEY = "scout_config";
const LAST_RUN_KEY = "last_run_timestamp";
const SEEN_PREFIX = "seen:";
const SEEN_TTL = 60 * 60 * 24 * 30; // 30 days in seconds

export async function getConfig(kv: KVNamespace): Promise<ScoutConfig> {
  const raw = await kv.get(CONFIG_KEY);
  if (!raw) {
    console.log("[config] No config found in KV, using defaults");
    const now = new Date().toISOString();
    return {
      id: "default",
      email: "",
      name: "",
      ...DEFAULT_CONFIG,
      createdAt: now,
      updatedAt: now,
    };
  }
  return JSON.parse(raw) as ScoutConfig;
}

export async function saveConfig(kv: KVNamespace, config: ScoutConfig): Promise<void> {
  config.updatedAt = new Date().toISOString();
  await kv.put(CONFIG_KEY, JSON.stringify(config));
  console.log("[config] Config saved to KV");
}

export async function getLastRunTimestamp(kv: KVNamespace): Promise<string> {
  const ts = await kv.get(LAST_RUN_KEY);
  if (!ts) {
    const fallback = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`[config] No last run found, defaulting to 24h ago: ${fallback}`);
    return fallback;
  }
  return ts;
}

export async function setLastRunTimestamp(kv: KVNamespace, timestamp: string): Promise<void> {
  await kv.put(LAST_RUN_KEY, timestamp);
}

export async function hasSeenListing(kv: KVNamespace, listingId: string): Promise<boolean> {
  const val = await kv.get(`${SEEN_PREFIX}${listingId}`);
  return val !== null;
}

export async function markListingsSeen(kv: KVNamespace, listingIds: string[]): Promise<void> {
  const now = new Date().toISOString();
  await Promise.all(
    listingIds.map((id) =>
      kv.put(`${SEEN_PREFIX}${id}`, now, { expirationTtl: SEEN_TTL }),
    ),
  );
  console.log(`[config] Marked ${listingIds.length} listings as seen`);
}
