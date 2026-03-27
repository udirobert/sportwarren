import { PrismaClient } from '@prisma/client';
import { PEER_RATING, MOTM } from './constants';
import { AttributeType } from '@/types';
import { telegramService } from '@/server/services/communication/telegram';

interface AttributeMedian {
  attribute: string;
  median: number;
  count: number;
}

/**
 * Peer Consensus Engine
 * Calculates medians, deviations, and applies XP after the rating window closes.
 */
export async function calculateConsensus(prisma: PrismaClient, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      peerRatings: true,
      motmVotes: true,
      homeSquad: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  playerProfile: true
                }
              }
            }
          }
        }
      },
      awaySquad: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  playerProfile: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!match) throw new Error('Match not found');
  if (match.peerRatingsClosed) return { success: false, message: 'Consensus already calculated' };

  const allPlayers = [
    ...match.homeSquad.members.map(m => m.user.playerProfile).filter(Boolean),
    ...match.awaySquad.members.map(m => m.user.playerProfile).filter(Boolean),
  ];

  const results = [];

  // 1. Calculate Median Ratings per Player per Attribute
  for (const player of allPlayers) {
    const playerRatings = match.peerRatings.filter(r => r.targetId === player!.id);
    const attributes = [...new Set(playerRatings.map(r => r.attribute))];
    
    const playerAttributeMedians: Record<string, number> = {};

    for (const attr of attributes) {
      const scores = playerRatings
        .filter(r => r.attribute === attr)
        .map(r => r.score)
        .sort((a, b) => a - b);

      if (scores.length < PEER_RATING.MIN_QUORUM) continue;

      const mid = Math.floor(scores.length / 2);
      const median = scores.length % 2 !== 0 
        ? scores[mid] 
        : (scores[mid - 1] + scores[mid]) / 2;

      playerAttributeMedians[attr] = median;

      // Apply Peer XP to PlayerAttribute
      const peerXP = Math.floor(median * PEER_RATING.XP_MULTIPLIER);
      
      await prisma.playerAttribute.update({
        where: {
          profileId_attribute: {
            profileId: player!.id,
            attribute: attr,
          }
        },
        data: {
          xp: { increment: peerXP }
        }
      });

      // Track for XPGain audit
      results.push({
        profileId: player!.id,
        attribute: attr,
        peerXP,
        median
      });
    }

    // 2. Handle MOTM Bonus
    const votesForPlayer = match.motmVotes.filter(v => v.targetId === player!.id).length;
    const totalVotes = match.motmVotes.length;

    // A player wins MOTM if they have the most votes (and at least 1)
    // Simple logic: find max votes
    const voteCounts = match.motmVotes.reduce((acc, v) => {
      acc[v.targetId] = (acc[v.targetId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxVotes = Math.max(...Object.values(voteCounts), 0);
    const isMOTM = maxVotes > 0 && votesForPlayer === maxVotes;

    if (isMOTM) {
      const motmBonus = MOTM.XP_BONUS;
      const attributesToBonus: AttributeType[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
      const xpPerAttr = Math.floor(motmBonus / attributesToBonus.length);

      for (const attr of attributesToBonus) {
        await prisma.playerAttribute.update({
          where: {
            profileId_attribute: {
              profileId: player!.id,
              attribute: attr,
            }
          },
          data: {
            xp: { increment: xpPerAttr }
          }
        });
      }

      // Record MOTM XP Gain
      await prisma.xPGain.create({
        data: {
          profileId: player!.id,
          matchId,
          totalXP: motmBonus,
          baseXP: motmBonus,
          source: 'motm_bonus',
          description: 'Player of the Match bonus',
          attributeBreakdown: attributesToBonus.reduce((acc, attr) => {
            acc[attr] = xpPerAttr;
            return acc;
          }, {} as any)
        }
      });
    }

    // Create XPGain entry for peer ratings if any
    const playerPeerResults = results.filter(r => r.profileId === player!.id);
    if (playerPeerResults.length > 0) {
      const totalPeerXP = playerPeerResults.reduce((sum, r) => sum + r.peerXP, 0);
      const breakdown = playerPeerResults.reduce((acc, r) => {
        acc[r.attribute] = r.peerXP;
        return acc;
      }, {} as any);

      await prisma.xPGain.create({
        data: {
          profileId: player!.id,
          matchId,
          totalXP: totalPeerXP,
          baseXP: totalPeerXP,
          source: 'peer_rating',
          description: 'Teammate peer ratings attribute bonus',
          attributeBreakdown: breakdown
        }
      });
    }
  }

  // 3. Calculate Rater Deviations and Award Scout XP
  for (const rating of match.peerRatings) {
    const playerAttrResults = results.find(r => r.profileId === rating.targetId && r.attribute === rating.attribute);
    if (!playerAttrResults) continue;

    const deviation = Math.abs(rating.score - playerAttrResults.median);
    let scoutXP = 0;

    if (deviation <= PEER_RATING.SCOUT_XP.NEUTRAL_RANGE) {
      if (deviation <= 1) {
        scoutXP = PEER_RATING.SCOUT_XP.ACCURATE;
      }
    } else if (deviation >= 3) {
      scoutXP = PEER_RATING.SCOUT_XP.OUTLIER_PENALTY;
    }

    await prisma.peerRating.update({
      where: { id: rating.id },
      data: {
        deviation: Math.round(deviation),
        scoutXP
      }
    });

    if (scoutXP !== 0) {
      const profile = await prisma.playerProfile.findUnique({
        where: { id: rating.raterId },
        select: { scoutXP: true }
      });

      if (profile) {
        const newScoutXP = Math.max(0, profile.scoutXP + scoutXP);
        let newTier = 'rookie';
        if (newScoutXP >= PEER_RATING.SCOUT_TIERS.ELITE.minXP) newTier = 'elite';
        else if (newScoutXP >= PEER_RATING.SCOUT_TIERS.TRUSTED.minXP) newTier = 'trusted';

        await prisma.playerProfile.update({
          where: { id: rating.raterId },
          data: {
            scoutXP: newScoutXP,
            scoutTier: newTier
          }
        });
      }
    }
  }

  // 4. Close the window
  await prisma.match.update({
    where: { id: matchId },
    data: { peerRatingsClosed: true }
  });

  // 5. Notify results
  const squadsToNotify = [
    { id: match.homeSquadId, name: match.homeSquad.name },
    { id: match.awaySquadId, name: match.awaySquad.name }
  ];

  for (const squadInfo of squadsToNotify) {
    const squadWithGroups = await prisma.squad.findUnique({
      where: { id: squadInfo.id },
      include: { groups: { where: { platform: 'telegram' } } }
    });

    if (squadWithGroups?.groups && squadWithGroups.groups.length > 0) {
      const tgGroup = squadWithGroups.groups[0];
      if (tgGroup?.chatId) {
        await telegramService.sendConsensusResults(tgGroup.chatId, matchId, squadInfo.name);
      }
    }
  }

  return { success: true, playersRated: allPlayers.length };
}
