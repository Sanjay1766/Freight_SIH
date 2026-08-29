/**
 * OceanPulse Prescriptive Optimizer & Vessel Allocator
 *
 * Implements:
 * 1. 7 East Coast India Ports Matrix (Draft, LOA, Beam, Daily Handling, Tariffs, Demurrage, Lightering)
 * 2. 5 Global Origin Terminals Matrix (Australia, Indonesia, US, Mozambique, Russia)
 * 3. Origin-to-Destination Nautical Distance & Transit Days Matrix
 * 4. Dual-Port Constrained Fleet Allocator (Handysize to Newcastlemax)
 * 5. IMO Carbon Intensity Indicator (CII) & Emissions Engine (CO2, CII Grade A-E, Carbon Levy)
 * 6. Multi-Origin Landed Cost Arbitrage Comparator
 * 7. Virtual Arrival Speed & Slow-Steaming Demurrage Optimizer
 * 8. Lightering & Transshipment Solver (Sagar-Sandheads / Haldia)
 * 9. Prescriptive CoA Decision Trigger Rule
 * 10. Backhaul / Triangular Route Optimizer to Eliminate Deadheading
 */

// 1. East Coast India Port Specification Matrix (All 7 Ports from Problem Statement)
export const EAST_COAST_PORT_MATRIX = {
  Paradip: {
    key: 'Paradip',
    name: 'Paradip Port (Odisha)',
    state: 'Odisha',
    maxDraft: 14.5,
    maxLOA: 260,
    maxBeam: 40.0,
    allowedClasses: ['Panamax', 'Kamsarmax', 'Supramax', 'Ultramax', 'Handysize'],
    dailyDischargeRate: 45000,
    portTariffPerTon: 3.80,
    demurrageRatePerDay: 22000,
    avgWaitingDays: 3.4,
    tidalRestriction: 'Semi-diurnal; berthing subject to high tide for >14m draft',
    congestionLevel: 'MODERATE',
    cargoTypes: ['Thermal Coal', 'Coking Coal', 'Iron Ore Pellets', 'Limestone']
  },
  Vizag: {
    key: 'Vizag',
    name: 'Visakhapatnam Port (Andhra Pradesh)',
    state: 'Andhra Pradesh',
    maxDraft: 16.5,
    maxLOA: 290,
    maxBeam: 45.0,
    allowedClasses: ['Capesize', 'Kamsarmax', 'Panamax', 'Ultramax', 'Supramax', 'Handysize'],
    dailyDischargeRate: 55000,
    portTariffPerTon: 4.10,
    demurrageRatePerDay: 24000,
    avgWaitingDays: 2.1,
    tidalRestriction: 'Inner harbour 14.5m / Outer harbour up to 18.1m with cape berths',
    congestionLevel: 'LOW',
    cargoTypes: ['Coking Coal', 'Thermal Coal', 'Bauxite', 'Manganese Ore']
  },
  Gangavaram: {
    key: 'Gangavaram',
    name: 'Gangavaram Port (Andhra Pradesh)',
    state: 'Andhra Pradesh',
    maxDraft: 18.5,
    maxLOA: 325,
    maxBeam: 50.0,
    allowedClasses: ['Newcastlemax', 'Capesize', 'Kamsarmax', 'Panamax', 'Supramax', 'Handysize'],
    dailyDischargeRate: 70000,
    portTariffPerTon: 4.40,
    demurrageRatePerDay: 28000,
    avgWaitingDays: 1.6,
    tidalRestriction: 'Deep water all-weather port, minimal tidal dependency',
    congestionLevel: 'LOW',
    cargoTypes: ['Coking Coal', 'Thermal Coal', 'Iron Ore', 'Limestone']
  },
  Gopalpur: {
    key: 'Gopalpur',
    name: 'Gopalpur Port (Odisha)',
    state: 'Odisha',
    maxDraft: 13.0,
    maxLOA: 225,
    maxBeam: 32.5,
    allowedClasses: ['Supramax', 'Ultramax', 'Handysize'],
    dailyDischargeRate: 28000,
    portTariffPerTon: 3.60,
    demurrageRatePerDay: 18000,
    avgWaitingDays: 2.3,
    tidalRestriction: 'Draft limited; seasonal swell during SW monsoon',
    congestionLevel: 'LOW',
    cargoTypes: ['Thermal Coal', 'Limestone', 'Ilmenite Sand', 'Fertilizer']
  },
  Dhamra: {
    key: 'Dhamra',
    name: 'Dhamra Port (Odisha)',
    state: 'Odisha',
    maxDraft: 17.5,
    maxLOA: 310,
    maxBeam: 48.0,
    allowedClasses: ['Capesize', 'Kamsarmax', 'Panamax', 'Ultramax', 'Supramax', 'Handysize'],
    dailyDischargeRate: 65000,
    portTariffPerTon: 4.50,
    demurrageRatePerDay: 26000,
    avgWaitingDays: 2.5,
    tidalRestriction: 'Deep water port with dedicated capesize berths; high-speed conveyors',
    congestionLevel: 'MODERATE',
    cargoTypes: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone']
  },
  SagarSandheads: {
    key: 'SagarSandheads',
    name: 'Sagar - Sandheads Anchorage (WB)',
    state: 'West Bengal',
    maxDraft: 16.0,
    maxLOA: 300,
    maxBeam: 46.0,
    allowedClasses: ['Capesize', 'Panamax', 'Kamsarmax', 'Supramax', 'Ultramax'],
    dailyDischargeRate: 35000,
    portTariffPerTon: 2.90,
    demurrageRatePerDay: 20000,
    avgWaitingDays: 3.0,
    tidalRestriction: 'Open sea lightering point; sea state swell sensitive during monsoon',
    congestionLevel: 'MODERATE',
    cargoTypes: ['Thermal Coal', 'Coking Coal', 'Lightering for Haldia & Kolkata'],
    isLighteringHub: true
  },
  Haldia: {
    key: 'Haldia',
    name: 'Haldia Dock Complex (West Bengal)',
    state: 'West Bengal',
    maxDraft: 8.5,
    maxLOA: 195,
    maxBeam: 32.2,
    allowedClasses: ['Handysize', 'Supramax (Lightered)'],
    dailyDischargeRate: 22000,
    portTariffPerTon: 5.40,
    demurrageRatePerDay: 16000,
    avgWaitingDays: 5.2,
    tidalRestriction: 'Severe Hugli river draft constraints; requires lightering at Sandheads for parcels >25k MT',
    congestionLevel: 'HIGH',
    cargoTypes: ['Coking Coal', 'Thermal Coal', 'Petcoke', 'Manganese Ore']
  }
};

