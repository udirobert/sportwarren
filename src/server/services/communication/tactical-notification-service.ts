
import { prisma } from "@/lib/db";
import { TelegramService } from "./telegram";
import { INTEL_LEVELS, getIntelLevel } from "@/lib/match/intel-disclosure";
import { managerInsightService } from "../ai/manager-insights";

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
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Find matches in the next 7 days that are still pending
    const upcomingMatches = await prisma.match.findMany({
      where: {
        matchDate: {
          gt: now,
          lte: sevenDaysFromNow,
        },
        status: "pending",
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

    console.log(`[TACTICAL-NOTIF] Found ${upcomingMatches.length} matches in 7-day window.`);

    for (const match of upcomingMatches) {
      try {
        const intelLevel = getIntelLevel(match.matchDate, now);
        const agentInsights = (match.agentInsights as any) || {};
        const lastNotifiedLevel = agentInsights.last_notified_intel_level ?? -1;

        if (intelLevel > lastNotifiedLevel) {
          await this.notifyMatchAtLevel(match, intelLevel);
        }
      } catch (err) {
        console.error(`[TACTICAL-NOTIF] Failed to process match ${match.id}:`, err);
      }
    }
  }

  private async notifyMatchAtLevel(match: any, level: number) {
    // 1. Generate Insight via AI (ManagerInsightService)
    const insight = await managerInsightService.generateTacticalPreview(
      match.homeSquad,
      match.awaySquad
    );

    if (!insight) {
      console.warn(`[TACTICAL-NOTIF] Could not generate insight for match ${match.id}`);
      return;
    }

    let title = `🛡️ *Tactical Briefing*`;
    let detail = "";

    switch (level) {
      case INTEL_LEVELS.BASIC:
        title = `⚽ *New Opponent Revealed*`;
        detail = `Next up: *${match.homeSquad.name}* vs *${match.awaySquad.name}*.\nTime to start studying the tape!`;
        break;
      case INTEL_LEVELS.SQUAD:
        title = `📋 *Squad Intelligence Unlock*`;
        detail = `We've got their likely formation and lineup. Check the PitchCanvas for details.`;
        break;
      case INTEL_LEVELS.SCOUTING:
        title = `🔍 *Scouting Report Ready*`;
        detail = `Key threats and opportunities identified. AI Staff has highlighted their weak spots.`;
        break;
      case INTEL_LEVELS.TACTICAL:
        title = `🧠 *Tactical DNA Finalized*`;
        detail = `Coach Kite has a specific game plan for this matchup. review it before kick-off!`;
        break;
      case INTEL_LEVELS.FULL:
        title = `🔥 *Match Day: Final Briefing*`;
        detail = `Win probabilities are in. ${insight.message}`;
        break;
    }

    // 2. Format the Telegram message
    const message = [
      title,
      `🆚 *${match.homeSquad.name}* vs *${match.awaySquad.name}*`,
      `⏰ Kickoff: ${match.matchDate.toLocaleDateString()} ${match.matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      '',
      detail,
      '',
      `🔗 [Open Match Preview in Mini App](https://t.me/sportwarren_bot/app?startapp=match_${match.id})`,
    ].join("\n");

    // 3. Send to both squads
    const squadsToNotify = [match.homeSquad, match.awaySquad];
    for (const squad of squadsToNotify) {
      const telegramGroup = squad.groups.find((g: any) => g.platform === "telegram" && g.chatId);
      if (telegramGroup?.chatId) {
        await this.telegramService.sendMatchNotification(telegramGroup.chatId, message);
      }
    }

    // 4. Update notified level
    const currentInsights = (match.agentInsights as any) || {};
    await prisma.match.update({
      where: { id: match.id },
      data: {
        agentInsights: {
          ...currentInsights,
          last_notified_intel_level: level,
          [`notified_level_${level}_at`]: new Date().toISOString(),
        }
      }
    });

    console.log(`[TACTICAL-NOTIF] Notified level ${level} for match ${match.id}`);
  }
}
