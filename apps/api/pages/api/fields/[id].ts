import type { NextApiRequest, NextApiResponse } from 'next';
import { analysesTable, fieldsTable } from '@/lib/supabase';
import { reportError } from '@/lib/telemetry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ownerId = (req.headers['x-owner-id'] as string) || 'demo-owner';
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'id is required' });
      return;
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
      return;
    }

    const { data, error } = await fieldsTable().select('*').eq('id', id).eq('owner_id', ownerId).single();
    if (error) throw error;
    const { data: analysis, error: analysisError } = await analysesTable()
      .select('*')
      .eq('field_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (analysisError && analysisError.code !== 'PGRST116') throw analysisError;

    res.status(200).json({
      id: data.id,
      name: data.name,
      acreage: data.acreage,
      crop: data.crop,
      centroid: data.centroid,
      boundaryGeoJson: data.boundary_geojson,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      latestAnalysis: analysis
        ? {
            id: analysis.id,
            fieldId: analysis.field_id,
            ndviRasterUrl: analysis.ndvi_raster_uri,
            summaryStats: analysis.summary_stats,
            lowNdviAreaPct: analysis.low_ndvi_area_pct,
            avgNdviDelta: analysis.avg_ndvi_delta,
            generatedAt: analysis.created_at,
          }
        : undefined,
    });
  } catch (error) {
    reportError(error);
    res.status(500).json({ error: 'Failed to load field' });
  }
}
