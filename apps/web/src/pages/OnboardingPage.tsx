import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, endpoints } from '@/lib/api-client';

const schema = z.object({
  sentinelInstanceId: z.string().min(5),
  sentinelKey: z.string().min(10),
  stripeSecret: z.string().min(10),
  storageBucket: z.string().min(3),
});

type OnboardingValues = z.infer<typeof schema>;

export const OnboardingPage = () => {
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sentinelInstanceId: '',
      sentinelKey: '',
      stripeSecret: '',
      storageBucket: 'croplens-uploads',
    },
  });

  const onSubmit = async (values: OnboardingValues) => {
    await apiRequest({
      url: endpoints.integrations,
      method: 'POST',
      data: values,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
        <h1 className="text-3xl font-semibold">Onboarding checklist</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-6 text-slate-300">
          <li>Connect Supabase project + service role key.</li>
          <li>Provision Sentinel Hub Process API credentials.</li>
          <li>Configure storage bucket for uploads.</li>
          <li>Enable Stripe + webhook endpoint.</li>
          <li>Invite team members.</li>
        </ol>
      </section>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold">Connect integrations</h2>
        <label className="block text-sm text-slate-300">
          Sentinel Hub Instance ID
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('sentinelInstanceId')}
            placeholder="xxxxxxxx"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Sentinel API key
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('sentinelKey')}
            placeholder="sh.key"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Stripe secret key
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('stripeSecret')}
            placeholder="sk_live_"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Storage bucket
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('storageBucket')}
            placeholder="croplens-uploads"
          />
        </label>
        <button type="submit" className="w-full rounded-xl bg-emerald-400 px-3 py-2 font-semibold text-slate-900">
          Save integrations
        </button>
      </form>
    </div>
  );
};
