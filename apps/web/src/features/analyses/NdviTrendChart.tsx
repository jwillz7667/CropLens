import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import type { FieldAnalysis } from '@/types';

interface Props {
  analyses?: FieldAnalysis[];
}

export const NdviTrendChart = ({ analyses }: Props) => {
  if (!analyses?.length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-slate-400">
        No analyses yet – run one to unlock NDVI trends.
      </div>
    );
  }

  const chartData = analyses
    .slice()
    .sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime())
    .map((analysis) => ({
      date: new Date(analysis.generatedAt).toLocaleDateString(),
      mean: Number(analysis.summaryStats.mean.toFixed(2)),
      lowArea: Number((analysis.lowNdviAreaPct ?? 0).toFixed(2)),
    }));

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">NDVI trend</h3>
          <p className="text-sm text-slate-400">Track vegetation vigor over time</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 4, right: 16, top: 16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: '#020617', borderRadius: 12, borderColor: '#1f2937' }}
              labelStyle={{ color: '#cbd5f5' }}
            />
            <Line type="monotone" dataKey="mean" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lowArea" stroke="#f97316" strokeWidth={2} dot={false} yAxisId={0} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
