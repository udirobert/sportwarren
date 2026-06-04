/**
 * Moments service — declarative records of personalisation events.
 *
 * Every twin event that has a `momentHint` produces a `Moment` row. The
 * in-app gallery reads from this table. PNG render is *deferred* — `render`
 * is a no-op stub for PR 2; a later cron picks up unrendered rows and
 * generates share cards via satori/resvg.
 *
 * Why a row per event instead of a denormalized JSON blob on the twin:
 *   - The in-app gallery needs a list view with pagination and filters
 *   - Source event linkage (e.g. attestation id) makes moments auditable
 *   - Render can be retried without re-emitting the underlying twin event
 */

import { prisma } from '@/lib/db';
import type { MomentHint, MomentTier } from './twin-types';

export interface CreateMomentInput {
  subjectType: 'player' | 'squad';
  subjectId: string;
  hint: MomentHint;
  sourceEventId?: string;
}

export interface MomentRecord {
  id: string;
  subjectType: string;
  subjectId: string;
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  sourceEventId: string | null;
  renderedKey: string | null;
  createdAt: Date;
}

class MomentServiceImpl {
  /**
   * Insert a new moment row. Synchronous; no render.
   * Returns the persisted record so the orchestrator can include the id in
   * in-app notifications.
   */
  async create(input: CreateMomentInput): Promise<MomentRecord> {
    const row = await prisma.moment.create({
      data: {
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        kind: input.hint.kind,
        tier: input.hint.tier,
        label: input.hint.label,
        detail: input.hint.detail ?? null,
        sourceEventId: input.sourceEventId ?? input.hint.sourceEventId ?? null,
      },
    });
    return {
      id: row.id,
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      kind: row.kind,
      tier: row.tier,
      label: row.label,
      detail: row.detail,
      sourceEventId: row.sourceEventId,
      renderedKey: row.renderedKey,
      createdAt: row.createdAt,
    };
  }

  /**
   * Lazy render. PR 2 stub: returns the row unchanged. A future cron or
   * worker will pick up moments with `renderedKey: null` and generate a PNG
   * via satori/resvg, then write back `renderedKey` and `renderedAt`.
   */
  async render(momentId: string): Promise<{ renderedKey: string | null }> {
    const row = await prisma.moment.findUnique({ where: { id: momentId } });
    if (!row) throw new Error(`Moment not found: ${momentId}`);
    return { renderedKey: row.renderedKey };
  }

  /** Read API for the gallery (PR 5 consumes this). */
  async listForSubject(subjectType: 'player' | 'squad', subjectId: string, limit = 30) {
    return prisma.moment.findMany({
      where: { subjectType, subjectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const momentService = new MomentServiceImpl();
export type { MomentServiceImpl as MomentService };
export type { MomentTier };
