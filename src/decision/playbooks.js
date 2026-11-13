/**
 * SentinelPulse - Actionable Decision Support & Playbook Engine
 * Translates multi-signal risk evaluations into calibrated, role-assigned,
 * proportionate preventive actions with explicit evidence cards and assumptions.
 */

import { ROLES, RISK_TIERS } from '../models/signals.js';

/**
 * Generate actionable preventive playbooks based on risk evaluation and driving signals.
 */
export function generatePlaybooks(evaluation, currentRecord, explanation = null) {
  const { compositeRisk, tierLevel, zScores } = evaluation;
  const topDrivers = evaluation.topDrivers || explanation?.topDrivers || [];

  if (tierLevel === 0) {
    return {
      activePlaybooks: [],
      summary: 'Baseline risk normal. Routine surveillance ongoing; no emergency interventions required.'
    };
  }

  const playbooks = [];
  const primaryDriverName = topDrivers[0]?.signal || 'Multi-Signal Deviation';

  // -------------------------------------------------------------
  // THEMATIC SCENARIO A: THERMAL STRESS & HEAT MITIGATION PLAYBOOK
  // -------------------------------------------------------------
  if (zScores.wbgt > 1.2 || zScores.edHeat > 1.5) {
    if (tierLevel === 1) {
      playbooks.push({
        id: 'PB-HEAT-T1',
        title: 'Thermal Hazard Watch & Hydration Distribution Advisory',
        tier: RISK_TIERS.TIER_1_ADVISORY,
        responsibleRole: ROLES.FACILITY_OPERATIONS_MANAGER,
        secondaryRole: ROLES.OCCUPATIONAL_HEALTH_OFFICER,
        targetZone: currentRecord.zoneName,
        actionChecklist: [
          'Verify chilled drinking water and electrolyte station replenishment every 2 hours.',
          'Issue proactive heat index advisory bulletin across all shift supervisor radios.',
          'Conduct voluntary hydration checks and encourage buddy-system monitoring in high-exposure docks.'
        ],
        evidenceAndAssumptions: {
          drivingSignal: `Wet-Bulb Globe Temp reached ${currentRecord.environmental.wbgt}°C (+${zScores.wbgt}σ above 14-day baseline).`,
          assumption: 'Early hydration and rest breaks mitigate 65-80% of heat exhaustion incidents prior to clinical escalation.',
          regulatoryStandard: 'OSHA National Emphasis Program on Outdoor and Indoor Heat-Related Hazards (NEP).'
        },
        urgency: 'Within 4 hours of shift start'
      });
    } else if (tierLevel === 2) {
      playbooks.push({
        id: 'PB-HEAT-T2',
        title: 'Mandatory Work-Rest Cycles & Thermal Shift Modification',
        tier: RISK_TIERS.TIER_2_TARGETED,
        responsibleRole: ROLES.OCCUPATIONAL_HEALTH_OFFICER,
        secondaryRole: ROLES.FACILITY_OPERATIONS_MANAGER,
        targetZone: currentRecord.zoneName,
        actionChecklist: [
          'Enforce mandatory 15-minute rest breaks per working hour in air-conditioned or shaded respite zones.',
          'Reschedule heavy manual lifting and unshaded roof activities to cooler early morning hours (05:00-09:00).',
          'Deploy portable industrial evaporative coolers and high-velocity misting fans across loading bays.',
          'Active symptom screening (dizziness, nausea, cramping) conducted by on-site nursing/first-responder staff.'
        ],
        evidenceAndAssumptions: {
          drivingSignal: `Synergistic elevation: WBGT ${currentRecord.environmental.wbgt}°C coupled with Shift Fatigue Index ${currentRecord.workplace.shiftFatigueIndex}.`,
          assumption: 'Active work-rest cycle enforcement prevents severe core hyperthermia and reduces emergency room transfers by an estimated 72%.',
          regulatoryStandard: 'ACGIH Threshold Limit Values (TLVs) for Work/Rest Allocations.'
        },
        urgency: 'Immediate (within 60 minutes)'
      });
    } else if (tierLevel === 3) {
      playbooks.push({
        id: 'PB-HEAT-T3',
        title: 'Emergency Thermal Surge Escalation & Clinical Pre-Hospital Standby',
        tier: RISK_TIERS.TIER_3_CRITICAL,
        responsibleRole: ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST,
        secondaryRole: ROLES.OCCUPATIONAL_HEALTH_OFFICER,
        targetZone: currentRecord.zoneName,
        actionChecklist: [
          'Issue municipal Public Health Emergency Alert for District Vulnerable Populations and Outdoor Workers.',
          'Direct local emergency departments and urgent care centers to activate thermal surge protocol and IV fluid stocking.',
          'Execute temporary cessation of non-essential outdoor commercial operations in high-heat zones.',
          'Open municipal cooling centers and dispatch community mobile hydration/wellness response vehicles.'
        ],
        evidenceAndAssumptions: {
          drivingSignal: `Critical thermal surge: WBGT ${currentRecord.environmental.wbgt}°C, workplace absence at ${currentRecord.workplace.sicknessAbsenceRate}%, ED heat visits climbing.`,
          assumption: 'Hospital emergency departments face risk of bed/cooling deficit within 24-48 hours if community pre-triage is not established.',
          regulatoryStandard: 'CDC Heat & Health Framework / FEMA Emergency Activation.'
        },
        urgency: 'Emergency (within 15 minutes)'
      });
    }
  }

  // -----------------------------------------------------------------
  // THEMATIC SCENARIO B: INDUSTRIAL PARTICULATE & AIR QUALITY PLAYBOOK
  // -----------------------------------------------------------------
  if (zScores.pm25 > 1.2 || zScores.edResp > 1.4) {
    if (tierLevel >= 1 && tierLevel < 3) {
      playbooks.push({
        id: 'PB-AIR-T1T2',
        title: 'Industrial Emission Suppression & Respiratory PPE Distribution',
        tier: tierLevel === 1 ? RISK_TIERS.TIER_1_ADVISORY : RISK_TIERS.TIER_2_TARGETED,
        responsibleRole: ROLES.REGULATORY_COMPLIANCE_AUDITOR,
        secondaryRole: ROLES.FACILITY_OPERATIONS_MANAGER,
        targetZone: currentRecord.zoneName,
        actionChecklist: [
          'Distribute fit-tested N95/FFP2 respirators to all outdoor logistics and warehouse workers.',
          'Switch facility HVAC systems to 100% recirculation mode with activated MERV-13/HEPA filtration.',
          'Order immediate dust-suppression water misting on all unpaved haul roads and material stockpiles.',
          'Notify local primary care networks and pharmacies to ensure bronchodilator / inhaler inventory resilience.'
        ],
        evidenceAndAssumptions: {
          drivingSignal: `PM2.5 concentration elevated to ${currentRecord.environmental.pm25} µg/m³ (AQI: ${currentRecord.environmental.aqi}).`,
          assumption: 'Early respirator adoption and filtration switching curbs acute bronchospasm episodes among susceptible asthmatic workers by 55%.',
          regulatoryStandard: 'EPA Clean Air Act National Ambient Air Quality Standards (NAAQS) & OSHA 29 CFR 1910.134.'
        },
        urgency: 'Within 2 hours'
      });
    } else if (tierLevel === 3) {
      playbooks.push({
        id: 'PB-AIR-T3',
        title: 'Severe Particulate Plume Containment & Clinical Surge Protocol',
        tier: RISK_TIERS.TIER_3_CRITICAL,
        responsibleRole: ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST,
        secondaryRole: ROLES.REGULATORY_COMPLIANCE_AUDITOR,
        targetZone: currentRecord.zoneName,
        actionChecklist: [
          'Issue Shelter-in-Place health advisory for asthmatic and elderly residents in impacted downwind corridor.',
          'Mandate emergency curtailment of high-emission manufacturing processes in Zone-A and Zone-D.',
          'Pre-position supplemental nebulizer and oxygen reserves at community clinics and regional hospitals.',
          'Mobilize air quality monitoring vans for real-time plume perimeter tracking.'
        ],
        evidenceAndAssumptions: {
          drivingSignal: `Severe particulate hazard: PM2.5 at ${currentRecord.environmental.pm25} µg/m³, OTC respiratory sales index at ${currentRecord.community.otcRespiratorySales}.`,
          assumption: 'Uncontrolled particulate plumes precipitate a 3-5x spike in acute pediatric and geriatric respiratory admissions within 72 hours.',
          regulatoryStandard: 'State Emergency Environmental Health Order.'
        },
        urgency: 'Emergency (within 30 minutes)'
      });
    }
  }

  // -----------------------------------------------------------------
  // THEMATIC SCENARIO C: WORKPLACE SYNDROMIC / VIRAL CLUSTER PLAYBOOK
  // -----------------------------------------------------------------
  if (zScores.absence > 1.5 || zScores.edViral > 1.5 || zScores.otcAnti > 1.5) {
    playbooks.push({
      id: 'PB-VIRAL-CLUSTER',
      title: 'High-Density Workplace Cluster Containment & Syndromic Contact Tracing',
      tier: tierLevel === 3 ? RISK_TIERS.TIER_3_CRITICAL : RISK_TIERS.TIER_2_TARGETED,
      responsibleRole: ROLES.OCCUPATIONAL_HEALTH_OFFICER,
      secondaryRole: ROLES.PUBLIC_HEALTH_EPIDEMIOLOGIST,
      targetZone: currentRecord.zoneName,
      actionChecklist: [
        'Deploy rapid antigen testing booths at facility shift change gates; offer voluntary on-site testing.',
        'Implement staggered break schedules and increase physical spacing on assembly/packing conveyors.',
        'Sanitize communal touchpoints (canteens, locker rooms, biometrics) with hospital-grade disinfectant.',
        'Permit non-punitive paid sick leave for symptomatic staff to halt transmission cascades.'
      ],
      evidenceAndAssumptions: {
        drivingSignal: `Workplace absenteeism surged to ${currentRecord.workplace.sicknessAbsenceRate}% with OTC antipyretic sales index at ${currentRecord.community.otcAntipyreticSales}.`,
        assumption: 'Prompt isolation of early symptomatic cases truncates the effective reproductive rate (Rt) from 1.8 down to <1.0 within 5 business days.',
        regulatoryStandard: 'CDC Workplace Health Guidance & NIOSH Health Hazard Evaluation.'
      },
      urgency: 'Immediate'
    });
  }

  return {
    tierLevel,
    compositeRisk,
    totalPlaybooks: playbooks.length,
    activePlaybooks: playbooks,
    summary: `${playbooks.length} actionable preventive playbook(s) generated for ${currentRecord.zoneName} under ${evaluation.tierLabel}.`
  };
}