// 2. Global Origin Terminals Matrix (5 Key Origins from Problem Statement)
export const ORIGIN_PORTS_MATRIX = {
  Australia_Newcastle: {
    key: 'Australia_Newcastle',
    name: 'Port of Newcastle (PWCS / NCIG)',
    country: 'Australia',
    region: 'Oceania',
    maxDraft: 15.2,
    maxLOA: 300,
    allowedClasses: ['Capesize', 'Newcastlemax', 'Kamsarmax', 'Panamax', 'Supramax'],
    dailyLoadingRate: 85000,
    portTariffPerTon: 2.20,
    primaryCommodity: 'Thermal & Coking Coal',
    fobBenchmarkPriceUSD: 118.50,
    caloricValueKcal: 6000,
    chokepoints: ['Torres Strait / Great Barrier Reef or Lombok Strait']
  },
  Australia_HayPoint: {
    key: 'Australia_HayPoint',
    name: 'Hay Point / Dalrymple Bay (DBCT)',
    country: 'Australia',
    region: 'Oceania',
    maxDraft: 19.5,
    maxLOA: 330,
    allowedClasses: ['Newcastlemax', 'Capesize', 'Kamsarmax', 'Panamax'],
    dailyLoadingRate: 110000,
    portTariffPerTon: 2.40,
    primaryCommodity: 'Premium Metallurgical / Coking Coal',
    fobBenchmarkPriceUSD: 235.00,
    caloricValueKcal: 6700,
    chokepoints: ['Hydrographers Passage / Sunda or Lombok Strait']
  },
  Indonesia_Samarinda: {
    key: 'Indonesia_Samarinda',
    name: 'Samarinda / Muara Berau Anchorage',
    country: 'Indonesia',
    region: 'East Kalimantan',
    maxDraft: 18.0,
    maxLOA: 310,
    allowedClasses: ['Capesize', 'Kamsarmax', 'Panamax', 'Ultramax', 'Supramax', 'Handysize'],
    dailyLoadingRate: 40000,
    portTariffPerTon: 1.80,
    primaryCommodity: 'Low/Mid CV Thermal Coal (GAR 4200)',
    fobBenchmarkPriceUSD: 56.50,
    caloricValueKcal: 4200,
    chokepoints: ['Makassar Strait / Singapore & Malacca Strait']
  },
  Indonesia_Taboneo: {
    key: 'Indonesia_Taboneo',
    name: 'Taboneo Anchorage (Banjarmasin)',
    country: 'Indonesia',
    region: 'South Kalimantan',
    maxDraft: 17.5,
    maxLOA: 300,
    allowedClasses: ['Capesize', 'Kamsarmax', 'Panamax', 'Ultramax', 'Supramax'],
    dailyLoadingRate: 45000,
    portTariffPerTon: 1.70,
    primaryCommodity: 'Thermal Coal (GAR 4800)',
    fobBenchmarkPriceUSD: 68.00,
    caloricValueKcal: 4800,
    chokepoints: ['Java Sea / Sunda Strait or Malacca']
  },
  US_Norfolk: {
    key: 'US_Norfolk',
    name: 'Norfolk Hampton Roads (Pier 6 / Lamberts Pt)',
    country: 'United States',
    region: 'US East Coast',
    maxDraft: 15.5,
    maxLOA: 305,
    allowedClasses: ['Capesize', 'Kamsarmax', 'Panamax'],
    dailyLoadingRate: 65000,
    portTariffPerTon: 3.50,
    primaryCommodity: 'High-Vol & Low-Vol Coking Coal',
    fobBenchmarkPriceUSD: 220.00,
    caloricValueKcal: 6800,
    chokepoints: ['North Atlantic / Cape of Good Hope or Suez Canal']
  },
  Mozambique_Maputo: {
    key: 'Mozambique_Maputo',
    name: 'Port of Maputo (Matola TCM)',
    country: 'Mozambique',
    region: 'East Africa',
    maxDraft: 14.3,
    maxLOA: 260,
    allowedClasses: ['Panamax', 'Kamsarmax', 'Supramax', 'Ultramax', 'Handysize'],
    dailyLoadingRate: 35000,
    portTariffPerTon: 2.80,
    primaryCommodity: 'Thermal & Metallurgical Coal',
    fobBenchmarkPriceUSD: 94.00,
    caloricValueKcal: 5500,
    chokepoints: ['Mozambique Channel / Indian Ocean']
  },
  Mozambique_Nacala: {
    key: 'Mozambique_Nacala',
    name: 'Port of Nacala-a-Velha',
    country: 'Mozambique',
    region: 'East Africa',
    maxDraft: 20.0,
    maxLOA: 340,
    allowedClasses: ['Capesize', 'Newcastlemax', 'Kamsarmax', 'Panamax'],
    dailyLoadingRate: 75000,
    portTariffPerTon: 2.60,
    primaryCommodity: 'Moatize Coking & Thermal Coal',
    fobBenchmarkPriceUSD: 165.00,
    caloricValueKcal: 6200,
    chokepoints: ['Indian Ocean direct passage']
  },
  Russia_Taman: {
    key: 'Russia_Taman',
    name: 'Port of Taman (Black Sea Bulk Terminal)',
    country: 'Russia',
    region: 'Black Sea',
    maxDraft: 18.0,
    maxLOA: 300,
    allowedClasses: ['Capesize', 'Kamsarmax', 'Panamax', 'Supramax'],
    dailyLoadingRate: 60000,
    portTariffPerTon: 3.20,
    primaryCommodity: 'Kuzbass Thermal & Anthracite Coal, PCI',
    fobBenchmarkPriceUSD: 88.00,
    caloricValueKcal: 5900,
    chokepoints: ['Bosphorus Strait / Suez Canal / Bab-el-Mandeb']
  },
  Russia_UstLuga: {
    key: 'Russia_UstLuga',
    name: 'Port of Ust-Luga (Baltic Sea Terminal)',
    country: 'Russia',
    region: 'Baltic Sea',
    maxDraft: 16.0,
    maxLOA: 280,
    allowedClasses: ['Capesize', 'Panamax', 'Supramax'],
    dailyLoadingRate: 50000,
    portTariffPerTon: 3.40,
    primaryCommodity: 'Thermal Coal, Petcoke, Fertilizer',
    fobBenchmarkPriceUSD: 82.00,
    caloricValueKcal: 5800,
    chokepoints: ['Danish Straits / English Channel / Cape or Suez']
  }
};

