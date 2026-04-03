import type {
  BridgeListing,
  DailyReport,
  ListingAnalysis,
  Recommendation,
  RprData,
  ScoutConfig,
} from "@miami-listing-scout/shared";

export function buildReport(
  listings: BridgeListing[],
  analyses: ListingAnalysis[],
  config: ScoutConfig,
  totalFetched: number,
  failedAnalysisCount = 0,
  dateOverride?: string,
  rprDataMap?: Map<string, RprData>,
): DailyReport {
  const analysisMap = new Map(analyses.map((a) => [a.listingId, a]));

  const paired = listings
    .filter((l) => analysisMap.has(l.listingId))
    .map((listing) => ({
      listing,
      analysis: analysisMap.get(listing.listingId)!,
      rprData: rprDataMap?.get(listing.listingId),
    }))
    .sort((a, b) => b.analysis.overallScore - a.analysis.overallScore);

  return {
    date: dateOverride ?? new Date().toISOString().split("T")[0],
    totalNewListings: totalFetched,
    totalMatches: listings.length,
    totalAnalyzed: analyses.length,
    failedAnalysisCount,
    listings: paired,
    generatedAt: new Date().toISOString(),
  };
}

function scoreColor(score: number): string {
  if (score >= 8) return "#16a34a";
  if (score >= 5) return "#ca8a04";
  return "#dc2626";
}

function scoreBg(score: number): string {
  if (score >= 8) return "#dcfce7";
  if (score >= 5) return "#fef9c3";
  return "#fee2e2";
}

function recLabel(rec: Recommendation): string {
  switch (rec) {
    case "strong_buy": return "STRONG BUY";
    case "buy": return "BUY";
    case "watch": return "WATCH";
    case "pass": return "PASS";
  }
}

function recColor(rec: Recommendation): string {
  switch (rec) {
    case "strong_buy": return "#16a34a";
    case "buy": return "#2563eb";
    case "watch": return "#ca8a04";
    case "pass": return "#dc2626";
  }
}

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("en-US");
}

function renderRprBox(rprData: RprData): string {
  const ratio = rprData.valuation.priceToValueRatio;
  const ratioColor = ratio <= 0.95 ? "#16a34a" : ratio >= 1.05 ? "#dc2626" : "#ca8a04";
  const ratioLabel = ratio <= 0.95 ? "Underpriced" : ratio >= 1.05 ? "Overpriced" : "Fair Value";
  const avgSchoolRating = rprData.schools.length > 0
    ? (rprData.schools.reduce((sum, s) => sum + s.rating, 0) / rprData.schools.length).toFixed(1)
    : "N/A";

  return `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:12px;margin-top:12px;">
      <div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:8px;">RPR Valuation</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <div>
          <div style="font-size:11px;color:#6b7280;">RVM Estimate</div>
          <div style="font-size:14px;font-weight:600;color:#111827;">$${rprData.valuation.estimatedValue.toLocaleString("en-US")}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#6b7280;">Price/Value</div>
          <div style="font-size:14px;font-weight:600;color:${ratioColor};">${(ratio * 100).toFixed(0)}% — ${ratioLabel}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#6b7280;">Flood Zone</div>
          <div style="font-size:14px;font-weight:600;color:${rprData.floodZone.isHighRisk ? "#dc2626" : "#16a34a"};">${rprData.floodZone.zone}${rprData.floodZone.isHighRisk ? " (High Risk)" : ""}</div>
        </div>
        <div>
          <div style="font-size:11px;color:#6b7280;">Schools Avg</div>
          <div style="font-size:14px;font-weight:600;color:#111827;">${avgSchoolRating}/10</div>
        </div>
        <div>
          <div style="font-size:11px;color:#6b7280;">Cap Rate</div>
          <div style="font-size:14px;font-weight:600;color:#111827;">${rprData.investmentMetrics.estimatedCapRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  `;
}

