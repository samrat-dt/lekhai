import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions
  // Recommendation: Set this to a lower value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
});
