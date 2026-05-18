/**
 * Auto-Scout - autonomous pre-match scouting loop.
 *
 * Finds matches scheduled ~24 hours from now, then for each squad the
 * match involves, the squad's manager agent autonomously commissions an
 * x402 scouting report on the opponent and pushes the result to any
 * linked WhatsApp user.
 *
 * This is the "minimal human involvement" proof for the Kite hackathon:
 * the agent acts proactively without a human command.
 *
 * Cron schedule: every 6 hours.
 * The 22-26 hour window ensures we hit each match roughly once.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { kiteAIService } from '@/server/services/ai/kite';
import { WhatsAppService } from '@/server/services/communication/whatsapp';

const EXPLORER_BASE = process.env.KITE_EXPLORER_URL || 'https://testnet.kitescan.ai';
const SCOUT_AUTO_PRICE_USDC = Number(process.env.KITE_SCOUT_PRICE_USDC || '0.50');
const SCOUT_AUTO_MAX_USDC = Number(process.env.KITE_SCOUT_MAX_USDC || '0.50');

function fmtTx(txHash: string | undefined | null): string {
  if (!txHash) return '(no tx)';
  return `${EXPLORER_BASE}/tx/${txHash}`;
}

export async function GET(request: Request) {
  console.log('[Cron:auto-scout] Starting autonomous scouting loop...');

  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 22 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  try {
    // Fetch raw matches with squad names (dynamic includes require any cast)
    const upcomingMatches: any[] = await prisma.match.findMany({
      where: {
        matchDate: { gte: windowStart, lte: windowEnd },
        status: 'pending',
        NOT: {
          agentInsights: {
            path: ['auto_scout_complete'],
            equals: true,
          },
        },
      },
      include: {
        homeSquad: {
          include: {
            groups: { where: { platform: 'telegram', chatId: { not: null } } },
            members: {
              include: {
                user: {
                  include: {
                    platformIdentities: {
                      where: { platform: 'whatsapp' },
                    },
                  },
                },
              },
              where: { status: 'active' },
            },
          },
        },
        awaySquad: {
          include: {
            groups: { where: { platform: 'telegram', chatId: { not: null } } },
            members: {
              include: {
                user: {
                  include: {
                    platformIdentities: {
                      where: { platform: 'whatsapp' },
                    },
                  },
                },
              },
              where: { status: 'active' },
            },
          },
        },
      },
    });

    if (upcomingMatches.length === 0) {
      console.log('[Cron:auto-scout] No matches in the 22-26h window.');
      return NextResponse.json({ success: true, processed: 0 });
    }

    console.log(`[Cron:auto-scout] Found ${upcomingMatches.length} match(es) to auto-scout.`);

    const results: Array<{ matchId: string; opponent: string; squadId: string; ok: boolean; txHash?: string | null; error?: string }> = [];
    const whatsapp = new WhatsAppService();

    for (const match of upcomingMatches) {
      const pairs = [
        { squadId: match.homeSquadId, squadName: match.homeSquad?.name || '', opponentName: match.awaySquad?.name || '' },
        { squadId: match.awaySquadId, squadName: match.awaySquad?.name || '', opponentName: match.homeSquad?.name || '' },
      ];

      for (const { squadId, squadName, opponentName } of pairs) {
        try {
          const manager = await kiteAIService.upsertSquadManagerAgent(squadId);

          try {
            await kiteAIService.createSession({
              agentId: manager.id,
              taskSummary: `Auto-scout ${opponentName} for upcoming match`,
              maxPerTxUsdc: SCOUT_AUTO_MAX_USDC,
              maxTotalUsdc: SCOUT_AUTO_MAX_USDC * 5,
              ttlSeconds: 3600,
              scope: { source: 'auto-scout', matchId: match.id, opponent: opponentName },
              approvedBy: 'cron:auto-scout',
            });
          } catch {
            /* session may already exist */
          }

          const res = await kiteAIService.executePaidRequest<{ summary?: string }>({
            agentId: manager.id,
            url: process.env.KITE_SCOUT_SERVICE_URL || '',
            method: 'POST',
            body: { opponent: opponentName, requestedBy: 'cron:auto-scout' },
            maxAmountUsdc: SCOUT_AUTO_MAX_USDC,
            subject: { type: 'squad', id: squadId },
            kind: 'scout_report',
          });

          if (!res.ok) {
            console.warn(`[Cron:auto-scout] Scout failed for ${squadName} vs ${opponentName}: ${res.error}`);
            results.push({ matchId: match.id, opponent: opponentName, squadId, ok: false, error: res.error });
            continue;
          }

          const txUrl = fmtTx(res.payment?.txHash);
          const summary = res.data?.summary || 'No summary available.';
          const matchTime = match.matchDate
            ? match.matchDate.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "TBC";

          // Collect WhatsApp numbers from squad members
          const squadData = squadId === match.homeSquadId ? match.homeSquad : match.awaySquad;
          const whatsappNumbers = new Set<string>();
          if (squadData?.members) {
            for (const member of squadData.members) {
              if (member.user?.platformIdentities) {
                for (const identity of member.user.platformIdentities) {
                  if (identity.platformUserId) whatsappNumbers.add(identity.platformUserId);
                }
              }
            }
          }

          if (whatsappNumbers.size > 0 && whatsapp.isConfigured()) {
            const message = [
              `\u{1f6f0}\u{fe0f} *Auto-Scout Report*`,
              `Match: *${opponentName}* (${matchTime})`,
              '',
              summary,
              '',
              `\u{2705} *Settled on Kite*`,
              `Receipt: ${txUrl}`,
              `Price: ${SCOUT_AUTO_PRICE_USDC.toFixed(2)} USDC`,
              '',
              `Reply \`scout ${opponentName}\` for a fresh report.`,
            ].join('\n');

            for (const number of whatsappNumbers) {
              try {
                await whatsapp.sendText(number, message);
                console.log(`[Cron:auto-scout] Pushed auto-scout to WhatsApp ${number}`);
              } catch (err) {
                console.warn(`[Cron:auto-scout] Failed to send WhatsApp to ${number}:`, err);
              }
            }
          } else {
            console.log(`[Cron:auto-scout] No WhatsApp numbers for squad ${squadId} - recorded attestation only.`);
          }

          // Also notify via Telegram groups if the squad has one
          if (squadData?.groups) {
            for (const group of squadData.groups) {
              if (group.chatId) {
                try {
                  const { getTelegramService } = await import("@/server/services/communication/telegram");
                  const tgService = getTelegramService();
                  if (tgService) {
                    const bot = tgService.getBot();
                    if (bot) {
                      const tgMsg = [
                        "\u{1f6f0}\u{fe0f} *Auto-Scout Report",
                        "",
                        "Your squad manager agent autonomously scouted the next opponent:",
                        "",
                        "*Opponent:* " + opponentName,
                        "*Kickoff:* " + matchTime,
                        "",
                        summary,
                        "",
                        "*Settled on Kite*: " + txUrl,
                      ].join("\n");
                      await bot.sendMessage(group.chatId, tgMsg, { parse_mode: "Markdown" });
                      console.log(`[Cron:auto-scout] Pushed auto-scout to Telegram group ${group.chatId}`);
                    }
                  }
                } catch (err) {
                  console.warn(`[Cron:auto-scout] Failed to send Telegram to group:`, err);
                }
              }
            }
          }

          results.push({ matchId: match.id, opponent: opponentName, squadId, ok: true, txHash: res.payment?.txHash });
        } catch (err) {
          console.error(`[Cron:auto-scout] Error processing squad ${squadId} vs ${opponentName}:`, err);
          results.push({ matchId: match.id, opponent: opponentName, squadId, ok: false, error: (err as Error).message });
        }
      }

      // Mark match as auto-scouted
      const currentInsights = (match.agentInsights as Record<string, unknown>) || {};
      await prisma.match.update({
        where: { id: match.id },
        data: {
          agentInsights: {
            ...currentInsights,
            auto_scout_complete: true,
            auto_scout_at: now.toISOString(),
          },
        },
      });
    }

    const okCount = results.filter((r) => r.ok).length;
    const failCount = results.filter((r) => !r.ok).length;
    console.log(`[Cron:auto-scout] Done. ${okCount} succeeded, ${failCount} failed.`);

    return NextResponse.json({
      success: true,
      matchesProcessed: upcomingMatches.length,
      scoutsAttempted: results.length,
      scoutsSucceeded: okCount,
      scoutsFailed: failCount,
      results,
    });
  } catch (error) {
    console.error('[Cron:auto-scout] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
