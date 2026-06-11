/**
 * Auto-Scout - autonomous pre-match scouting loop.
 *
 * Finds matches scheduled ~24 hours from now, then for each squad the
 * match involves, the squad's manager agent commissions a scouting
 * report on the opponent and pushes the result to any linked WhatsApp
 * user or Telegram group.
 *
 * This is the "minimal human involvement" proof for the Kite hackathon:
 * the agent acts proactively without a human command.
 *
 * Cron schedule: every 6 hours.
 * The 22-26 hour window ensures we hit each match roughly once.
 *
 * The scout report is generated via the in-process `createScoutReport`
 * service (same path WhatsApp `scout` uses) so behaviour is identical
 * across surfaces. Settlement is deferred by default; the
 * `/api/cron/scout-settle` worker fills in the on-chain receipt async.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createScoutReport } from '@/server/services/ai/scout-report';
import { tinyfishService, tinyfishConfigured } from '@/server/services/ai/tinyfish';
import { WhatsAppService } from '@/server/services/communication/whatsapp';

const EXPLORER_BASE = process.env.KITE_EXPLORER_URL || 'https://testnet.kitescan.ai';
const SCOUT_AUTO_PRICE_USDC = Number(process.env.KITE_SCOUT_PRICE_USDC || '0.005');

function fmtTx(txHash: string | undefined | null): string {
  if (!txHash) return '(verifying on Kite)';
  if (txHash.startsWith('internal-')) return txHash;
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
          // Generate the scout report via the same in-process service the
          // WhatsApp `scout` command uses. Settlement runs asynchronously
          // in the scout-settle worker; the cron gets back a report
          // immediately.
          let report: Awaited<ReturnType<typeof createScoutReport>>;
          try {
            report = await createScoutReport({
              opponent: opponentName,
              requestedBy: `cron:auto-scout:${squadId}`,
              priceUsdc: SCOUT_AUTO_PRICE_USDC,
              // no `settlement` arg → createScoutReport writes a pending
              // row; the scout-settle worker settles it asynchronously.
              enforceUserLimit: false,
              enforceSquadLimit: false,
            });
          } catch (err) {
            console.warn(`[Cron:auto-scout] Scout failed for ${squadName} vs ${opponentName}: ${(err as Error).message}`);
            results.push({ matchId: match.id, opponent: opponentName, squadId, ok: false, error: (err as Error).message });
            continue;
          }

          const txUrl = fmtTx(report.txHash);
          const summary = report.summary || 'No summary available.';
          const matchTime = match.matchDate
            ? match.matchDate.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "TBC";

          // ── TinyFish web scout (best-effort, free) ──────────────
          let webScoutSnippets: string[] = [];
          if (tinyfishConfigured()) {
            try {
              const webReport = await tinyfishService.scout(opponentName);
              if (webReport.sources.length > 0) {
                const topPages = webReport.snippets.slice(0, 3)
                  .map((s) => `• ${s.snippet.slice(0, 150)}`)
                  .filter(Boolean);
                if (topPages.length > 0) {
                  webScoutSnippets = [
                    '',
                    `\u{1f41f} *Web data* (via TinyFish)`,
                    ...topPages,
                    '',
                    `Sources: ${webReport.sources.slice(0, 2).map((s) => s.url).join(' · ')}`,
                  ];
                }
              }
            } catch (err) {
              console.warn(`[Cron:auto-scout] TinyFish web scout failed for ${opponentName}:`, err);
            }
          }

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
            const settleLine = report.txHash && !report.txHash.startsWith('internal-')
              ? `✅ *Settled on Kite*\nReceipt: ${txUrl}`
              : `⏳ *Verifying on Kite* — you'll get a follow-up message here once confirmed.`;
            const message = [
              `\u{1f6f0}\u{fe0f} *Auto-Scout Report*`,
              `Match: *${opponentName}* (${matchTime})`,
              '',
              summary,
              ...webScoutSnippets,
              '',
              settleLine,
              `Price: ${SCOUT_AUTO_PRICE_USDC.toFixed(2)} USDC`,
              '',
              `Reply \`scout ${opponentName}\` for an AI report or \`tinyfish scout ${opponentName}\` for web data.`,
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
                      const webSection = webScoutSnippets.length > 0
                        ? ["", "_Web data (TinyFish):_", ...webScoutSnippets.slice(1).map((l) => l.startsWith("\u{1f41f}") ? l : l)]
                        : [];

                      const tgMsg = [
                        "\u{1f6f0}\u{fe0f} *Auto-Scout Report",
                        "",
                        "Your squad manager agent autonomously scouted the next opponent:",
                        "",
                        "*Opponent:* " + opponentName,
                        "*Kickoff:* " + matchTime,
                        "",
                        summary,
                        ...webSection,
                        "",
                        report.txHash && !report.txHash.startsWith('internal-')
                          ? "*Receipt:* " + txUrl
                          : "*Receipt:* verifying on Kite — will post here when confirmed",
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

          results.push({ matchId: match.id, opponent: opponentName, squadId, ok: true, txHash: report.txHash });
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
