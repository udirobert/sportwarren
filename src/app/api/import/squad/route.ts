import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { commitSquadImport } from '@/server/services/import/squad-import';
import type { ColumnMapping } from '@/server/services/import/squad-import';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raw, mapping, squadName, captainWalletAddress, delimiter, origin } = body;

    if (!raw || typeof raw !== 'string') {
      return NextResponse.json({ error: 'Missing raw data' }, { status: 400 });
    }
    if (!mapping || !Array.isArray(mapping)) {
      return NextResponse.json({ error: 'Missing column mapping' }, { status: 400 });
    }
    if (!squadName || typeof squadName !== 'string' || !squadName.trim()) {
      return NextResponse.json({ error: 'Missing squad name' }, { status: 400 });
    }
    if (!captainWalletAddress || typeof captainWalletAddress !== 'string') {
      return NextResponse.json({ error: 'Missing captain wallet address' }, { status: 400 });
    }

    // Validate the mapping has a name column
    const hasName = (mapping as ColumnMapping[]).some(m => m.field === 'name');
    if (!hasName) {
      return NextResponse.json({ error: 'Column mapping must include a name field' }, { status: 400 });
    }

    // Look up the captain by wallet address
    const captain = await prisma.user.findUnique({
      where: { walletAddress: captainWalletAddress },
    });

    if (!captain) {
      return NextResponse.json({ error: 'Captain user not found. Make sure you are signed in.' }, { status: 404 });
    }

    const result = await commitSquadImport(
      raw,
      mapping as ColumnMapping[],
      squadName.trim(),
      captain.id,
      {
        origin: origin ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`,
        delimiter,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed';
    console.error('[IMPORT] Squad import error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
