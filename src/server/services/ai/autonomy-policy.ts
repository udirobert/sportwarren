/**
 * Autonomy Policy — central authority for what agents can do without human approval.
 *
 * Levels:
 *   observe    — read-only: search, status, budget. No spending, hiring, or payments.
 *   integrate  — can scout (with optional confirmation). No hiring or payments.
 *   automate   — full spending authority within budget limits (default).
 *
 * Per-squad overrides are stored in Redis and can be set via WhatsApp `autonomy` command
 * or the squad settings UI. Time-windowed overrides (e.g., match-day automation) are
 * managed by the autonomy-window cron.
 */
import { prisma } from '@/lib/db';
import { redisService } from '../redis';

export type AutonomyLevel = 'observe' | 'integrate' | 'automate';

export type ActionType = 'scout' | 'hire' | 'pay' | 'search' | 'status' | 'budget' | 'chat';

export interface ActionDecision {
  allowed: boolean;
  reason?: string;
  requiresConfirmation: boolean;
}

/** Structured audit payload for every evaluateAction call. */
export interface AutonomyAuditEntry {
  squadId: string;
  action: ActionType;
  level: AutonomyLevel;
  requiredLevel: AutonomyLevel;
  allowed: boolean;
  requiresConfirmation: boolean;
  reason?: string;
  triggeredBy?: string;
}

// ── Global config from env ────────────────────────────────────────────

const ENV_LEVEL = (process.env.AUTONOMY_LEVEL || 'automate').trim().toLowerCase() as AutonomyLevel;
const VALID_LEVELS: AutonomyLevel[] = ['observe', 'integrate', 'automate'];
const GLOBAL_LEVEL: AutonomyLevel = VALID_LEVELS.includes(ENV_LEVEL) ? ENV_LEVEL : 'automate';

const REQUIRE_CONFIRMATION = process.env.KITE_REQUIRE_CONFIRMATION === 'true';

// ── Per-action minimum autonomy required (defaults) ───────────────────

const ACTION_MIN_LEVEL: Record<ActionType, AutonomyLevel> = {
  search: 'observe',
  status: 'observe',
  budget: 'observe',
  chat: 'observe',
  scout: 'integrate',
  hire: 'automate',
  pay: 'automate',
};

// ── Redis keys ────────────────────────────────────────────────────────

function squadLevelKey(squadId: string): string {
  return `autonomy:squad:${squadId}:level`;
}
function squadConfirmKey(squadId: string): string {
  return `autonomy:squad:${squadId}:require_confirmation`;
}
function actionOverrideKey(squadId: string, action: ActionType): string {
  return `autonomy:squad:${squadId}:action:${action}:min_level`;
}
function windowOverrideKey(squadId: string): string {
  return `autonomy:squad:${squadId}:window`;
}

const ALL_ACTIONS: ActionType[] = ['search', 'status', 'budget', 'chat', 'scout', 'hire', 'pay'];

function levelRank(level: AutonomyLevel): number {
  if (level === 'automate') return 2;
  if (level === 'integrate') return 1;
  return 0;
}

// ── Service ───────────────────────────────────────────────────────────

export class AutonomyPolicy {
  // -----------------------------------------------------------------------
  // Squad-level override
  // -----------------------------------------------------------------------

  async getSquadLevel(squadId: string): Promise<AutonomyLevel> {
    // Window override takes highest precedence
    try {
      const windowData = await redisService.get(windowOverrideKey(squadId));
      if (windowData) {
        const parsed = JSON.parse(windowData) as { level: AutonomyLevel; expiresAt: number };
        if (parsed.expiresAt > Date.now() && VALID_LEVELS.includes(parsed.level)) {
          return parsed.level;
        }
        await redisService.del(windowOverrideKey(squadId));
      }
    } catch { /* redis optional */ }

    try {
      const override = await redisService.get(squadLevelKey(squadId));
      if (override && VALID_LEVELS.includes(override as AutonomyLevel)) {
        return override as AutonomyLevel;
      }
    } catch { /* redis optional */ }
    return GLOBAL_LEVEL;
  }

