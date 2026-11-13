/**
 * SentinelPulse - Abu Dhabi Malaffi / HL7 FHIR v4 Ingestion Engine
 * Ingests, parses, and harmonizes standard FHIR syndromic surveillance bundles
 * conforming to Malaffi Health Information Exchange (HIE) specifications.
 */

import { ZONES } from '../models/signals.js';

// Standard Syndromic Terminology Codes (LOINC & ICD-10)
export const FHIR_SYNDROMIC_CODES = {
  HEAT_ILLNESS: {
    loinc: ['82257-7'], // Heat exhaustion screening
    icd10: ['T67.0', 'T67.1', 'T67.2', 'T67.3', 'T67.4', 'T67.5'], // Heat stroke / exhaustion
    label: 'Heat Exhaustion / Thermal Stress'
  },
  RESPIRATORY_DISTRESS: {
    loinc: ['30525-0'], // Respiratory symptom assessment
    icd10: ['J45.9', 'J44.1', 'J46', 'R06.0'], // Asthma, COPD exacerbation, Dyspnea
    label: 'Acute Respiratory & Bronchospasm'
  },
  VIRAL_SYNDROMIC: {
    loinc: ['86290-0', '95409-9'], // Viral respiratory screen
    icd10: ['U07.1', 'R50.9', 'J12.9'], // COVID-19, Fever unspecified, Viral pneumonia
    label: 'Viral Syndromic / Fever Cluster'
  }
};

/**
 * Parse an incoming HL7 FHIR v4.0 Bundle into SentinelPulse syndromic signals.
 * @param {object} fhirBundle - Standard FHIR Bundle JSON object (resourceType: 'Bundle')
 */
export function parseMalaffiFHIRBundle(fhirBundle) {
  if (!fhirBundle || fhirBundle.resourceType !== 'Bundle') {
    throw new Error('Invalid FHIR payload: Resource must be a FHIR Bundle.');
  }

  const entries = fhirBundle.entry || [];
  const resultsByZone = {
    'ZONE-A': { heatStrainCount: 0, respiratoryCount: 0, viralCount: 0, encountersProcessed: 0 },
    'ZONE-B': { heatStrainCount: 0, respiratoryCount: 0, viralCount: 0, encountersProcessed: 0 },
    'ZONE-C': { heatStrainCount: 0, respiratoryCount: 0, viralCount: 0, encountersProcessed: 0 },
    'ZONE-D': { heatStrainCount: 0, respiratoryCount: 0, viralCount: 0, encountersProcessed: 0 }
  };

  let totalParsedObservations = 0;

  for (const entry of entries) {
    const resource = entry.resource;
    if (!resource) continue;

    // Determine target zone from organization or address
    let targetZone = 'ZONE-A'; // Default to Industrial Corridor (Mussafah)
    const orgReference = resource.serviceProvider?.reference || resource.performer?.[0]?.reference || '';
    const postalCode = resource.subject?.postalCode || '';

    if (orgReference.includes('Mussafah') || postalCode.includes('ICAD') || orgReference.includes('ZONE-A')) {
      targetZone = 'ZONE-A';
    } else if (orgReference.includes('Corniche') || orgReference.includes('Al-Danah') || orgReference.includes('ZONE-B')) {
      targetZone = 'ZONE-B';
    } else if (orgReference.includes('Reem') || orgReference.includes('ZONE-C')) {
      targetZone = 'ZONE-C';
    } else if (orgReference.includes('KIZAD') || orgReference.includes('Khalifa') || orgReference.includes('ZONE-D')) {
      targetZone = 'ZONE-D';
    }

    // Process Encounter resources
    if (resource.resourceType === 'Encounter') {
      resultsByZone[targetZone].encountersProcessed++;
      const reasonCodes = resource.reasonCode?.flatMap(rc => rc.coding?.map(c => c.code) || []) || [];

      if (reasonCodes.some(c => FHIR_SYNDROMIC_CODES.HEAT_ILLNESS.icd10.some(h => c.startsWith(h)))) {
        resultsByZone[targetZone].heatStrainCount++;
      }
      if (reasonCodes.some(c => FHIR_SYNDROMIC_CODES.RESPIRATORY_DISTRESS.icd10.some(r => c.startsWith(r)))) {
        resultsByZone[targetZone].respiratoryCount++;
      }
      if (reasonCodes.some(c => FHIR_SYNDROMIC_CODES.VIRAL_SYNDROMIC.icd10.some(v => c.startsWith(v)))) {
        resultsByZone[targetZone].viralCount++;
      }
    }

    // Process Observation resources
    if (resource.resourceType === 'Observation') {
      totalParsedObservations++;
      const codings = resource.code?.coding || [];
      const codes = codings.map(c => c.code);

      if (codes.some(c => FHIR_SYNDROMIC_CODES.HEAT_ILLNESS.loinc.includes(c))) {
        resultsByZone[targetZone].heatStrainCount++;
      }
      if (codes.some(c => FHIR_SYNDROMIC_CODES.RESPIRATORY_DISTRESS.loinc.includes(c))) {
        resultsByZone[targetZone].respiratoryCount++;
      }
      if (codes.some(c => FHIR_SYNDROMIC_CODES.VIRAL_SYNDROMIC.loinc.includes(c))) {
        resultsByZone[targetZone].viralCount++;
      }
    }
  }

  return {
    status: 'SUCCESS',
    hieSource: 'Malaffi Health Information Exchange (Abu Dhabi)',
    fhirVersion: '4.0.1',
    bundleId: fhirBundle.id || `MALAFFI-HIE-${Date.now()}`,
    timestamp: new Date().toISOString(),
    totalEntries: entries.length,
    totalObservations: totalParsedObservations,
    aggregatedByZone: resultsByZone,
    auditSummary: `Successfully parsed ${entries.length} FHIR resources across Abu Dhabi healthcare network. Extracted syndromic heat, respiratory, and viral indicators.`
  };
}

