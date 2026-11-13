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
