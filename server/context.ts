import { Request } from 'express';
import { DatabaseService } from './services/database.js';
import { RedisService } from './services/redis.js';
import { AuthService } from './services/auth.js';
import { SocketService } from './services/socket.js';
import { CommunicationBridge } from './services/communication/bridge.js';
import { VoiceProcessingService } from './services/ai/voice.js';
import { ComputerVisionService } from './services/ai/vision.js';
import { Web3Service } from './services/blockchain/web3.js';
import { EventStreamService } from './services/events/kafka.js';

export interface Context {
  req: Request;
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
    web3Service?: Web3Service;
    eventStreamService?: EventStreamService;
  };
}

export async function createContext({ req, services }: {
  req: Request;
  services: {
    dbService: DatabaseService;
    redisService: RedisService;
    authService: AuthService;
    socketService?: SocketService;
    communicationBridge?: CommunicationBridge;
    voiceService?: VoiceProcessingService;
    visionService?: ComputerVisionService;
    web3Service?: Web3Service;
    eventStreamService?: EventStreamService;
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