// 3. Nautical Distance Matrix (in NM)
export const NAUTICAL_DISTANCES = {
  'Indonesia_Samarinda-Paradip': 2520,
  'Indonesia_Samarinda-Vizag': 2440,
  'Indonesia_Samarinda-Gangavaram': 2430,
  'Indonesia_Samarinda-Gopalpur': 2480,
  'Indonesia_Samarinda-Dhamra': 2550,
  'Indonesia_Samarinda-SagarSandheads': 2580,
  'Indonesia_Samarinda-Haldia': 2640,

  'Indonesia_Taboneo-Paradip': 2380,
  'Indonesia_Taboneo-Vizag': 2300,
  'Indonesia_Taboneo-Gangavaram': 2290,
  'Indonesia_Taboneo-Gopalpur': 2340,
  'Indonesia_Taboneo-Dhamra': 2410,
  'Indonesia_Taboneo-SagarSandheads': 2440,
  'Indonesia_Taboneo-Haldia': 2500,

  'Australia_Newcastle-Paradip': 5100,
  'Australia_Newcastle-Vizag': 4980,
  'Australia_Newcastle-Gangavaram': 4970,
  'Australia_Newcastle-Gopalpur': 5040,
  'Australia_Newcastle-Dhamra': 5140,
  'Australia_Newcastle-SagarSandheads': 5180,
  'Australia_Newcastle-Haldia': 5230,

  'Australia_HayPoint-Paradip': 4680,
  'Australia_HayPoint-Vizag': 4560,
  'Australia_HayPoint-Gangavaram': 4550,
  'Australia_HayPoint-Gopalpur': 4620,
  'Australia_HayPoint-Dhamra': 4710,
  'Australia_HayPoint-SagarSandheads': 4750,
  'Australia_HayPoint-Haldia': 4800,

  'Mozambique_Maputo-Paradip': 4380,
  'Mozambique_Maputo-Vizag': 4240,
  'Mozambique_Maputo-Gangavaram': 4230,
  'Mozambique_Maputo-Gopalpur': 4310,
  'Mozambique_Maputo-Dhamra': 4410,
  'Mozambique_Maputo-SagarSandheads': 4450,
  'Mozambique_Maputo-Haldia': 4500,

  'Mozambique_Nacala-Paradip': 3650,
  'Mozambique_Nacala-Vizag': 3510,
  'Mozambique_Nacala-Gangavaram': 3500,
  'Mozambique_Nacala-Gopalpur': 3580,
  'Mozambique_Nacala-Dhamra': 3680,
  'Mozambique_Nacala-SagarSandheads': 3720,
  'Mozambique_Nacala-Haldia': 3770,

  'US_Norfolk-Paradip': 11150,
  'US_Norfolk-Vizag': 11020,
  'US_Norfolk-Gangavaram': 11010,
  'US_Norfolk-Gopalpur': 11090,
  'US_Norfolk-Dhamra': 11180,
  'US_Norfolk-SagarSandheads': 11220,
  'US_Norfolk-Haldia': 11280,

  'Russia_Taman-Paradip': 5480,
  'Russia_Taman-Vizag': 5340,
  'Russia_Taman-Gangavaram': 5330,
  'Russia_Taman-Gopalpur': 5410,
  'Russia_Taman-Dhamra': 5510,
  'Russia_Taman-SagarSandheads': 5550,
  'Russia_Taman-Haldia': 5600,

  'Russia_UstLuga-Paradip': 8550,
  'Russia_UstLuga-Vizag': 8410,
  'Russia_UstLuga-Gangavaram': 8400,
  'Russia_UstLuga-Gopalpur': 8480,
  'Russia_UstLuga-Dhamra': 8580,
  'Russia_UstLuga-SagarSandheads': 8620,
  'Russia_UstLuga-Haldia': 8680
};

export function getNauticalDistance(originKey, destKey) {
  const lookup = `${originKey}-${destKey}`;
  if (NAUTICAL_DISTANCES[lookup]) return NAUTICAL_DISTANCES[lookup];
  if (originKey && originKey.includes('Indonesia')) return 2500;
  if (originKey && originKey.includes('Australia')) return 4900;
  if (originKey && originKey.includes('Mozambique')) return 4000;
  if (originKey && originKey.includes('Russia')) return 5800;
  if (originKey && originKey.includes('US')) return 11000;
  return 3500;
}

