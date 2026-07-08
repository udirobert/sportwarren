import { Server as SocketIOServer } from 'socket.io';
import type { PrismaClient } from '@prisma/client';

export class SocketService {
  private io: SocketIOServer;
  private prisma?: PrismaClient;

  constructor(io: SocketIOServer, prisma?: PrismaClient) {
    this.io = io;
    this.prisma = prisma;
    this.setupEventHandlers();
  }

  /**
   * Verify the caller holds a preview token (walletAddress) belonging to
   * a member of the squad. The `squad:{id}` room carries teammates' first
   * names + live perception activity, so an unauthenticated join would
   * leak the group's activity to anyone who guesses a squadId. Fail
   * closed: if the check errors or no prisma is wired, deny.
   */
  private async isSquadMember(token: string, squadId: string): Promise<boolean> {
    if (!this.prisma) {
      console.error('🚫 join-squad auth unavailable: no prisma client injected');
      return false;
    }
    try {
      const member = await this.prisma.squadMember.findFirst({
        where: { squadId, user: { walletAddress: token } },
        select: { id: true },
      });
      return member !== null;
    } catch (err) {
      console.error('🚫 join-squad auth check failed:', err);
      return false;
    }
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Join match room for live updates
      socket.on('join-match', (matchId: string) => {
        socket.join(`match:${matchId}`);
        console.log(`👤 User ${socket.id} joined match ${matchId}`);
      });

      // Leave match room
      socket.on('leave-match', (matchId: string) => {
        socket.leave(`match:${matchId}`);
        console.log(`👤 User ${socket.id} left match ${matchId}`);
      });

      // Join squad room for updates — membership-gated. Requires a preview
      // token (walletAddress) whose holder is a member of the squad. Bare
      // string joins (the old unauthenticated shape) are rejected.
      socket.on('join-squad', async (payload: { squadId?: string; token?: string } | string) => {
        const squadId = typeof payload === 'string' ? payload : payload?.squadId;
        const token = typeof payload === 'string' ? undefined : payload?.token;

        if (!squadId || !token) {
          socket.emit('join-squad-denied', { squadId: squadId ?? null, reason: 'auth_required' });
          console.warn(`🚫 join-squad denied (no token) for socket ${socket.id}`);
          return;
        }

        const authorized = await this.isSquadMember(token, squadId);
        if (!authorized) {
          socket.emit('join-squad-denied', { squadId, reason: 'not_a_member' });
          console.warn(`🚫 join-squad denied (not a member) squad ${squadId}, socket ${socket.id}`);
          return;
        }

        socket.join(`squad:${squadId}`);
        console.log(`👤 User ${socket.id} joined squad ${squadId}`);
      });

      // Leave squad room
      socket.on('leave-squad', (squadId: string) => {
        socket.leave(`squad:${squadId}`);
        console.log(`👤 User ${socket.id} left squad ${squadId}`);
      });

      // Handle live match events
      socket.on('match-event', (data) => {
        this.broadcastMatchEvent(data.matchId, data.event);
      });

      // Handle live score updates
      socket.on('score-update', (data) => {
        this.broadcastScoreUpdate(data.matchId, data.score);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast match events to all users in the match room
  broadcastMatchEvent(matchId: string, event: any): void {
    this.io.to(`match:${matchId}`).emit('match-event', {
      matchId,
      event,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast score updates
  broadcastScoreUpdate(matchId: string, score: any): void {
    this.io.to(`match:${matchId}`).emit('score-update', {
      matchId,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast squad updates
  broadcastSquadUpdate(squadId: string, update: any): void {
    this.io.to(`squad:${squadId}`).emit('squad-update', {
      squadId,
      update,
      timestamp: new Date().toISOString(),
    });
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any): void {
    this.io.emit('notification', {
      userId,
      notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast achievement unlock
  broadcastAchievement(userId: string, achievement: any): void {
    this.io.emit('achievement-unlocked', {
      userId,
      achievement,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.io.engine.clientsCount;
  }

  // Get users in a specific room
  async getUsersInRoom(room: string): Promise<string[]> {
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(socket => socket.id);
  }
}