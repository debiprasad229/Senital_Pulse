/**
 * SentinelPulse - Surveillance Analytics Engine
 * Implements CDC EARS (C1, C2, C3) Aberration Detection,
 * Modified Farrington Baseline with Down-weighting, and
 * Cross-Signal Multivariate Anomaly Fusion.
 */

/**
 * Standard CDC EARS C1, C2, C3 Aberration Algorithms
 * @param {number[]} history - Time series of daily counts up to current day t
 * @returns {{ c1: number, c2: number, c3: number, isAlertC1: boolean, isAlertC2: boolean, isAlertC3: boolean, baselineMean: number, baselineStd: number }}
 */
export function calculateEARS(history) {
  const n = history.length;
  if (n < 4) {
    return { c1: 0, c2: 0, c3: 0, isAlertC1: false, isAlertC2: false, isAlertC3: false, baselineMean: 0, baselineStd: 1 };
  }

  const currentVal = history[n - 1];

  // --- C1: Baseline using preceding 7 days (n-8 to n-2)
  const c1Window = history.slice(Math.max(0, n - 8), n - 1);
  const c1Mean = c1Window.reduce((a, b) => a + b, 0) / (c1Window.length || 1);
  const c1Variance = c1Window.reduce((a, b) => a + Math.pow(b - c1Mean, 2), 0) / Math.max(1, c1Window.length - 1);
  const c1Std = Math.max(0.5, Math.sqrt(c1Variance));
  const c1Score = (currentVal - c1Mean) / c1Std;

  // --- C2: 2-day buffer (n-10 to n-3) to avoid baseline inflation from ongoing surge
  const c2Window = history.slice(Math.max(0, n - 10), Math.max(0, n - 3));
  const c2Mean = c2Window.length > 0 ? c2Window.reduce((a, b) => a + b, 0) / c2Window.length : c1Mean;
  const c2Variance = c2Window.length > 1 ? c2Window.reduce((a, b) => a + Math.pow(b - c2Mean, 2), 0) / (c2Window.length - 1) : c1Variance;
  const c2Std = Math.max(0.5, Math.sqrt(c2Variance));
  const c2Score = (currentVal - c2Mean) / c2Std;

  // --- C3: 3-day aberration persistence (sum of positive excess C2 over past 3 days)
  let c3Score = Math.max(0, c2Score - 1.0);
  if (n >= 2) {
    const prevC2Score = Math.max(0, (history[n - 2] - c2Mean) / c2Std - 1.0);
    c3Score += prevC2Score;
  }
  if (n >= 3) {
    const prevPrevC2Score = Math.max(0, (history[n - 3] - c2Mean) / c2Std - 1.0);
    c3Score += prevPrevC2Score;
  }

  // Calibrated thresholds (EARS standard: C1 >= 3.0, C2 >= 3.0, C3 >= 2.0)
  return {
    c1: parseFloat(c1Score.toFixed(2)),
    c2: parseFloat(c2Score.toFixed(2)),
    c3: parseFloat(c3Score.toFixed(2)),
    isAlertC1: c1Score >= 3.0,
    isAlertC2: c2Score >= 3.0,
    isAlertC3: c3Score >= 2.0,
    baselineMean: parseFloat(c1Mean.toFixed(2)),
    baselineStd: parseFloat(c1Std.toFixed(2))
  };
}

/**
 * Modified Farrington Baseline Estimation with Outlier Down-weighting
 * Down-weights historical outbreak points so baseline is not artificially lifted.
 */
export function calculateFarringtonBaseline(history) {
  if (history.length < 5) {
    const mean = history.reduce((a, b) => a + b, 0) / (history.length || 1);
    return { expected: mean, upperThreshold: mean + 2 * Math.sqrt(Math.max(1, mean)), weights: history.map(() => 1) };
  }

  // Pass 1: raw mean and variance
  const rawMean = history.reduce((a, b) => a + b, 0) / history.length;
  const rawVariance = history.reduce((a, b) => a + Math.pow(b - rawMean, 2), 0) / (history.length - 1);
  const dispersion = Math.max(1.0, rawVariance / Math.max(1.0, rawMean));

  // Pass 2: Calculate weights using Anscombe residuals to down-weight past aberrations
  const weights = history.map(val => {
    const standardizedResidual = Math.abs(val - rawMean) / Math.sqrt(Math.max(1.0, dispersion * rawMean));
    if (standardizedResidual > 2.58) {
      return Math.pow(2.58 / standardizedResidual, 2); // downweight severe outliers
    }
    return 1.0;
  });

  // Re-estimate weighted mean
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedMean = history.reduce((sum, val, idx) => sum + val * weights[idx], 0) / totalWeight;

  // Upper threshold based on quasi-Poisson 95% upper prediction bound
  const upperThreshold = weightedMean + 1.96 * Math.sqrt(dispersion * weightedMean);

  return {
    expected: parseFloat(weightedMean.toFixed(2)),
    dispersion: parseFloat(dispersion.toFixed(2)),
    upperThreshold: parseFloat(upperThreshold.toFixed(2)),
    isExceeded: history[history.length - 1] > upperThreshold
  };
}

