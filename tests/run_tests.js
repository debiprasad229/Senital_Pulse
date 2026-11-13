/**
 * SentinelPulse - Automated Test Suite
 * Validates all 6 pillars of Challenge 06:
 * 1. Multi-signal surveillance
 * 2. Explainable anomaly detection
 * 3. Actionable decision support
 * 4. Privacy preservation & small-cell suppression
 * 5. Operational validation & lead time
 * 6. Health & resilience impact
 */

import { generateMultiSignalData } from '../src/data/generator.js';
import { calculateEARS, calculateFarringtonBaseline, evaluateMultiSignalRisk } from '../src/analytics/surveillance.js';
import { explainAlert } from '../src/analytics/explainability.js';
import { applySmallCellSuppression, projectRecordForRole } from '../src/privacy/guardian.js';
import { generatePlaybooks } from '../src/decision/playbooks.js';
import { runBacktest, runMissingDataStressTest } from '../src/validation/backtester.js';
import { calculateImpactMetrics } from '../src/decision/impact.js';
import { ROLES } from '../src/models/signals.js';
import { calculateWBGT, calculateWetBulbTemperature, fetchLiveZoneTelemetry } from '../src/data/telemetry_service.js';
import { generateSampleMalaffiBundle, parseMalaffiFHIRBundle } from '../src/data/fhir_parser.js';
import { formatTeamsAdaptiveCard, dispatchTeamsAlert } from '../src/decision/webhook_dispatcher.js';
import { generateAICommanderBrief } from '../src/decision/ai_commander.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('  RUNNING SENTINELPULSE TEST SUITE (CHALLENGE 06)');
console.log('======================================================\n');

// -----------------------------------------------------------------
// TEST GROUP 1: MULTI-SIGNAL SURVEILLANCE DATA GENERATION
// -----------------------------------------------------------------
console.log('--- TEST GROUP 1: Multi-Signal Data Ingestion & Generation ---');
const heatwaveData = generateMultiSignalData('heatwave', 30);
assert(heatwaveData.records.length === 30 * 4, 'Generates 120 zone-day records for 30 days across 4 zones');

const sampleRec = heatwaveData.records[0];
assert(sampleRec.environmental && sampleRec.workplace && sampleRec.clinical && sampleRec.community, 'Record contains all 4 distinct signal streams (Environmental, Workplace, Clinical, Community)');
assert(typeof sampleRec.environmental.wbgt === 'number' && sampleRec.environmental.wbgt > 0, 'Environmental WBGT reading is valid');
assert(typeof sampleRec.workplace.sicknessAbsenceRate === 'number', 'Workplace sickness absence rate is valid');
assert(typeof sampleRec.clinical.edHeatStrain === 'number', 'Clinical ED visits reading is valid');

// -----------------------------------------------------------------
// TEST GROUP 2: SURVEILLANCE ALGORITHMS (EARS & FARRINGTON)
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Statistical Anomaly Detection (EARS & Farrington) ---');
const baselineHistory = [5, 6, 4, 5, 5, 6, 5, 6, 5, 18]; // sudden spike on day 10
const ears = calculateEARS(baselineHistory);
assert(ears.c1 > 3.0, `EARS C1 correctly identifies aberration with score > 3.0 (score: ${ears.c1})`);
assert(ears.isAlertC1 === true, 'EARS C1 alert flag triggers on spike');

const farrington = calculateFarringtonBaseline(baselineHistory);
assert(farrington.isExceeded === true, `Farrington baseline upper threshold exceeded (expected: ${farrington.expected}, thresh: ${farrington.upperThreshold})`);

// -----------------------------------------------------------------
// TEST GROUP 3: EXPLAINABILITY & FEATURE ATTRIBUTION
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Explainability & Feature Attribution ---');
const surgeRecord = heatwaveData.records.find(r => r.dayIndex === 24 && r.zoneId === 'ZONE-A');
const zoneHistory = heatwaveData.records.filter(r => r.zoneId === 'ZONE-A' && r.dayIndex < 24);
const riskEval = evaluateMultiSignalRisk(surgeRecord, zoneHistory);
const explanation = explainAlert(riskEval, surgeRecord, zoneHistory);

assert(riskEval.compositeRisk > 50, `Composite risk correctly elevated during surge (risk: ${riskEval.compositeRisk})`);
assert(explanation.contributions && explanation.contributions.length > 0, 'Attribution breakdown produces quantified signal contributions');
const topDriver = explanation.topDrivers[0];
assert(topDriver && topDriver.percentageContribution > 0, `Top driver identified: ${topDriver?.signal} (${topDriver?.percentageContribution}% contribution)`);
assert(explanation.narrativeExplanation.length > 20, 'Generates human-readable narrative explanation');

