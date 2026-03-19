
import { NextResponse } from 'next/server';
import { getMarcusResponse } from '@/lib/ai/marcus';

export async function POST(request: Request) {
    try {
        const { message, city, venue, history, userId } = await request.json();
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const response = await getMarcusResponse(message, { city, venue, history, userId });
        return NextResponse.json({ response, degraded: false });
    } catch (error: any) {
        console.error('[VENICE-AI] Chat failed:', error);

        // Graceful character-retained fallback
        const fallback = error.message?.includes('API_KEY')
            ? "Tactical sensors recalibrating. Connect your identity to unlock full support."
            : "Strategic analysis interrupted. Re-synchronize your link.";

        return NextResponse.json({
            error: 'Inference degraded',
            response: fallback,
            degraded: true
        });
    }
}