  async setSquadLevel(squadId: string, level: AutonomyLevel): Promise<void> {
    if (!VALID_LEVELS.includes(level)) throw new Error(`Invalid autonomy level: ${level}`);
    await redisService.set(squadLevelKey(squadId), level, 0);
  }

  async clearSquadLevel(squadId: string): Promise<void> {
    await redisService.del(squadLevelKey(squadId));
  }

  /** Set a temporary window override (used by autonomy-window cron). */
  async setWindowOverride(squadId: string, level: AutonomyLevel, ttlSeconds: number): Promise<void> {
    const data = { level, expiresAt: Date.now() + ttlSeconds * 1000 };
    await redisService.set(windowOverrideKey(squadId), JSON.stringify(data), ttlSeconds);
  }

  async clearWindowOverride(squadId: string): Promise<void> {
    await redisService.del(windowOverrideKey(squadId));
  }

  // -----------------------------------------------------------------------
  // Confirmation requirement
  // -----------------------------------------------------------------------

  async squadRequiresConfirmation(squadId: string): Promise<boolean> {
    try {
      const override = await redisService.get(squadConfirmKey(squadId));
      if (override !== null) return override === 'true';
    } catch { /* redis optional */ }
    return REQUIRE_CONFIRMATION;
  }

  async setSquadConfirmation(squadId: string, required: boolean): Promise<void> {
    await redisService.set(squadConfirmKey(squadId), required ? 'true' : 'false', 0);
  }

  // -----------------------------------------------------------------------
  // Per-action override (fine-grained control)
  // -----------------------------------------------------------------------

  /** Resolve the minimum level required for a specific action on a squad. */
  async getActionMinLevel(squadId: string, action: ActionType): Promise<AutonomyLevel> {
    const key = actionOverrideKey(squadId, action);
    try {
      const override = await redisService.get(key);
      if (override && VALID_LEVELS.includes(override as AutonomyLevel)) {
        return override as AutonomyLevel;
      }
    } catch { /* redis optional */ }
    return ACTION_MIN_LEVEL[action];
  }

  async setActionMinLevel(squadId: string, action: ActionType, level: AutonomyLevel): Promise<void> {
    if (!VALID_LEVELS.includes(level)) throw new Error(`Invalid autonomy level: ${level}`);
    await redisService.set(actionOverrideKey(squadId, action), level, 0);
  }

  async clearActionMinLevel(squadId: string, action: ActionType): Promise<void> {
    await redisService.del(actionOverrideKey(squadId, action));
  }

  /** Get all per-action overrides for a squad. */
  async getActionOverrides(squadId: string): Promise<Record<ActionType, AutonomyLevel>> {
    const overrides: Record<string, AutonomyLevel> = {};
    for (const action of ALL_ACTIONS) {
      try {
        const val = await redisService.get(actionOverrideKey(squadId, action));
        if (val && VALID_LEVELS.includes(val as AutonomyLevel)) {
          overrides[action] = val as AutonomyLevel;
        }
      } catch { /* skip */ }
    }
    return overrides as Record<ActionType, AutonomyLevel>;
  }

  // -----------------------------------------------------------------------
  // Bulk config for UI
  // -----------------------------------------------------------------------

  /** Get the full autonomy config for a squad (for the settings panel). */
  async getSquadConfig(squadId: string): Promise<{
    level: AutonomyLevel;
    requiresConfirmation: boolean;
    actionOverrides: Partial<Record<ActionType, AutonomyLevel>>;
  }> {
    const [level, requiresConfirmation, actionOverrides] = await Promise.all([
      this.getSquadLevel(squadId),
      this.squadRequiresConfirmation(squadId),
      this.getActionOverrides(squadId),
    ]);
    return { level, requiresConfirmation, actionOverrides };
  }

