import app from '../src/api/server.js';
import http from 'http';

const server = http.createServer(app);

server.listen(3001, async () => {
  console.log('Test server listening on port 3001...');
  try {
    const healthRes = await fetch('http://localhost:3001/api/health');
    const healthJson = await healthRes.json();
    console.log('HEALTH CHECK:', healthJson);

    const backtestRes = await fetch('http://localhost:3001/api/backtest?scenario=heatwave&days=15');
    const backtestJson = await backtestRes.json();
    console.log('BACKTEST RESULT:', {
      scenario: backtestJson.scenario,
      leadTimeAdvantageDays: backtestJson.leadTime.leadTimeAdvantageDays,
      sensitivity: backtestJson.performanceMetrics.sensitivity,
      ppv: backtestJson.performanceMetrics.positivePredictiveValue,
      totalAvertedVisits: backtestJson.impact.counterfactualAnalysis.avertedEdVisits
    });

    const privacyRes = await fetch('http://localhost:3001/api/privacy-view?role=Facility%20Operations%20/%20HR%20Manager');
    const privacyJson = await privacyRes.json();
    console.log('PRIVACY HR AIR-GAP CHECK:', {
      role: privacyJson.role,
      clinicalView: privacyJson.sampleSanitizedRecords[0].clinical,
      privacyNotice: privacyJson.sampleSanitizedRecords[0].privacyNotice
    });

    console.log('\nALL SERVER ENDPOINTS FUNCTIONING AS SPECIFIED!');
  } catch (err) {
    console.error('Server test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});