/**
 * Generate a realistic sample Malaffi FHIR Emergency Bundle for interactive testing.
 * Simulates a cluster of thermal stress and dehydration presentations originating from Mussafah industrial district.
 */
export function generateSampleMalaffiBundle(incidentType = 'heatwave', zoneId = 'ZONE-A') {
  const zoneName = ZONES[zoneId]?.name || 'Mussafah / ICAD Industrial City';
  const bundleId = `MALAFFI-EMERGENCY-${Date.now().toString(36).toUpperCase()}`;

  const entries = [];
  const caseCount = incidentType === 'heatwave' ? 8 : 6;

  for (let i = 1; i <= caseCount; i++) {
    // 1. Encounter Resource
    entries.push({
      resource: {
        resourceType: 'Encounter',
        id: `enc-malaffi-${i}`,
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'EMER',
          display: 'emergency'
        },
        subject: {
          display: `Worker ID: ANONYMIZED-${1000 + i}`,
          postalCode: zoneId === 'ZONE-A' ? 'ICAD-1' : 'KIZAD-PORT'
        },
        serviceProvider: {
          display: `Abu Dhabi Occupational Health Clinic (${zoneName})`,
          reference: `Organization/${zoneId}`
        },
        reasonCode: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10',
                code: incidentType === 'heatwave' ? 'T67.0' : 'J45.9',
                display: incidentType === 'heatwave' ? 'Heat exhaustion / heat stroke' : 'Acute bronchospasm exacerbation'
              }
            ]
          }
        ],
        period: {
          start: new Date(Date.now() - (i * 1800000)).toISOString()
        }
      }
    });

    // 2. Observation Resource (Core Temperature or SpO2)
    entries.push({
      resource: {
        resourceType: 'Observation',
        id: `obs-malaffi-${i}`,
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: incidentType === 'heatwave' ? '82257-7' : '30525-0',
              display: incidentType === 'heatwave' ? 'Heat stress core temperature index' : 'Respiratory symptom assessment'
            }
          ]
        },
        valueQuantity: {
          value: incidentType === 'heatwave' ? (38.8 + (i * 0.15)) : 88 + (i * 1.0),
          unit: incidentType === 'heatwave' ? 'Cel' : '%',
          system: 'http://unitsofmeasure.org'
        },
        performer: [
          {
            reference: `Organization/${zoneId}`,
            display: `Malaffi HIE Node: ${zoneName}`
          }
        ]
      }
    });
  }

  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'collection',
    timestamp: new Date().toISOString(),
    meta: {
      profile: ['http://malaffi.ae/fhir/StructureDefinition/syndromic-surveillance-bundle']
    },
    entry: entries
  };
}

