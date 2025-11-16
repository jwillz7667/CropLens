import type { NdviSummary } from './ndvi';

type Insight = {
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
};

export const deriveInsights = (current: NdviSummary, previous?: NdviSummary): Insight[] => {
  const insights: Insight[] = [];

  if (current.lowNdviAreaPct > 0.2) {
    insights.push({
      severity: 'medium',
      message: 'Significant low NDVI area detected',
      recommendation: 'Inspect irrigation equipment and scout the highlighted block this week.',
    });
  }

  if (previous) {
    const delta = current.mean - previous.mean;
    if (delta <= -0.08) {
      insights.push({
        severity: 'high',
        message: 'NDVI dropped sharply vs last run',
        recommendation: 'Prioritize this field for scouting and consider feeding/irrigation adjustments immediately.',
      });
    } else if (delta >= 0.05) {
      insights.push({
        severity: 'low',
        message: 'Canopy vigor improving',
        recommendation: 'Maintain irrigation cadence; no action required.',
      });
    }
  }

  if (current.mean < 0.4) {
    insights.push({
      severity: 'medium',
      message: 'Overall vigor is trending low',
      recommendation: 'Review fertilizer plan and soil moisture sensors before stress spreads.',
    });
  }

  return insights;
};
