import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type RouteContext = { params: Promise<{ squadId: string }> };

/**
 * GET /api/import/claim/[squadId]?player=<name>
 * Returns the pending player info for a given squad + player name match.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { squadId } = await params;
    const playerName = req.nextUrl.searchParams.get('player');

    if (!playerName?.trim()) {
      return NextResponse.json({ error: 'Missing player name' }, { status: 400 });
    }

    const [squad, pendingMember] = await Promise.all([
      prisma.squad.findUnique({
        where: { id: squadId },
        select: { id: true, name: true, shortName: true },
      }),
      prisma.squadMember.findFirst({
        where: {
          squadId,
          status: 'pending',
          user: { name: { equals: playerName.trim(), mode: 'insensitive' } },
        },
        include: {
          user: { select: { id: true, name: true, position: true, walletAddress: true } },
          squad: { select: { name: true, shortName: true } },
        },
      }),
    ]);

    if (!squad) {
      return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    }

    if (!pendingMember) {
      return NextResponse.json({
        squad: { id: squad.id, name: squad.name, shortName: squad.shortName },
        pendingPlayer: null,
        message: `No pending invite found for "${playerName}" in ${squad.name}. The link may have expired or the player was already claimed.`,
      });
    }

    // Get total squad member count for display
    const memberCount = await prisma.squadMember.count({
      where: { squadId, status: 'active' },
    });

    return NextResponse.json({
      squad: { id: squad.id, name: squad.name, shortName: squad.shortName },
      pendingPlayer: {
        id: pendingMember.user.id,
        name: pendingMember.user.name,
        position: pendingMember.user.position,
        isPlaceholder: pendingMember.user.walletAddress.startsWith('imported_'),
      },
      memberCount,
    });
  } catch (error) {
    console.error('[IMPORT-CLAIM] GET error:', error);
    return NextResponse.json({ error: 'Failed to look up invite' }, { status: 500 });
  }
}

/**
 * POST /api/import/claim/[squadId]
 * Body: { playerName: string; claimingWalletAddress: string }
 *
 * Claims an imported player spot: transfers SquadMember and SquadPlayerContext
 * from the placeholder user to the real claiming user, then cleans up the
 * placeholder user record.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { squadId } = await params;
    const body = await req.json();
    const { playerName, claimingWalletAddress } = body;

    if (!playerName?.trim()) {
      return NextResponse.json({ error: 'Missing player name' }, { status: 400 });
    }
    if (!claimingWalletAddress?.trim()) {
      return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
    }

    // Find the claiming user by wallet address
    const claimingUser = await prisma.user.findUnique({
      where: { walletAddress: claimingWalletAddress },
    });

    if (!claimingUser) {
      return NextResponse.json({ error: 'User not found. Make sure you are signed in.' }, { status: 404 });
    }

    // Check if claiming user is already a member of this squad
    const existingMembership = await prisma.squadMember.findUnique({
      where: { squadId_userId: { squadId, userId: claimingUser.id } },
    });

    if (existingMembership && existingMembership.status === 'active') {
      return NextResponse.json({
        success: true,
        message: 'You are already a member of this squad.',
        alreadyMember: true,
      });
    }

    // Find the pending placeholder member matching the player name
    const pendingMember = await prisma.squadMember.findFirst({
      where: {
        squadId,
        status: 'pending',
        user: { name: { equals: playerName.trim(), mode: 'insensitive' } },
      },
      include: { user: true },
    });

    if (!pendingMember) {
      return NextResponse.json({
        error: `No pending invite found for "${playerName}" in this squad. The link may have expired.`,
      }, { status: 404 });
    }

    const placeholderUserId = pendingMember.userId;

    // Execute the claim in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. If the claiming user already has a pending membership, activate it
      if (existingMembership && existingMembership.status === 'pending') {
        await tx.squadMember.update({
          where: { id: existingMembership.id },
          data: { status: 'active' },
        });
        // Also clean up the placeholder membership
        await tx.squadMember.delete({ where: { id: pendingMember.id } });
      } else {
        // 2. Transfer the SquadMember to the claiming user
        await tx.squadMember.update({
          where: { id: pendingMember.id },
          data: {
            userId: claimingUser.id,
            status: 'active',
          },
        });
      }

      // 3. Transfer or update SquadPlayerContext
      const existingContext = await tx.squadPlayerContext.findUnique({
        where: { userId_squadId: { userId: claimingUser.id, squadId } },
      });

      if (existingContext) {
        // Claiming user already has context — just remove the placeholder one
        await tx.squadPlayerContext.deleteMany({
          where: { userId: placeholderUserId, squadId },
        });
      } else {
        // Transfer the placeholder's context to the claiming user
        await tx.squadPlayerContext.updateMany({
          where: { userId: placeholderUserId, squadId },
          data: { userId: claimingUser.id },
        });
      }

      // 4. Copy name and position from placeholder if the claiming user doesn't have them set
      if (!claimingUser.name || !claimingUser.position) {
        await tx.user.update({
          where: { id: claimingUser.id },
          data: {
            ...(!claimingUser.name ? { name: pendingMember.user.name } : {}),
            ...(!claimingUser.position ? { position: pendingMember.user.position } : {}),
          },
        });
      }

      // 5. Delete the placeholder user (cascades to any remaining orphan records)
      if (placeholderUserId !== claimingUser.id) {
        await tx.squadMember.deleteMany({
          where: { userId: placeholderUserId },
        });
        await tx.squadPlayerContext.deleteMany({
          where: { userId: placeholderUserId },
        });
        await tx.user.delete({
          where: { id: placeholderUserId },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `You have claimed your spot in the squad!`,
      squadId,
      playerName: playerName.trim(),
    });
  } catch (error) {
    console.error('[IMPORT-CLAIM] POST error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to claim spot',
    }, { status: 500 });
  }
}