/**
 * Multi-Signal Cross-Correlation & Anomaly Fusion
 * Ingests temporal window of clinical, environmental, workplace, and community signals
 * and outputs calibrated Composite Risk Score (0-100) and Multi-signal Alert Tier.
 */
export function evaluateMultiSignalRisk(currentRecord, zoneHistoryRecords = []) {
  const n = zoneHistoryRecords.length;
  
  // Extract historical series for rolling z-scores
  const wbgtHistory = zoneHistoryRecords.map(r => r.environmental.wbgt);
  const pm25History = zoneHistoryRecords.map(r => r.environmental.pm25);
  const absenceHistory = zoneHistoryRecords.map(r => r.workplace.sicknessAbsenceRate);
  const fatigueHistory = zoneHistoryRecords.map(r => r.workplace.shiftFatigueIndex);
  const nearMissHistory = zoneHistoryRecords.map(r => r.workplace.nearMissIncidents);
  const otcRespHistory = zoneHistoryRecords.map(r => r.community.otcRespiratorySales);
  const otcAntipyreticHistory = zoneHistoryRecords.map(r => r.community.otcAntipyreticSales);
  const edRespHistory = zoneHistoryRecords.map(r => r.clinical.edRespiratory);
  const edHeatHistory = zoneHistoryRecords.map(r => r.clinical.edHeatStrain);
  const edViralHistory = zoneHistoryRecords.map(r => r.clinical.edViralSymptoms);

  // EARS scores for primary syndromic indicators
  const earsAbsence = calculateEARS(absenceHistory);
  const earsEdResp = calculateEARS(edRespHistory);
  const earsEdHeat = calculateEARS(edHeatHistory);
  const earsEdViral = calculateEARS(edViralHistory);

  // Farrington baselines
  const farringtonAbsence = calculateFarringtonBaseline(absenceHistory);
  const farringtonEdTotal = calculateFarringtonBaseline(zoneHistoryRecords.map(r => r.clinical.totalEdVisits));

  // Feature Z-Scores relative to baseline window with domain prior stabilization
  const calcZ = (val, hist, defaultMean, minStd) => {
    if (hist.length < 5) {
      // Use domain baseline prior during initial cold-start window
      return (val - defaultMean) / minStd;
    }
    const m = hist.reduce((a, b) => a + b, 0) / hist.length;
    const std = Math.max(minStd, Math.sqrt(hist.reduce((a, b) => a + Math.pow(b - m, 2), 0) / hist.length));
    return (val - m) / std;
  };

  const zWbgt = calcZ(currentRecord.environmental.wbgt, wbgtHistory, 22.0, 2.5);
  const zPm25 = calcZ(currentRecord.environmental.pm25, pm25History, 18.0, 4.5);
  const zAbsence = calcZ(currentRecord.workplace.sicknessAbsenceRate, absenceHistory, 2.2, 0.6);
  const zFatigue = calcZ(currentRecord.workplace.shiftFatigueIndex, fatigueHistory, 30.0, 6.0);
  const zNearMiss = calcZ(currentRecord.workplace.nearMissIncidents, nearMissHistory, 1.0, 1.0);
  const zOtcResp = calcZ(currentRecord.community.otcRespiratorySales, otcRespHistory, 100.0, 12.0);
  const zOtcAnti = calcZ(currentRecord.community.otcAntipyreticSales, otcAntipyreticHistory, 100.0, 12.0);
  const zEdHeat = calcZ(currentRecord.clinical.edHeatStrain, edHeatHistory, 2.0, 2.0);
  const zEdResp = calcZ(currentRecord.clinical.edRespiratory, edRespHistory, 8.0, 2.5);
  const zEdViral = calcZ(currentRecord.clinical.edViralSymptoms, edViralHistory, 9.0, 3.0);

  // Cross-Signal Synergy Factors
  // Synergy 1: Thermal stress synergy (WBGT elevated + Workplace Fatigue/Near Misses elevated)
  const thermalSynergy = (zWbgt > 1.5 && (zFatigue > 1.5 || zNearMiss > 1.5)) ? 1.45 : 1.0;
  
  // Synergy 2: Industrial Inhalation synergy (PM2.5 elevated + OTC respiratory spike + Absence)
  const respiratorySynergy = (zPm25 > 1.8 && (zOtcResp > 1.5 || zAbsence > 1.5)) ? 1.4 : 1.0;

  // Synergy 3: Viral Workplace Cluster synergy (Absence spike + OTC fever sales + Viral calls)
  const viralClusterSynergy = (zAbsence > 2.0 && zOtcAnti > 1.8) ? 1.5 : 1.0;

  // Sub-Scores (0 to 100)
  const envSubScore = Math.min(100, Math.max(0, (Math.max(0, zWbgt) * 18 + Math.max(0, zPm25) * 16)));
  const workplaceSubScore = Math.min(100, Math.max(0, (Math.max(0, zAbsence) * 22 + Math.max(0, zFatigue) * 14 + Math.max(0, zNearMiss) * 12)));
  const communitySubScore = Math.min(100, Math.max(0, (Math.max(0, zOtcResp) * 18 + Math.max(0, zOtcAnti) * 18)));
  const clinicalSubScore = Math.min(100, Math.max(0, (Math.max(0, zEdHeat) * 25 + Math.max(0, zEdResp) * 22 + Math.max(0, zEdViral) * 22)));

  // Composite Risk Score Formulation:
  // Key innovation: High workplace + environmental deviations trigger early risk even BEFORE clinical hits!
  let compositeRisk = (
    envSubScore * 0.28 +
    workplaceSubScore * 0.35 +
    communitySubScore * 0.17 +
    clinicalSubScore * 0.20
  );

  // Apply maximum cross-signal synergy boost
  const maxSynergy = Math.max(thermalSynergy, respiratorySynergy, viralClusterSynergy);
  compositeRisk = Math.min(100, compositeRisk * maxSynergy);

  // Maximum individual feature deviation
  const maxZ = Math.max(zWbgt, zPm25, zAbsence, zFatigue, zNearMiss, zOtcResp, zOtcAnti, zEdHeat, zEdResp, zEdViral);
  
  // Statistical aberration gating to avoid alert fatigue:
  // Requires either a single signal deviation >= 1.75 sigma, cross-signal synergy, or standard EARS / Farrington alert
  const hasAberrationSupport = (
    maxZ >= 1.75 ||
    maxSynergy > 1.0 ||
    earsAbsence.isAlertC1 || earsAbsence.isAlertC2 ||
    earsEdHeat.isAlertC1 || earsEdResp.isAlertC1 || earsEdViral.isAlertC1 ||
    farringtonAbsence.isExceeded
  );

  if (!hasAberrationSupport) {
    compositeRisk = Math.min(30, compositeRisk); // Suppress false alarms during normal baseline noise
  }

  // Determine Risk Tier
  let tierLevel = 0;
  let tierLabel = 'Normal Baseline';
  let tierColor = '#10B981';

  if (compositeRisk >= 75) {
    tierLevel = 3;
    tierLabel = 'Tier 3: Emergency Surge & Escalation';
    tierColor = '#EF4444';
  } else if (compositeRisk >= 55) {
    tierLevel = 2;
    tierLabel = 'Tier 2: Targeted Operational Control';
    tierColor = '#F97316';
  } else if (compositeRisk >= 35 && hasAberrationSupport) {
    tierLevel = 1;
    tierLabel = 'Tier 1: Preventive Advisory';
    tierColor = '#F59E0B';
  }

  return {
    compositeRisk: Math.round(compositeRisk),
    tierLevel,
    tierLabel,
    tierColor,
    subScores: {
      environmental: Math.round(envSubScore),
      workplace: Math.round(workplaceSubScore),
      community: Math.round(communitySubScore),
      clinical: Math.round(clinicalSubScore)
    },
    zScores: {
      wbgt: parseFloat(zWbgt.toFixed(2)),
      pm25: parseFloat(zPm25.toFixed(2)),
      absence: parseFloat(zAbsence.toFixed(2)),
      fatigue: parseFloat(zFatigue.toFixed(2)),
      nearMiss: parseFloat(zNearMiss.toFixed(2)),
      otcResp: parseFloat(zOtcResp.toFixed(2)),
      otcAnti: parseFloat(zOtcAnti.toFixed(2)),
      edHeat: parseFloat(zEdHeat.toFixed(2)),
      edResp: parseFloat(zEdResp.toFixed(2)),
      edViral: parseFloat(zEdViral.toFixed(2))
    },
    ears: {
      absence: earsAbsence,
      edResp: earsEdResp,
      edHeat: earsEdHeat,
      edViral: earsEdViral
    },
    farrington: {
      absence: farringtonAbsence,
      edTotal: farringtonEdTotal
    },
    synergyMultiplier: parseFloat(maxSynergy.toFixed(2))
  };
}
