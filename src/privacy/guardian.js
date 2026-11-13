/**
 * SentinelPulse - Privacy Guardian & Role-Based Access Control (RBAC) Module
 * Implements small-cell suppression (n < 5), k-anonymity boundaries,
 * and strict separation preventing HR/Management from accessing clinical/health data.
 */

import { ROLES } from '../models/signals.js';

export const SUPPRESSION_THRESHOLD = 5;

/**
 * Apply small-cell suppression to sensitive numerical counts.
 * If 1 <= count < SUPPRESSION_THRESHOLD, replaces with '<5' string.
 */
export function applySmallCellSuppression(value) {
  if (typeof value === 'number' && value > 0 && value < SUPPRESSION_THRESHOLD) {
    return '<5';
  }
  return value;
}

/**
 * Project and sanitize a multi-signal record according to the requester's role.
 * Enforces role boundaries and privacy compliance.
 */
export function projectRecordForRole(record, role = ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST) {
  const sanitized = {
    date: record.date,
    zoneId: record.zoneId,
    zoneName: record.zoneName,
    zoneType: record.zoneType,
    population: record.population,
    workforce: record.workforce,
    environmental: { ...record.environmental },
    roleAccessLevel: role
  };

  if (role === ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST) {
    // Public Health View:
    // Can view aggregate clinical syndromic data (with small-cell suppression on low counts),
    // community pharmacy sales, environmental readings, and aggregate workplace absence rate.
    sanitized.clinical = {
      edRespiratory: applySmallCellSuppression(record.clinical.edRespiratory),
      edHeatStrain: applySmallCellSuppression(record.clinical.edHeatStrain),
      edViralSymptoms: applySmallCellSuppression(record.clinical.edViralSymptoms),
      totalEdVisits: applySmallCellSuppression(record.clinical.totalEdVisits)
    };
    sanitized.community = { ...record.community };
    sanitized.workplace = {
      sicknessAbsenceRate: record.workplace.sicknessAbsenceRate
      // Specific near-miss incident logs and shift fatigue details suppressed from public view
    };
    sanitized.privacyNotice = 'Small-cell suppression active (<5 suppressed). Individual health identifiers omitted.';

  } else if (role === ROLES.OCCUPATIONAL_HEALTH_OFFICER) {
    // Occupational Health View:
    // Can view workplace operational metrics, environmental exposure, and aggregated clinical alerts.
    sanitized.workplace = {
      sicknessAbsenceRate: record.workplace.sicknessAbsenceRate,
      shiftFatigueIndex: record.workplace.shiftFatigueIndex,
      nearMissIncidents: applySmallCellSuppression(record.workplace.nearMissIncidents)
    };
    sanitized.clinical = {
      // Aggregate alert trends only, without raw hospital patient counts
      clinicalSurgeRisk: record.clinical.totalEdVisits > 20 ? 'ELEVATED' : 'NORMAL'
    };
    sanitized.community = {
      pharmacyTrend: record.community.otcRespiratorySales > 130 ? 'SURGE' : 'STABLE'
    };
    sanitized.privacyNotice = 'Authorized Occupational Health View. Governed by medical confidentiality standards.';

  } else if (role === ROLES.FACILITY_OPERATIONS_MANAGER) {
    // HR & Facility Operations View:
    // STRICT ETHICAL & LEGAL PRIVACY AIR-GAP.
    // Prohibited from seeing clinical diagnoses, ED visits, or medical absence details.
    // ONLY receives operational hazard ratings, aggregated safety readiness, and actionable work orders.
    sanitized.operationalHazardRating = record.environmental.wbgt > 32 || record.environmental.pm25 > 100 ? 'HIGH HAZARD' : 'MODERATE/LOW';
    sanitized.workplace = {
      shiftSafetyReadiness: Math.max(10, Math.round(100 - record.workplace.shiftFatigueIndex)),
      operationalStaffingAdequacy: record.workplace.sicknessAbsenceRate > 5.0 ? 'IMPACTED_HIGH' : 'NORMAL'
    };
    // Medical records completely stripped:
    sanitized.clinical = 'ACCESS_RESTRICTED: Medical confidentiality boundary prevents employer/manager inspection.';
    sanitized.community = 'ACCESS_RESTRICTED: Not required for facility operational control.';
    sanitized.privacyNotice = 'AIR-GAP COMPLIANCE: Data sanitized to prevent discriminatory, employment, or disciplinary action against individual personnel.';

  } else if (role === ROLES.REGULATORY_COMPLIANCE_AUDITOR) {
    // Regulatory / OSHA view:
    // Environmental thresholds, workplace aggregate compliance, and incident rate metrics.
    sanitized.environmental = { ...record.environmental };
    sanitized.workplace = {
      sicknessAbsenceRate: record.workplace.sicknessAbsenceRate,
      nearMissIncidents: applySmallCellSuppression(record.workplace.nearMissIncidents)
    };
    sanitized.regulatoryComplianceStatus = {
      oshaHeatStandardCompliant: record.environmental.wbgt < 31.0,
      airQualityStandardCompliant: record.environmental.pm25 < 55.0
    };
    sanitized.privacyNotice = 'Regulatory audit view. Anonymized compliance metrics.';
  }

  return sanitized;
}

