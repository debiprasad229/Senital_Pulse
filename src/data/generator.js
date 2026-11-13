/**
 * SentinelPulse - Multi-Signal Synthetic Data Generator
 * Generates realistic temporal multi-signal time series with baseline seasonality
 * and 3 injected crisis scenarios for back-testing and validation.
 */

import { ZONES } from '../models/signals.js';

// Random normal distribution using Box-Muller transform
function randomNormal(mean = 0, stdDev = 1) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generate 30 days of multi-signal data across all 4 zones.
 * @param {string} scenario - 'baseline' | 'heatwave' | 'particulate_respiratory' | 'viral_workplace_cluster'
 */
export function generateMultiSignalData(scenario = 'heatwave', totalDays = 30) {
  const records = [];
  const startDate = new Date('2026-06-01T00:00:00Z');

  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    for (const [zoneId, zoneMeta] of Object.entries(ZONES)) {
      // 1. Environmental Signals Baseline
      // PM2.5 baseline (12 - 25 ug/m3)
      let pm25 = Math.max(5, randomNormal(18, 4));
      // Ozone baseline (25 - 45 ppb)
      let ozone = Math.max(10, randomNormal(35, 5));
      // Wet-Bulb Globe Temp (WBGT in Celsius) (20 - 25 C baseline)
      let wbgt = Math.max(16, randomNormal(22, 2.5));
      // Air Quality Index (AQI)
      let aqi = Math.round(pm25 * 2.1 + randomNormal(10, 3));

      // 2. Workplace Operational Signals Baseline
      // Sickness Absence Rate (1.5% - 3.2% baseline, higher on Mon/Fri)
      let baseAbsenceRate = isWeekend ? 0.4 : (dayOfWeek === 1 || dayOfWeek === 5 ? 2.8 : 2.1);
      let sicknessAbsenceRate = Math.max(0.2, randomNormal(baseAbsenceRate, 0.4));
      // Shift Fatigue Index (0 - 100)
      let shiftFatigueIndex = Math.max(10, Math.min(100, randomNormal(isWeekend ? 20 : 35, 6)));
      // Near-Miss / Heat-Strain Incident Reports (count)
      let nearMissIncidents = Math.max(0, Math.round(randomNormal(isWeekend ? 0.3 : 1.2, 0.8)));

      // 3. Clinical & Service Signals Baseline
      // Emergency Department (ED) visits per 10,000 population
      let edRespiratory = Math.max(1, Math.round(randomNormal(isWeekend ? 6 : 9, 2.5)));
      let edHeatStrain = Math.max(0, Math.round(randomNormal(isWeekend ? 1 : 2, 1.0)));
      let edViralSymptoms = Math.max(1, Math.round(randomNormal(isWeekend ? 7 : 11, 3.0)));

      // 4. Community & Pharmacy Signals Baseline
      // OTC Inhaler & Respiratory Medication Sales index (baseline 100)
      let otcRespiratorySales = Math.max(50, Math.round(randomNormal(100, 12)));
      // OTC Antipyretic / Fever Sales index (baseline 100)
      let otcAntipyreticSales = Math.max(50, Math.round(randomNormal(100, 10)));
      // Telehealth Consultation volume (count)
      let telehealthVolume = Math.max(5, Math.round(randomNormal(isWeekend ? 15 : 28, 5)));

      // Ground truth indicators
      let groundTruthPhase = 'normal';
      let injectedSignals = [];

      // ==========================================
      // INJECTED CRISIS SCENARIOS
      // ==========================================

      if (scenario === 'heatwave') {
        // Crisis Timeline:
        // Day 16-19: Heatwave builds (WBGT jumps to 34-37°C) in ZONE-A & ZONE-D
        // Day 17-20: Workplace shift fatigue index shoots to 85, near-misses jump to 8-12
        // Day 19-22: Sickness absence rises to 7.8%
        // Day 23-27: Hospital ED heat exhaustion surge reaches peak (Lagged Clinical Burden)
        if (day >= 16 && (zoneId === 'ZONE-A' || zoneId === 'ZONE-D')) {
          const heatProgression = Math.min(1.0, (day - 15) / 4);
          wbgt += heatProgression * 13.5; // up to 35.5 - 37 C
          aqi += heatProgression * 45;
          injectedSignals.push('wbgt_spike');
          groundTruthPhase = 'early_warning_window';

          if (day >= 17) {
            shiftFatigueIndex += heatProgression * 48; // climbs above 80
            nearMissIncidents += Math.round(heatProgression * 9);
            injectedSignals.push('shift_fatigue_spike');
          }

          if (day >= 19) {
            sicknessAbsenceRate += heatProgression * 5.2; // jumps to 7-8%
            telehealthVolume += Math.round(heatProgression * 30);
            injectedSignals.push('workplace_absence_surge');
          }

          if (day >= 23) {
            // Clinical surge (lagged by 7 days from environmental onset, 4 days from workplace warning)
            edHeatStrain += Math.round(heatProgression * 22);
            injectedSignals.push('clinical_ed_surge');
            groundTruthPhase = 'clinical_surge_phase';
          }
        }
      } else if (scenario === 'particulate_respiratory') {
        // Industrial plume & PM2.5 Crisis in ZONE-A & ZONE-C
        // Day 12-15: Particulate explosion (PM2.5 reaches 130 ug/m3)
        // Day 13-16: OTC inhaler sales surge (+180%)
        // Day 15-18: Workplace respiratory absences double
        // Day 19-24: ED asthma / respiratory admissions surge (+250%)
        if (day >= 12 && (zoneId === 'ZONE-A' || zoneId === 'ZONE-C')) {
          const plumeIntensity = Math.min(1.0, (day - 11) / 3);
          pm25 += plumeIntensity * 105; // reaches 125-135 ug/m3
          aqi += plumeIntensity * 130;
          injectedSignals.push('pm25_plume');
          groundTruthPhase = 'early_warning_window';

          if (day >= 13) {
            otcRespiratorySales += Math.round(plumeIntensity * 140);
            telehealthVolume += Math.round(plumeIntensity * 25);
            injectedSignals.push('otc_pharmacy_spike');
          }

          if (day >= 15) {
            sicknessAbsenceRate += plumeIntensity * 4.1;
            injectedSignals.push('respiratory_absence_spike');
          }

          if (day >= 19) {
            edRespiratory += Math.round(plumeIntensity * 26);
            injectedSignals.push('clinical_ed_surge');
            groundTruthPhase = 'clinical_surge_phase';
          }
        }
      } else if (scenario === 'viral_workplace_cluster') {
        // High density viral outbreak originating in logistics hub ZONE-A
        // Day 10-13: Workplace cluster: fever calls, near-doubling absenteeism
        // Day 12-15: OTC antipyretic sales surge across community
        // Day 14-17: Community clinic & telehealth surge
        // Day 18-24: Hospital ED & ICU viral surge
        if (day >= 10) {
          const outbreakDays = day - 9;
          const zoneFactor = zoneId === 'ZONE-A' ? 1.0 : (zoneId === 'ZONE-B' ? 0.6 : 0.3);
          
          if (zoneFactor > 0.4) {
            sicknessAbsenceRate += zoneFactor * Math.min(6.5, outbreakDays * 0.9);
            shiftFatigueIndex += zoneFactor * 25;
            otcAntipyreticSales += Math.round(zoneFactor * outbreakDays * 18);
            injectedSignals.push('workplace_fever_cluster', 'otc_antipyretic_spike');
            groundTruthPhase = 'early_warning_window';

            if (day >= 14) {
              telehealthVolume += Math.round(zoneFactor * 40);
            }

            if (day >= 18) {
              edViralSymptoms += Math.round(zoneFactor * 28);
              injectedSignals.push('clinical_ed_surge');
              groundTruthPhase = 'clinical_surge_phase';
            }
          }
        }
      }

      records.push({
        date: dateStr,
        dayIndex: day,
        zoneId: zoneId,
        zoneName: zoneMeta.name,
        zoneType: zoneMeta.type,
        population: zoneMeta.population,
        workforce: zoneMeta.workforce,
        
        // Signal readings
        environmental: {
          pm25: parseFloat(pm25.toFixed(1)),
          ozone: parseFloat(ozone.toFixed(1)),
          wbgt: parseFloat(wbgt.toFixed(1)),
          aqi: Math.round(aqi)
        },
        workplace: {
          sicknessAbsenceRate: parseFloat(sicknessAbsenceRate.toFixed(2)),
          shiftFatigueIndex: parseFloat(shiftFatigueIndex.toFixed(1)),
          nearMissIncidents: nearMissIncidents
        },
        clinical: {
          edRespiratory: edRespiratory,
          edHeatStrain: edHeatStrain,
          edViralSymptoms: edViralSymptoms,
          totalEdVisits: edRespiratory + edHeatStrain + edViralSymptoms
        },
        community: {
          otcRespiratorySales: otcRespiratorySales,
          otcAntipyreticSales: otcAntipyreticSales,
          telehealthVolume: telehealthVolume
        },

        // Ground truth metadata for validation
        groundTruth: {
          phase: groundTruthPhase,
          injectedSignals: injectedSignals,
          isTrueAberration: injectedSignals.length > 0,
          isClinicalSurge: groundTruthPhase === 'clinical_surge_phase'
        }
      });
    }
  }

  return {
    scenario,
    totalRecords: records.length,
    days: totalDays,
    zones: Object.keys(ZONES),
    records
  };
}