// -----------------------------------------------------------------
// TEST GROUP 4: PRIVACY GUARDIAN & SMALL-CELL SUPPRESSION
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 4: Privacy Guardian & Small-Cell Suppression ---');
assert(applySmallCellSuppression(3) === '<5', 'Suppresses small count of 3 to "<5"');
assert(applySmallCellSuppression(0) === 0, 'Leaves 0 count unmasked');
assert(applySmallCellSuppression(14) === 14, 'Leaves count >= 5 unmasked (count: 14)');

const sampleRecordForPrivacy = {
  ...sampleRec,
  clinical: { edRespiratory: 2, edHeatStrain: 12, edViralSymptoms: 3, totalEdVisits: 17 },
  workplace: { sicknessAbsenceRate: 3.4, shiftFatigueIndex: 42, nearMissIncidents: 2 }
};

// Test Public Health projection
const pubHealthView = projectRecordForRole(sampleRecordForPrivacy, ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST);
assert(pubHealthView.clinical.edRespiratory === '<5', 'Small-cell suppression applied to public health clinical count of 2');
assert(pubHealthView.clinical.edHeatStrain === 12, 'Clinical count of 12 retained for statistical epidemiological tracking');

// Test HR / Employer projection (Privacy Air-gap)
const hrView = projectRecordForRole(sampleRecordForPrivacy, ROLES.FACILITY_OPERATIONS_MANAGER);
assert(typeof hrView.clinical === 'string' && hrView.clinical.includes('ACCESS_RESTRICTED'), 'Clinical medical records completely air-gapped from HR / Employer view');
assert(hrView.workplace.shiftSafetyReadiness !== undefined, 'HR view receives generalized operational safety readiness score instead');

// -----------------------------------------------------------------
// TEST GROUP 5: ACTIONABLE DECISION SUPPORT PLAYBOOKS
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 5: Actionable Decision Support Playbooks ---');
const playbooks = generatePlaybooks(riskEval, surgeRecord);
assert(playbooks.activePlaybooks.length > 0, 'Generates active preventive playbooks for elevated risk');
const pb = playbooks.activePlaybooks[0];
assert(pb.responsibleRole && pb.responsibleRole.length > 0, `Playbook assigns accountable operational role: ${pb.responsibleRole}`);
assert(pb.actionChecklist && pb.actionChecklist.length >= 2, 'Playbook provides concrete action checklist');
assert(pb.evidenceAndAssumptions && pb.evidenceAndAssumptions.drivingSignal, 'Playbook includes explicit evidence card and regulatory standard');

// -----------------------------------------------------------------
// TEST GROUP 6: OPERATIONAL VALIDATION & LEAD TIME ADVANTAGE
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 6: Operational Validation, Lead Time & Stress Testing ---');
const backtest = runBacktest('heatwave', 30, 0.0);
assert(backtest.leadTime.leadTimeAdvantageDays >= 3, `Demonstrates early warning lead time advantage of ${backtest.leadTime.leadTimeAdvantageDays} days ahead of hospital surge`);
assert(parseFloat(backtest.performanceMetrics.sensitivity) > 80, `High sensitivity achieved: ${backtest.performanceMetrics.sensitivity}`);
assert(parseFloat(backtest.performanceMetrics.positivePredictiveValue) > 75, `High PPV achieved: ${backtest.performanceMetrics.positivePredictiveValue}`);
assert(parseFloat(backtest.performanceMetrics.falseAlarmRate) < 10, `Calibrated false alarm rate: ${backtest.performanceMetrics.falseAlarmRate}`);

// Missing data stress test
const stressTest = runMissingDataStressTest('heatwave');
assert(stressTest.benchmarkCurve.length === 4, 'Evaluates missing-data degradation curve at 0%, 15%, 30%, and 50% dropout');
assert(stressTest.benchmarkCurve[0].sensitivity !== undefined, 'Stress test evaluates sensitivity under data dropout');

// -----------------------------------------------------------------
// TEST GROUP 7: HEALTH & RESILIENCE IMPACT MODEL
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 7: Health & Economic Impact Assessment ---');
const impact = calculateImpactMetrics(backtest.timeline.map(t => ({ tierLevel: t.evaluation.tierLevel, explainability: t.explainability })), 'heatwave');
assert(impact.counterfactualAnalysis.avertedEdVisits > 0, `Quantifies averted emergency department visits: ${impact.counterfactualAnalysis.avertedEdVisits}`);
assert(impact.counterfactualAnalysis.savedLostWorkdays > 0, `Quantifies preserved worker days: ${impact.counterfactualAnalysis.savedLostWorkdays}`);
assert(impact.economicImpact.totalEconomicBenefit > 0, `Quantifies economic value added: $${impact.economicImpact.totalEconomicBenefit.toLocaleString()}`);

