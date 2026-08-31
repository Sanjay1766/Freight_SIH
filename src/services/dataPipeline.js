/**
 * OceanPulse Data Ingestion & Feature Engineering Pipeline
 *
 * Implements:
 * 1. Multi-source proxy series generation & time-alignment (BDI, BCI, BPI, BSI, VLSFO Bunker, Coal Indices, DXY)
 * 2. Denton-Cholette monthly-to-daily disaggregation (via smooth cubic spline stand-in)
 * 3. Market Tightness Index (MTI_India) computation:
 *    MTI_t = Seaborne_Volume_t / (Fleet_DWT_t * (1 / Fuel_Price_t))
 */

// Helper for deterministic seeded random generation to maintain smooth realistic curves
function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Natural Cubic Spline Interpolation for Denton-Cholette Disaggregation Stand-in
 * Disaggregates monthly volume totals into a continuous daily series without edge artifacts.
 */
function cubicSplineInterpolate(monthlyPoints, totalDays) {
  const n = monthlyPoints.length;
  const x = monthlyPoints.map((_, i) => (i + 0.5) * (totalDays / n));
  const y = monthlyPoints.map(p => p.volume);

  const daily = [];
  for (let d = 0; d < totalDays; d++) {
    let segment = 0;
    while (segment < n - 1 && x[segment + 1] < d) {
      segment++;
    }

    if (segment >= n - 1) {
      daily.push(y[n - 1] / 30);
      continue;
    }

    const t = (d - x[segment]) / (x[segment + 1] - x[segment]);
    const h00 = 2 * t * t * t - 3 * t * t + 1;
    const h10 = t * t * t - 2 * t * t + t;
    const h01 = -2 * t * t * t + 3 * t * t;
    const h11 = t * t * t - t * t;

    const m0 = segment > 0 ? (y[segment + 1] - y[segment - 1]) / 2 : (y[segment + 1] - y[segment]);
    const m1 = segment < n - 2 ? (y[segment + 2] - y[segment]) / 2 : (y[segment + 1] - y[segment]);

    const val = h00 * y[segment] + h10 * m0 + h01 * y[segment + 1] + h11 * m1;
    daily.push(Math.max(100000, val / 30));
  }
  return daily;
}

/**
 * Generates historical multi-source proxies (90 days of history + live daily pipeline)
 */
export function generateHistoricalData(scenarioModifiers = {}) {
  const {
    bunkerFuelMultiplier = 1.0,
    importVolumeMultiplier = 1.0,
    fleetCapacityDWT = 12500000, // 12.5M DWT base East Coast Fleet
    bdiOffset = 0,
    regime = 'normal'
  } = scenarioModifiers;

  const totalDays = 90;
  const startDate = new Date('2026-05-25');

  // Monthly import tonnage raw data (in Metric Tons per month, e.g. 18M - 24M MT)
  const monthlyImports = [
    { month: 'March', volume: 19200000 * importVolumeMultiplier },
    { month: 'April', volume: 21500000 * importVolumeMultiplier },
    { month: 'May', volume: 23800000 * importVolumeMultiplier },
    { month: 'June', volume: 22400000 * importVolumeMultiplier },
  ];

  // Disaggregate to daily seaborne volume signal
  const dailySeaborneVolume = cubicSplineInterpolate(monthlyImports, totalDays);

  const series = [];
  let currentBDI = 2150 + bdiOffset;
  let currentBunker = 784.5 * bunkerFuelMultiplier;
  let currentCoalIndex = 138.5;
  let currentIndoCoal = 58.0; // ICI4 4200 GAR ($/MT)
  let currentDXY = 104.2;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Seeded random walk for economic proxies
    const rand1 = (pseudoRandom(i * 13 + 7) - 0.48) * 45;
    const rand2 = (pseudoRandom(i * 19 + 3) - 0.49) * 12;
    const rand3 = (pseudoRandom(i * 31 + 5) - 0.50) * 1.8;
    const rand4 = (pseudoRandom(i * 41 + 11) - 0.50) * 0.4;
    const rand5 = (pseudoRandom(i * 53 + 9) - 0.49) * 0.9;

    currentBDI = Math.max(1100, Math.min(3900, currentBDI + rand1));
    currentBunker = Math.max(450, Math.min(950, (currentBunker + rand2 * 0.3) * (0.999 + bunkerFuelMultiplier * 0.001)));
    currentCoalIndex = Math.max(90, Math.min(220, currentCoalIndex + rand3));
    currentIndoCoal = Math.max(45, Math.min(85, currentIndoCoal + rand5));
    currentDXY = Math.max(98, Math.min(110, currentDXY + rand4));

    // Sub-indices for vessel classes
    const bciCapesize = Math.round(currentBDI * 1.35 + rand1 * 1.2);
    const bpiPanamax = Math.round(currentBDI * 0.95 + rand2 * 0.8);
    const bsiSupramax = Math.round(currentBDI * 0.78 + rand3 * 1.5);

    // Apply monsoon / bottleneck regime modifiers to volume & rates
    let regimeMultiplier = 1.0;
    if (regime === 'monsoon' && i > 60) {
      regimeMultiplier = 1.25;
    } else if (regime === 'disruption' && i > 45) {
      regimeMultiplier = 1.40;
    }

    const seaborneDailyTons = dailySeaborneVolume[i] * regimeMultiplier;

    // Formula: MTI_t = Seaborne_Volume_t / (Fleet_DWT_t * (1 / Fuel_Price_t))
    const mtiRaw = (seaborneDailyTons / fleetCapacityDWT) * (currentBunker / 100);
    const mtiIndia = Number((mtiRaw * 0.85).toFixed(3));

    // Capesize/Panamax daily charter rate proxy ($/day) aligned with BDI & MTI
    const spotFreightRate = Math.round(currentBDI * 9.8 + mtiIndia * 4200 + (currentBunker - 600) * 12);

    series.push({
      dayIndex: i,
      date: dateStr,
      bdi: Math.round(currentBDI),
      bciCapesize,
      bpiPanamax,
      bsiSupramax,
      spotFreightRate,
      bunkerFuel: Number(currentBunker.toFixed(1)),
      coalIndex: Number(currentCoalIndex.toFixed(1)),
      indoCoalIndex: Number(currentIndoCoal.toFixed(1)),
      dxy: Number(currentDXY.toFixed(2)),
      seaborneVolumeDaily: Math.round(seaborneDailyTons),
      mtiIndia,
      isDisaggregated: true,
    });
  }

  return series;
}