// 4. Candidate Fleet Pool
export const CANDIDATE_VESSELS = [
  {
    id: 'VESSEL-01',
    name: 'MV Samarinda Express',
    vesselClass: 'Capesize',
    dwt: 178000,
    draft: 17.2,
    loa: 292,
    beam: 45.0,
    speedKnots: 13.5,
    bunkerConsumptionTonsPerDay: 42,
    currentLocation: 'Malacca Strait (Eastbound to Bay of Bengal)',
    availableFromDay: 3,
    dailyCharterRateMultiplier: 1.15,
    ciiBaseRating: 'A',
    co2GramsPerTonNM: 3.65
  },
  {
    id: 'VESSEL-02',
    name: 'MV Bharat Glory',
    vesselClass: 'Kamsarmax',
    dwt: 82000,
    draft: 14.2,
    loa: 229,
    beam: 32.3,
    speedKnots: 14.0,
    bunkerConsumptionTonsPerDay: 27,
    currentLocation: 'Bay of Bengal (Off Paradip Anchorage)',
    availableFromDay: 1,
    dailyCharterRateMultiplier: 0.95,
    ciiBaseRating: 'B',
    co2GramsPerTonNM: 4.85
  },
  {
    id: 'VESSEL-03',
    name: 'MV Ocean Sentinel',
    vesselClass: 'Panamax',
    dwt: 76000,
    draft: 13.8,
    loa: 225,
    beam: 32.2,
    speedKnots: 13.2,
    bunkerConsumptionTonsPerDay: 25,
    currentLocation: 'Singapore Anchorage (Repositioning)',
    availableFromDay: 4,
    dailyCharterRateMultiplier: 0.90,
    ciiBaseRating: 'C',
    co2GramsPerTonNM: 5.60
  },
  {
    id: 'VESSEL-04',
    name: 'MV Ganga Titan',
    vesselClass: 'Capesize',
    dwt: 180000,
    draft: 17.8,
    loa: 295,
    beam: 45.5,
    speedKnots: 13.0,
    bunkerConsumptionTonsPerDay: 45,
    currentLocation: 'Indian Ocean (Off Sri Lanka)',
    availableFromDay: 5,
    dailyCharterRateMultiplier: 1.18,
    ciiBaseRating: 'A',
    co2GramsPerTonNM: 3.75
  },
  {
    id: 'VESSEL-05',
    name: 'MV Bengal Pioneer',
    vesselClass: 'Supramax',
    dwt: 58000,
    draft: 8.4,
    loa: 188,
    beam: 31.0,
    speedKnots: 12.8,
    bunkerConsumptionTonsPerDay: 20,
    currentLocation: 'Sandheads Pilot Boarding Grounds',
    availableFromDay: 1,
    dailyCharterRateMultiplier: 0.78,
    ciiBaseRating: 'D',
    co2GramsPerTonNM: 7.20
  },
  {
    id: 'VESSEL-06',
    name: 'MV Kalinga Voyager',
    vesselClass: 'Ultramax',
    dwt: 64000,
    draft: 12.8,
    loa: 199,
    beam: 32.2,
    speedKnots: 13.4,
    bunkerConsumptionTonsPerDay: 22,
    currentLocation: 'Port Blair Anchorage (Andaman)',
    availableFromDay: 2,
    dailyCharterRateMultiplier: 0.84,
    ciiBaseRating: 'C',
    co2GramsPerTonNM: 6.10
  },
  {
    id: 'VESSEL-07',
    name: 'MV Eastern Majestic',
    vesselClass: 'Newcastlemax',
    dwt: 208000,
    draft: 18.3,
    loa: 300,
    beam: 50.0,
    speedKnots: 13.0,
    bunkerConsumptionTonsPerDay: 52,
    currentLocation: 'Sunda Strait (En route Gangavaram)',
    availableFromDay: 6,
    dailyCharterRateMultiplier: 1.28,
    ciiBaseRating: 'A',
    co2GramsPerTonNM: 3.40
  },
  {
    id: 'VESSEL-08',
    name: 'MV Coromandel Trader',
    vesselClass: 'Handysize',
    dwt: 38000,
    draft: 8.2,
    loa: 179,
    beam: 28.4,
    speedKnots: 12.5,
    bunkerConsumptionTonsPerDay: 16,
    currentLocation: 'Vizag Roads Anchorage',
    availableFromDay: 1,
    dailyCharterRateMultiplier: 0.65,
    ciiBaseRating: 'E',
    co2GramsPerTonNM: 9.80
  }
];

// 5. Backhaul Export Cargo Pool
export const BACKHAUL_OPPORTUNITIES = [
  {
    id: 'BH-01',
    cargo: 'Iron Ore Pellets / Fines',
    originPort: 'Paradip',
    destinationRegion: 'China (Qingdao) / SE Asia (Cigading)',
    volumeRange: '55,000 - 150,000 MT',
    revenuePerTon: 14.50,
    ballastReductionPercent: 78,
    potentialNetBenefitDollars: 380000,
    compatibleClasses: ['Supramax', 'Ultramax', 'Panamax', 'Kamsarmax', 'Capesize'],
    summary: 'Triangular backhaul loading iron ore at Paradip for discharge in SE Asia, positioning vessel directly near Indonesia coal loading anchorages.'
  },
  {
    id: 'BH-02',
    cargo: 'Metallurgical Alumina & Steel Coils',
    originPort: 'Vizag',
    destinationRegion: 'Middle East (Jebel Ali / Sohar)',
    volumeRange: '35,000 - 60,000 MT',
    revenuePerTon: 18.20,
    ballastReductionPercent: 65,
    potentialNetBenefitDollars: 260000,
    compatibleClasses: ['Handysize', 'Supramax', 'Ultramax'],
    summary: 'High-value breakbulk/bulk steel & alumina parcel from Vizag to Persian Gulf, eliminating uncompensated ballast voyages.'
  },
  {
    id: 'BH-03',
    cargo: 'Thermal Coal Coastal Shuttle',
    originPort: 'Dhamra',
    destinationRegion: 'Ennore / Tuticorin (South India Coast)',
    volumeRange: '70,000 - 80,000 MT',
    revenuePerTon: 9.80,
    ballastReductionPercent: 50,
    potentialNetBenefitDollars: 195000,
    compatibleClasses: ['Panamax', 'Kamsarmax'],
    summary: 'Domestic coastal coal shuttle utilizing cabotage permission to earn freight while repositioning towards Indian Ocean / South Africa trade lane.'
  },
  {
    id: 'BH-04',
    cargo: 'Heavy Mineral Sand (Ilmenite / Bauxite)',
    originPort: 'Gopalpur',
    destinationRegion: 'China / Malaysia',
    volumeRange: '45,000 - 58,000 MT',
    revenuePerTon: 16.00,
    ballastReductionPercent: 72,
    potentialNetBenefitDollars: 240000,
    compatibleClasses: ['Supramax', 'Ultramax', 'Handysize'],
    summary: 'Export parcel from Gopalpur to Southeast Asia, cutting empty deadheading back to Australian/Indonesian loading ports.'
  }
];

