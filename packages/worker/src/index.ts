import { fetchNewListings } from "./bridge";
import { analyzeListings } from "./analyzer";
import { buildReport, renderEmail, sendReport } from "./email";
import { getConfig, getLastRunTimestamp, hasSeenListing, markListingsSeen, saveConfig, setLastRunTimestamp } from "./config";
import { MOCK_LISTINGS } from "./mock";
import type { ScoutConfig } from "@miami-listing-scout/shared";

export interface Env {
  SCOUT_CONFIG: KVNamespace;
  SEEN_LISTINGS: KVNamespace;
  BRIDGE_API_TOKEN: string;
  ANTHROPIC_API_KEY: string;
  RESEND_API_KEY: string;
  CONFIG_API_KEY: string;
  EMAIL_FROM: string;
  MOCK_MODE: string;
}

function isMockMode(env: Env): boolean {
  return env.MOCK_MODE === "true";
}

// ── Pipeline ────────────────────────────────────────────────────

async function runPipeline(env: Env): Promise<string> {
  const startTime = Date.now();
  const mock = isMockMode(env);
  console.log(`[pipeline] Starting daily listing scan${mock ? " (MOCK MODE)" : ""}`);

  // 1. Load config
  const config = await getConfig(env.SCOUT_CONFIG);
  if (!config.email) {
    console.log("[pipeline] No email configured — skipping run");
    return "Skipped: no email configured";
  }

  // 2. Get last run timestamp
  const since = await getLastRunTimestamp(env.SCOUT_CONFIG);
  console.log(`[pipeline] Fetching listings since ${since}`);

  // 3. Fetch listings — mock or real
  let allListings;
  if (mock) {
    console.log("[pipeline] Using mock listings (MOCK_MODE=true)");
    allListings = MOCK_LISTINGS;
  } else {
    try {
      allListings = await fetchNewListings(env.BRIDGE_API_TOKEN, config.baseFilters, since);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[pipeline] Bridge API failed: ${msg}`);
      return `Error: Bridge API failed — ${msg}`;
    }
  }

  const totalFetched = allListings.length;
  console.log(`[pipeline] Fetched ${totalFetched} listings`);

  // 4. Filter out already-seen listings
  const seenChecks = await Promise.all(
    allListings.map(async (l) => ({
      listing: l,
      seen: await hasSeenListing(env.SEEN_LISTINGS, l.listingId),
    })),
  );
  const newListings = seenChecks.filter((c) => !c.seen).map((c) => c.listing);
  console.log(`[pipeline] ${newListings.length} new listings after dedup (${totalFetched - newListings.length} already seen)`);

  // 5. If no new matches, send empty report and return
  if (newListings.length === 0) {
    console.log("[pipeline] No new listings — sending empty report");
    const report = buildReport([], [], config, totalFetched);
    const html = renderEmail(report, config);
    try {
      await sendReport(report, html, config, env.RESEND_API_KEY, env.EMAIL_FROM);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[pipeline] Failed to send empty report email: ${msg}`);
      console.error(`[pipeline] Report data: date=${report.date}, totalMatches=${report.totalMatches}`);
    }
    await setLastRunTimestamp(env.SCOUT_CONFIG, new Date().toISOString());
    return "No new listings found";
  }

  // 6. Analyze matches with Haiku
  const analyses = await analyzeListings(newListings, config, env.ANTHROPIC_API_KEY);
  const failedCount = newListings.length - analyses.length;
  console.log(`[pipeline] ${analyses.length}/${newListings.length} listings analyzed${failedCount > 0 ? ` (${failedCount} failed)` : ""}`);

  // 7. Build and send email report
  const report = buildReport(newListings, analyses, config, totalFetched, failedCount);
  const html = renderEmail(report, config);

  try {
    await sendReport(report, html, config, env.RESEND_API_KEY, env.EMAIL_FROM);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[pipeline] Failed to send report email: ${msg}`);
    console.error(`[pipeline] Report had ${report.listings.length} analyzed listings. Report data preserved in logs.`);
    console.error(`[pipeline] Report JSON: ${JSON.stringify({ date: report.date, totalMatches: report.totalMatches, totalAnalyzed: report.totalAnalyzed, listingIds: report.listings.map((l) => l.listing.listingId) })}`);
    // Continue to mark as seen even if email fails
  }

  // 8. Mark all processed listings as seen
  await markListingsSeen(
    env.SEEN_LISTINGS,
    newListings.map((l) => l.listingId),
  );

  // 9. Update last run timestamp
  await setLastRunTimestamp(env.SCOUT_CONFIG, new Date().toISOString());

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const summary = `Done in ${elapsed}s — ${totalFetched} fetched, ${newListings.length} new, ${analyses.length} analyzed${failedCount > 0 ? `, ${failedCount} failed` : ""}`;
  console.log(`[pipeline] ${summary}`);
  return summary;
}

// ── CORS ────────────────────────────────────────────────────────

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data: unknown, request: Request, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

// ── HTTP API ────────────────────────────────────────────────────

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  // Health check — no auth required
  if (path === "/api/health" && request.method === "GET") {
    const lastRun = await getLastRunTimestamp(env.SCOUT_CONFIG);
    return jsonResponse({
      status: "ok",
      lastRun,
      mockMode: isMockMode(env),
    }, request);
  }

  // Auth check for all other API routes
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey || apiKey !== env.CONFIG_API_KEY) {
    return jsonResponse({ error: "Unauthorized" }, request, 401);
  }

  // GET /api/config
  if (path === "/api/config" && request.method === "GET") {
    const config = await getConfig(env.SCOUT_CONFIG);
    return jsonResponse(config, request);
  }

  // PUT /api/config
  if (path === "/api/config" && request.method === "PUT") {
    try {
      const body = await request.json() as ScoutConfig;
      if (!body.id || !body.email) {
        return jsonResponse({ error: "Missing required fields: id, email" }, request, 400);
      }
      await saveConfig(env.SCOUT_CONFIG, body);
      return jsonResponse({ ok: true }, request);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return jsonResponse({ error: `Invalid request body: ${msg}` }, request, 400);
    }
  }

  // POST /api/test-run
  if (path === "/api/test-run" && request.method === "POST") {
    console.log("[api] Manual test run triggered");
    const resultPromise = runPipeline(env);
    ctx.waitUntil(resultPromise);
    return jsonResponse({ status: "started", message: "Pipeline running in background" }, request);
  }

  return jsonResponse({ error: "Not found" }, request, 404);
}

// ── Worker Export ────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error(`[api] Unhandled error: ${err}`);
      return jsonResponse({ error: "Internal server error" }, request, 500);
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log("[cron] Scheduled trigger fired");
    try {
      const result = await runPipeline(env);
      console.log(`[cron] ${result}`);
    } catch (err) {
      console.error(`[cron] Pipeline failed: ${err}`);
    }
  },
};
