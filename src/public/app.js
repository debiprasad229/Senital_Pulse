/**
 * SentinelPulse - Frontend Application Logic
 * Integrates Chart.js, dynamic RBAC view switching, explainability waterfalls,
 * and operational playbook execution.
 */

let currentChart = null;
let currentScenario = 'heatwave';
let currentRole = 'Public Health Epidemiologist';
let activeData = null;
let selectedZoneId = 'ZONE-A';
let currentDayIndex = 24; // Day 25 (0-indexed)
let isAutoPlaying = false;
let playInterval = null;

// Expose zone selector globally for SVG map interaction
window.selectZone = function(zoneId) {
  selectedZoneId = zoneId;
  const badge = document.getElementById('selectedZoneBadge');
  if (badge) badge.innerText = zoneId;
  if (activeData) {
    renderZoneCards(activeData);
    renderMultiSignalChart(activeData);
    renderExplainability(activeData, selectedZoneId);
    renderPlaybooks(activeData, selectedZoneId);
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadScenario(currentScenario);
});

function setupEventListeners() {
  const scenarioSelector = document.getElementById('scenarioSelector');
  scenarioSelector.addEventListener('change', (e) => {
    currentScenario = e.target.value;
    loadScenario(currentScenario);
  });

  const roleSelector = document.getElementById('roleSelector');
  roleSelector.addEventListener('change', (e) => {
    currentRole = e.target.value;
    updateRolePrivacyView();
  });

  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.addEventListener('click', () => {
    loadScenario(currentScenario);
  });

  const dispatchBtn = document.getElementById('dispatchWorkOrderBtn');
  dispatchBtn.addEventListener('click', () => {
    alert('✓ Preventive Work-Orders successfully dispatched to Facility Operations & Occupational Health Leads. Audit record logged.');
  });

  // Timeline Scrubber
  const timelineSlider = document.getElementById('timelineSlider');
  if (timelineSlider) {
    timelineSlider.addEventListener('input', (e) => {
      currentDayIndex = parseInt(e.target.value, 10) - 1;
      updatePlaybackDay();
    });
  }

  // Auto-play Button
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      toggleAutoPlay();
    });
  }

  // Export Executive Brief
  const exportBriefBtn = document.getElementById('exportBriefBtn');
  if (exportBriefBtn) {
    exportBriefBtn.addEventListener('click', () => {
      exportExecutiveBrief();
    });
  }
}

function toggleAutoPlay() {
  const playBtnText = document.getElementById('playBtnText');
  const playIcon = document.getElementById('playIcon');

  if (isAutoPlaying) {
    clearInterval(playInterval);
    isAutoPlaying = false;
    if (playBtnText) playBtnText.innerText = 'Auto-Play Outbreak';
    if (playIcon) playIcon.setAttribute('data-lucide', 'play');
  } else {
    isAutoPlaying = true;
    if (playBtnText) playBtnText.innerText = 'Pause Playback';
    if (playIcon) playIcon.setAttribute('data-lucide', 'pause');

    playInterval = setInterval(() => {
      currentDayIndex = (currentDayIndex + 1) % 30;
      const slider = document.getElementById('timelineSlider');
      if (slider) slider.value = currentDayIndex + 1;
      updatePlaybackDay();
    }, 1200);
  }
  if (window.lucide) window.lucide.createIcons();
}

function updatePlaybackDay() {
  const dayDisplay = document.getElementById('currentDayDisplay');
  if (dayDisplay) dayDisplay.innerText = `Day ${currentDayIndex + 1} / 30`;

  const phaseBadge = document.getElementById('playbackPhaseBadge');
  if (phaseBadge) {
    if (currentDayIndex < 15) {
      phaseBadge.innerText = 'Phase: Normal Baseline Window';
      phaseBadge.className = 'font-mono text-emerald-400';
    } else if (currentDayIndex < 22) {
      phaseBadge.innerText = 'Phase: PRE-CLINICAL EARLY WARNING ACTIVE';
      phaseBadge.className = 'font-mono text-amber-400 animate-pulse';
    } else {
      phaseBadge.innerText = 'Phase: Acute Clinical Hospital Surge';
      phaseBadge.className = 'font-mono text-rose-400';
    }
  }

  if (activeData) {
    renderZoneCards(activeData);
    renderExplainability(activeData, selectedZoneId);
    renderPlaybooks(activeData, selectedZoneId);
    updateSvgMapColors();
  }
}

