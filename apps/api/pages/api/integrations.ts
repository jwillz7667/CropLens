import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { integrationsTable } from '@/lib/supabase';
import { reportError } from '@/lib/telemetry';

const schema = z.object({
  sentinelInstanceId: z.string().min(4),
  sentinelKey: z.string().min(8),
  stripeSecret: z.string().min(8),
  storageBucket: z.string().min(3),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ownerId = (req.headers['x-owner-id'] as string) || 'demo-owner';
    if (req.method === 'POST') {
      const payload = schema.parse(req.body);
      const { data, error } = await integrationsTable()
        .upsert(
          {
            owner_id: ownerId,
            sentinel_instance_id: payload.sentinelInstanceId,
            sentinel_key: payload.sentinelKey,
            stripe_secret: payload.stripeSecret,
            storage_bucket: payload.storageBucket,
          },
          { onConflict: 'owner_id' },
        )
        .select()
        .single();
      if (error) throw error;
      res.status(200).json(data);
      return;
    }

    if (req.method === 'GET') {
      const { data, error } = await integrationsTable().select('*').eq('owner_id', ownerId).maybeSingle();
      if (error) throw error;
      res.status(200).json(data ?? null);
      return;
    }

    res.setHeader('Allow', 'GET,POST');
    res.status(405).end('Method Not Allowed');
  } catch (error) {
    reportError(error);
    res.status(500).json({ error: 'Failed to manage integrations' });
  }
}
