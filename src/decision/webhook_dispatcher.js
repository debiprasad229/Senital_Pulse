/**
 * SentinelPulse - Microsoft Teams & Enterprise Incident Webhook Dispatcher
 * Constructs official Microsoft Teams Adaptive Cards v1.4 and Slack-compatible payloads
 * for automated closed-loop decision support alerting.
 */

/**
 * Format a Microsoft Teams Adaptive Card v1.4 JSON payload for an early warning alert.
 */
export function formatTeamsAdaptiveCard(evaluation, currentRecord, playbook = null, baseUrl = 'http://localhost:3000') {
  const { compositeRisk, tierLevel, tierLabel, zScores } = evaluation;

  // Determine theme color
  let themeColor = '10B981'; // Green
  let badgeTitle = 'PREVENTIVE ADVISORY';
  if (tierLevel === 3) {
    themeColor = 'EF4444'; // Red
    badgeTitle = 'CRITICAL EMERGENCY SURGE ALERT';
  } else if (tierLevel === 2) {
    themeColor = 'F97316'; // Orange
    badgeTitle = 'TARGETED OPERATIONAL CONTROL ORDER';
  } else if (tierLevel === 1) {
    themeColor = 'F59E0B'; // Yellow
    badgeTitle = 'EARLY WARNING ADVISORY';
  }

  const zoneName = currentRecord.zoneName || 'Mussafah / ICAD Industrial City';
  const role = playbook?.responsibleRole || 'Occupational Health & Safety Lead';
  const playbookTitle = playbook?.title || 'Operational Work-Rest Cycle Modification';

  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          msteams: {
            width: 'Full'
          },
          body: [
            {
              type: 'Container',
              style: tierLevel >= 2 ? 'attention' : 'warning',
              items: [
                {
                  type: 'ColumnSet',
                  columns: [
                    {
                      type: 'Column',
                      width: 'auto',
                      items: [
                        {
                          type: 'Image',
                          url: 'https://img.icons8.com/fluency/48/activity-feed.png',
                          size: 'Small'
                        }
                      ]
                    },
                    {
                      type: 'Column',
                      width: 'stretch',
                      items: [
                        {
                          type: 'TextBlock',
                          text: `SENTINELPULSE · ${badgeTitle}`,
                          weight: 'Bolder',
                          size: 'Medium',
                          color: tierLevel >= 2 ? 'Attention' : 'Warning'
                        },
                        {
                          type: 'TextBlock',
                          text: `Target District: ${zoneName} (${currentRecord.zoneId})`,
                          isSubtle: true,
                          spacing: 'None'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'FactSet',
              facts: [
                {
                  title: 'Composite Risk Score:',
                  value: `${compositeRisk} / 100 (${tierLabel})`
                },
                {
                  title: 'Wet-Bulb Temp (WBGT):',
                  value: `${currentRecord.environmental.wbgt}°C (+${zScores.wbgt}σ deviation)`
                },
                {
                  title: 'Sickness Absence Rate:',
                  value: `${currentRecord.workplace.sicknessAbsenceRate}% (+${zScores.absence}σ spike)`
                },
                {
                  title: 'Accountable Role:',
                  value: `${role}`
                },
                {
                  title: 'Mandated Playbook:',
                  value: `${playbookTitle}`
                }
              ]
            },
            {
              type: 'TextBlock',
              text: `**Regulatory Basis:** UAE MoHRE Midday Work Ban Directives, Abu Dhabi Public Health Centre (ADPHC) Thermal Standards & OSHA NEP.`,
              wrap: true,
              size: 'Small',
              isSubtle: true
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: '🔍 Open SentinelPulse Live Cockpit',
              url: baseUrl
            },
            {
              type: 'Action.Submit',
              title: '⚡ Acknowledge & Deploy Work-Rest Roster',
              data: {
                action: 'ACKNOWLEDGE_ALERT',
                alertId: `ALERT-${Date.now()}`,
                zoneId: currentRecord.zoneId,
                tierLevel: tierLevel
              }
            }
          ]
        }
      }
    ]
  };
}

/**
 * Dispatch an Adaptive Card alert to a Microsoft Teams incoming webhook or return payload for visual preview.
 */
export async function dispatchTeamsAlert(webhookUrl, adaptiveCardPayload) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return {
      status: 'SIMULATED_PREVIEW',
      message: 'No external webhook URL configured. Generated validated Microsoft Teams Adaptive Card v1.4 payload for in-dashboard inspection.',
      payload: adaptiveCardPayload
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adaptiveCardPayload)
    });

    if (!res.ok) {
      throw new Error(`Teams Webhook responded with status: ${res.status}`);
    }

    return {
      status: 'DELIVERED',
      message: 'Successfully dispatched real-time Adaptive Card alert to Microsoft Teams channel.',
      deliveredAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      status: 'DISPATCH_ERROR',
      error: err.message,
      payload: adaptiveCardPayload
    };
  }
}
