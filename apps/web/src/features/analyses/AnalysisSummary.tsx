import type { FieldAnalysis } from '@/types';

interface Props {
  analysis?: FieldAnalysis;
}

const formatPct = (value?: number) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '—');

export const AnalysisSummary = ({ analysis }: Props) => {
  if (!analysis) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-slate-400">
        No analyses yet. Upload imagery or trigger a satellite run.
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6 md:grid-cols-4">
      <Metric label="Average NDVI" value={analysis.summaryStats.mean.toFixed(2)} />
      <Metric label="Range" value={`${analysis.summaryStats.min.toFixed(2)} – ${analysis.summaryStats.max.toFixed(2)}`} />
      <Metric label="Low vigor area" value={formatPct(analysis.lowNdviAreaPct)} />
      <Metric label="Change vs prev" value={analysis.avgNdviDelta ? `${(analysis.avgNdviDelta * 100).toFixed(1)}%` : 'Stable'} />
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-semibold">{value}</p>
  </div>
);
