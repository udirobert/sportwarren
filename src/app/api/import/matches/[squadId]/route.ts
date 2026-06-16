import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { commitMatchHistoryImport } from '@/server/services/import/squad-import';
import type { ColumnMapping } from '@/server/services/import/squad-import';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ squadId: string }> },
) {
  try {
    const { squadId } = await params;

    const body = await req.json();
    const { raw, mapping, delimiter } = body;

    if (!raw || typeof raw !== 'string') {
      return NextResponse.json({ error: 'Missing raw data' }, { status: 400 });
    }
    if (!mapping || !Array.isArray(mapping)) {
      return NextResponse.json({ error: 'Missing column mapping' }, { status: 400 });
    }
    if (!squadId || typeof squadId !== 'string') {
      return NextResponse.json({ error: 'Missing squad ID' }, { status: 400 });
    }

    // Validate the mapping has date and opponent columns
    const hasDate = (mapping as ColumnMapping[]).some(m => m.field === 'date');
    const hasOpponent = (mapping as ColumnMapping[]).some(m => m.field === 'opponent');
    if (!hasDate || !hasOpponent) {
      return NextResponse.json({ error: 'Column mapping must include date and opponent fields' }, { status: 400 });
    }

    // Verify squad exists
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { id: true },
    });

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    const result = await commitMatchHistoryImport(
      raw,
      mapping as ColumnMapping[],
      squadId,
      { delimiter },
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Match import failed';
    console.error('[IMPORT] Match history import error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
