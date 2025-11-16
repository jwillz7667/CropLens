import type { NextApiRequest, NextApiResponse } from 'next';
import { fieldsTable, insightsTable } from '@/lib/supabase';
import { reportError } from '@/lib/telemetry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      res.status(405).end('Method Not Allowed');
      return;
    }

    const fieldId = req.query.fieldId as string | undefined;
    const ownerId = (req.headers['x-owner-id'] as string) || 'demo-owner';

    if (!fieldId) {
      res.status(400).json({ error: 'fieldId required' });
      return;
    }

    const { data: fieldOwnership, error: fieldError } = await fieldsTable()
      .select('id')
      .eq('id', fieldId)
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (fieldError) throw fieldError;
    if (!fieldOwnership) {
      res.status(404).json({ error: 'Field not found' });
      return;
    }

    const { data, error } = await insightsTable()
      .select('*')
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(
      data.map((row) => ({
        id: row.id,
        fieldId: row.field_id,
        message: row.message,
        recommendation: row.recommendation,
        severity: row.severity,
        createdAt: row.created_at,
      })),
    );
  } catch (error) {
    reportError(error);
    res.status(500).json({ error: 'Failed to load insights' });
  }
}
