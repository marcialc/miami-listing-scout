import type { TranslationKey } from "./en";

const es: Record<TranslationKey, string> = {
  // Header
  "header.title": "Listing Scout",
  "header.tagline": "Inteligencia Inmobiliaria de Miami",
  "header.lastRun": "Ultima: {time}",
  "header.justNow": "Ahora mismo",
  "header.minutesAgo": "hace {count}m",
  "header.hoursAgo": "hace {count}h",
  "header.unknown": "Desconocido",
  "header.next": "Siguiente: {time}",
  "header.daily": "diario",
  "header.workerNotConnected": "Worker no conectado",
  "header.runNow": "Ejecutar",
  "header.runDate": "Ejecutar {date}",
  "header.clearDate": "Borrar fecha",
  "header.running": "Ejecutando...",

  // Tabs
  "tabs.settings": "Ajustes",
  "tabs.reports": "Reportes",

  // Mock mode
  "mock.label": "Modo de Prueba",
  "mock.description": "El worker usa listados de ejemplo en vez de la API de Bridge.",

  // Loading
  "loading.config": "Cargando configuracion...",

  // Filters
  "filters.title": "Filtros de Busqueda",
  "filters.description": "Define que listados buscar para ti cada dia",
  "filters.cities": "Ciudades",
  "filters.searchCityPlaceholder": "Buscar una ciudad...",
  "filters.priceRange": "Rango de Precio",
  "filters.min": "Min",
  "filters.max": "Max",
  "filters.bedrooms": "Habitaciones",
  "filters.bathrooms": "Banos",
  "filters.noMin": "Sin min",
  "filters.noMax": "Sin max",
  "filters.sqft": "Pies Cuadrados",
  "filters.minSqft": "Min sqft",
  "filters.maxSqft": "Max sqft",
  "filters.propertyTypes": "Tipos de Propiedad",
  "filters.keywords": "Palabras Clave",
  "filters.keywordsPlaceholder": "Terminos de busqueda en comentarios MLS...",
  "filters.keywordsHelp": "Busca en los comentarios publicos del listado",

  // Property types
  "propertyType.singleFamily": "Unifamiliar",
  "propertyType.condo": "Condominio",
  "propertyType.townhouse": "Casa Adosada",
  "propertyType.multiFamily": "Multifamiliar",
  "propertyType.land": "Terreno",

  // Analysis
  "analysis.title": "Analisis IA",
  "analysis.description": "Configura que analiza Claude para cada listado",
  "analysis.modules": "Modulos de Analisis",
  "analysis.customTitle": "Requisitos Personalizados",
  "analysis.customHelp": "Agrega preguntas en texto libre para que la IA responda sobre cada listado",
  "analysis.customPlaceholder": "Es esta propiedad buena para Airbnb/alquiler a corto plazo?",
  "analysis.addRequirement": "Agregar requisito",

  // Module labels and descriptions
  "module.investment_potential.label": "Potencial de Inversion",
  "module.investment_potential.description": "Estimacion de ROI, rendimiento de alquiler, potencial de apreciacion",
  "module.price_vs_comps.label": "Precio vs Comparables",
  "module.price_vs_comps.description": "Comparacion con ventas recientes similares cercanas",
  "module.red_flags.label": "Senales de Alerta",
  "module.red_flags.description": "Problemas estructurales, anomalias de DOM, caidas de precio, preocupaciones de HOA",
  "module.neighborhood_insights.label": "Informacion del Vecindario",
  "module.neighborhood_insights.description": "Escuelas, seguridad, caminabilidad, desarrollo cercano",
  "module.rental_analysis.label": "Analisis de Alquiler",
  "module.rental_analysis.description": "Estimacion de renta mensual, ocupacion, corto vs largo plazo",
  "module.flip_potential.label": "Potencial de Reventa",
  "module.flip_potential.description": "Estimacion de costo de remodelacion y valor post-reparacion (ARV)",

  // Email & Schedule
  "email.title": "Correo y Horario",
  "email.description": "Donde y cuando enviar tu reporte diario",
  "email.name": "Tu Nombre",
  "email.namePlaceholder": "Juan Perez",
  "email.address": "Correo Electronico",
  "email.addressPlaceholder": "tu@ejemplo.com",
  "email.addressHelp": "Los reportes diarios se enviaran a esta direccion",
  "email.frequency": "Frecuencia de Escaneo",
  "email.frequencyDaily": "Diario",
  "email.frequencyTwiceDaily": "Dos Veces al Dia",
  "email.frequencyWeekdays": "Solo Dias Laborales",
  "email.maxListings": "Max Listados por Reporte",
  "email.timezone": "Zona Horaria",
  "email.sendTime": "Hora de Envio",
  "email.am": "AM",
  "email.pm": "PM",

  // Save bar
  "save.unsaved": "Cambios sin guardar",
  "save.saving": "Guardando...",
  "save.saveChanges": "Guardar Cambios",

  // Toast / status
  "toast.saveSuccess": "Configuracion guardada exitosamente",
  "toast.saveFailed": "Error al guardar la configuracion",
  "toast.scanFailed": "Error al iniciar el escaneo",
  "toast.deleteSuccess": "Reporte eliminado",
  "toast.deleteFailed": "Error al eliminar el reporte",
  "toast.noNewListings": "No se encontraron listados nuevos",

  // Reports page
  "reports.empty": "No hay reportes aun",
  "reports.emptyDescription": "Los reportes apareceran aqui despues de tu primer escaneo.",
  "reports.new": "{count} nuevos",
  "reports.matched": "{count} coincidencias",
  "reports.analyzed": "{count} analizados",
  "reports.inReport": "{count} en reporte",
  "reports.newListings": "{count} listados nuevos",

  // Report detail
  "report.backToReports": "Volver a reportes",
  "report.sortBy": "Ordenar por",
  "report.sortScore": "Puntaje",
  "report.sortPrice": "Precio",
  "report.filter": "Filtrar",
  "report.filterAll": "Todos",
  "report.noMatch": "Ningun listado coincide con el filtro seleccionado.",
  "report.loadError": "Error al cargar el reporte",
  "report.delete": "Eliminar",
  "report.deleteConfirm": "Eliminar este reporte? Esta accion no se puede deshacer.",

  // Listing card
  "listing.bd": "{count} hab",
  "listing.ba": "{count} ban",
  "listing.sqft": "{count} sqft",
  "listing.built": "Construido {year}",
  "listing.pool": "Piscina",
  "listing.waterfront": "Frente al Agua",
  "listing.investmentHighlights": "Inversión",

  // Listing detail page
  "listing.backToReport": "Volver al reporte",
  "listing.notFound": "Listado no encontrado en este reporte.",
  "listing.propertyDetails": "Detalles de la Propiedad",
  "listing.financial": "Finanzas",
  "listing.aiSummary": "Resumen IA",
  "listing.propertyDescription": "Descripcion de la Propiedad",
  "listing.listingAgent": "Agente del Listado",
  "listing.mls": "MLS# {id}",
  "listing.listed": "Publicado {date}",
  "listing.modified": "Modificado {date}",
  "listing.analyzed": "Analizado {date}",

  // Property detail labels
  "detail.bedrooms": "Habitaciones",
  "detail.bathrooms": "Banos",
  "detail.bathsFull": "{count} completos",
  "detail.bathsHalf": "{count} medios",
  "detail.sqft": "Pies Cuadrados",
  "detail.lotSize": "Tamano del Lote",
  "detail.yearBuilt": "Ano de Construccion",
  "detail.stories": "Pisos",
  "detail.garage": "Garaje",
  "detail.pool": "Piscina",
  "detail.waterfront": "Frente al Agua",
  "detail.type": "Tipo",
  "detail.spaces": "{count} espacios",
  "detail.none": "Ninguno",
  "detail.na": "N/D",
  "detail.yes": "Si",
  "detail.no": "No",
  "detail.sqftUnit": "sqft",

  // Financial labels
  "financial.listPrice": "Precio de Lista",
  "financial.priceSqft": "Precio / Pie Cuadrado",
  "financial.hoaFee": "Cuota HOA",
  "financial.taxAmount": "Impuestos",
  "financial.perMonth": "/mes",
  "financial.perYear": "/ano",

  // Recommendation labels
  "rec.strong_buy": "Compra Fuerte",
  "rec.buy": "Comprar",
  "rec.watch": "Observar",
  "rec.pass": "Pasar",

  // Run modal
  "runModal.title": "Ejecutar Reporte",
  "runModal.dateLabel": "Fecha de Listados",
  "runModal.dateHelp": "Dejar vacío para escanear los listados más recientes",
  "runModal.languageLabel": "Idioma del Reporte",
  "runModal.run": "Ejecutar",
  "runModal.cancel": "Cancelar",

  // Report language in settings
  "email.reportLanguage": "Idioma del Reporte",
  "email.reportLanguageHelp": "Idioma del análisis de IA en reportes programados",

  // Module card
  "module.showDetails": "Ver detalles",
  "module.hideDetails": "Ocultar detalles",
  "module.moreHighlights": "+{count} más",

  // RPR
  "rpr.title": "Enriquecimiento RPR",
  "rpr.description": "Enriquecer listados con datos RPR (valuaciones, escuelas, zonas de inundacion, metricas de inversion)",
  "rpr.requiresNar": "Requiere membresia NAR y credenciales de API RPR",
  "rpr.valuation": "Valuacion RPR",
  "rpr.estimatedValue": "Estimacion RVM",
  "rpr.priceToValue": "Precio / Valor",
  "rpr.underpriced": "Subvalorado",
  "rpr.fairValue": "Valor Justo",
  "rpr.overpriced": "Sobrevalorado",
  "rpr.confidence": "Confianza",
  "rpr.neighborhood": "Vecindario",
  "rpr.appreciation1Yr": "Apreciacion 1 Ano",
  "rpr.appreciation5Yr": "Apreciacion 5 Anos",
  "rpr.medianValue": "Valor Medio de Vivienda",
  "rpr.medianIncome": "Ingreso Medio del Hogar",
  "rpr.schools": "Escuelas",
  "rpr.floodZone": "Zona de Inundacion",
  "rpr.highRisk": "Alto Riesgo",
  "rpr.lowRisk": "Bajo Riesgo",
  "rpr.investmentMetrics": "Metricas de Inversion",
  "rpr.capRate": "Tasa de Capitalizacion",
  "rpr.monthlyCashFlow": "Flujo de Caja Mensual",
  "rpr.monthlyRent": "Renta Mensual Est.",
  "rpr.grm": "Multiplicador de Renta Bruta",
  "rpr.taxHistory": "Historial de Impuestos",
  "rpr.enriched": "Enriquecido con RPR",

  // Language toggle
  "lang.en": "EN",
  "lang.es": "ES",
};

export default es;
