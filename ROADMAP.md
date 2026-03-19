# Roadmap — Future Data Source Integrations

Once Bridge Interactive is fully working and the core pipeline (fetch → analyze → email) is stable, integrate these free Miami Realtors data sources one at a time to enrich investment analysis.

## Phase 1: RPR (Realtors Property Resource)

**Priority: High**
**Cost: Free (included with NAR membership)**

### Why
RPR provides property valuations (RVM), neighborhood data, school ratings, flood zones, and investment metrics (cap rate, cash flow estimates). This is the single biggest upgrade for investment analysis — it turns raw listings into actionable investment decisions.

### What to build
- Enrich each listing with RPR valuation data (estimated value vs list price)
- Pull neighborhood appreciation trends
- Add tax history and mortgage data
- Feed RPR data into Claude analysis for better investment scoring

### Integration approach
- RPR has an API for NAR members — investigate API access and auth
- If no API, consider scraping RPR reports (PDF export) as a fallback
- Add RPR data fields to `packages/shared` types
- New `packages/worker/src/rpr.ts` module for RPR data fetching
- Update `analyzer.ts` to include RPR context in Claude prompts

---

## Phase 2: Realist by CoreLogic

**Priority: High**
**Cost: Free (via Miami Association)**

### Why
Realist provides deep property-level data: ownership history, deed transfers, tax assessments, liens, permits, and comparable sales. Critical for spotting undervalued properties and understanding true property cost basis.

### What to build
- Pull ownership duration (long-term owners more likely to accept lower offers)
- Get permit history (recent renovations = higher actual value)
- Tax assessment vs list price comparison (find mispriced listings)
- Lien data (motivated sellers)

### Integration approach
- Check if Realist/CoreLogic offers API access through Miami Association
- New `packages/worker/src/realist.ts` module
- Add property history fields to shared types
- Update Claude analysis prompts with ownership/tax context

---

## Phase 3: SunStats (Market Analytics)

**Priority: Medium**
**Cost: Free**

### Why
SunStats provides Miami market-level statistics: median prices, days on market, inventory levels, and price trends by neighborhood/zip code. Useful for macro-level investment timing and neighborhood comparison.

### What to build
- Daily/weekly market snapshot for configured neighborhoods
- Neighborhood-level trend indicators (appreciating, flat, declining)
- Add market context to the daily email report
- "Hot market" / "Cooling market" signals per area

### Integration approach
- Investigate if SunStats has an API or if data must be scraped
- New `packages/worker/src/sunstats.ts` module
- Add market trend section to email report template
- Include market context in Claude analysis for better recommendations

---

## Phase 4: Utility Connect

**Priority: Low**
**Cost: Free**

### Why
Utility cost estimates for properties. Helps calculate true monthly carrying costs for investment properties, improving cash flow projections.

### What to build
- Estimated monthly utility costs per listing
- Factor into Claude's cash flow analysis
- Add utility estimate to email report per property

---

## Phase 5: RentSpree Rental Tools

**Priority: Medium (for rental investment properties)**
**Cost: Free tier available**

### Why
Rental market data helps estimate rental income for investment properties. Essential for calculating cap rates and cash-on-cash returns accurately.

### What to build
- Pull comparable rental rates for each listing's area
- Calculate estimated rental yield
- Feed rental estimates into Claude for ROI analysis

---

## Implementation Notes

- Integrate one source at a time — get it stable before moving on
- Each integration should be a separate worker module (`src/<source>.ts`)
- Add new data fields to `packages/shared/src/types.ts`
- Update the Claude analysis prompt in `analyzer.ts` to leverage new data
- Update the email template in `email.ts` to display new insights
- Each phase should have its own feature branch and PR
- Test with mock data first, then live data
