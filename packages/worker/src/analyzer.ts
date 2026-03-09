import type {
  AnalysisModule,
  BridgeListing,
  ListingAnalysis,
  ModuleResult,
  Recommendation,
  ScoutConfig,
} from "@miami-listing-scout/shared";
import { ANALYSIS_MODULES } from "@miami-listing-scout/shared";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const BATCH_SIZE = 5;

const SYSTEM_PROMPT = `You are an expert Miami real estate investment analyst. You analyze MLS listings and provide detailed, data-driven assessments across multiple dimensions.

You MUST respond with valid JSON matching this exact structure:
{
  "overallScore": <number 1-10>,
  "summary": "<2-3 sentence executive summary>",
  "moduleResults": {
    "<module_name>": {
      "score": <number 1-10>,
      "analysis": "<detailed analysis paragraph>",
      "highlights": ["<key point 1>", "<key point 2>", ...]
    }
  },
  "customResults": {
    "<requirement>": "<answer>"
  },
  "recommendation": "<strong_buy|buy|watch|pass>"
}

Scoring guide:
- 8-10: Excellent opportunity, strong fundamentals
- 5-7: Decent opportunity, some considerations
- 1-4: Below average, significant concerns

Recommendation guide:
- strong_buy: Score 9-10, exceptional value and fundamentals
- buy: Score 7-8, solid opportunity worth pursuing
- watch: Score 5-6, has potential but wait for price drop or more info
- pass: Score 1-4, too many red flags or poor value

Be specific to Miami market dynamics: flood zones, hurricane insurance, condo special assessments, rental regulations, seasonal market patterns, and neighborhood-level trends.`;

function buildUserPrompt(
  listing: BridgeListing,
  config: ScoutConfig,
): string {
  const lines: string[] = [];

  lines.push("Analyze this Miami-area listing:\n");
  lines.push("```json");
  lines.push(JSON.stringify(listing, null, 2));
  lines.push("```\n");

  lines.push(`Enabled analysis modules: ${config.analysisModules.join(", ")}\n`);

  lines.push("For each enabled module, provide analysis:");
  for (const mod of config.analysisModules) {
    switch (mod) {
      case "investment_potential":
        lines.push("- investment_potential: ROI estimate, rental yield, appreciation potential");
        break;
      case "price_vs_comps":
        lines.push("- price_vs_comps: How does the price compare to similar recent sales nearby?");
        break;
      case "red_flags":
        lines.push("- red_flags: Structural issues, days on market anomalies, price drops, HOA red flags");
        break;
      case "neighborhood_insights":
        lines.push("- neighborhood_insights: School ratings, crime, walkability, nearby development");
        break;
      case "rental_analysis":
        lines.push("- rental_analysis: Estimated monthly rent, occupancy rates, short-term vs long-term");
        break;
      case "flip_potential":
        lines.push("- flip_potential: Estimated rehab cost and ARV (after repair value)");
        break;
    }
  }

  if (config.customRequirements.length > 0) {
    lines.push("\nAlso answer these custom questions in the customResults field:");
    for (const req of config.customRequirements) {
      lines.push(`- "${req}"`);
    }
  }

  lines.push("\nRespond ONLY with the JSON object. No markdown fences, no extra text.");

  return lines.join("\n");
}

interface AnthropicMessage {
  id: string;
  content: Array<{ type: string; text?: string }>;
}

export async function analyzeListing(
  listing: BridgeListing,
  config: ScoutConfig,
  apiKey: string,
): Promise<ListingAnalysis> {
  const userPrompt = buildUserPrompt(listing, config);

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body.substring(0, 300)}`);
  }

  const msg: AnthropicMessage = await res.json();
  const textBlock = msg.content.find((b) => b.type === "text");
  if (!textBlock?.text) {
    throw new Error("No text content in Anthropic response");
  }

  const parsed = JSON.parse(textBlock.text) as {
    overallScore: number;
    summary: string;
    moduleResults: Record<string, ModuleResult>;
    customResults: Record<string, string>;
    recommendation: string;
  };

  // Validate and fill missing modules with defaults
  const moduleResults = {} as Record<AnalysisModule, ModuleResult>;
  for (const mod of ANALYSIS_MODULES) {
    if (parsed.moduleResults[mod]) {
      moduleResults[mod] = parsed.moduleResults[mod];
    } else {
      moduleResults[mod] = { score: 0, analysis: "Not analyzed", highlights: [] };
    }
  }

  const recommendation = (["strong_buy", "buy", "watch", "pass"].includes(parsed.recommendation)
    ? parsed.recommendation
    : "watch") as Recommendation;

  return {
    listingId: listing.listingId,
    overallScore: Math.min(10, Math.max(1, Math.round(parsed.overallScore))),
    summary: parsed.summary ?? "",
    moduleResults,
    customResults: parsed.customResults ?? {},
    recommendation,
    analyzedAt: new Date().toISOString(),
  };
}

export async function analyzeListings(
  listings: BridgeListing[],
  config: ScoutConfig,
  apiKey: string,
): Promise<ListingAnalysis[]> {
  const results: ListingAnalysis[] = [];

  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(listings.length / BATCH_SIZE);

    console.log(`[analyzer] Processing batch ${batchNum}/${totalBatches} (${batch.length} listings)`);

    const settled = await Promise.allSettled(
      batch.map((listing) => analyzeListing(listing, config, apiKey)),
    );

    for (let j = 0; j < settled.length; j++) {
      const result = settled[j];
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        console.error(
          `[analyzer] Failed to analyze listing ${batch[j].listingId}: ${result.reason}`,
        );
      }
    }
  }

  console.log(`[analyzer] Completed — ${results.length}/${listings.length} analyzed successfully`);
  return results;
}
