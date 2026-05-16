import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/server/services/communication/whatsapp';

const whatsappService = new WhatsAppService();

/**
 * GET /api/platform/whatsapp/webhook
 * Verification endpoint for Kapso/Meta webhooks.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WHATSAPP] Webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST /api/platform/whatsapp/webhook
 * Main webhook handler for Kapso.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Process the webhook asynchronously
    await whatsappService.handleWebhook(body);
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[WHATSAPP WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
