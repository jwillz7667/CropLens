import { useMemo } from 'react';
import type { Polygon } from 'geojson';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateField } from '@/hooks/useFields';

const schema = z.object({
  name: z.string().min(2),
  acreage: z.coerce.number().min(1),
  crop: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().min(50).max(5000),
});

export type FieldFormValues = z.infer<typeof schema>;

const createCircularPolygon = (lat: number, lng: number, radiusMeters: number): Polygon => {
  const coordinates: [number, number][] = [];
  const steps = 42;
  const earthRadius = 6_371_000;

  for (let i = 0; i <= steps; i += 1) {
    const bearing = (2 * Math.PI * i) / steps;
    const latRadians = (lat * Math.PI) / 180;
    const lngRadians = (lng * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(latRadians) * Math.cos(radiusMeters / earthRadius) +
        Math.cos(latRadians) * Math.sin(radiusMeters / earthRadius) * Math.cos(bearing),
    );
    const lng2 =
      lngRadians +
      Math.atan2(
        Math.sin(bearing) * Math.sin(radiusMeters / earthRadius) * Math.cos(latRadians),
        Math.cos(radiusMeters / earthRadius) - Math.sin(latRadians) * Math.sin(lat2),
      );

    coordinates.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }

  return {
    type: 'Polygon',
    coordinates: [coordinates],
  };
};

export const FieldForm = () => {
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      acreage: 50,
      radiusMeters: 250,
      lat: 39.8283,
      lng: -98.5795,
    },
  });

  const mutation = useCreateField();

  const centroidPreview = useMemo(() => {
    const values = form.watch();
    return `${values.lat.toFixed(4)}, ${values.lng.toFixed(4)}`;
  }, [form]);

  const onSubmit = async (values: FieldFormValues) => {
    const boundaryGeoJson = createCircularPolygon(values.lat, values.lng, values.radiusMeters);
    await mutation.mutateAsync({
      name: values.name,
      acreage: values.acreage,
      crop: values.crop,
      centroid: { lat: values.lat, lng: values.lng },
      boundaryGeoJson,
    });
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Add a field</h3>
        {mutation.isSuccess && <span className="text-sm text-emerald-300">Saved</span>}
      </div>

      <label className="block text-sm font-medium text-slate-300">
        Field name
        <input
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
          {...form.register('name')}
          placeholder="North 80"
        />
      </label>
      {form.formState.errors.name && <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-300">
          Acreage
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('acreage')}
            placeholder="120"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Crop
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('crop')}
            placeholder="Corn"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-medium text-slate-300">
          Latitude
          <input
            type="number"
            step="0.0001"
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('lat')}
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Longitude
          <input
            type="number"
            step="0.0001"
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('lng')}
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Radius (m)
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2"
            {...form.register('radiusMeters')}
          />
        </label>
      </div>

      <p className="text-sm text-slate-400">Centroid preview: {centroidPreview}</p>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-3 py-2 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Save field'}
      </button>
    </form>
  );
};