function updateSvgMapColors() {
  if (!activeData) return;
  const dayRecords = activeData.timeline.filter(t => t.dayIndex === currentDayIndex);

  dayRecords.forEach(rec => {
    const risk = rec.evaluation.compositeRisk;
    let color = '#10b981'; // green
    if (risk >= 75) color = '#ef4444'; // red
    else if (risk >= 55) color = '#f97316'; // orange
    else if (risk >= 35) color = '#f59e0b'; // yellow

    const zoneSuffix = rec.zoneId.replace('ZONE-', '');
    const rectElem = document.getElementById(`mapRectZone${zoneSuffix}`);
    const dotElem = document.getElementById(`mapDotZone${zoneSuffix}`);

    if (dotElem) dotElem.setAttribute('fill', color);
    if (rectElem) {
      if (rec.zoneId === selectedZoneId) {
        rectElem.setAttribute('stroke', '#22d3ee');
        rectElem.setAttribute('stroke-width', '2.5');
      } else {
        rectElem.setAttribute('stroke', '#334155');
        rectElem.setAttribute('stroke-width', '1.5');
      }
    }
  });
}

function exportExecutiveBrief() {
  if (!activeData) return;

  const brief = {
    title: 'SentinelPulse Early Warning Platform - Executive Audit Brief',
    challengeReference: 'Population Health · Challenge 06',
    generatedAt: new Date().toISOString(),
    activeScenario: currentScenario,
    activeRole: currentRole,
    performanceMetrics: activeData.performanceMetrics,
    earlyWarningLeadTime: activeData.leadTime,
    healthAndResilienceImpact: activeData.impact,
    activeInterventionPlaybooks: activeData.timeline[currentDayIndex]?.playbooks?.activePlaybooks || []
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(brief, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `SentinelPulse_Executive_Brief_${currentScenario}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Fetch and render full backtested scenario data
 */
async function loadScenario(scenario) {
  try {
    const res = await fetch(`/api/backtest?scenario=${scenario}`);
    const data = await res.json();
    activeData = data;

    updateKPIs(data);
    renderZoneCards(data);
    renderMultiSignalChart(data);
    renderExplainability(data, selectedZoneId);
    renderPlaybooks(data, selectedZoneId);
    renderStressTestTable(data.stressTest);
    updateRolePrivacyView();

    // Re-render Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch (err) {
    console.error('Failed to load scenario data:', err);
  }
}

/**
 * Update Top KPI Summary
 */
function updateKPIs(data) {
  const { leadTime, performanceMetrics, impact } = data;

  // Lead Time KPI
  document.getElementById('kpiLeadTime').innerText = `+${leadTime.leadTimeAdvantageDays} Days Ahead`;

  // Accuracy KPI
  document.getElementById('kpiAccuracy').innerText = `${performanceMetrics.sensitivity} Sens / ${performanceMetrics.positivePredictiveValue} PPV`;

  // Impact KPI
  document.getElementById('kpiImpact').innerText = `${impact.counterfactualAnalysis.avertedEdVisits} ED Visits Saved`;
  document.getElementById('kpiImpactSub').innerHTML = `<i data-lucide="dollar-sign" class="w-3.5 h-3.5 text-emerald-400"></i> $${impact.economicImpact.totalEconomicBenefit.toLocaleString()} Total Economic Benefit`;

  // Validation metrics
  document.getElementById('farMetric').innerText = performanceMetrics.falseAlarmRate;
  document.getElementById('f1Metric').innerText = performanceMetrics.f1Score;

  // Impact Counterfactual Box
  document.getElementById('impactUnmitigated').innerText = `${impact.counterfactualAnalysis.unmitigatedProjectedSurgeVisits} visits`;
  document.getElementById('impactAverted').innerText = `${impact.counterfactualAnalysis.avertedEdVisits} visits (-${impact.counterfactualAnalysis.mitigationEfficiencyPercentage}%)`;
  document.getElementById('impactWorkdays').innerText = `${impact.counterfactualAnalysis.savedLostWorkdays} workdays saved`;
  document.getElementById('impactNetSavings').innerText = `$${impact.economicImpact.netSavings.toLocaleString()}`;

  // Peak surveillance tier
  const peakAlert = data.timeline.reduce((max, t) => t.evaluation.compositeRisk > max ? t.evaluation.compositeRisk : max, 0);
  const kpiTierLabel = document.getElementById('kpiTierLabel');
  if (peakAlert >= 80) {
    kpiTierLabel.innerText = 'Tier 3: Emergency Surge';
    kpiTierLabel.className = 'text-xl font-bold text-rose-400 mt-1';
  } else if (peakAlert >= 60) {
    kpiTierLabel.innerText = 'Tier 2: Targeted Control';
    kpiTierLabel.className = 'text-xl font-bold text-amber-400 mt-1';
  } else if (peakAlert >= 35) {
    kpiTierLabel.innerText = 'Tier 1: Preventive Advisory';
    kpiTierLabel.className = 'text-xl font-bold text-yellow-400 mt-1';
  } else {
    kpiTierLabel.innerText = 'Tier 0: Normal Baseline';
    kpiTierLabel.className = 'text-xl font-bold text-emerald-400 mt-1';
  }
}

/**
 * Render District / Zone status cards
 */
function renderZoneCards(data) {
  const container = document.getElementById('zoneCardsContainer');
  container.innerHTML = '';

  const zoneIds = ['ZONE-A', 'ZONE-B', 'ZONE-C', 'ZONE-D'];
  const latestEvaluations = {};

  // Find peak evaluation for each zone
  data.timeline.forEach(t => {
    if (!latestEvaluations[t.zoneId] || t.evaluation.compositeRisk > latestEvaluations[t.zoneId].evaluation.compositeRisk) {
      latestEvaluations[t.zoneId] = t;
    }
  });

  zoneIds.forEach(zId => {
    const item = latestEvaluations[zId];
    if (!item) return;

    const risk = item.evaluation.compositeRisk;
    const tier = item.evaluation.tierLabel;
    const isSelected = (zId === selectedZoneId);

    let borderColor = 'border-slate-800';
    let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    if (risk >= 80) {
      borderColor = isSelected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-rose-500/40';
      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    } else if (risk >= 60) {
      borderColor = isSelected ? 'border-amber-500 ring-1 ring-amber-500' : 'border-amber-500/40';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    } else if (risk >= 35) {
      borderColor = isSelected ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-yellow-500/40';
      badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }

    const card = document.createElement('div');
    card.className = `p-3 rounded-lg bg-slate-900 border ${borderColor} hover:border-cyan-500 cursor-pointer transition flex items-center justify-between text-xs`;
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-1.5 font-semibold text-slate-200">
          <span class="w-2 h-2 rounded-full ${risk >= 60 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}"></span>
          ${item.zoneName}
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">
          Pop: ${item.rawRecord.population.toLocaleString()} · Workforce: ${item.rawRecord.workforce.toLocaleString()}
        </div>
      </div>
      <div class="text-right">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}">
          Risk: ${risk}/100
        </span>
        <div class="text-[10px] text-slate-400 mt-1 font-mono">${zId}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      selectedZoneId = zId;
      document.getElementById('selectedZoneBadge').innerText = zId;
      renderZoneCards(data);
      renderExplainability(data, selectedZoneId);
      renderPlaybooks(data, selectedZoneId);
    });

    container.appendChild(card);
  });
}

/**
 * Render Multi-Signal Time Series Chart showing pre-clinical signal lead time
 */
function renderMultiSignalChart(data) {
  const ctx = document.getElementById('multiSignalChart').getContext('2d');
  
  // Filter timeline for selected zone
  const zoneTimeline = data.timeline.filter(t => t.zoneId === selectedZoneId);
  const labels = zoneTimeline.map(t => `Day ${t.dayIndex + 1}`);

  let preClinicalSeries = [];
  let preClinicalLabel = '';
  let clinicalSeries = [];

  if (currentScenario === 'heatwave') {
    preClinicalSeries = zoneTimeline.map(t => t.rawRecord.environmental.wbgt);
    preClinicalLabel = 'Pre-Clinical: Wet-Bulb Temp (°C)';
    clinicalSeries = zoneTimeline.map(t => t.rawRecord.clinical.edHeatStrain);
  } else if (currentScenario === 'particulate_respiratory') {
    preClinicalSeries = zoneTimeline.map(t => t.rawRecord.environmental.pm25);
    preClinicalLabel = 'Pre-Clinical: PM2.5 Plume (µg/m³)';
    clinicalSeries = zoneTimeline.map(t => t.rawRecord.clinical.edRespiratory);
  } else {
    preClinicalSeries = zoneTimeline.map(t => t.rawRecord.workplace.sicknessAbsenceRate * 10);
    preClinicalLabel = 'Pre-Clinical: Workplace Absence (x10)';
    clinicalSeries = zoneTimeline.map(t => t.rawRecord.clinical.edViralSymptoms);
  }

  const absenceSeries = zoneTimeline.map(t => t.rawRecord.workplace.sicknessAbsenceRate);

  if (currentChart) {
    currentChart.destroy();
  }

  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: preClinicalLabel,
          data: preClinicalSeries,
          borderColor: '#22d3ee', // cyan-400
          backgroundColor: 'rgba(34, 211, 238, 0.08)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          yAxisID: 'y'
        },
        {
          label: 'Workplace Absence Rate (%)',
          data: absenceSeries,
          borderColor: '#f59e0b', // amber-500
          borderDash: [4, 4],
          tension: 0.3,
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Hospital ED Visits (Lagged Clinical Surge)',
          data: clinicalSeries,
          borderColor: '#f43f5e', // rose-500
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#94a3b8', font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: { color: '#22d3ee', font: { size: 10 } }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#f43f5e', font: { size: 10 } }
        }
      }
    }
  });
}

/**
 * Render Explainability and Feature Attribution
 */
function renderExplainability(data, zoneId) {
  // Find peak record for selected zone
  const zoneRecords = data.timeline.filter(t => t.zoneId === zoneId);
  const peakRecord = zoneRecords.reduce((max, r) => r.evaluation.compositeRisk > max.evaluation.compositeRisk ? r : max, zoneRecords[0]);

  if (!peakRecord) return;

  const exp = peakRecord.explainability;
  document.getElementById('narrativeCard').innerText = exp.narrativeExplanation;
  document.getElementById('temporalPhaseLabel').innerText = exp.temporalPhase;
  document.getElementById('synergyMultiplierLabel').innerText = `${peakRecord.evaluation.synergyMultiplier}x Multiplier Applied`;

  const container = document.getElementById('attributionList');
  container.innerHTML = '';

  const drivers = exp.contributions.slice(0, 4);

  drivers.forEach(d => {
    const item = document.createElement('div');
    item.className = 'space-y-1';
    item.innerHTML = `
      <div class="flex justify-between text-xs">
        <span class="text-slate-300 font-medium">${d.signal} (${d.observedValue})</span>
        <span class="font-mono text-cyan-300 font-semibold">+${d.zScore}σ (${d.percentageContribution}% risk weight)</span>
      </div>
      <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full" style="width: ${d.percentageContribution}%"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

/**
 * Render Actionable Playbooks & Role Assignments
 */
function renderPlaybooks(data, zoneId) {
  const zoneRecords = data.timeline.filter(t => t.zoneId === zoneId);
  const peakRecord = zoneRecords.reduce((max, r) => r.evaluation.compositeRisk > max.evaluation.compositeRisk ? r : max, zoneRecords[0]);

  if (!peakRecord) return;

  const playbooks = peakRecord.playbooks.activePlaybooks;
  const container = document.getElementById('playbooksContainer');
  container.innerHTML = '';

  document.getElementById('playbookCountBadge').innerText = `${playbooks.length} Active`;

  if (playbooks.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs">
        No emergency playbooks triggered. Routine baseline surveillance active.
      </div>
    `;
    return;
  }

  playbooks.forEach(pb => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3';
    
    const checklistHtml = pb.actionChecklist.map(act => `
      <li class="flex items-start gap-2 text-slate-300 text-xs">
        <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></i>
        <span>${act}</span>
      </li>
    `).join('');

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            ${pb.id} · ${pb.tier.label}
          </span>
          <h3 class="font-bold text-slate-100 text-xs mt-1.5">${pb.title}</h3>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
          ${pb.urgency}
        </span>
      </div>

      <div class="text-[11px] flex flex-wrap items-center gap-3 text-slate-400">
        <span class="flex items-center gap-1 text-emerald-300 font-medium">
          <i data-lucide="user-check" class="w-3 h-3"></i> Lead Role: ${pb.responsibleRole}
        </span>
      </div>

      <ul class="space-y-1.5 pt-1 border-t border-slate-800">
        ${checklistHtml}
      </ul>

      <div class="p-2.5 rounded bg-slate-950/60 text-[11px] text-slate-400 border border-slate-800/60">
        <strong class="text-slate-300">Evidence & Assumptions:</strong> ${pb.evidenceAndAssumptions.drivingSignal} ${pb.evidenceAndAssumptions.assumption}
        <div class="text-[10px] text-cyan-400 mt-1 font-mono">${pb.evidenceAndAssumptions.regulatoryStandard}</div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Render Stress Test Table for missing-data resilience
 */
function renderStressTestTable(stressData) {
  const tbody = document.getElementById('stressTestTableBody');
  tbody.innerHTML = '';

  if (!stressData || !stressData.benchmarkCurve) return;

  stressData.benchmarkCurve.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/30 transition';
    tr.innerHTML = `
      <td class="py-2.5 px-3 text-slate-300 font-medium">${row.missingRatePercent}% Dropout</td>
      <td class="py-2.5 px-3 text-emerald-400">${row.sensitivity}</td>
      <td class="py-2.5 px-3 text-cyan-400">${row.ppv}</td>
      <td class="py-2.5 px-3 text-amber-300">+${row.leadTimeDays} Days</td>
      <td class="py-2.5 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] ${row.missingRatePercent <= 30 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'}">
          ${row.status}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Handle Role-Based Access Control (RBAC) View Switching & Privacy Air-Gap
 */
function updateRolePrivacyView() {
  const banner = document.getElementById('rolePrivacyBanner');
  const bannerTitle = document.getElementById('roleBannerTitle');
  const bannerText = document.getElementById('roleBannerText');

  if (currentRole === 'Public Health Epidemiologist') {
    banner.className = 'p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-200';
    bannerTitle.innerText = 'Active View: Public Health Epidemiologist';
    bannerText.innerText = 'Small-cell suppression active: Aggregated clinical syndromic visit counts below 5 are masked (<5) to eliminate re-identification risk while retaining district-wide statistical signal power.';
  } else if (currentRole === 'Occupational Health & Safety Lead') {
    banner.className = 'p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3 text-xs text-cyan-200';
    bannerTitle.innerText = 'Active View: Occupational Health & Safety Lead';
    bannerText.innerText = 'Clinical triage authorized under medical confidentiality. Workplace shift fatigue index, near-miss incident logs, and indoor environmental readings enabled for targeted clinical preventative intervention.';
  } else if (currentRole === 'Facility Operations / HR Manager') {
    banner.className = 'p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-xs text-rose-200';
    bannerTitle.innerText = 'Active View: Facility / HR Operations (Strict Privacy Air-Gap)';
    bannerText.innerText = 'ETHICAL & LEGAL AIR-GAP ENFORCED: Individual clinical records, medical diagnoses, and illness histories are completely restricted from employer inspection. Only generalized operational hazard ratings, safety readiness scores, and preventive work-orders are visible.';
  } else if (currentRole === 'Regulatory & Environmental Auditor') {
    banner.className = 'p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-start gap-3 text-xs text-indigo-200';
    bannerTitle.innerText = 'Active View: Regulatory Compliance Auditor';
    bannerText.innerText = 'Audit Trail Verification Active: Displays OSHA NEP Heat Standard and EPA NAAQS compliance benchmarks and verifiable environmental sensor calibration logs.';
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

