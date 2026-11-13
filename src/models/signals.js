/**
 * SentinelPulse - Core Signal Data Models & Definitions
 * Challenge 06: Population and Workforce Health Early Warning
 */

// Canonical Zones / Geographic Sub-districts
export const ZONES = {
  'ZONE-A': { id: 'ZONE-A', name: 'Industrial & Logistics Corridor', type: 'Workplace/Industrial', population: 24500, workforce: 14200, lat: 40.7128, lng: -74.0060 },
  'ZONE-B': { id: 'ZONE-B', name: 'Metro Commercial & Civic Core', type: 'Commercial/Transit', population: 58000, workforce: 28000, lat: 40.7306, lng: -73.9925 },
  'ZONE-C': { id: 'ZONE-C', name: 'Riverside High-Density Residential', type: 'Residential/Family', population: 42000, workforce: 19500, lat: 40.7484, lng: -73.9857 },
  'ZONE-D': { id: 'ZONE-D', name: 'Port Operations & Chemical Warehousing', type: 'Heavy Industrial', population: 16500, workforce: 11800, lat: 40.7011, lng: -74.0150 }
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