// -----------------------------------------------------------------
// TEST GROUP 8: LIVE ENVIRONMENTAL TELEMETRY & WBGT PSYCHROMETRICS
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 8: Live Environmental Telemetry & WBGT Calculations ---');
const testTw = calculateWetBulbTemperature(35.0, 60.0);
assert(testTw > 25.0 && testTw < 32.0, `Calculates accurate psychrometric wet-bulb temperature: ${testTw}°C (from 35°C @ 60% RH)`);

const testWbgt = calculateWBGT(38.0, 50.0);
assert(testWbgt >= 30.0, `Calculates accurate WBGT heat stress index: ${testWbgt}°C`);

const liveZoneTelemetry = await fetchLiveZoneTelemetry('ZONE-A');
assert(liveZoneTelemetry.zoneId === 'ZONE-A', 'Fetches live telemetry structure for Mussafah / ICAD');
assert(typeof liveZoneTelemetry.environmental.wbgt === 'number', 'Telemetry contains computed WBGT index');
assert(typeof liveZoneTelemetry.environmental.pm25 === 'number', 'Telemetry contains ambient PM2.5 reading');

// -----------------------------------------------------------------
// TEST GROUP 9: ABU DHABI MALAFFI / HL7 FHIR v4 INTEROPERABILITY
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 9: Abu Dhabi Malaffi / HL7 FHIR v4 Interoperability ---');
const sampleMalaffiBundle = generateSampleMalaffiBundle('heatwave', 'ZONE-A');
assert(sampleMalaffiBundle.resourceType === 'Bundle', 'Generates valid HL7 FHIR v4 Bundle');
assert(sampleMalaffiBundle.entry.length > 0, `Bundle contains clinical entries (count: ${sampleMalaffiBundle.entry.length})`);

const parsedMalaffi = parseMalaffiFHIRBundle(sampleMalaffiBundle);
assert(parsedMalaffi.status === 'SUCCESS', 'Parses Malaffi FHIR bundle successfully');
assert(parsedMalaffi.aggregatedByZone['ZONE-A'].heatStrainCount > 0, `Extracts syndromic heat strain encounters: ${parsedMalaffi.aggregatedByZone['ZONE-A'].heatStrainCount}`);

// -----------------------------------------------------------------
// TEST GROUP 10: MICROSOFT TEAMS ADAPTIVE CARDS v1.4
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 10: Microsoft Teams Adaptive Card v1.4 Dispatch ---');
const samplePlaybook = playbooks.activePlaybooks[0];
const teamsCard = formatTeamsAdaptiveCard(riskEval, surgeRecord, samplePlaybook);
assert(teamsCard.type === 'message', 'Teams payload type is message');
assert(teamsCard.attachments[0].contentType === 'application/vnd.microsoft.card.adaptive', 'Attachment is standard Microsoft Adaptive Card');
const cardContent = teamsCard.attachments[0].content;
assert(cardContent.version === '1.4', 'Adaptive Card adheres to v1.4 schema');
assert(cardContent.actions && cardContent.actions.length >= 2, 'Card includes interactive Action buttons for field operations');

const simulatedDispatch = await dispatchTeamsAlert(null, teamsCard);
assert(simulatedDispatch.status === 'SIMULATED_PREVIEW', 'Supports simulated card inspection without corporate account');

// -----------------------------------------------------------------
// TEST GROUP 11: AI INCIDENT COMMANDER EXECUTIVE BRIEFING
// -----------------------------------------------------------------
console.log('\n--- TEST GROUP 11: AI Incident Commander Synthesis ---');
const aiBrief = generateAICommanderBrief(riskEval, surgeRecord, playbooks, impact);
assert(aiBrief.briefId.startsWith('BRIEF-AIC-'), 'Generates unique traceable executive briefing ID');
assert(aiBrief.regulatoryFrameworks.some(r => r.includes('MoHRE')), 'Explicitly cites UAE MoHRE Midday Work Ban regulatory framework');
assert(aiBrief.markdownReport.length > 200, 'Generates comprehensive Markdown executive briefing report');

// -----------------------------------------------------------------
// TEST SUMMARY
// -----------------------------------------------------------------
console.log('\n======================================================');
console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('  All challenge requirements successfully verified!');
  process.exit(0);
}

