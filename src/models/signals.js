/**
 * SentinelPulse - Core Signal Data Models & Definitions
 * Challenge 06: Population and Workforce Health Early Warning
 */

// Canonical Zones / Geographic Sub-districts (Abu Dhabi Workforce & Industrial Ecosystem)
export const ZONES = {
  'ZONE-A': { id: 'ZONE-A', name: 'Mussafah / ICAD Industrial City', type: 'Manufacturing & Heavy Fabrication', population: 38200, workforce: 29500, lat: 24.3417, lng: 54.4969 },
  'ZONE-B': { id: 'ZONE-B', name: 'Abu Dhabi Civic & Commercial Core', type: 'Commercial, Financial & Transit', population: 64000, workforce: 32000, lat: 24.4856, lng: 54.3649 },
  'ZONE-C': { id: 'ZONE-C', name: 'Al Reem Island & Riverside Urban', type: 'High-Density Residential & Services', population: 48500, workforce: 19800, lat: 24.4975, lng: 54.4042 },
  'ZONE-D': { id: 'ZONE-D', name: 'KIZAD Industrial Zone & Khalifa Port', type: 'Petrochemicals, Maritime & Logistics', population: 19200, workforce: 15400, lat: 24.7865, lng: 54.6865 }
};

// Signal Categories
export const SIGNAL_CATEGORIES = {
  CLINICAL: 'clinical',
  ENVIRONMENTAL: 'environmental',
  WORKPLACE: 'workplace',
  COMMUNITY: 'community'
};

// Risk Tiers
export const RISK_TIERS = {
  TIER_0_NORMAL: { level: 0, label: 'Normal Baseline', minScore: 0, maxScore: 34, color: '#10B981' },
  TIER_1_ADVISORY: { level: 1, label: 'Tier 1: Preventive Advisory', minScore: 35, maxScore: 59, color: '#F59E0B' },
  TIER_2_TARGETED: { level: 2, label: 'Tier 2: Targeted Operational Control', minScore: 60, maxScore: 79, color: '#F97316' },
  TIER_3_CRITICAL: { level: 3, label: 'Tier 3: Emergency Surge & Escalation', minScore: 80, maxScore: 100, color: '#EF4444' }
};

// Operational Stakeholder Roles
export const ROLES = {
  PUBLIC_HEALTH_EPIDEMIOLOGIST: 'Public Health Epidemiologist',
  OCCUPATIONAL_HEALTH_OFFICER: 'Occupational Health & Safety Lead',
  FACILITY_OPERATIONS_MANAGER: 'Facility Operations / HR Manager',
  REGULATORY_COMPLIANCE_AUDITOR: 'Regulatory & Environmental Auditor'
};