function renderListingCard(listing: BridgeListing, analysis: ListingAnalysis, rprData?: RprData): string {
  const photo = listing.photos[0];
  const photoHtml = photo
    ? `<img src="${photo}" alt="Listing photo" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px 8px 0 0;" />`
    : `<div style="width:100%;height:120px;background:#e5e7eb;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;">No Photo</div>`;

  const moduleHtml = Object.entries(analysis.moduleResults)
    .filter(([, v]) => v.score > 0)
    .map(([key, val]) => `
      <div style="margin-bottom:12px;">
        <div style="font-weight:600;font-size:13px;color:#374151;margin-bottom:2px;">
          ${key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          <span style="color:${scoreColor(val.score)};font-weight:700;margin-left:6px;">${val.score}/10</span>
        </div>
        <div style="font-size:13px;color:#4b5563;margin-bottom:4px;">${val.analysis}</div>
        ${val.highlights.length > 0 ? `<ul style="margin:4px 0 0 16px;padding:0;font-size:12px;color:#6b7280;">${val.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>` : ""}
      </div>
    `)
    .join("");

  const customHtml = Object.entries(analysis.customResults)
    .map(([q, a]) => `
      <div style="margin-bottom:8px;">
        <div style="font-weight:600;font-size:13px;color:#374151;">${q}</div>
        <div style="font-size:13px;color:#4b5563;">${a}</div>
      </div>
    `)
    .join("");

  return `
    <div style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;overflow:hidden;background:#fff;">
      ${photoHtml}
      <div style="padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
          <div>
            <div style="font-size:18px;font-weight:700;color:#111827;">${formatPrice(listing.listPrice)}</div>
            <div style="font-size:14px;color:#4b5563;">${listing.address.full}</div>
          </div>
          <div style="text-align:right;">
            <span style="display:inline-block;padding:4px 10px;border-radius:12px;font-size:14px;font-weight:700;color:${scoreColor(analysis.overallScore)};background:${scoreBg(analysis.overallScore)};">${analysis.overallScore}/10</span>
            <div style="margin-top:4px;">
              <span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:600;color:#fff;background:${recColor(analysis.recommendation)};">${recLabel(analysis.recommendation)}</span>
            </div>
          </div>
        </div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:12px;">
          ${listing.property.bedrooms} bed &middot; ${listing.property.bathrooms} bath &middot; ${listing.property.sqft.toLocaleString()} sqft
          ${listing.property.yearBuilt ? ` &middot; Built ${listing.property.yearBuilt}` : ""}
          ${listing.property.pool ? " &middot; Pool" : ""}
          ${listing.property.waterfront ? " &middot; Waterfront" : ""}
        </div>
        <div style="font-size:14px;color:#374151;margin-bottom:16px;line-height:1.5;">${analysis.summary}</div>
        ${moduleHtml}
        ${customHtml ? `<div style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;">${customHtml}</div>` : ""}
        ${rprData ? renderRprBox(rprData) : ""}
        <div style="font-size:12px;color:#9ca3af;margin-top:8px;">
          MLS# ${listing.mlsId} &middot; Listed by ${listing.agent.name}${listing.agent.office ? ` at ${listing.agent.office}` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderEmail(report: DailyReport, config: ScoutConfig): string {
  const listingsHtml = report.listings
    .map(({ listing, analysis, rprData }) => renderListingCard(listing, analysis, rprData))
    .join("");

  const filtersHtml = [
    config.baseFilters.cities.length > 0 ? `Cities: ${config.baseFilters.cities.join(", ")}` : null,
    config.baseFilters.minPrice != null || config.baseFilters.maxPrice != null
      ? `Price: ${config.baseFilters.minPrice ? formatPrice(config.baseFilters.minPrice) : "any"} – ${config.baseFilters.maxPrice ? formatPrice(config.baseFilters.maxPrice) : "any"}`
      : null,
    config.baseFilters.propertyTypes.length > 0 ? `Types: ${config.baseFilters.propertyTypes.join(", ")}` : null,
    config.baseFilters.minBeds != null ? `Min beds: ${config.baseFilters.minBeds}` : null,
    config.baseFilters.minBaths != null ? `Min baths: ${config.baseFilters.minBaths}` : null,
    config.baseFilters.minSqft != null ? `Min sqft: ${config.baseFilters.minSqft}` : null,
  ]
    .filter(Boolean)
    .map((f) => `<li style="font-size:13px;color:#6b7280;">${f}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Miami Listing Scout — ${report.date}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1e3a5f;color:#fff;padding:24px;border-radius:8px;margin-bottom:24px;">
      <h1 style="margin:0 0 8px;font-size:22px;">Miami Listing Scout</h1>
      <p style="margin:0;font-size:14px;opacity:0.9;">Daily Report — ${report.date}</p>
      <div style="margin-top:16px;display:flex;gap:24px;">
        <div>
          <div style="font-size:28px;font-weight:700;">${report.totalMatches}</div>
          <div style="font-size:12px;opacity:0.8;">Matches</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:700;">${report.totalAnalyzed}</div>
          <div style="font-size:12px;opacity:0.8;">Analyzed</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:700;">${report.totalNewListings}</div>
          <div style="font-size:12px;opacity:0.8;">New Listings</div>
        </div>
      </div>
    </div>

    ${report.failedAnalysisCount > 0
      ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#92400e;">
          <strong>Note:</strong> ${report.failedAnalysisCount} listing${report.failedAnalysisCount > 1 ? "s" : ""} could not be analyzed due to AI processing errors and ${report.failedAnalysisCount > 1 ? "are" : "is"} not included below.
        </div>`
      : ""}

    ${report.listings.length === 0
      ? `<div style="text-align:center;padding:48px 24px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;">
          <div style="font-size:16px;color:#6b7280;">No new matching listings found today.</div>
          <div style="font-size:13px;color:#9ca3af;margin-top:8px;">We'll keep watching and notify you when something pops up.</div>
        </div>`
      : listingsHtml}

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-top:24px;">
      <div style="font-size:14px;font-weight:600;color:#374151;margin-bottom:8px;">Your Criteria</div>
      <ul style="margin:0;padding:0 0 0 16px;">${filtersHtml}</ul>
    </div>

    <div style="text-align:center;padding:24px;font-size:12px;color:#9ca3af;">
      Miami Listing Scout &middot; AI-powered real estate analysis
    </div>
  </div>
</body>
</html>`;
}

export async function sendReport(
  report: DailyReport,
  html: string,
  config: ScoutConfig,
  resendKey: string,
  emailFrom: string,
): Promise<void> {
  console.log(`[email] Sending report to ${config.email}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [config.email],
      subject: `Miami Listing Scout — ${report.totalMatches} matches (${report.date})`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body.substring(0, 300)}`);
  }

  console.log(`[email] Report sent successfully`);
}
