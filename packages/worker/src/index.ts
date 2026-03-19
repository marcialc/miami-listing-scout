import { fetchNewListings } from "./bridge";
import { analyzeListings } from "./analyzer";
import { buildReport, renderEmail, sendReport } from "./email";
import { getConfig, getLastRunTimestamp, hasSeenListing, markListingsSeen, saveConfig, setLastRunTimestamp, saveReport, getReportIndex, getReport } from "./config";
import { MOCK_LISTINGS } from "./mock";
import type { ScoutConfig } from "@miami-listing-scout/shared";
import { MLS_CITIES } from "@miami-listing-scout/shared";

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

async function runPipeline(env: Env, preloadedConfig?: ScoutConfig): Promise<string> {
  const startTime = Date.now();
  const mock = isMockMode(env);
  console.log(`[pipeline] Starting daily listing scan${mock ? " (MOCK MODE)" : ""}`);

  console.log("env.EMAIL_FROM: ",env.EMAIL_FROM)
  // 1. Load config (use preloaded if available to avoid redundant KV read)
  const config = preloadedConfig ?? await getConfig(env.SCOUT_CONFIG);
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

  // 5. If no new matches, skip report and email
  if (newListings.length === 0) {
    console.log("[pipeline] No new listings — skipping report and email");
    await setLastRunTimestamp(env.SCOUT_CONFIG, new Date().toISOString());
    return "No new listings found";
  }

  // 6. Analyze matches with Haiku
  const analyses = await analyzeListings(newListings, config, env.ANTHROPIC_API_KEY);
  const failedCount = newListings.length - analyses.length;
  console.log(`[pipeline] ${analyses.length}/${newListings.length} listings analyzed${failedCount > 0 ? ` (${failedCount} failed)` : ""}`);

  // 7. Cap listings to maxListingsPerReport (sort by score descending to pick best N; buildReport re-sorts)
  const maxListings = config.maxListingsPerReport;
  const cappedAnalyses = analyses
    .slice()
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, maxListings);

  // 8. Build report, persist to KV, then send email
  const report = buildReport(newListings, cappedAnalyses, config, totalFetched, failedCount);
  await saveReport(env.SCOUT_CONFIG, report);
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

  // 9. Mark all processed listings as seen
  await markListingsSeen(
    env.SEEN_LISTINGS,
    newListings.map((l) => l.listingId),
  );

  // 10. Update last run timestamp
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

  // GET /api/cities
  if (path === "/api/cities" && request.method === "GET") {
    return jsonResponse({ cities: [...MLS_CITIES] }, request);
  }

  // POST /api/test-run
  if (path === "/api/test-run" && request.method === "POST") {
    console.log("[api] Manual test run triggered");
    try {
      const result = await runPipeline(env);
      return jsonResponse({ status: "done", message: result }, request);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return jsonResponse({ status: "error", message: msg }, request, 500);
    }
  }

  // GET /api/reports — list summaries or fetch single report by key
  if (path === "/api/reports" && request.method === "GET") {
    const key = url.searchParams.get("key");
    if (key) {
      const report = await getReport(env.SCOUT_CONFIG, key);
      if (!report) {
        return jsonResponse({ error: "Report not found" }, request, 404);
      }
      return jsonResponse(report, request);
    }
    const index = await getReportIndex(env.SCOUT_CONFIG);
    return jsonResponse(index, request);
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
      const config = await getConfig(env.SCOUT_CONFIG);
      const frequency = config.schedule.frequency;
      const now = new Date();
      const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
      const utcHour = now.getUTCHours();

      // Skip weekends for weekdays_only
      if (frequency === "weekdays_only" && (utcDay === 0 || utcDay === 6)) {
        console.log("[cron] Skipping — weekdays_only and today is a weekend");
        return;
      }

      // For daily/weekdays_only: cron fires every 12h but we only want one run per day.
      // Approximate the configured send hour in UTC and skip if this trigger is far from it.
      if (frequency === "daily" || frequency === "weekdays_only") {
        const configuredHour = config.schedule.hour ?? 7; // local hour, e.g. 7 AM
        // Rough EST/EDT offset: UTC-5 in winter, UTC-4 in summer. Use -5 as default.
        const tzOffset = -5;
        const configuredUtcHour = ((configuredHour - tzOffset) % 24 + 24) % 24;
        const diff = Math.abs(utcHour - configuredUtcHour);
        const wrappedDiff = Math.min(diff, 24 - diff);
        if (wrappedDiff > 2) {
          console.log(`[cron] Skipping — current UTC hour ${utcHour} is far from configured UTC hour ${configuredUtcHour}`);
          return;
        }
      }

      // twice_daily: always run (cron fires every 12h, both triggers execute)

      const result = await runPipeline(env, config);
      console.log(`[cron] ${result}`);
    } catch (err) {
      console.error(`[cron] Pipeline failed: ${err}`);
    }
  },
};
