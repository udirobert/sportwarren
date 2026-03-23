import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_CLIENT_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  return NextResponse.json({
    url: baseUrl,
    name: 'SportWarren Telegram Treasury',
    iconUrl: `${baseUrl}/tonconnect-icon.png`,
    termsOfUseUrl: baseUrl,
    privacyPolicyUrl: baseUrl,
  });
}
