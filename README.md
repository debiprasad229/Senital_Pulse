# SentinelPulse: Population & Workforce Health Early Warning Platform

**Population Health · Challenge 06: Population and Workforce Health Early Warning**

SentinelPulse is an explainable, privacy-preserving, near-real-time early warning and decision-support system that breaks down data silos between public health surveillance and occupational operations. It fuses multi-modal signals to identify emerging health risks days ahead of traditional hospital capacity alerts, explains contributing factors with feature attribution, strictly protects worker privacy through small-cell suppression and employer air-gaps, and issues role-assigned preventive intervention playbooks.

---

## 🌟 The 6 Challenge Pillars Implemented

| # | Challenge Pillar | SentinelPulse Implementation |
|---|---|---|
| **1** | **Multi-Signal Surveillance** | Ingests 4 distinct streams: **Clinical/Service** (ED visits, urgent care syndromic codes), **Environmental** (PM2.5, Ozone, Wet-Bulb Globe Temp / Heat Index), **Workplace/Operational** (sickness absence rates, shift fatigue index, near-miss incident logs), and **Community** (OTC pharmacy velocity, telehealth volume). |
| **2** | **Explainable Anomaly Detection** | Combines **CDC EARS (C1, C2, C3)** aberration detection and **Modified Farrington Baseline** (with past outbreak down-weighting) with multivariate anomaly scoring. Provides quantified **feature attribution** (Z-scores, % risk contribution, and natural language narrative cards). |
| **3** | **Actionable Decision Support** | Automated **3-Tiered Action Matrix** (Tier 1: Preventive Advisory; Tier 2: Targeted Operational Control; Tier 3: Emergency Surge Escalation). Assigns concrete operational roles (*Occupational Health & Safety Lead*, *Facility Operations Manager*, *Public Health Epidemiologist*) with verifiable evidence and regulatory standards (OSHA NEP, EPA NAAQS, CDC Framework). |
| **4** | **Privacy-Preserving Views** | Enforces **Small-Cell Suppression** ($n < 5 \rightarrow \text{"<5"}$), $k$-anonymity, and an **ethical & legal employer air-gap** preventing HR/Managers from viewing clinical diagnoses, restricting usage to operational work-orders and safety readiness scores. |
| **5** | **Operational Validation & Stress Testing** | Back-testing against 3 benchmark crisis scenarios (*Extreme Heatwave*, *PM2.5 Industrial Plume*, *Workplace Viral Cluster*). Measures **Lead Time** (days gained before hospital surge), **Sensitivity** (>90%), **Positive Predictive Value** (>80%), **False Alarm Rate** (<7%), and evaluates graceful degradation across 0% to 50% missing data / delayed geolocation. |
| **6** | **Health and Resilience Impact** | Counterfactual impact engine calculates **averted emergency department visits**, **preserved productive workdays (DART days saved)**, **direct healthcare savings**, and return on investment (**ROI**). |

---

## 🏗️ Architecture & Directory Structure

```
health proj/
├── src/
│   ├── models/
│   │   └── signals.js          # Canonical schemas, geographic zones, risk tiers, and roles
│   ├── data/
│   │   └── generator.js        # Synthetic multi-signal generator with baseline & 3 crisis scenarios
│   ├── analytics/
│   │   ├── surveillance.js     # EARS (C1/C2/C3), Farrington Baseline & Multivariate Cross-Signal Fusion
│   │   └── explainability.js   # Feature attribution decomposition, Z-scores & narrative reasoning
│   ├── privacy/
│   │   └── guardian.js         # Small-cell suppression (<5), RBAC projection & employer air-gap
│   ├── decision/
│   │   ├── playbooks.js        # Actionable 3-Tier Preventive Playbooks with role assignment & evidence
│   │   └── impact.js           # Counterfactual impact model (averted admissions, saved workdays)
│   ├── validation/
│   │   └── backtester.js       # Backtesting harness, lead-time metrics & missing data stress test
│   ├── api/
│   │   └── server.js           # Express API server hosting REST endpoints and serving dashboard
│   └── public/
│       ├── index.html          # Modern, responsive Tailwind CSS operations cockpit
│       └── app.js              # Client-side dynamic charts (Chart.js), RBAC switching, and alerts
├── tests/
│   ├── run_tests.js            # Automated unit and integration test suite (32 tests)
│   └── test_server.js          # Live HTTP endpoint integration test
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **npm**: v9+ (tested on npm 11)

### 2. Run the Automated Test Suite
To verify all 6 pillars and algorithms:
```bash
npm test
```
*Executes 32 assertions covering data generation, EARS/Farrington surveillance, explainability waterfalls, small-cell suppression, RBAC air-gaps, lead-time validation, and economic impact modeling.*

### 3. Launch the Platform & Operations Dashboard
```bash
npm start
```
Once started, open your browser at:
👉 **`http://localhost:3000`**

---

## 🖥️ Interactive Dashboard Features

1. **Surveillance Districts & Zones**:
   - Monitored zones: *Industrial Corridor (Zone-A)*, *Civic Core (Zone-B)*, *Residential Riverside (Zone-C)*, *Port & Chemical Hub (Zone-D)*.
   - Click any zone card to inspect localized risk levels and driving signals.

2. **Scenario Selector**:
   - **Heatwave & Thermal Workplace Stress**: Watch pre-clinical wet-bulb temperature and shift fatigue spike 4-5 days before emergency department heat exhaustion admissions surge.
   - **PM2.5 Plume & Respiratory Surge**: Industrial particulate plume triggers OTC inhaler sales and workplace cough absences prior to hospital asthma surges.
   - **Logistics Hub Viral Cluster**: Syndromic absenteeism and fever calls trigger early quarantine playbooks before community transmission escalates.

3. **Role-Based Access Control (RBAC) Switcher**:
   - **Public Health Epidemiologist**: View aggregate clinical visit counts with small-cell suppression applied ($n < 5 \rightarrow \text{"<5"}$).
   - **Occupational Health & Safety Lead**: Inspect workplace fatigue indices, near-miss incident reports, and authorize clinical preventive triage.
   - **Facility Operations / HR Manager**: Inspect the strict employer air-gap where individual medical data is completely blocked, and only operational hazard ratings and safety readiness work-orders are provided.
   - **Regulatory & Environmental Auditor**: View OSHA NEP and EPA NAAQS compliance logs.

4. **Explainability Waterfall**:
   - Visual breakdown of driving variables, quantified statistical Z-score deviations, and percentage contributions to total risk score.

5. **Actionable Preventive Playbooks**:
   - Tiered action checklists with designated operational owners and regulatory evidence cards.
   - Click *"Dispatch Preventive Work-Orders"* to trigger simulated operational execution.

6. **Operational Validation Studio**:
   - Real-time confusion matrix metrics (Sensitivity, PPV, False Alarm Rate, F1-Score).
   - Missing Data Stress-Test benchmark evaluating resilience across 0%, 15%, 30%, and 50% data dropout.

---

## 🔒 Privacy & Compliance Guarantees

- **Small-Cell Suppression Policy**: Counts $1 \le n < 5$ are masked with `"<5"` to prevent re-identification of patients in small geographic or workplace clusters.
- **Employer Privacy Boundary**: Compliant with ADA, HIPAA, and GDPR occupational health guidelines. Sickness diagnostic codes and clinical logs are restricted to healthcare personnel; operational management only receives anonymized hazard tiers and engineering/administrative control orders.

