import { captureException } from '@sentry/nextjs';
import { PostHog } from 'posthog-node';

const posthogKey = process.env.POSTHOG_API_KEY;
const posthogHost = process.env.POSTHOG_API_HOST || 'https://app.posthog.com';

const posthogClient = posthogKey
  ? new PostHog(posthogKey, {
      host: posthogHost,
    })
  : undefined;

export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (!posthogClient) return;
  const userId = typeof properties?.userId === 'string' ? (properties.userId as string) : undefined;
  posthogClient.capture({ event, properties, distinctId: userId ?? 'system' });
};

export const flushTelemetry = async () => {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
};

export const reportError = (error: unknown) => {
  captureException(error);
};
