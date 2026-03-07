
import { NextResponse } from 'next/server';
import { getMarcusResponse } from '@/lib/ai/marcus';

export async function POST(request: Request) {
    const { message, city, venue, history } = await request.json();

    try {
        const response = await getMarcusResponse(message, { city, venue, history });
        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[VENICE-AI] Chat failed:', error);

        // Graceful character-retained fallback
        const fallback = error.message?.includes('API_KEY')
            ? "Tactical sensors recalibrating. Connect your identity to unlock full support."
            : "Strategic analysis interrupted. Re-synchronize your link.";

        return NextResponse.json({
            error: 'Inference failed',
            response: fallback
        }, { status: 500 });
    }
}
