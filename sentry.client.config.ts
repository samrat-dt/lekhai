import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions
  // Recommendation: Set this to a lower value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Skip JavaScript errors from browser extensions
  allowUrls: [
    // Only send errors from our own domain
    /https?:\/\/.*\.(localhost|lekhai\.com)/
  ]
});

// Capture exceptions that happen after page load
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    Sentry.captureException(event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });
}
