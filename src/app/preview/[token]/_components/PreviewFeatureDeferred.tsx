import Link from 'next/link';
import { PALETTE, TRACKING, TYPE, V3CTAButton, V3Heading, V3IdentityLine, V3PageShell, V3Ribbon } from '@/components/v3';

interface PreviewFeatureDeferredProps {
  token: string;
  title: string;
  description: string;
}

/** A clear, private-token-safe exit for tools that are not in the phase-one record journey. */
export function PreviewFeatureDeferred({ token, title, description }: PreviewFeatureDeferredProps) {
  return (
    <V3PageShell maxWidth={640}>
      <V3Ribbon />
      <V3IdentityLine context="Your football record" showDot={false} />
      <V3Heading size="large">{title}</V3Heading>
      <p
        style={{
          color: PALETTE.inkLight,
          fontFamily: TYPE.mono,
          fontSize: 13,
          lineHeight: 1.6,
          marginTop: 18,
          marginBottom: 28,
        }}
      >
        {description} Right now, SportWarren is focused on keeping the matches your group actually plays.
      </p>
      <Link href={`/preview/${encodeURIComponent(token)}`} style={{ textDecoration: 'none' }}>
        <V3CTAButton variant="primary">Back to your record</V3CTAButton>
      </Link>
      <p
        style={{
          color: PALETTE.inkLight,
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: TRACKING.cap,
          marginTop: 20,
          textTransform: 'uppercase',
        }}
      >
        Every match leaves a mark
      </p>
    </V3PageShell>
  );
}
