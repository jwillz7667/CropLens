import * as Sentry from '@sentry/nextjs';

if (!Sentry.isInitialized()) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || undefined,
    tracesSampleRate: 0.1,
  });
}
