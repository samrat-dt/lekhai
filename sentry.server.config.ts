import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Integrations for Node.js
  integrations: [
    // Express middleware integration
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection()
  ],

  // Set tracesSampleRate to 1.0 to capture 100% of transactions
  // Recommendation: Set this to a lower value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture async context
  autoSessionTracking: true,
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
});