  /** Delete all autonomy config for a squad (reset to defaults). */
  async resetSquadConfig(squadId: string): Promise<void> {
    await Promise.all([
      this.clearSquadLevel(squadId),
      redisService.del(squadConfirmKey(squadId)),
      this.clearWindowOverride(squadId),
      ...ALL_ACTIONS.map((a) => this.clearActionMinLevel(squadId, a)),
    ]);
  }

  // -----------------------------------------------------------------------
  // Evaluate action (core decision)
  // -----------------------------------------------------------------------

  async evaluateAction(
    squadId: string,
    action: ActionType,
  ): Promise<ActionDecision> {
    const [level, required] = await Promise.all([
      this.getSquadLevel(squadId),
      this.getActionMinLevel(squadId, action),
    ]);
    const effectiveLevel = levelRank(level);
    const minLevel = levelRank(required);

    if (effectiveLevel < minLevel) {
      return {
        allowed: false,
        reason: `Action "${action}" requires autonomy level "${required}", squad is "${level}".`,
        requiresConfirmation: false,
      };
    }

    const spendingActions: ActionType[] = ['scout', 'hire', 'pay'];
    const isSpending = spendingActions.includes(action);

    if (isSpending) {
      const needsConfirm = await this.squadRequiresConfirmation(squadId);
      return {
        allowed: true,
        requiresConfirmation: needsConfirm,
        reason: needsConfirm ? `This will cost USDC. Reply \`yes\` to confirm.` : undefined,
      };
    }

    return { allowed: true, requiresConfirmation: false };
  }

  // -----------------------------------------------------------------------
  // Audit trail
  // -----------------------------------------------------------------------

  /** Persist an evaluateAction decision as an Attestation row. */
  async recordDecision(entry: AutonomyAuditEntry): Promise<void> {
    try {
      await prisma.attestation.create({
        data: {
          subjectType: 'squad',
          subjectId: entry.squadId,
          kind: `autonomy:${entry.action}`,
          payload: {
            action: entry.action,
            level: entry.level,
            requiredLevel: entry.requiredLevel,
            allowed: entry.allowed,
            requiresConfirmation: entry.requiresConfirmation,
            reason: entry.reason ?? null,
            triggeredBy: entry.triggeredBy ?? null,
          },
        },
      });
    } catch (err) {
      console.warn('[AutonomyPolicy] failed to record decision:', err);
    }
  }

  /** Convenience: evaluate + audit in one call. */
  async evaluateAndRecord(
    squadId: string,
    action: ActionType,
    triggeredBy?: string,
  ): Promise<ActionDecision> {
    const [level, required] = await Promise.all([
      this.getSquadLevel(squadId),
      this.getActionMinLevel(squadId, action),
    ]);
    const decision = await this.evaluateAction(squadId, action);
    await this.recordDecision({
      squadId,
      action,
      level,
      requiredLevel: required,
      allowed: decision.allowed,
      requiresConfirmation: decision.requiresConfirmation,
      reason: decision.reason,
      triggeredBy,
    });
    return decision;
  }

  // -----------------------------------------------------------------------
  // Utils
  // -----------------------------------------------------------------------

  isConfirmed(reply: string): boolean {
    const normalized = reply.trim().toLowerCase();
    return ['yes', 'y', 'confirm', 'yeah', 'sure', 'ok', 'do it', 'proceed', 'go ahead'].includes(normalized);
  }

  /** Human-readable level name. */
  levelLabel(level: AutonomyLevel): string {
    switch (level) {
      case 'observe': return '🔍 Observe (read-only)';
      case 'integrate': return '🔗 Integrate (scout only)';
      case 'automate': return '🤖 Automate (full spend)';
    }
  }
}

export const autonomyPolicy = new AutonomyPolicy();
