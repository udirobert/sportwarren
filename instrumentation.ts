import * as Sentry from '@sentry/nextjs';

export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  const enabled = process.env.NODE_ENV === 'production' && !!dsn;

  const commonOptions: Sentry.NodeOptions = {
    dsn,
    enabled,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    beforeSend(event) {
      // Strip PII from error events
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-wallet-signature'];
        delete event.request.headers['x-auth-message'];
      }
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = event.request.data as Record<string, unknown>;
        if ('signature' in data) delete data.signature;
        if ('mnemonic' in data) delete data.mnemonic;
        if ('privateKey' in data) delete data.privateKey;
      }
      return event;
    },
  };

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init(commonOptions);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(commonOptions);
  }
}