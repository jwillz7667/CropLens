import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { reportError, trackEvent } from '@/lib/telemetry';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

const buffer = async (req: NextApiRequest) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  if (!stripe || !webhookSecret) {
    res.status(200).json({ received: true });
    return;
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(buf, sig as string, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      trackEvent('subscription_activated', { customerId: session.customer, userId: session.client_reference_id });
    }

    res.json({ received: true });
  } catch (error) {
    reportError(error);
    res.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }
}
