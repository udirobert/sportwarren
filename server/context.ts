import { Request } from 'express';
import { IncomingMessage } from 'http';
import { DatabaseService } from './services/database.js';
import { RedisService } from './services/redis.js';
import { AuthService } from './services/auth.js';
import { SocketService } from './services/socket.js';
import { CommunicationBridge } from './services/communication/bridge.js';
import { VoiceProcessingService } from '../src/server/services/ai/voice.js';
import { ComputerVisionService } from '../src/server/services/ai/vision.js';
import { AlgorandService } from './services/blockchain/algorand.js';
import { EventStreamService } from './services/events/kafka.js';
import { LensService } from './services/communication/lens.js';

export interface Context {
  req: Request | IncomingMessage;
  user?: {
    id: string;
    email: string;
    role: string;
    walletAddress?: string;
  };
  services: {
    dbService: DatabaseService;
    redisService: RedisService;
    authService: AuthService;
    socketService?: SocketService;
    communicationBridge?: CommunicationBridge;
    voiceService?: VoiceProcessingService;
    visionService?: ComputerVisionService;
    algorandService?: AlgorandService;
    eventStreamService?: EventStreamService;
    lensService?: LensService;
  };
}

export async function createContext({ req, services }: {
  req: Request | IncomingMessage;
  services: {
    dbService: DatabaseService;
    redisService: RedisService;
    authService: AuthService;
    socketService?: SocketService;
    communicationBridge?: CommunicationBridge;
    voiceService?: VoiceProcessingService;
    visionService?: ComputerVisionService;
    algorandService?: AlgorandService;
    eventStreamService?: EventStreamService;
    lensService?: LensService;
  };
}): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  let user;

  if (token) {
    try {
      user = await services.authService.verifyToken(token);
    } catch (error) {
      console.warn('Invalid token:', error);
    }
  }

  return {
    req,
    user,
    services,
  };
}
