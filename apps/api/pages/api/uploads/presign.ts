import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createUploadUrl } from '@/lib/storage';
import { fieldsTable } from '@/lib/supabase';
import { reportError } from '@/lib/telemetry';

const schema = z.object({
  filename: z.string().min(3),
  contentType: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.status(405).end('Method Not Allowed');
      return;
    }
    const ownerId = (req.headers['x-owner-id'] as string) || 'demo-owner';
    const fieldId = req.query.fieldId as string | undefined;
    if (!fieldId) {
      res.status(400).json({ error: 'fieldId required' });
      return;
    }

    const payload = schema.parse(req.body);
    const { data: field, error: fieldError } = await fieldsTable()
      .select('id')
      .eq('id', fieldId)
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (fieldError) throw fieldError;
    if (!field) {
      res.status(404).json({ error: 'Field not found' });
      return;
    }
    const presign = await createUploadUrl({
      filename: payload.filename,
      contentType: payload.contentType,
      fieldId,
    });
    res.status(200).json(presign);
  } catch (error) {
    reportError(error);
    res.status(500).json({ error: 'Failed to sign upload' });
  }
}
