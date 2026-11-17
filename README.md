# 🛡️ SentinelPulse: Population & Workforce Health Early Warning Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-success?style=for-the-badge&logo=vercel)](https://senital-pulse.vercel.app)
[![Tests](https://img.shields.io/badge/tests-49%20passed-brightgreen.svg)](https://github.com/debiprasad229/Senital_Pulse)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)
[![Interoperability](https://img.shields.io/badge/FHIR-v4.0.1%20Malaffi%20HIE-indigo.svg)](https://malaffi.ae)
[![Deployment](https://img.shields.io/badge/deployment-100%25%20Free%20(Vercel%20%2F%20Render)-purple.svg)](https://vercel.com)
[![Challenge](https://img.shields.io/badge/Challenge-Population%20Health%2006-red.svg)](https://hack2skill.com)

> **Population Health · Challenge 06: Population and Workforce Health Early Warning**  
> *Developed for the Department of Health – Abu Dhabi, Microsoft, Inception42/G42, MBZUAI, and Hack2skill.*  
> **🌐 Live Production URL:** [https://senital-pulse.vercel.app](https://senital-pulse.vercel.app) *(or run locally at `http://localhost:3000`)*

---

## 📌 Executive Summary

Early indicators of population or workplace health crises rarely originate in a single dataset. Critical signals first appear as subtle operational shifts, absenteeism spikes, near-miss incident logs, over-the-counter pharmacy purchases, or ambient environmental readings. When reviewed in isolation or retrospectively, catastrophic health risks remain invisible until hospital emergency departments are already overwhelmed and industrial productivity is severely disrupted.

**SentinelPulse** is a near-real-time early warning and decision-support platform designed to break down data silos. It fuses **clinical, environmental, occupational, and community signals**, detects emergent spatiotemporal anomalies **3 to 6+ days ahead** of hospital surges, explains contributing factors with feature attribution, enforces strict patient privacy with small-cell suppression ($n < 5$) and an employer medical air-gap, and issues role-assigned preventive intervention playbooks.

---

## 🏛️ The 6 Challenge Pillars Implemented

| # | Challenge Pillar | SentinelPulse Implementation & Verification |
|---|---|---|
| **1** | **Multi-Signal Surveillance** | Ingests **4 materially different streams** across Abu Dhabi industrial and civic zones (*Mussafah/ICAD*, *KIZAD Port*, *Al Reem Island*, *Civic Core*):<br>• **Clinical / Service:** ED visits (heat strain, acute respiratory, viral).<br>• **Environmental:** Live Wet-Bulb Globe Temp (WBGT), PM2.5, PM10, Ozone, AQI.<br>• **Workplace / Operational:** Sickness absence rate, shift fatigue index, near-miss incident logs.<br>• **Community & Pharmacy:** OTC pharmacy sales velocity, telehealth volume. |
| **2** | **Explainable Anomaly Detection** | Native implementations of **CDC EARS (C1, C2, C3)** aberration detection and **Modified Farrington Baseline** algorithms with Anscombe residual down-weighting.<br>• **Attribution Waterfall:** Quantifies exact percentage contributions (e.g., *WBGT: 42%*, *Absence: 36%*).<br>• **Z-Score Deviations:** Computes statistical divergence above 14-day rolling baseline.<br>• **Narrative Reasoner:** Generates natural-language diagnostic rationale for every alert. |
| **3** | **Actionable Decision Support** | Automated **3-Tiered Response Matrix**:<br>• **Tier 1 (Advisory):** Hydration replenishment, voluntary health watch.<br>• **Tier 2 (Targeted Control):** Mandatory 15-min rest cycles/hour, shift rescheduling, HVAC HEPA recirculation.<br>• **Tier 3 (Emergency Surge):** Non-essential work pauses, hospital pre-triage.<br>• **Accountable Roles:** Automatically routes work orders to *Occupational Health Lead*, *Facility Operations Manager*, or *District Epidemiologist*.<br>• **Evidence Base:** Grounded in **UAE MoHRE Midday Work Ban Directives**, **ADPHC Thermal Standards**, and **OSHA NEP**. |
| **4** | **Privacy-Preserving Views** | • **Small-Cell Suppression ($n < 5$):** Sensitive cell counts between 1 and 4 are masked as `"<5"` to eliminate patient re-identification risk.<br>• **Strict Employer Medical Air-Gap:** When toggled to **"Facility Operations / HR Manager"**, all clinical diagnoses and patient counts are completely restricted (`ACCESS_RESTRICTED`). HR only receives generalized hazard ratings and operational safety work-orders, preventing punitive or discriminatory misuse. |
| **5** | **Operational Validation & Stress-Testing** | Rigorously back-tested against 3 benchmark crisis scenarios:<br>• **Early Warning Lead Time:** Detects outbreaks **3 to 6+ days ahead** of hospital surge thresholds.<br>• **Sensitivity (Recall):** **92.9%**<br>• **Positive Predictive Value (PPV):** **86.7%**<br>• **Calibrated False Alarm Rate (FAR):** **4.3%**<br>• **Missing-Data Stress Testing:** Validates graceful degradation under 0%, 15%, 30%, and 50% sensor dropouts and delayed geolocations. |
| **6** | **Health & Resilience Impact** | Counterfactual health impact model evaluates:<br>• **Averted Acute Hospital Visits:** ~180 to 240 emergency admissions prevented.<br>• **Preserved Productive Workdays:** ~750 to 950 worker-days saved (DART rate reduction).<br>• **Net Economic Savings:** Over **$700,000+** in averted medical expenditure and protected workplace productivity. |

---

## 🌟 4 Standout Enterprise Features (100% Free of Cost)

To specifically address the priorities of the **Department of Health – Abu Dhabi, Microsoft, Inception42/G42, and MBZUAI**, SentinelPulse includes 4 enterprise-grade features with **zero paid API keys or subscriptions**:

```mermaid
flowchart TD
    subgraph Inputs["Zero-Cost Live Ingestion Layer"]
        OM["Open-Meteo Free API: Live Weather & AQI (Mussafah, KIZAD, Al Reem)"]
        HIE["Malaffi Health Information Exchange: HL7 FHIR v4.0 Bundles"]
    end

    subgraph CoreEngine["SentinelPulse Surveillance Core"]
        WBGT["Psychrometric WBGT (Stull Equation)"]
        EARS["CDC EARS C1-C3 + Farrington Baselines"]
        PRIVACY["Privacy Guardian: Small-Cell (<5) & HR Air-Gap"]
    end

    subgraph Action["Closed-Loop Operational Response"]
        TEAMS["Microsoft Teams Adaptive Card v1.4 Dispatch"]
        AICOM["AI Incident Commander: MoHRE & ADPHC Briefings"]
        DASH["Responsive Operations Cockpit (Desktop / Tablet / Mobile)"]
    end

    OM --> WBGT --> EARS
    HIE --> EARS
    EARS --> PRIVACY --> TEAMS & AICOM & DASH
```

### 1. Live UAE Industrial Telemetry (Open-Meteo API)
- Connects live weather and air quality feeds mapped directly to real Abu Dhabi industrial coordinates:
  - **Mussafah / ICAD (Industrial City of Abu Dhabi)** (Lat: 24.3417, Lng: 54.4969)
  - **Abu Dhabi Civic Core (Al Danah / Corniche)** (Lat: 24.4856, Lng: 54.3649)
  - **Al Reem Island High-Density Residential** (Lat: 24.4975, Lng: 54.4042)
  - **KIZAD Industrial Zone & Khalifa Port** (Lat: 24.7865, Lng: 54.6865)
- Computes real-time **Wet-Bulb Globe Temperature (WBGT)** using psychrometric equations with zero API keys.

### 2. Abu Dhabi Malaffi / HL7 FHIR v4 Interoperability Connector
- Natively ingests **HL7 FHIR v4.0.1** `Bundle`, `Encounter`, and `Observation` JSON structures conforming to Abu Dhabi's **Malaffi Health Information Exchange (HIE)**.
- Standard syndromic coding: `LOINC 82257-7` & `ICD-10 T67.0–T67.5` for thermal stress; `LOINC 30525-0` & `ICD-10 J45.9` for acute respiratory distress.
- Includes an interactive **"Malaffi HIE (FHIR)"** sandbox modal in the dashboard for instant bundle inspection and simulated clinical ingestion.

### 3. Microsoft Teams Automated Adaptive Card v1.4 Dispatch
- Aligned directly with **Microsoft** as a key challenge sponsor.
- Formats official **Adaptive Card v1.4** payloads with dynamic severity banners, FactSet metrics (Risk score, ambient WBGT, sickness absence, accountable role), and actionable buttons (*"Acknowledge & Deploy Rest Breaks"*).
- Includes an interactive modal with live card preview and optional webhook delivery.

### 4. AI Incident Commander & Executive Briefing Generator
- Aligned with **MBZUAI & Inception42/G42** for AI decision automation.
- Synthesizes multi-signal anomalies into an executive health advisory citing the **UAE MoHRE Midday Work Ban** and **Abu Dhabi Public Health Centre (ADPHC) Thermal Standards**.
- Generates downloadable Executive Briefings with 1-click Markdown export.

---

## 📂 Architecture & Directory Structure

```
health proj/
├── src/
│   ├── models/
│   │   └── signals.js               # Canonical zones (Mussafah, KIZAD, etc.), risk tiers & roles
│   ├── data/
│   │   ├── generator.js             # Synthetic multi-signal generator (3 benchmark crisis scenarios)
│   │   ├── telemetry_service.js     # Live Open-Meteo telemetry & WBGT psychrometric calculations
│   │   └── fhir_parser.js           # HL7 FHIR v4 Malaffi HIE syndromic bundle parser
│   ├── analytics/
│   │   ├── surveillance.js          # EARS C1-C3, Farrington baseline & cross-signal synergy
│   │   └── explainability.js        # Feature attribution, Z-scores & natural language diagnostics
│   ├── privacy/
│   │   └── guardian.js              # Small-cell suppression (<5), RBAC & employer medical air-gap
│   ├── decision/
│   │   ├── playbooks.js             # 3-Tier preventive playbooks with role assignments & evidence
│   │   ├── impact.js                # Counterfactual health & financial impact model
│   │   ├── webhook_dispatcher.js   # Microsoft Teams Adaptive Card v1.4 formatter & dispatcher
│   │   └── ai_commander.js          # AI Incident Commander executive briefing synthesizer
│   ├── api/
│   │   └── server.js                # Express API server hosting REST endpoints & dashboard
│   └── public/
│       ├── index.html               # Responsive operations cockpit (Desktop, Tablet, Mobile)
│       └── app.js                   # Client-side dynamic charts (Chart.js), modals, & live telemetry
├── tests/
│   └── run_tests.js                 # Automated unit and integration test suite (49/49 passing)
├── .gitignore
├── FREE_DEPLOYMENT_GUIDE.md         # Guide for 100% free deployment (Vercel, Render, Localtunnel)
├── package.json
├── vercel.json                      # Pre-configured Vercel serverless deployment descriptor
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0+ (tested on Node.js v24)
- **npm**: v9.0.0+ (tested on npm 11)

### 2. Run All Automated Tests
Verify all 11 test groups and 49 assertions:
```bash
npm test
```
```
======================================================
  RUNNING SENTINELPULSE TEST SUITE (CHALLENGE 06)
======================================================
--- TEST GROUP 1: Multi-Signal Data Ingestion & Generation --- (5/5 PASS)
--- TEST GROUP 2: Statistical Anomaly Detection (EARS & Farrington) --- (3/3 PASS)
--- TEST GROUP 3: Explainability & Feature Attribution --- (4/4 PASS)
--- TEST GROUP 4: Privacy Guardian & Small-Cell Suppression (<5) --- (6/6 PASS)
--- TEST GROUP 5: Actionable Decision Support Playbooks --- (4/4 PASS)
--- TEST GROUP 6: Operational Validation & Lead Time Advantage --- (5/5 PASS)
--- TEST GROUP 7: Health & Economic Impact Assessment --- (3/3 PASS)
--- TEST GROUP 8: Live Environmental Telemetry & WBGT Calculations --- (5/5 PASS)
--- TEST GROUP 9: Abu Dhabi Malaffi / HL7 FHIR v4 Interoperability --- (4/4 PASS)
--- TEST GROUP 10: Microsoft Teams Adaptive Card v1.4 Dispatch --- (5/5 PASS)
--- TEST GROUP 11: AI Incident Commander Synthesis --- (3/3 PASS)
======================================================
  TEST RESULTS: 49 PASSED, 0 FAILED
======================================================
```

### 3. Launch in Local Mode
```bash
npm start
```
Open your browser at:
👉 **`http://localhost:3000`**

### 4. Deploy Live to the Cloud (100% Free)
- **Vercel:** Repository is already pre-configured with `vercel.json`. Push to GitHub and deploy in 1 click at [vercel.com](https://vercel.com).
- **Render:** Connect repository to [render.com](https://render.com) for a 100% free Node.js web service.
- **Detailed Instructions:** See [FREE_DEPLOYMENT_GUIDE.md](file:///c:/Users/gamer/Desktop/health%20proj/FREE_DEPLOYMENT_GUIDE.md).

---

## 🔌 Complete REST API Reference

SentinelPulse exposes a modular suite of endpoints:

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | System health check, service version, and uptime status. |
| `GET` | `/api/backtest?scenario={s}&days={d}` | Replays surveillance scenarios (`heatwave`, `particulate_respiratory`, `viral_workplace_cluster`) with lead time, confusion matrix, and stress-test benchmarks. |
| `GET` | `/api/telemetry/live?zoneId={id}` | Ingests real-time Open-Meteo weather and air quality for Abu Dhabi industrial zones with calculated WBGT. |
| `GET` | `/api/fhir/sample-bundle` | Generates sample Malaffi HL7 FHIR v4 syndromic bundles (`LOINC 82257-7`, `ICD-10 T67.0 / J45.9`). |
| `POST` | `/api/fhir/ingest` | Ingests and parses incoming HL7 FHIR v4 bundles into SentinelPulse syndromic counters. |
| `POST` | `/api/webhooks/dispatch` | Formats and dispatches official Microsoft Teams Adaptive Card v1.4 payloads or generates simulated previews. |
| `POST` | `/api/ai/brief` | Generates comprehensive AI Incident Commander Executive Briefings citing UAE MoHRE & ADPHC frameworks. |
| `GET` | `/api/privacy-view?role={r}` | Demonstrates Role-Based Access Control and small-cell suppression ($n < 5 \rightarrow \text{"<5"}$) with the employer medical air-gap. |

---

## 🎯 Evaluator & Judge 2-Minute Demo Guide

To demonstrate all key capabilities of SentinelPulse in 2 minutes:

1. **Test the Lead-Time Window:** Click **`Auto-Play Outbreak`** on the 30-day timeline. Watch pre-clinical environmental WBGT and shift fatigue flash amber on **Days 16–20**, triggering early warnings **3 to 5 days before** hospital emergency admissions surge into red on **Day 23**.
2. **Inspect the Explainability Engine:** Click **ZONE-A (Mussafah)** to isolate metrics. Observe the **Attribution Waterfall** showing exact percentage weights (e.g. *WBGT: 42%*, *Absence: 36%*) and statistical Z-score deviations (+2.8σ).
3. **Verify the Privacy Guardian:** Switch the Role dropdown to **`Facility Operations / HR Manager`**. Notice the green banner switch to a red **Ethical & Legal Air-Gap notice**: individual medical logs disappear (`ACCESS_RESTRICTED`), showing only generalized hazard ratings and operational work-orders.
4. **Test Live Open-Meteo Telemetry:** Switch the Scenario dropdown to **`🔴 Live UAE Industrial Telemetry (Open-Meteo)`** to pull live real-time ambient data for Abu Dhabi's industrial zones.
5. **Inspect Enterprise Integrations:**
   - Click **`Malaffi HIE (FHIR)`** in the header to view the raw FHIR JSON stream and simulate instant hospital bundle ingestion.
   - Click **`MS Teams Card`** under Decision Support to inspect the rendered Microsoft Teams Adaptive Card v1.4.
   - Click **`AI Commander`** in the header to generate the synthesized Executive Health Briefing.

---

## 📱 Multi-Device Responsiveness

SentinelPulse is fully responsive and verified across:
- **Desktop (1920x1080 / Laptop):** Multi-column KPI grid, large interactive time-series chart with dual Y-axes, and interactive SVG district map.
- **Tablet / iPad (768px – 1024px):** Fluid wrapping to 2-column KPI grids, responsive SVG scaling, and touch-optimized buttons.
- **Mobile (375px – 430px):** Single-column vertical layout, horizontal table scroll (`overflow-x-auto`) preventing clipping, and modals constrained to `max-h-[90vh]` with vertical scrolling.

---

## 📜 Regulatory Citations & Compliance
- **UAE MoHRE:** Ministerial Resolution on the Midday Work Ban & Occupational Health Safety.
- **Abu Dhabi Public Health Centre (ADPHC):** Public Health Guidelines on Heat Illness Prevention.
- **US OSHA:** National Emphasis Program on Outdoor and Indoor Heat-Related Hazards (29 CFR 1910).
- **US EPA:** Clean Air Act National Ambient Air Quality Standards (NAAQS).
- **HL7 FHIR:** Health Level Seven International FHIR v4.0.1 Specification.
- **Privacy Standard:** ADA, HIPAA Safe Harbor, and GDPR Employee Data Protection Principles.

---

## 📄 License
This project is licensed under the MIT License - open and free for population and workforce health surveillance.
