/**
 * OceanPulse Prescriptive Optimizer & Vessel Allocator
 *
 * Implements:
 * 1. Proposal Decision Trigger Logic:
 *    Enter_CoA IF (σ̂²_{t+h} > θ_risk AND ŷ_{t+h} ≥ C_CoA) ELSE Spot
 * 2. East Coast India Port Matrix (Draft, LOA, Daily Handling, Tariffs, Demurrage)
 * 3. PuLP-style Linear/Greedy Vessel Allocator Solver
 * 4. Plain-language recommendation card generation
 */

// East Coast India Port Specification Matrix
export const EAST_COAST_PORT_MATRIX = {
  Dhamra: {
    name: 'Dhamra Port (Odisha)',
    maxDraft: 17.5, // meters
    maxLOA: 300,   // meters
    allowedClasses: ['Capesize', 'Panamax'],
    dailyDischargeRate: 60000, // MT / day
    portTariffPerTon: 4.50,    // USD / MT
    demurrageRatePerDay: 25000, // USD / day
    avgWaitingDays: 2.5
  },
  Paradeep: {
    name: 'Paradeep Port (Odisha)',
    maxDraft: 14.5,
    maxLOA: 245,
    allowedClasses: ['Panamax', 'Supramax'],
    dailyDischargeRate: 40000,
    portTariffPerTon: 3.80,
    demurrageRatePerDay: 20000,
    avgWaitingDays: 3.8
  },
  Haldia: {
    name: 'Haldia Dock Complex (WB)',
    maxDraft: 8.5,
    maxLOA: 190,
    allowedClasses: ['Handymax', 'Supramax'],
    dailyDischargeRate: 20000,
    portTariffPerTon: 5.20,
    demurrageRatePerDay: 15000,
    avgWaitingDays: 5.0
  },
  Vizag: {
    name: 'Visakhapatnam Port (AP)',
    maxDraft: 16.0,
    maxLOA: 280,
    allowedClasses: ['Capesize', 'Panamax'],
    dailyDischargeRate: 50000,
    portTariffPerTon: 4.10,
    demurrageRatePerDay: 22000,
    avgWaitingDays: 2.1
  },
  Krishnapatnam: {
    name: 'Krishnapatnam Port (AP)',
    maxDraft: 18.0,
    maxLOA: 320,
    allowedClasses: ['Capesize', 'Panamax'],
    dailyDischargeRate: 65000,
    portTariffPerTon: 4.20,
    demurrageRatePerDay: 26000,
    avgWaitingDays: 1.8
  }
};

// Fleet Candidate Pool (Simulated live AIS queue options)
export const CANDIDATE_VESSELS = [
  {
    id: 'VESSEL-01',
    name: 'MV Samarinda Express',
    vesselClass: 'Capesize',
    dwt: 178000,
    draft: 17.2,
    loa: 292,
    speedKnots: 13.5,
    bunkerConsumptionTonsPerDay: 42,
    currentLocation: 'Malacca Strait (3 days to Dhamra)',
    availableFromDay: 3
  },
  {
    id: 'VESSEL-02',
    name: 'MV Bharat Glory',
    vesselClass: 'Panamax',
    dwt: 82000,
    draft: 14.1,
    loa: 229,
    speedKnots: 14.0,
    bunkerConsumptionTonsPerDay: 28,
    currentLocation: 'Bay of Bengal (1 day to Paradeep)',
    availableFromDay: 1
  },
  {
    id: 'VESSEL-03',
    name: 'MV Ocean Sentinel',
    vesselClass: 'Panamax',
    dwt: 76000,
    draft: 13.8,
    loa: 225,
    speedKnots: 13.2,
    bunkerConsumptionTonsPerDay: 26,
    currentLocation: 'Singapore Anchorage (4 days to Vizag)',
    availableFromDay: 4
  },
  {
    id: 'VESSEL-04',
    name: 'MV Ganga Titan',
    vesselClass: 'Capesize',
    dwt: 180000,
    draft: 17.8,
    loa: 295,
    speedKnots: 13.0,
    bunkerConsumptionTonsPerDay: 45,
    currentLocation: 'Richards Bay (14 days to Krishnapatnam)',
    availableFromDay: 14
  },
  {
    id: 'VESSEL-05',
    name: 'MV Bengal Pioneer',
    vesselClass: 'Supramax',
    dwt: 58000,
    draft: 8.4,
    loa: 188,
    speedKnots: 12.8,
    bunkerConsumptionTonsPerDay: 21,
    currentLocation: 'Sandheads Outer (0.5 days to Haldia)',
    availableFromDay: 1
  }
];

/**
 * Evaluates the Decision Trigger Rule:
 * Enter_CoA IF (σ̂²_{t+h} > θ_risk AND ŷ_{t+h} ≥ C_CoA) ELSE Spot
 */
export function evaluateDecisionTrigger(horizonForecast, thetaRisk, targetCoACost) {
  const predictedRate = horizonForecast.pointForecast;
  const predictedVolDollars = horizonForecast.volatilityDollars;

  // Normalized risk metric (volatility relative to rate)
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
      ? `High volatility forecast (vol ratio ${volMetricRatio} > θ_risk ${thetaRisk}) and predicted spot rate ($${predictedRate.toLocaleString()}/day ≥ CoA Target $${targetCoACost.toLocaleString()}/day) dictate locking in a Medium-Term CoA to hedge upside price exposure.`
      : `Market conditions favor Spot procurement. Volatility ratio (${volMetricRatio}) or predicted rate ($${predictedRate.toLocaleString()}/day) remain below CoA trigger thresholds.`
  };
}

