
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { TelegramService } from "./telegram";
import { managerInsightService } from "../ai/manager-insights";
import { AGENT_PERSONAS } from "../ai/prompts";

export class TacticalNotificationService {
  private telegramService: TelegramService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(telegramService: TelegramService) {
    this.telegramService = telegramService;
  }

  /**
   * Starts the notification poller.
   * Runs every 15 minutes by default.
   */
  startPoller(intervalMs: number = 15 * 60 * 1000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("[TACTICAL-NOTIF] Starting poller...");
    
    // Initial run
    this.processUpcomingMatches().catch(err => {
      console.error("[TACTICAL-NOTIF] Error in initial run:", err);
    });

    this.intervalId = setInterval(() => {
      this.processUpcomingMatches().catch(err => {
        console.error("[TACTICAL-NOTIF] Error in poller run:", err);
      });
    }, intervalMs);
  }

  stopPoller() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("[TACTICAL-NOTIF] Poller stopped.");
  }

  /**
   * Main logic: Find upcoming matches and notify squads.
   */
  async processUpcomingMatches() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // 1. Find matches starting in the next 1 hour that haven't been notified
    // We check agentInsights for a 'tactical_notified' flag
    const upcomingMatches = await prisma.match.findMany({
      where: {
        matchDate: {
          gt: now,
          lte: oneHourFromNow,
        },
        status: "pending",
        OR: [
          { agentInsights: { equals: Prisma.AnyNull } },
          { 
            agentInsights: {
              path: ["tactical_notified"],
              equals: Prisma.AnyNull
            }
          }
        ]
      },
      include: {
        homeSquad: {
          include: {
            members: {
              include: {
                user: {
                  include: {
                    playerProfile: {
                      include: {
                        attributes: true
                      }
                    }
                  }
                }
              }
            },
            tactics: true,
            groups: {
              where: {
                platform: "telegram",
                chatId: { not: null }
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
                    playerProfile: {
                      include: {
                        attributes: true
                      }
                    }
                  }
                }
              }
            },
            tactics: true,
            groups: {
              where: {
                platform: "telegram",
                chatId: { not: null }
              }
            }
          }
        }
      }
    });

    console.log(`[TACTICAL-NOTIF] Found ${upcomingMatches.length} upcoming matches to process.`);

    for (const match of upcomingMatches) {
      try {
        await this.notifyMatch(match);
      } catch (err) {
        console.error(`[TACTICAL-NOTIF] Failed to notify match ${match.id}:`, err);
      }
    }
  }

  private async notifyMatch(match: any) {
    // 1. Generate Insight via AI (ManagerInsightService)
    const insight = await managerInsightService.generateTacticalPreview(
      match.homeSquad,
      match.awaySquad
    );

    if (!insight) {
      console.warn(`[TACTICAL-NOTIF] Could not generate insight for match ${match.id}`);
      return;
    }

    // 2. Format the Telegram message
    const message = [
      `🛡️ *Tactical Briefing: Match Prep*`,
      `🆚 *${match.homeSquad.name}* vs *${match.awaySquad.name}*`,
      `⏰ Kickoff: ${match.matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      '',
      `👤 *${AGENT_PERSONAS.COACH_KITE.name} says:*`,
      `_${insight.message}_`,
      '',
      `📊 *Win Probability:*`,
      `🏠 ${match.homeSquad.name}: *${Math.round((insight.metadata?.probs?.homeWin || 0) * 100)}%*`,
      `🚀 ${match.awaySquad.name}: *${Math.round((insight.metadata?.probs?.awayWin || 0) * 100)}%*`,
      `🤝 Draw: *${Math.round((insight.metadata?.probs?.draw || 0) * 100)}%*`,
      '',
      `🔗 [Open Match Preview in Mini App](https://t.me/sportwarren_bot/app?startapp=match_${match.id})`,
    ].join("\n");

    // 3. Send to both squads' Telegram groups if they exist
    const squadsToNotify = [match.homeSquad, match.awaySquad];
    let notifiedAny = false;

    for (const squad of squadsToNotify) {
      const telegramGroup = squad.groups.find((g: any) => g.platform === "telegram" && g.chatId);
      if (telegramGroup?.chatId) {
        await this.telegramService.sendMatchNotification(telegramGroup.chatId, message);
        notifiedAny = true;
      }
    }

    // 4. Mark match as notified in agentInsights
    const currentInsights = (match.agentInsights as any) || {};
    await prisma.match.update({
      where: { id: match.id },
      data: {
        agentInsights: {
          ...currentInsights,
          tactical_notified: true,
          notified_at: new Date().toISOString(),
          preview_insight: insight.message
        }
      }
    });

    if (notifiedAny) {
      console.log(`[TACTICAL-NOTIF] Successfully notified squads for match ${match.id}`);
    } else {
      console.log(`[TACTICAL-NOTIF] No Telegram groups found for match ${match.id}, marked as notified.`);
    }
  }
}
