const en = {
  // Header
  "header.title": "Listing Scout",
  "header.tagline": "Miami Real Estate Intelligence",
  "header.lastRun": "Last run: {time}",
  "header.justNow": "Just now",
  "header.minutesAgo": "{count}m ago",
  "header.hoursAgo": "{count}h ago",
  "header.unknown": "Unknown",
  "header.next": "Next: {time}",
  "header.daily": "daily",
  "header.workerNotConnected": "Worker not connected",
  "header.runNow": "Run Now",
  "header.runDate": "Run {date}",
  "header.clearDate": "Clear date",
  "header.running": "Running...",

  // Tabs
  "tabs.settings": "Settings",
  "tabs.reports": "Reports",

  // Mock mode
  "mock.label": "Mock Mode",
  "mock.description": "Worker is using sample listings instead of the Bridge API.",

  // Loading
  "loading.config": "Loading configuration...",

  // Filters
  "filters.title": "Search Filters",
  "filters.description": "Define what listings to scout for you each day",
  "filters.cities": "Cities",
  "filters.searchCityPlaceholder": "Search for a city...",
  "filters.priceRange": "Price Range",
  "filters.min": "Min",
  "filters.max": "Max",
  "filters.bedrooms": "Bedrooms",
  "filters.bathrooms": "Bathrooms",
  "filters.noMin": "No min",
  "filters.noMax": "No max",
  "filters.sqft": "Square Footage",
  "filters.minSqft": "Min sqft",
  "filters.maxSqft": "Max sqft",
  "filters.propertyTypes": "Property Types",
  "filters.keywords": "Keywords",
  "filters.keywordsPlaceholder": "Search terms for MLS remarks...",
  "filters.keywordsHelp": "Matches against the listing's public remarks",

  // Property types
  "propertyType.singleFamily": "Single Family",
  "propertyType.condo": "Condo",
  "propertyType.townhouse": "Townhouse",
  "propertyType.multiFamily": "Multi-Family",
  "propertyType.land": "Land",

  // Analysis
  "analysis.title": "AI Analysis",
  "analysis.description": "Configure what Claude analyzes for each matching listing",
  "analysis.modules": "Analysis Modules",
  "analysis.customTitle": "Custom Requirements",
  "analysis.customHelp": "Add plain-English questions for the AI to answer about each listing",
  "analysis.customPlaceholder": "Is this property good for Airbnb/short-term rental?",
  "analysis.addRequirement": "Add requirement",

  // Module labels and descriptions
  "module.investment_potential.label": "Investment Potential",
  "module.investment_potential.description": "ROI estimate, rental yield, appreciation potential",
  "module.price_vs_comps.label": "Price vs Comps",
  "module.price_vs_comps.description": "Comparison to similar recent sales nearby",
  "module.red_flags.label": "Red Flags",
  "module.red_flags.description": "Structural issues, DOM anomalies, price drops, HOA concerns",
  "module.neighborhood_insights.label": "Neighborhood Insights",
  "module.neighborhood_insights.description": "Schools, crime, walkability, nearby development",
  "module.rental_analysis.label": "Rental Analysis",
  "module.rental_analysis.description": "Monthly rent estimate, occupancy, STR vs LTR",
  "module.flip_potential.label": "Flip Potential",
  "module.flip_potential.description": "Rehab cost estimate and after-repair value (ARV)",

  // Email & Schedule
  "email.title": "Email & Schedule",
  "email.description": "Where and when to send your daily report",
  "email.name": "Your Name",
  "email.namePlaceholder": "John Smith",
  "email.address": "Email Address",
  "email.addressPlaceholder": "you@example.com",
  "email.addressHelp": "Daily reports will be sent to this address",
  "email.frequency": "Scan Frequency",
  "email.frequencyDaily": "Daily",
  "email.frequencyTwiceDaily": "Twice Daily",
  "email.frequencyWeekdays": "Weekdays Only",
  "email.maxListings": "Max Listings per Report",
  "email.timezone": "Timezone",
  "email.sendTime": "Send Time",
  "email.am": "AM",
  "email.pm": "PM",

  // Save bar
  "save.unsaved": "Unsaved changes",
  "save.saving": "Saving...",
  "save.saveChanges": "Save Changes",

  // Toast / status
  "toast.saveSuccess": "Settings saved successfully",
  "toast.saveFailed": "Failed to save settings",
  "toast.scanFailed": "Failed to trigger scan",
  "toast.deleteSuccess": "Report deleted",
  "toast.deleteFailed": "Failed to delete report",
  "toast.noNewListings": "No new listings found",

  // Reports page
  "reports.empty": "No reports yet",
  "reports.emptyDescription": "Reports will appear here after your first scan runs.",
  "reports.new": "{count} new",
  "reports.matched": "{count} matched",
  "reports.analyzed": "{count} analyzed",
  "reports.inReport": "{count} in report",
  "reports.newListings": "{count} new listings",

  // Report detail
  "report.backToReports": "Back to reports",
  "report.sortBy": "Sort by",
  "report.sortScore": "Score",
  "report.sortPrice": "Price",
  "report.filter": "Filter",
  "report.filterAll": "All",
  "report.noMatch": "No listings match the selected filter.",
  "report.loadError": "Failed to load report",
  "report.delete": "Delete",
  "report.deleteConfirm": "Delete this report? This cannot be undone.",

  // Listing card
  "listing.bd": "{count} bd",
  "listing.ba": "{count} ba",
  "listing.sqft": "{count} sqft",
  "listing.built": "Built {year}",
  "listing.pool": "Pool",
  "listing.waterfront": "Waterfront",
  "listing.investmentHighlights": "Investment",

  // Listing detail page
  "listing.backToReport": "Back to report",
  "listing.notFound": "Listing not found in this report.",
  "listing.propertyDetails": "Property Details",
  "listing.financial": "Financial",
  "listing.aiSummary": "AI Summary",
  "listing.propertyDescription": "Property Description",
  "listing.listingAgent": "Listing Agent",
  "listing.mls": "MLS# {id}",
  "listing.listed": "Listed {date}",
  "listing.modified": "Modified {date}",
  "listing.analyzed": "Analyzed {date}",

  // Property detail labels
  "detail.bedrooms": "Bedrooms",
  "detail.bathrooms": "Bathrooms",
  "detail.bathsFull": "{count} full",
  "detail.bathsHalf": "{count} half",
  "detail.sqft": "Sq Ft",
  "detail.lotSize": "Lot Size",
  "detail.yearBuilt": "Year Built",
  "detail.stories": "Stories",
  "detail.garage": "Garage",
  "detail.pool": "Pool",
  "detail.waterfront": "Waterfront",
  "detail.type": "Type",
  "detail.spaces": "{count} spaces",
  "detail.none": "None",
  "detail.na": "N/A",
  "detail.yes": "Yes",
  "detail.no": "No",
  "detail.sqftUnit": "sqft",

  // Financial labels
  "financial.listPrice": "List Price",
  "financial.priceSqft": "Price / Sq Ft",
  "financial.hoaFee": "HOA Fee",
  "financial.taxAmount": "Tax Amount",
  "financial.perMonth": "/mo",
  "financial.perYear": "/yr",

  // Recommendation labels
  "rec.strong_buy": "Strong Buy",
  "rec.buy": "Buy",
  "rec.watch": "Watch",
  "rec.pass": "Pass",

  // Run modal
  "runModal.title": "Run Report",
  "runModal.dateLabel": "Listing Date",
  "runModal.dateHelp": "Leave empty to scan latest listings",
  "runModal.languageLabel": "Report Language",
  "runModal.run": "Run",
  "runModal.cancel": "Cancel",

  // Report language in settings
  "email.reportLanguage": "Report Language",
  "email.reportLanguageHelp": "Language for AI analysis in scheduled reports",

  // Module card
  "module.showDetails": "Show details",
  "module.hideDetails": "Hide details",
  "module.moreHighlights": "+{count} more",

  // RPR
  "rpr.title": "RPR Enrichment",
  "rpr.description": "Enrich listings with RPR property data (valuations, schools, flood zones, investment metrics)",
  "rpr.requiresNar": "Requires NAR membership and RPR API credentials",
  "rpr.valuation": "RPR Valuation",
  "rpr.estimatedValue": "RVM Estimate",
  "rpr.priceToValue": "Price / Value",
  "rpr.underpriced": "Underpriced",
  "rpr.fairValue": "Fair Value",
  "rpr.overpriced": "Overpriced",
  "rpr.confidence": "Confidence",
  "rpr.neighborhood": "Neighborhood",
  "rpr.appreciation1Yr": "1-Year Appreciation",
  "rpr.appreciation5Yr": "5-Year Appreciation",
  "rpr.medianValue": "Median Home Value",
  "rpr.medianIncome": "Median Household Income",
  "rpr.schools": "Schools",
  "rpr.floodZone": "Flood Zone",
  "rpr.highRisk": "High Risk",
  "rpr.lowRisk": "Low Risk",
  "rpr.investmentMetrics": "Investment Metrics",
  "rpr.capRate": "Cap Rate",
  "rpr.monthlyCashFlow": "Monthly Cash Flow",
  "rpr.monthlyRent": "Est. Monthly Rent",
  "rpr.grm": "Gross Rent Multiplier",
  "rpr.taxHistory": "Tax History",
  "rpr.enriched": "RPR Enriched",

  // Language toggle
  "lang.en": "EN",
  "lang.es": "ES",
} as const;

export type TranslationKey = keyof typeof en;
export default en;
