import { NavLink, Outlet } from 'react-router-dom';
import { FieldList } from '@/features/fields/FieldList';
import { FieldForm } from '@/features/fields/FieldForm';

export const DashboardLayout = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <header className="border-b border-white/5 bg-slate-950/70 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <NavLink to="/" className="text-xl font-semibold">
          CropLens
        </NavLink>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <NavLink to="/app" className={({ isActive }) => (isActive ? 'text-white' : undefined)}>
            Fields
          </NavLink>
          <NavLink to="/app/onboarding" className={({ isActive }) => (isActive ? 'text-white' : undefined)}>
            Onboarding
          </NavLink>
          <a href="mailto:support@croplens.app" className="text-slate-400 hover:text-white">
            Support
          </a>
        </div>
      </div>
    </header>

    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[320px,1fr]">
      <aside className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fields</p>
            <a href="/app/onboarding" className="text-xs text-emerald-300">
              Import KML
            </a>
          </div>
          <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            <FieldList />
          </div>
        </div>
        <FieldForm />
      </aside>

      <section className="space-y-6">
        <Outlet />
      </section>
    </div>
  </div>
);
