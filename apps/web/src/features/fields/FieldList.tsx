import { Link, useLocation } from 'react-router-dom';
import { useFields } from '@/hooks/useFields';
import { useUIStore } from '@/lib/store';

export const FieldList = () => {
  const { data, isLoading } = useFields();
  const selectedId = useUIStore((state) => state.selectedFieldId);
  const setSelectedFieldId = useUIStore((state) => state.setSelectedFieldId);
  const location = useLocation();

  if (isLoading) {
    return <p className="animate-pulse text-slate-400">Loading fields…</p>;
  }

  if (!data?.length) {
    return <p className="text-slate-400">No fields yet. Add one to start analyzing NDVI.</p>;
  }

  return (
    <ul className="space-y-2">
      {data.map((field) => {
        const isActive = selectedId ? selectedId === field.id : location.pathname.includes(field.id);
        return (
          <li key={field.id}>
            <Link
              to={`/app/fields/${field.id}`}
              onClick={() => setSelectedFieldId(field.id)}
              className={`block rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-white/5 bg-slate-900/40 hover:border-emerald-400/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{field.name}</p>
                  <p className="text-sm text-slate-400">{field.acreage} acres · {field.crop ?? 'Mixed'}</p>
                </div>
                {field.latestAnalysis && (
                  <span className="text-sm font-semibold text-emerald-300">
                    NDVI {field.latestAnalysis.summaryStats.mean.toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