/**
 * Evaluates the Decision Trigger Rule:
 * Enter_CoA IF (σ̂²_{t+h} > θ_risk AND ŷ_{t+h} ≥ C_CoA) ELSE Spot
 */
export function evaluateDecisionTrigger(horizonForecast, thetaRisk, targetCoACost) {
  const predictedRate = horizonForecast.pointForecast;
  const predictedVolDollars = horizonForecast.volatilityDollars;
  const volMetricRatio = Number((predictedVolDollars / predictedRate).toFixed(3));

  const isVolExceeded = volMetricRatio > thetaRisk;
  const isCostExceeded = predictedRate >= targetCoACost;
  const triggerActivated = isVolExceeded && isCostExceeded;

  return {
    recommendation: triggerActivated ? 'ENTER_COA' : 'SPOT_MARKET',
    triggerActivated,
    predictedRate,
    predictedVolDollars,
    volMetricRatio,
    thetaRisk,
    targetCoACost,
    reasoning: triggerActivated
      ? `Elevated volatility risk (${volMetricRatio} > θ_risk ${thetaRisk}) combined with forward spot rate ($${predictedRate.toLocaleString()}/day ≥ CoA target $${targetCoACost.toLocaleString()}/day) triggers a prescriptive lock into a Medium-Term CoA (or 3-Voyage Short Term fixture) to hedge upward rate exposure.`
      : `Market fundamentals favor Spot Market execution. Volatility ratio (${volMetricRatio}) and forward rate ($${predictedRate.toLocaleString()}/day) remain within target budget thresholds without requiring upfront CoA volume commitments.`
  };
}

/**
 * Solves Dual-Port Constrained Vessel Allocation with IMO CII carbon metrics,
 * lightering logic (Sagar-Sandheads for Haldia), and complete cost breakdown.
 */
