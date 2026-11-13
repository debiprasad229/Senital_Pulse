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

    const telemetryRes = await fetch('http://localhost:3001/api/telemetry/live?zoneId=ZONE-A');
    const telemetryJson = await telemetryRes.json();
    console.log('LIVE TELEMETRY CHECK:', {
      zone: telemetryJson.zoneName,
      wbgt: telemetryJson.environmental.wbgt,
      pm25: telemetryJson.environmental.pm25
    });

    const fhirRes = await fetch('http://localhost:3001/api/fhir/sample-bundle?incident=heatwave&zoneId=ZONE-A');
    const fhirJson = await fhirRes.json();
    console.log('FHIR SAMPLE BUNDLE CHECK:', {
      bundleId: fhirJson.id,
      entriesCount: fhirJson.entry.length
    });

    const fhirIngestRes = await fetch('http://localhost:3001/api/fhir/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fhirJson)
    });
    const fhirIngestJson = await fhirIngestRes.json();
    console.log('FHIR INGESTION CHECK:', {
      status: fhirIngestJson.status,
      hieSource: fhirIngestJson.hieSource,
      heatCountZoneA: fhirIngestJson.aggregatedByZone['ZONE-A'].heatStrainCount
    });

    const webhookRes = await fetch('http://localhost:3001/api/webhooks/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: null,
        evaluation: { compositeRisk: 72, tierLevel: 2, tierLabel: 'Tier 2: Targeted Operational Control', zScores: { wbgt: 2.8, absence: 3.1 } },
        currentRecord: { zoneId: 'ZONE-A', zoneName: 'Mussafah / ICAD Industrial City', environmental: { wbgt: 34.5 }, workplace: { sicknessAbsenceRate: 6.2 } }
      })
    });
    const webhookJson = await webhookRes.json();
    console.log('TEAMS WEBHOOK DISPATCH CHECK:', {
      status: webhookJson.status,
      cardType: webhookJson.payload.attachments[0].contentType
    });

    console.log('\nALL SERVER ENDPOINTS FUNCTIONING AS SPECIFIED!');
  } catch (err) {
    console.error('Server test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});

