import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { analysesTable, fieldsTable } from '@/lib/supabase';
import { reportError } from '@/lib/telemetry';
import type { Database } from '@/lib/database-types';

const createSchema = z.object({
  name: z.string().min(2),
  acreage: z.number().positive(),
  crop: z.string().optional(),
  centroid: z.object({ lat: z.number(), lng: z.number() }),
  boundaryGeoJson: z.any(),
});

const mapField = (
  row: Database['public']['Tables']['fields']['Row'],
  latestAnalysis?: Database['public']['Tables']['analyses']['Row'],
) => ({
  id: row.id,
  name: row.name,
  acreage: row.acreage,
  crop: row.crop,
  centroid: row.centroid,
  boundaryGeoJson: row.boundary_geojson,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  latestAnalysis: latestAnalysis
    ? {
        id: latestAnalysis.id,
        fieldId: latestAnalysis.field_id,
        ndviRasterUrl: latestAnalysis.ndvi_raster_uri,
        summaryStats: latestAnalysis.summary_stats,
        lowNdviAreaPct: latestAnalysis.low_ndvi_area_pct,
        avgNdviDelta: latestAnalysis.avg_ndvi_delta,
        generatedAt: latestAnalysis.created_at,
      }
    : undefined,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ownerId = (req.headers['x-owner-id'] as string) || 'demo-owner';

    if (req.method === 'GET') {
      const { data, error } = await fieldsTable()
        .select('*')
        .eq('owner_id', ownerId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const fieldIds = data.map((field) => field.id);
      const latestByField = new Map<string, Database['public']['Tables']['analyses']['Row']>();

      if (fieldIds.length) {
        const { data: analyses, error: analysesError } = await analysesTable()
          .select('*')
          .in('field_id', fieldIds)
          .order('created_at', { ascending: false });
        if (analysesError) throw analysesError;
        analyses.forEach((analysis) => {
          if (!latestByField.has(analysis.field_id)) {
            latestByField.set(analysis.field_id, analysis);
          }
        });
      }

      res.status(200).json(data.map((field) => mapField(field, latestByField.get(field.id))));
      return;
    }

    if (req.method === 'POST') {
      const payload = createSchema.parse(req.body);
      const { data, error } = await fieldsTable()
        .insert({
          name: payload.name,
          acreage: payload.acreage,
          crop: payload.crop ?? null,
          centroid: payload.centroid,
          boundary_geojson: payload.boundaryGeoJson,
          owner_id: ownerId,
        })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(mapField(data));
      return;
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).end('Method Not Allowed');
  } catch (error) {
    reportError(error);
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