export function solveVesselAllocation(params) {
  const {
    originPortKey = 'Indonesia_Samarinda',
    destinationPortKey = 'Dhamra',
    cargoQuantityTons = 75000,
    bunkerPrice = 640,
    horizonForecast,
    decisionTrigger,
    contractType = 'RECOMMENDED'
  } = params;

  const originPort = ORIGIN_PORTS_MATRIX[originPortKey] || ORIGIN_PORTS_MATRIX.Indonesia_Samarinda;
  const destPort = EAST_COAST_PORT_MATRIX[destinationPortKey] || EAST_COAST_PORT_MATRIX.Dhamra;
  const distanceNM = getNauticalDistance(originPortKey, destinationPortKey);

  let activeContract = decisionTrigger.triggerActivated ? 'COA_SHORT_3V' : 'SPOT';
  if (contractType === 'SPOT') activeContract = 'SPOT';
  else if (contractType === 'COA_SHORT_3V') activeContract = 'COA_SHORT_3V';
  else if (contractType === 'COA_MID_6M') activeContract = 'COA_MID_6M';

  let baseCharterRate = horizonForecast.pointForecast;
  let coaDiscountRate = 1.0;

  if (activeContract === 'COA_SHORT_3V') {
    coaDiscountRate = 0.95;
    baseCharterRate = Math.min(decisionTrigger.targetCoACost, horizonForecast.pointForecast * coaDiscountRate);
  } else if (activeContract === 'COA_MID_6M') {
    coaDiscountRate = 0.90;
    baseCharterRate = Math.min(decisionTrigger.targetCoACost * 0.95, horizonForecast.pointForecast * coaDiscountRate);
  }

  const solutions = CANDIDATE_VESSELS.map(vessel => {
    // 1. Origin & Dest Port Constraints
    const originDraftOk = vessel.draft <= originPort.maxDraft;
    const originLoaOk = vessel.loa <= originPort.maxLOA;
    const originClassOk = originPort.allowedClasses.includes(vessel.vesselClass);

    let destDraftOk = vessel.draft <= destPort.maxDraft;
    let destLoaOk = vessel.loa <= destPort.maxLOA;
    let destBeamOk = vessel.beam <= destPort.maxBeam;
    let destClassOk = destPort.allowedClasses.includes(vessel.vesselClass);
    const capacityOk = vessel.dwt >= cargoQuantityTons * 0.85;

    let requiresLightering = false;
    let lighteringSurcharge = 0;
    if (destinationPortKey === 'Haldia' && vessel.draft > 8.5) {
      requiresLightering = true;
      destDraftOk = true;
      destLoaOk = true;
      destClassOk = true;
      lighteringSurcharge = cargoQuantityTons * 3.20;
    }

    const isFeasible = originDraftOk && originLoaOk && originClassOk && destDraftOk && destLoaOk && destBeamOk && destClassOk && capacityOk;

    // 2. Voyage Calculations
    const sailingSpeed = vessel.speedKnots;
    const sailingHours = distanceNM / sailingSpeed;
    const sailingDays = Number((sailingHours / 24).toFixed(1));
    const originLoadingDays = Number((cargoQuantityTons / originPort.dailyLoadingRate).toFixed(1));
    const destDischargeDays = Number((cargoQuantityTons / destPort.dailyDischargeRate).toFixed(1));
    const destWaitingDays = destPort.avgWaitingDays;
    const totalTurnaroundDays = Number((sailingDays + originLoadingDays + destDischargeDays + destWaitingDays).toFixed(1));

    // 3. Costs
    const vesselAdjustedDailyRate = Math.round(baseCharterRate * (vessel.dailyCharterRateMultiplier || 1.0));
    const freightCost = Math.round(vesselAdjustedDailyRate * totalTurnaroundDays);
    const atSeaBunkerBurnTons = sailingDays * vessel.bunkerConsumptionTonsPerDay;
    const inPortBunkerBurnTons = (originLoadingDays + destDischargeDays + destWaitingDays) * 3.5;
    const totalBunkerBurnTons = Number((atSeaBunkerBurnTons + inPortBunkerBurnTons).toFixed(1));

    const atSeaFuelCost = Math.round(atSeaBunkerBurnTons * bunkerPrice);
    const inPortFuelCost = Math.round(inPortBunkerBurnTons * bunkerPrice);
    const bunkerCost = atSeaFuelCost + inPortFuelCost;

    let canalToll = 0;
    if (originPortKey.includes('Russia_Taman')) canalToll = 175000;
    else if (originPortKey.includes('US_Norfolk') && distanceNM < 10000) canalToll = 220000;

    const originTariffCost = Math.round(cargoQuantityTons * originPort.portTariffPerTon);
    const destTariffCost = Math.round(cargoQuantityTons * destPort.portTariffPerTon);
    const portTariffCost = originTariffCost + destTariffCost;

    const demurrageCost = Math.round(destWaitingDays * destPort.demurrageRatePerDay);
    const totalCost = freightCost + bunkerCost + canalToll + portTariffCost + demurrageCost + lighteringSurcharge;
    const costPerTon = Number((totalCost / cargoQuantityTons).toFixed(2));

    // 4. IMO Carbon Intensity Indicator (CII) & Emissions
    // 1 MT VLSFO = 3.114 MT CO2 (IMO GHG standard factor)
    const co2EmissionsTons = Math.round(totalBunkerBurnTons * 3.114);
    const co2GramsPerTonNM = Number(((co2EmissionsTons * 1000000) / (cargoQuantityTons * distanceNM)).toFixed(2));
    
    // CII Rating Classification
    let ciiGrade = 'A';
    if (co2GramsPerTonNM >= 8.5) ciiGrade = 'E';
    else if (co2GramsPerTonNM >= 6.8) ciiGrade = 'D';
    else if (co2GramsPerTonNM >= 5.2) ciiGrade = 'C';
    else if (co2GramsPerTonNM >= 4.0) ciiGrade = 'B';
    else ciiGrade = 'A';

    // Carbon Tax / Green Levy proxy ($30/MT CO2)
    const carbonTaxDollars = Math.round(co2EmissionsTons * 30);
    const greenLandedCostPerTon = Number(((totalCost + carbonTaxDollars) / cargoQuantityTons).toFixed(2));

    return {
      vessel,
      originKey: originPortKey,
      originName: originPort.name,
      portKey: destinationPortKey,
      portName: destPort.name,
      distanceNM,
      sailingDays,
      totalTurnaroundDays,
      requiresLightering,
      isFeasible,
      carbonMetrics: {
        totalBunkerBurnTons,
        co2EmissionsTons,
        co2GramsPerTonNM,
        ciiGrade,
        carbonTaxDollars,
        greenLandedCostPerTon
      },
      constraintCheck: {
        originDraft: { value: `${vessel.draft}m`, limit: `${originPort.maxDraft}m`, pass: originDraftOk },
        destDraft: { value: `${vessel.draft}m`, limit: `${destPort.maxDraft}m`, pass: destDraftOk, lightered: requiresLightering },
        destLOA: { value: `${vessel.loa}m`, limit: `${destPort.maxLOA}m`, pass: destLoaOk },
        destBeam: { value: `${vessel.beam}m`, limit: `${destPort.maxBeam}m`, pass: destBeamOk },
        vesselClass: { value: vessel.vesselClass, allowed: destPort.allowedClasses.join('/'), pass: destClassOk },
        capacity: { value: `${vessel.dwt.toLocaleString()} DWT`, required: `${cargoQuantityTons.toLocaleString()} MT`, pass: capacityOk }
      },
      costBreakdown: {
        freightCost,
        bunkerCost,
        canalToll,
        portTariffCost,
        demurrageCost,
        lighteringSurcharge,
        totalCost,
        costPerTon,
        dailyRate: vesselAdjustedDailyRate
      }
    };
  });

  const feasibleSolutions = solutions.filter(s => s.isFeasible).sort((a, b) => a.costBreakdown.totalCost - b.costBreakdown.totalCost);
  const infeasibleSolutions = solutions.filter(s => !s.isFeasible);
  const bestSolution = feasibleSolutions[0] || null;

  const compatibleBackhauls = BACKHAUL_OPPORTUNITIES.filter(bh =>
    bh.originPort === destinationPortKey || bh.originPort === 'Paradip' || bh.originPort === 'Vizag'
  );

  let recommendationCard = {};
  if (bestSolution) {
    const actionLabel = activeContract === 'COA_SHORT_3V'
      ? '3-Voyage Short-Term CoA'
      : activeContract === 'COA_MID_6M'
      ? '6-Month Medium-Term CoA'
      : 'Spot Market Fixture';

    const lighteringNotice = bestSolution.requiresLightering ? ' [via Sagar-Sandheads transshipment]' : '';

    const cii = bestSolution?.ciiGrade || bestSolution?.carbonMetrics?.ciiGrade || 'B';
    const ciiGrams = bestSolution?.carbonMetrics?.co2GramsPerTonNM || 4.2;
    const costPerTon = bestSolution?.costPerTon ?? bestSolution?.costBreakdown?.costPerTon ?? 15.30;
    const totalCost = bestSolution?.totalCost ?? bestSolution?.costBreakdown?.totalCost ?? 1150000;
    const turnaroundDays = bestSolution?.totalVoyageDays || bestSolution?.totalTurnaroundDays || 18.5;

    recommendationCard = {
      title: `Recommended: ${actionLabel} on ${bestSolution?.vessel?.name || 'MV Bharat Glory'}`,
      headline: `Deploy ${bestSolution?.vessel?.vesselClass || 'Kamsarmax'} (${bestSolution?.vessel?.name || 'MV Bharat Glory'}) for ${originPort.country} → ${destPort.name}${lighteringNotice}`,
      summary: `Optimizer selected ${bestSolution?.vessel?.name || 'MV Bharat Glory'} (${bestSolution?.vessel?.vesselClass || 'Kamsarmax'}) achieving lowest landed cost of $${costPerTon}/MT ($${(totalCost / 1000000).toFixed(2)}M total) with IMO CII Grade '${cii}' (${ciiGrams} gCO2/ton-NM). Estimated turnaround: ${turnaroundDays} days.`,
      contractStructure: actionLabel,
      savingsVsSpot: decisionTrigger?.triggerActivated
        ? `$${Math.round(((horizonForecast?.pointForecast || 22000) * 1.05 - baseCharterRate) * turnaroundDays).toLocaleString()} estimated hedge savings`
        : 'Spot Rate Execution Optimal',
      activeContract,
      ciiGrade: cii
    };
  } else {
    recommendationCard = {
      title: 'No Compatible Vessel in Candidate Pool',
      headline: `Draft, LOA, or parcel capacity constraints breached for ${destinationPortKey}`,
      summary: `All available candidate vessels exceed draft or length limitations for ${destPort.name} or ${originPort.name}. Consider lightering at Sagar-Sandheads or selecting an alternative deep-draft port like Gangavaram or Dhamra.`,
      contractStructure: 'N/A',
      savingsVsSpot: 'N/A',
      activeContract,
      ciiGrade: 'N/A'
    };
  }

  const spotLandedCost = bestSolution ? bestSolution.costBreakdown.totalCost : 0;
  const coa3VLandedCost = bestSolution ? Math.round(spotLandedCost * 0.94) : 0;
  const coa6MLandedCost = bestSolution ? Math.round(spotLandedCost * 0.89) : 0;

  const contractComparison = {
    spot: {
      label: 'Single Spot Contract',
      ratePerDay: horizonForecast.pointForecast,
      totalCostDollars: spotLandedCost,
      costPerTon: Number((spotLandedCost / cargoQuantityTons).toFixed(2)),
      volatilityExposure: 'HIGH (100% Spot Volatility)',
      demurrageRiskScore: 'UNHEDGED',
      recommendationTag: !decisionTrigger.triggerActivated ? 'RECOMMENDED' : 'AVOID_VOLATILITY'
    },
    coaShortTerm3V: {
      label: 'Short-Term 3-Voyage CoA',
      ratePerDay: Math.round(baseCharterRate * 0.95),
      totalCostDollars: coa3VLandedCost,
      costPerTon: Number((coa3VLandedCost / cargoQuantityTons).toFixed(2)),
      volatilityExposure: 'MODERATE (Guaranteed Cap)',
      demurrageRiskScore: 'Capped @ $18k/d',
      savingsVsSpot: Math.max(0, spotLandedCost - coa3VLandedCost),
      recommendationTag: decisionTrigger.triggerActivated ? 'RECOMMENDED' : 'NEUTRAL'
    },
    coaMidTerm6M: {
      label: 'Medium-Term 6-Month CoA',
      ratePerDay: Math.round(decisionTrigger.targetCoACost * 0.92),
      totalCostDollars: coa6MLandedCost,
      costPerTon: Number((coa6MLandedCost / cargoQuantityTons).toFixed(2)),
      volatilityExposure: 'MINIMAL (Fixed Rate Lock)',
      demurrageRiskScore: 'Preferred Berth Allocation',
      savingsVsSpot: Math.max(0, spotLandedCost - coa6MLandedCost),
      recommendationTag: decisionTrigger.volMetricRatio > 0.28 ? 'HIGH_PRIORITY' : 'LONG_TERM_HEDGE'
    }
  };

  return {
    originPort,
    destPort,
    bestSolution,
    allSolutions: [...feasibleSolutions, ...infeasibleSolutions],
    feasibleSolutions,
    infeasibleSolutions,
    recommendationCard,
    compatibleBackhauls,
    contractComparison
  };
}

