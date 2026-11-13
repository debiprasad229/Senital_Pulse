/**
 * SentinelPulse - Express API Server & Web Application Host
 * Challenge 06: Population and Workforce Health Early Warning
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateMultiSignalData } from '../data/generator.js';
import { runBacktest, runMissingDataStressTest } from '../validation/backtester.js';
import { projectRecordForRole } from '../privacy/guardian.js';
import { ROLES } from '../models/signals.js';
import { fetchAllLiveZones, fetchLiveZoneTelemetry } from '../data/telemetry_service.js';
import { parseMalaffiFHIRBundle, generateSampleMalaffiBundle } from '../data/fhir_parser.js';
import { formatTeamsAdaptiveCard, dispatchTeamsAlert } from '../decision/webhook_dispatcher.js';
import { generateAICommanderBrief } from '../decision/ai_commander.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static dashboard frontend from src/public
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SentinelPulse Early Warning Platform',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Endpoint: Run Backtested Surveillance Scenario
 * e.g., /api/backtest?scenario=heatwave&days=30
 */
app.get('/api/backtest', (req, res) => {
  const scenario = req.query.scenario || 'heatwave';
  const days = parseInt(req.query.days || '30', 10);
  const missingRate = parseFloat(req.query.missingRate || '0.0');

  try {
    const backtestResult = runBacktest(scenario, days, missingRate);
    const stressTest = runMissingDataStressTest(scenario);

    res.json({
      ...backtestResult,
      stressTest
    });
  } catch (error) {
    console.error('Backtest execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Privacy-Preserving Role-Based View
 * Demonstrates small-cell suppression and employer privacy air-gap.
 */
app.get('/api/privacy-view', (req, res) => {
  const role = req.query.role || ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST;
  const scenario = req.query.scenario || 'heatwave';

  try {
    const rawData = generateMultiSignalData(scenario, 5);
    const sanitizedRecords = rawData.records.map(rec => projectRecordForRole(rec, role));

    res.json({
      role,
      scenario,
      recordCount: sanitizedRecords.length,
      sampleSanitizedRecords: sanitizedRecords
    });
  } catch (error) {
    console.error('Privacy view error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Live UAE & Industrial Environmental Telemetry (Open-Meteo Free API)
 * e.g., /api/telemetry/live?zoneId=ZONE-A
 */
app.get('/api/telemetry/live', async (req, res) => {
  try {
    const zoneId = req.query.zoneId;
    if (zoneId) {
      const data = await fetchLiveZoneTelemetry(zoneId);
      return res.json(data);
    }
    const allData = await fetchAllLiveZones();
    res.json({
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo Live API & Calibrated Microclimate Engine',
      zones: allData
    });
  } catch (error) {
    console.error('Live telemetry error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Get Sample Malaffi HL7 FHIR Syndromic Bundle
 */
app.get('/api/fhir/sample-bundle', (req, res) => {
  const incident = req.query.incident || 'heatwave';
  const zoneId = req.query.zoneId || 'ZONE-A';
  try {
    const bundle = generateSampleMalaffiBundle(incident, zoneId);
    res.json(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Ingest Malaffi / HL7 FHIR Bundle
 */
app.post('/api/fhir/ingest', (req, res) => {
  try {
    const fhirBundle = req.body;
    const parsed = parseMalaffiFHIRBundle(fhirBundle);
    res.json(parsed);
  } catch (error) {
    console.error('FHIR Ingestion error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Endpoint: Dispatch Microsoft Teams Adaptive Card Alert
 */
app.post('/api/webhooks/dispatch', async (req, res) => {
  try {
    const { webhookUrl, evaluation, currentRecord, playbook } = req.body;
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const cardPayload = formatTeamsAdaptiveCard(evaluation, currentRecord, playbook, hostUrl);
    const dispatchResult = await dispatchTeamsAlert(webhookUrl, cardPayload);
    res.json(dispatchResult);
  } catch (error) {
    console.error('Webhook dispatch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Generate AI Incident Commander Briefing
 */
app.post('/api/ai/brief', (req, res) => {
  try {
    const { evaluation, currentRecord, playbooks, impact } = req.body;
    const brief = generateAICommanderBrief(evaluation, currentRecord, playbooks, impact);
    res.json(brief);
  } catch (error) {
    console.error('AI brief generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Root fallback to dashboard
 */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  SentinelPulse Early Warning Platform is running!`);
    console.log(`  Access Dashboard: http://localhost:${PORT}`);
    console.log(`  API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
