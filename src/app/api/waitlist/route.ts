import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const source = typeof body?.source === 'string' ? body.source.slice(0, 64) : null;
    const context = (body?.context && typeof body.context === 'object') ? body.context : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    // Upsert to keep it idempotent per email
    const entry = await prisma.waitlistSignup.upsert({
      where: { email },
      create: { email, source: source || undefined, context: context as any },
      update: { source: source || undefined, context: context as any },
    });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('[waitlist] POST failed', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

