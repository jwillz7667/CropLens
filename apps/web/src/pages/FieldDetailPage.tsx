import { useParams } from 'react-router-dom';
import { useField, useFieldAnalyses, useFieldInsights, useStartAnalysis } from '@/hooks/useFields';
import { FieldMap } from '@/components/FieldMap';
import { AnalysisSummary } from '@/features/analyses/AnalysisSummary';
import { NdviTrendChart } from '@/features/analyses/NdviTrendChart';

export const FieldDetailPage = () => {
  const { fieldId } = useParams();
  const { data: field, isLoading } = useField(fieldId);
  const { data: analyses } = useFieldAnalyses(fieldId);
  const { data: insights } = useFieldInsights(fieldId);
  const startAnalysis = useStartAnalysis();

  if (isLoading) return <p className="text-slate-400">Loading field…</p>;
  if (!field) return <p className="text-slate-400">Field not found.</p>;

  const latestAnalysis = analyses?.[0];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Field overview</p>
            <h1 className="text-3xl font-semibold">{field.name}</h1>
            <p className="text-slate-300">{field.acreage} acres · {field.crop ?? 'Mixed'} crop</p>
          </div>
          <button
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900"
            onClick={() => startAnalysis.mutate({ fieldId: field.id, source: 'sentinel' })}
          >
            Refresh analysis
          </button>
        </div>
      </div>

      <FieldMap field={field} analysis={latestAnalysis} />
      <AnalysisSummary analysis={latestAnalysis} />
      <NdviTrendChart analyses={analyses} />

      <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold">Insights</h3>
        <div className="mt-4 space-y-3">
          {insights?.map((insight) => (
            <article key={insight.id} className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span className="uppercase tracking-[0.3em]">{insight.severity}</span>
                <span>{new Date(insight.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{insight.message}</p>
              <p className="text-sm text-slate-400">{insight.recommendation}</p>
            </article>
          ))}
          {!insights?.length && <p className="text-sm text-slate-400">No insights yet.</p>}
        </div>
      </section>
    </div>
  );
};
