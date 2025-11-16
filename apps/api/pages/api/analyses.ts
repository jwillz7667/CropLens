import type { NextApiRequest, NextApiResponse } from 'next';
import type { MultiPolygon, Polygon } from 'geojson';
import { z } from 'zod';
import { analysesTable, fieldsTable, insightsTable } from '@/lib/supabase';
import { fetchSentinelScene } from '@/lib/sentinel';
import { computeNdvi } from '@/lib/ndvi';
import { buildPublicUrl, uploadRaster } from '@/lib/storage';
import { deriveInsights } from '@/lib/recommendations';
import { reportError, trackEvent } from '@/lib/telemetry';
import { fetchWeatherOutlook } from '@/lib/weather';
import { sendInsightEmail } from '@/lib/notifications';

const schema = z.object({
  fieldId: z.string().uuid(),
  uploadKey: z.string().optional(),
  source: z.enum(['upload', 'sentinel']).default('sentinel'),
  date: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ownerId = (req.headers['x-owner-id'] as string) || 'demo-owner';

    if (req.method === 'GET') {
      const fieldId = req.query.fieldId as string | undefined;
      if (!fieldId) {
        res.status(400).json({ error: 'fieldId required' });
        return;
      }
      const { data: fieldOwnership, error: fieldExistsError } = await fieldsTable()
        .select('id')
        .eq('id', fieldId)
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (fieldExistsError) throw fieldExistsError;
      if (!fieldOwnership) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }
      const { data, error } = await analysesTable()
        .select('*')
        .eq('field_id', fieldId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json(
        data.map((analysis) => ({
          id: analysis.id,
          fieldId: analysis.field_id,
          ndviRasterUrl: analysis.ndvi_raster_uri,
          summaryStats: analysis.summary_stats,
          lowNdviAreaPct: analysis.low_ndvi_area_pct,
          avgNdviDelta: analysis.avg_ndvi_delta,
          generatedAt: analysis.created_at,
        })),
      );
      return;
    }

    if (req.method === 'POST') {
      const payload = schema.parse(req.body);
      const { data: field, error: fieldError } = await fieldsTable()
        .select('*')
        .eq('id', payload.fieldId)
        .eq('owner_id', ownerId)
        .single();
      if (fieldError) throw fieldError;

      let buffer: Buffer;
      if (payload.source === 'upload') {
        if (!payload.uploadKey) {
          res.status(400).json({ error: 'uploadKey required for upload source' });
          return;
        }
        const uploadUrl = buildPublicUrl(payload.uploadKey);
        if (!uploadUrl) throw new Error('Cannot resolve upload URL');
        const response = await fetch(uploadUrl);
        if (!response.ok) throw new Error('Failed to fetch uploaded imagery');
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        buffer = await fetchSentinelScene({
          geometry: field.boundary_geojson as Polygon | MultiPolygon,
          from: payload.date,
        });
      }

      const { data: previousAnalysis } = await analysesTable()
        .select('*')
        .eq('field_id', field.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const ndvi = await computeNdvi(buffer);
      const rasterKey = `ndvi/${field.id}/${Date.now()}.png`;
      const rasterUrl = await uploadRaster(ndvi.raster, rasterKey);
      const avgNdviDelta = previousAnalysis ? ndvi.summary.mean - previousAnalysis.summary_stats.mean : null;
      const { data: inserted, error: insertError } = await analysesTable()
        .insert({
          field_id: field.id,
          ndvi_raster_uri: rasterUrl,
          summary_stats: ndvi.summary,
          low_ndvi_area_pct: ndvi.summary.lowNdviAreaPct,
          avg_ndvi_delta: avgNdviDelta,
          source: payload.source,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      const insights = deriveInsights(ndvi.summary, previousAnalysis?.summary_stats).map((insight) => ({
        field_id: field.id,
        message: insight.message,
        recommendation: insight.recommendation,
        severity: insight.severity,
      }));

      if (insights.length) {
        const { error: insightsError } = await insightsTable().insert(insights);
        if (insightsError) throw insightsError;
        const alertEmail = process.env.ALERT_TEST_EMAIL;
        if (alertEmail) {
          await sendInsightEmail({
            to: alertEmail,
            subject: `CropLens insight for ${field.name}`,
            html: insights
              .map(
                (insight) =>
                  `<p><strong>${insight.severity.toUpperCase()}</strong>: ${insight.message}<br/>${insight.recommendation}</p>`,
              )
              .join(''),
          });
        }
      }

      const weather = await fetchWeatherOutlook(field.centroid.lat, field.centroid.lng).catch((err) => {
        console.warn('Weather lookup failed', err);
        return undefined;
      });

      trackEvent('analysis_created', {
        fieldId: field.id,
        source: payload.source,
        avgNdvi: ndvi.summary.mean,
      });

      res.status(201).json({
        id: inserted.id,
        fieldId: inserted.field_id,
        ndviRasterUrl: inserted.ndvi_raster_uri,
        summaryStats: inserted.summary_stats,
        lowNdviAreaPct: inserted.low_ndvi_area_pct,
        avgNdviDelta: inserted.avg_ndvi_delta,
        generatedAt: inserted.created_at,
        weather,
      });
      return;
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).end('Method Not Allowed');
  } catch (error) {
    reportError(error);
    console.error(error);
    res.status(500).json({ error: 'Failed to process analysis' });
  }
}