/**
 * Multi-Origin Landed Cost Arbitrage Comparator
 * Compares simultaneous procurement landed costs ($/MT & $/GJ) across all 5 global origin hubs.
 */
export function solveMultiOriginArbitrage(params) {
  const {
    destinationPortKey = 'Dhamra',
    cargoQuantityTons = 75000,
    bunkerPrice = 640,
    horizonForecast,
    decisionTrigger
  } = params;

  const destPort = EAST_COAST_PORT_MATRIX[destinationPortKey] || EAST_COAST_PORT_MATRIX.Dhamra;

  const results = Object.entries(ORIGIN_PORTS_MATRIX).map(([originKey, origin]) => {
    const distanceNM = getNauticalDistance(originKey, destinationPortKey);
    const alloc = solveVesselAllocation({
      originPortKey: originKey,
      destinationPortKey,
      cargoQuantityTons,
      bunkerPrice,
      horizonForecast,
      decisionTrigger
    });

    const freightPerTon = alloc.bestSolution ? (alloc.bestSolution.costPerTon ?? alloc.bestSolution.costBreakdown?.costPerTon ?? 28.50) : 28.50;
    const fobPrice = origin.fobBenchmarkPriceUSD;
    const totalLandedCostPerTon = Number((fobPrice + freightPerTon).toFixed(2));
    
    // Energy-adjusted cost: ($/MT / (caloricValueKcal * 4.184 / 1000000)) -> $/GJ
    const energyGigaJoulesPerTon = (origin.caloricValueKcal * 4.184) / 1000;
    const costPerGigajoule = Number((totalLandedCostPerTon / energyGigaJoulesPerTon).toFixed(2));

    const transitDays = alloc.bestSolution ? (alloc.bestSolution.seaDaysOneWay || alloc.bestSolution.sailingDays || 10.0) : Number((distanceNM / (13.5 * 24)).toFixed(1));
    const ciiGrade = alloc.bestSolution ? (alloc.bestSolution.ciiGrade || alloc.bestSolution.carbonMetrics?.ciiGrade || 'C') : 'C';

    return {
      originKey,
      originName: origin.name,
      country: origin.country,
      commodity: origin.primaryCommodity,
      fobPrice,
      freightPerTon,
      totalLandedCostPerTon,
      caloricValueKcal: origin.caloricValueKcal,
      costPerGigajoule,
      distanceNM,
      transitDays,
      ciiGrade,
      bestVesselName: alloc.bestSolution ? alloc.bestSolution.vessel.name : 'Capesize Pool',
      isFeasible: !!alloc.bestSolution
    };
  });

  results.sort((a, b) => a.totalLandedCostPerTon - b.totalLandedCostPerTon);
  const lowestLandedOrigin = results[0];
  const lowestEnergyOrigin = [...results].sort((a, b) => a.costPerGigajoule - b.costPerGigajoule)[0];

  return {
    destinationPort: destPort,
    originsComparison: results,
    lowestLandedOrigin,
    lowestEnergyOrigin
  };
}

