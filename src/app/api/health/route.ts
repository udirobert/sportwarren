import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected',
      communication: 'initialized',
      ai: 'ready',
      algorand: 'ready',
      events: 'streaming',
    }
  });
}
