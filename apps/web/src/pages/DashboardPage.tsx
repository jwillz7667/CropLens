import { useEffect, useMemo } from 'react';
import { Sparkles, Satellite, Activity } from 'lucide-react';
import { useFields, useFieldAnalyses, useFieldInsights, useStartAnalysis } from '@/hooks/useFields';
import { useUIStore } from '@/lib/store';
import { FieldMap } from '@/components/FieldMap';
import { UploadZone } from '@/features/uploads/UploadZone';
import { AnalysisSummary } from '@/features/analyses/AnalysisSummary';
import { NdviTrendChart } from '@/features/analyses/NdviTrendChart';

export const DashboardPage = () => {
  const { data: fields } = useFields();
  const selectedId = useUIStore((state) => state.selectedFieldId);
  const setSelectedFieldId = useUIStore((state) => state.setSelectedFieldId);

  const activeField = useMemo(() => {
    if (!fields?.length) return undefined;
    const fallback = fields[0];
    const match = fields.find((field) => field.id === selectedId);
    return match ?? fallback;
  }, [fields, selectedId]);

  const { data: analyses } = useFieldAnalyses(activeField?.id);
  const latestAnalysis = analyses?.[0];
  const { data: insights } = useFieldInsights(activeField?.id);
  const startAnalysis = useStartAnalysis();

  useEffect(() => {
    if (activeField?.id && activeField.id !== selectedId) {
      setSelectedFieldId(activeField.id);
    }
  }, [activeField?.id, selectedId, setSelectedFieldId]);

  const triggerSentinelRun = () => {
    if (!activeField) return;
    startAnalysis.mutate({ fieldId: activeField.id, source: 'sentinel' });
  };

  const handleUploadComplete = (fileKey: string) => {
    if (!activeField) return;
    startAnalysis.mutate({ fieldId: activeField.id, uploadKey: fileKey, source: 'upload' });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Active field</p>
            <h1 className="text-3xl font-semibold">{activeField ? activeField.name : 'Add your first field'}</h1>
            {activeField && (
              <p className="text-slate-300">{activeField.acreage} acres · {activeField.crop ?? 'Mixed'} crop</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={triggerSentinelRun}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm"
              disabled={!activeField || startAnalysis.isPending}
            >
              <Satellite className="h-4 w-4" /> Fetch Sentinel
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              <Sparkles className="h-4 w-4" /> Automations
            </button>
          </div>
        </div>
      </section>

      <FieldMap field={activeField} analysis={latestAnalysis} />
      <AnalysisSummary analysis={latestAnalysis} />

      {activeField && (
        <div className="grid gap-6 lg:grid-cols-2">
          <UploadZone fieldId={activeField.id} onUploaded={handleUploadComplete} />
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sentinel status</p>
                <p className="text-lg font-semibold">Queued runs</p>
              </div>
              {startAnalysis.isPending && <span className="text-sm text-emerald-300">Running…</span>}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              We pull the cleanest cloud-free scene inside your observation window and clip to the field boundary.
            </p>
            <button
              onClick={triggerSentinelRun}
              className="mt-4 w-full rounded-xl border border-white/10 px-3 py-2 text-sm"
              disabled={startAnalysis.isPending}
            >
              Trigger run
            </button>
          </div>
        </div>
      )}

      <NdviTrendChart analyses={analyses} />

      <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-300" />
          <h3 className="text-lg font-semibold">Recommendations</h3>
        </div>
        <div className="mt-4 space-y-3">
          {insights?.map((insight) => (
            <article key={insight.id} className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{insight.severity} alert</p>
                <p className="text-xs text-slate-500">{new Date(insight.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="mt-2 text-lg font-semibold">{insight.message}</p>
              <p className="text-sm text-slate-400">{insight.recommendation}</p>
            </article>
          ))}
          {!insights?.length && <p className="text-sm text-slate-400">No insights yet. Run an analysis to unlock actionable recommendations.</p>}
        </div>
      </section>
    </div>
  );
};