/**
 * Virtual Arrival Speed & Slow-Steaming Demurrage Optimizer
 * Calculates fuel burn reduction, demurrage absorption, net voyage savings, and emissions avoided.
 */
export function calculateVirtualArrival(params) {
  const {
    baseSpeedKnots = 13.5,
    slowSpeedKnots = 11.2,
    distanceNM = 2550,
    dailyCharterRate = 22500,
    bunkerPrice = 640,
    baseDailyBunkerTons = 42,
    berthQueueDays = 3.2,
    demurrageRatePerDay = 24000
  } = params;

  // 1. Standard full-speed voyage
  const standardSailingHours = distanceNM / baseSpeedKnots;
  const standardSailingDays = Number((standardSailingHours / 24).toFixed(2));
  const standardBunkerBurnTons = standardSailingDays * baseDailyBunkerTons;
  const standardFuelCost = Math.round(standardBunkerBurnTons * bunkerPrice);
  const standardDemurrageCost = Math.round(berthQueueDays * demurrageRatePerDay);
  const standardTotalTransitCost = Math.round(standardFuelCost + (standardSailingDays * dailyCharterRate) + standardDemurrageCost);

  // 2. Slow-steaming virtual arrival voyage
  // Power & fuel consumption scale with cubic law: Fuel_slow = Fuel_base * (V_slow / V_base)^3
  const speedRatio = slowSpeedKnots / baseSpeedKnots;
  const slowDailyBunkerTons = baseDailyBunkerTons * Math.pow(speedRatio, 3);
  const slowSailingHours = distanceNM / slowSpeedKnots;
  const slowSailingDays = Number((slowSailingHours / 24).toFixed(2));
  const additionalSailingDays = Math.max(0, slowSailingDays - standardSailingDays);

  // Absorbed waiting time:
  const remainingWaitingDays = Math.max(0, berthQueueDays - additionalSailingDays);
  const absorbedDemurrageDays = berthQueueDays - remainingWaitingDays;

  const slowBunkerBurnTons = slowSailingDays * slowDailyBunkerTons;
  const slowFuelCost = Math.round(slowBunkerBurnTons * bunkerPrice);
  const slowDemurrageCost = Math.round(remainingWaitingDays * demurrageRatePerDay);
  const slowTotalTransitCost = Math.round(slowFuelCost + (slowSailingDays * dailyCharterRate) + slowDemurrageCost);

  const fuelSavedDollars = Math.max(0, standardFuelCost - slowFuelCost);
  const fuelSavedTons = Math.max(0, Number((standardBunkerBurnTons - slowBunkerBurnTons).toFixed(1)));
  const demurrageAvoidedDollars = Math.max(0, standardDemurrageCost - slowDemurrageCost);
  const netVoyageSavingsDollars = Math.max(0, standardTotalTransitCost - slowTotalTransitCost);

  // CO2 emissions avoided: 1 MT VLSFO = 3.114 MT CO2
  const co2AvoidedTons = Math.round(fuelSavedTons * 3.114);

  return {
    baseSpeedKnots,
    slowSpeedKnots,
    distanceNM,
    standardSailingDays,
    slowSailingDays,
    additionalSailingDays: Number(additionalSailingDays.toFixed(1)),
    berthQueueDays,
    absorbedDemurrageDays: Number(absorbedDemurrageDays.toFixed(1)),
    remainingWaitingDays: Number(remainingWaitingDays.toFixed(1)),
    fuelSavedDollars,
    fuelSavedTons,
    demurrageAvoidedDollars,
    netVoyageSavingsDollars,
    co2AvoidedTons,
    standardTotalCost: standardTotalTransitCost,
    slowTotalCost: slowTotalTransitCost
  };
}
