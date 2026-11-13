/**
 * SentinelPulse - Explainability & Feature Attribution Engine
 * Breaks down composite alerts into explainable signal contributions,
 * baseline comparisons, temporal phase tracking, and human-readable audit cards.
 */

/**
 * Generate comprehensive explainability breakdown for an alert evaluation.
 */
export function explainAlert(evaluation, currentRecord, zoneHistory = []) {
  const { compositeRisk, subScores, zScores, synergyMultiplier, tierLabel } = evaluation;

  // Signal contribution calculations
  const rawContributions = [
    { signal: 'Wet-Bulb Temperature (Heat)', category: 'environmental', z: zScores.wbgt, value: `${currentRecord.environmental.wbgt} °C`, weight: 1.2 },
    { signal: 'PM2.5 Air Quality', category: 'environmental', z: zScores.pm25, value: `${currentRecord.environmental.pm25} µg/m³`, weight: 1.1 },
    { signal: 'Workplace Sickness Absence', category: 'workplace', z: zScores.absence, value: `${currentRecord.workplace.sicknessAbsenceRate} %`, weight: 1.5 },
    { signal: 'Workforce Shift Fatigue', category: 'workplace', z: zScores.fatigue, value: `${currentRecord.workplace.shiftFatigueIndex} /100`, weight: 1.0 },
    { signal: 'Near-Miss / Strain Incidents', category: 'workplace', z: zScores.nearMiss, value: `${currentRecord.workplace.nearMissIncidents} reports`, weight: 0.9 },
    { signal: 'Pharmacy OTC Respiratory Sales', category: 'community', z: zScores.otcResp, value: `${currentRecord.community.otcRespiratorySales} idx`, weight: 0.8 },
    { signal: 'Pharmacy OTC Antipyretic Sales', category: 'community', z: zScores.otcAnti, value: `${currentRecord.community.otcAntipyreticSales} idx`, weight: 0.8 },
    { signal: 'ED Heat Strain Visits', category: 'clinical', z: zScores.edHeat, value: `${currentRecord.clinical.edHeatStrain} visits`, weight: 1.4 },
    { signal: 'ED Respiratory Visits', category: 'clinical', z: zScores.edResp, value: `${currentRecord.clinical.edRespiratory} visits`, weight: 1.3 },
    { signal: 'ED Viral Symptoms', category: 'clinical', z: zScores.edViral, value: `${currentRecord.clinical.edViralSymptoms} visits`, weight: 1.3 }
  ];

  // Calculate positive variance points contributed by each signal
  const positiveContribs = rawContributions.map(c => {
    const rawScore = Math.max(0, c.z) * c.weight;
    return { ...c, rawScore };
  });

  const totalRawScore = positiveContribs.reduce((sum, c) => sum + c.rawScore, 0) || 1;

  // Normalize into percentage contributions
  const contributions = positiveContribs
    .map(c => ({
      signal: c.signal,
      category: c.category,
      observedValue: c.value,
      zScore: c.z,
      percentageContribution: Math.round((c.rawScore / totalRawScore) * 100)
    }))
    .filter(c => c.zScore > 0.5)
    .sort((a, b) => b.percentageContribution - a.percentageContribution);

  // Identify primary driving factors
  const topDrivers = contributions.slice(0, 3);

  // Determine Temporal Warning Phase
  let temporalPhase = 'Normal Baseline';
  let leadTimeStatus = 'Monitoring standard baseline.';

  const isWorkplaceLeading = (zScores.absence > 2.0 || zScores.fatigue > 2.0 || zScores.nearMiss > 2.0);
  const isEnvLeading = (zScores.wbgt > 2.0 || zScores.pm25 > 2.0);
  const isClinicalSurging = (zScores.edHeat > 2.5 || zScores.edResp > 2.5 || zScores.edViral > 2.5);

  if (compositeRisk >= 35) {
    if ((isWorkplaceLeading || isEnvLeading) && !isClinicalSurging) {
      temporalPhase = 'EARLY WARNING LEAD PHASE';
      leadTimeStatus = 'Early detection active: Pre-clinical signals (workplace + environmental) are elevated prior to acute hospital surge. Lead time window estimated at 3-6 days.';
    } else if (isClinicalSurging && (isWorkplaceLeading || isEnvLeading)) {
      temporalPhase = 'ACTIVE CLINICAL SURGE COINCIDENT PHASE';
      leadTimeStatus = 'Acute clinical burden in progress: Emergency department visits and community health services experiencing high utilization.';
    } else {
      temporalPhase = 'ELEVATED PERSISTENT MONITORING';
      leadTimeStatus = 'Moderate elevation across distributed community and operational metrics.';
    }
  }

  // Generate natural language audit statement
  let narrativeExplanation = '';
  if (topDrivers.length === 0) {
    narrativeExplanation = `All signals in ${currentRecord.zoneName} remain within normal statistical tolerance limits.`;
  } else {
    const driverSummary = topDrivers.map(d => `${d.signal} (+${d.zScore}σ deviation, ${d.percentageContribution}% weight)`).join(', ');
    narrativeExplanation = `Alert triggered at ${tierLabel} in ${currentRecord.zoneName} (${currentRecord.zoneId}). Primary drivers: ${driverSummary}. Cross-signal synergy multiplier applied: ${synergyMultiplier}x.`;
  }

  return {
    zoneId: currentRecord.zoneId,
    zoneName: currentRecord.zoneName,
    date: currentRecord.date,
    compositeRisk,
    tierLabel,
    temporalPhase,
    leadTimeStatus,
    narrativeExplanation,
    topDrivers,
    contributions,
    categoryBreakdown: subScores
  };
}