/**
 * PuLP-style Vessel Allocation Solver
 * Minimizes total procurement cost subject to East Coast Port draft/LOA constraints
 */
export function solveVesselAllocation(params) {
  const {
    destinationPortKey = 'Dhamra',
    cargoQuantityTons = 75000,
    bunkerPrice = 640,
    horizonForecast,
    decisionTrigger
  } = params;

  const port = EAST_COAST_PORT_MATRIX[destinationPortKey] || EAST_COAST_PORT_MATRIX.Dhamra;
  const applicableFreightRate = decisionTrigger.triggerActivated
    ? decisionTrigger.targetCoACost * 0.96 // CoA discount locked rate
    : horizonForecast.pointForecast;

  const solutions = CANDIDATE_VESSELS.map(vessel => {
    // Check Port Physical Constraints
    const draftOk = vessel.draft <= port.maxDraft;
    const loaOk = vessel.loa <= port.maxLOA;
    const classOk = port.allowedClasses.includes(vessel.vesselClass);
    const capacityOk = vessel.dwt >= cargoQuantityTons * 0.90; // Capacity match

    const isFeasible = draftOk && loaOk && classOk && capacityOk;

    // Calculate Costs
    const voyageDays = Math.ceil(vessel.availableFromDay + 5); // 5 sailing days average from origin
    const freightCost = Math.round((applicableFreightRate * cargoQuantityTons) / 1000); // charter cost approximation
    const bunkerCost = Math.round(voyageDays * vessel.bunkerConsumptionTonsPerDay * bunkerPrice);
    const portTariffCost = Math.round(cargoQuantityTons * port.portTariffPerTon);
    const dischargeDays = cargoQuantityTons / port.dailyDischargeRate;
    const totalPortTimeDays = dischargeDays + port.avgWaitingDays;
    const demurrageCost = Math.round(port.avgWaitingDays * port.demurrageRatePerDay);

    const totalCost = freightCost + bunkerCost + portTariffCost + demurrageCost;
    const costPerTon = Number((totalCost / cargoQuantityTons).toFixed(2));

    return {
      vessel,
      portKey: destinationPortKey,
      portName: port.name,
      isFeasible,
      constraintCheck: {
        draft: { value: `${vessel.draft}m`, limit: `${port.maxDraft}m`, pass: draftOk },
        loa: { value: `${vessel.loa}m`, limit: `${port.maxLOA}m`, pass: loaOk },
        vesselClass: { value: vessel.vesselClass, allowed: port.allowedClasses.join('/'), pass: classOk },
        capacity: { value: `${vessel.dwt.toLocaleString()} DWT`, required: `${cargoQuantityTons.toLocaleString()} MT`, pass: capacityOk }
      },
      costBreakdown: {
        freightCost,
        bunkerCost,
        portTariffCost,
        demurrageCost,
        totalCost,
        costPerTon
      }
    };
  });

  // Filter feasible and sort by minimum total cost
  const feasibleSolutions = solutions.filter(s => s.isFeasible).sort((a, b) => a.costBreakdown.totalCost - b.costBreakdown.totalCost);
  const infeasibleSolutions = solutions.filter(s => !s.isFeasible);

  const bestSolution = feasibleSolutions[0] || null;

  // Generate plain-language executive recommendation card
  let recommendationCard = {};
  if (bestSolution) {
    const actionVerb = decisionTrigger.triggerActivated ? 'Lock in 3-voyage CoA' : 'Secure Spot fixture';
    const dayNotice = Math.max(1, bestSolution.vessel.availableFromDay + 1);
    recommendationCard = {
      title: `${actionVerb} for ${bestSolution.vessel.name}`,
      headline: `Book ${bestSolution.vessel.vesselClass} (${bestSolution.vessel.name}) — Samarinda to ${destinationPortKey} — by Day ${dayNotice}`,
      summary: `Optimizer selected ${bestSolution.vessel.name} with lowest landed cost of $${bestSolution.costBreakdown.costPerTon}/MT ($${(bestSolution.costBreakdown.totalCost / 1000000).toFixed(2)}M total). Fully compliant with ${port.name} draft (${bestSolution.vessel.draft}m) and LOA (${bestSolution.vessel.loa}m).`,
      savingsVsSpot: decisionTrigger.triggerActivated ? `$${Math.round((horizonForecast.pointForecast - decisionTrigger.targetCoACost) * 20).toLocaleString()} projected risk savings` : 'Spot rate optimal'
    };
  } else {
    recommendationCard = {
      title: 'No Compatible Vessel Found',
      headline: `Draft or LOA constraints breached for ${destinationPortKey}`,
      summary: `All available candidate vessels exceed draft or length limitations for ${port.name}. Consider lightering or selecting an alternative port.`,
      savingsVsSpot: 'N/A'
    };
  }

  return {
    bestSolution,
    allSolutions: [...feasibleSolutions, ...infeasibleSolutions],
    recommendationCard
  };
}
