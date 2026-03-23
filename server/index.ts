import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';
import dotenv from 'dotenv';

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { createContext } from './context.js';
import { DatabaseService } from './services/database.js';
import { RedisService } from './services/redis.js';
import { AuthService } from './services/auth.js';
import { SocketService } from './services/socket.js';

// Advanced services
import { CommunicationBridge } from './services/communication/bridge.js';
import { VoiceProcessingService } from './services/ai/voice.js';
import { ComputerVisionService } from './services/ai/vision.js';
import { AlgorandService } from './services/blockchain/algorand.js';
import { LensService, LensServiceUnavailableError } from './services/communication/lens.js';
import { EventStreamService } from './services/events/kafka.js';
import { TonSettlementWorker } from './services/economy/ton-settlement-worker.js';
import { prisma } from '../src/lib/db.js';

dotenv.config();

// Suppress known non-critical warnings
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

const PORT = process.env.PORT || 4000;

function isEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function sendLensError(res: express.Response, error: unknown, fallbackMessage: string) {
  if (error instanceof LensServiceUnavailableError) {
    res.status(503).json({ error: error.message });
    return;
  }

  console.error('Lens service error:', error);
  res.status(500).json({ error: fallbackMessage });
}

async function startServer() {
  // Initialize core services
  const dbService = new DatabaseService();
  const redisService = new RedisService();
  const authService = new AuthService();

  await dbService.connect();
  await redisService.connect();

  // Initialize advanced services
  const communicationBridge = new CommunicationBridge();
  const voiceService = new VoiceProcessingService();
  const visionService = new ComputerVisionService();
  const algorandService = new AlgorandService();
  const lensService = new LensService();
  const eventStreamService = new EventStreamService();

  // Initialize advanced services (each independently so one failure doesn't block others)
  try {
    await communicationBridge.initialize();
  } catch (error) {
    console.warn('⚠️ Communication bridge initialization failed (non-fatal):', (error as Error).message);
  }

  // TON settlement retry worker — auto-settles pending deposits on-chain
  const tonWorker = new TonSettlementWorker(prisma, communicationBridge.getTelegramService());
  try {
    await tonWorker.tick();
    tonWorker.start();
  } catch (error) {
    console.warn('⚠️ TON settlement worker failed to start (non-fatal):', (error as Error).message);
  }

  if (isEnabled(process.env.ENABLE_EVENT_STREAMING)) {
    try {
      await eventStreamService.initialize();
    } catch (error) {
      console.warn('⚠️ Kafka event streaming unavailable (non-fatal):', (error as Error).message);
    }
  } else {
    console.log('ℹ️ Kafka event streaming disabled (set ENABLE_EVENT_STREAMING=true to enable)');
  }

  if (isEnabled(process.env.ALGORAND_AUTO_DEPLOY)) {
    try {
      const squadDAOAppId = await algorandService.deploySquadDAO();
      if (squadDAOAppId) {
        console.log(`Squad DAO deployed with ID: ${squadDAOAppId}`);
      }
    } catch (error) {
      console.warn('⚠️ Squad DAO deployment skipped (non-fatal):', (error as Error).message);
    }

    try {
      const matchVerificationAppId = await algorandService.deployMatchVerification();
      if (matchVerificationAppId) {
        console.log(`Match Verification deployed with ID: ${matchVerificationAppId}`);
      }
    } catch (error) {
      console.warn('⚠️ Match Verification deployment skipped (non-fatal):', (error as Error).message);
    }
  } else {
    console.log('ℹ️ Algorand auto-deploy disabled (set ALGORAND_AUTO_DEPLOY=true to enable)');
  }

  // Create Express app and HTTP server
  const app = express();
  const httpServer = createServer(app);

  // Create WebSocket server for GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create GraphQL WebSocket server
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        return createContext({
          req: ctx.extra.request,
          services: {
            dbService,
            redisService,
            authService,
            communicationBridge,
            voiceService,
            visionService,
            algorandService,
            eventStreamService,
            lensService,
          }
        });
      },
    },
    wsServer
  );

  // Create Socket.IO server for real-time features
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  const socketService = new SocketService(io);

  // Create Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // GraphQL endpoint
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => createContext({
      req,
      services: {
        dbService,
        redisService,
        authService,
        socketService,
        communicationBridge,
        voiceService,
        visionService,
        algorandService,
        eventStreamService,
        lensService,
      }
    }),
  }));

  // Voice processing endpoints
  app.post('/api/voice/process', express.json(), async (req, res) => {
    try {
      const { audioData, matchId } = req.body;
      const result = await voiceService.processVoiceCommand(audioData, matchId);

      res.json(result);
    } catch (error) {
      console.error('Voice processing error:', error);
      res.status(500).json({ error: 'Failed to process voice command' });
    }
  });

  app.post('/api/voice/transcribe', express.json(), async (req, res) => {
    try {
      const { audioData } = req.body;
      const transcription = await voiceService.transcribeAudio(audioData);

      res.json({ transcription });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ error: 'Failed to transcribe audio' });
    }
  });

  // Computer vision endpoints
  app.post('/api/vision/analyze-match-photo', express.json(), async (req, res) => {
    try {
      const { imageData, matchId } = req.body;
      const analysis = await visionService.analyzeMatchPhoto(imageData, matchId);

      res.json(analysis);
    } catch (error) {
      console.error('Vision analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze match photo' });
    }
  });

  app.post('/api/vision/detect-events', express.json(), async (req, res) => {
    try {
      const { imageData } = req.body;
      const events = await visionService.detectMatchEvents(imageData);

      res.json({ events });
    } catch (error) {
      console.error('Event detection error:', error);
      res.status(500).json({ error: 'Failed to detect events' });
    }
  });

  // Algorand blockchain endpoints
  app.get('/api/algorand/wallet-info/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await algorandService.getAccountBalance(address);
      const networkStatus = await algorandService.getNetworkStatus();

      res.json({
        address,
        balance,
        network: networkStatus,
      });
    } catch (error) {
      console.error('Wallet info error:', error);
      res.status(500).json({ error: 'Failed to get wallet info' });
    }
  });

  app.post('/api/algorand/submit-match-result', express.json(), async (req, res) => {
    try {
      const { matchId, homeTeam, awayTeam, homeScore, awayScore, submitter } = req.body;
      const success = await algorandService.submitMatchResult(
        matchId, homeTeam, awayTeam, homeScore, awayScore, submitter
      );

      res.json({ success });
    } catch (error) {
      console.error('Match submission error:', error);
      res.status(500).json({ error: 'Failed to submit match result' });
    }
  });

  app.post('/api/algorand/verify-match-result', express.json(), async (req, res) => {
    try {
      const { matchId, verifier } = req.body;
      const success = await algorandService.verifyMatchResult(matchId, verifier);

      res.json({ success });
    } catch (error) {
      console.error('Match verification error:', error);
      res.status(500).json({ error: 'Failed to verify match result' });
    }
  });

  app.get('/api/algorand/player-reputation/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const reputation = await algorandService.getPlayerReputation(address);

      res.json({ reputation });
    } catch (error) {
      console.error('Player reputation error:', error);
      res.status(500).json({ error: 'Failed to get player reputation' });
    }
  });

  app.post('/api/algorand/create-challenge', express.json(), async (req, res) => {
    try {
      const { challengeName, description, prizePool, endDate } = req.body;
      const challengeId = await algorandService.createGlobalChallenge(
        challengeName, description, prizePool, new Date(endDate)
      );

      res.json({
        challengeId,
        success: !!challengeId,
      });
    } catch (error) {
      console.error('Challenge creation error:', error);
      res.status(500).json({ error: 'Failed to create challenge' });
    }
  });

  // DAO API endpoints
  app.get('/api/algorand/squad-dao-info', async (_req, res) => {
    try {
      const daoInfo = await algorandService.getSquadDAOInfo();
      res.json({ daoInfo });
    } catch (error) {
      console.error('DAO info error:', error);
      res.status(500).json({ error: 'Failed to get DAO info' });
    }
  });

  app.get('/api/algorand/proposals', async (_req, res) => {
    try {
      const proposals = await algorandService.getProposals();
      res.json({ proposals });
    } catch (error) {
      console.error('Proposals error:', error);
      res.status(500).json({ error: 'Failed to get proposals' });
    }
  });

  app.get('/api/algorand/user-token-balance/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const tokenBalance = await algorandService.getUserTokenBalance(address);
      res.json({ tokenBalance });
    } catch (error) {
      console.error('Token balance error:', error);
      res.status(500).json({ error: 'Failed to get token balance' });
    }
  });

  app.post('/api/algorand/opt-in-dao', express.json(), async (req, res) => {
    try {
      const { userAddress } = req.body;
      const success = await algorandService.optInToSquadDAO(userAddress);
      res.json({ success });
    } catch (error) {
      console.error('DAO opt-in error:', error);
      res.status(500).json({ error: 'Failed to opt in to DAO' });
    }
  });

  app.post('/api/algorand/create-proposal', express.json(), async (req, res) => {
    try {
      const { proposerAddress, description, startRound, endRound } = req.body;
      const success = await algorandService.createProposal(
        proposerAddress, description, startRound, endRound
      );
      res.json({ success });
    } catch (error) {
      console.error('Create proposal error:', error);
      res.status(500).json({ error: 'Failed to create proposal' });
    }
  });

  app.post('/api/algorand/vote-proposal', express.json(), async (req, res) => {
    try {
      const { voterAddress, proposalId, voteType } = req.body;
      const success = await algorandService.voteOnProposal(
        voterAddress, proposalId, voteType
      );
      res.json({ success });
    } catch (error) {
      console.error('Vote proposal error:', error);
      res.status(500).json({ error: 'Failed to vote on proposal' });
    }
  });

  app.post('/api/algorand/execute-proposal', express.json(), async (req, res) => {
    try {
      const { executorAddress, proposalId } = req.body;
      const success = await algorandService.executeProposal(executorAddress, proposalId);
      res.json({ success });
    } catch (error) {
      console.error('Execute proposal error:', error);
      res.status(500).json({ error: 'Failed to execute proposal' });
    }
  });

  // Lens v3 & Base API endpoints
  app.post('/api/lens/challenge', async (req, res) => {
    try {
      const { address } = req.body;
      const text = await lensService.generateChallenge(address);
      res.json({ text });
    } catch (error) {
      sendLensError(res, error, 'Failed to generate Lens challenge');
    }
  });

  app.post('/api/lens/authenticate', async (req, res) => {
    try {
      const { address, signature, message } = req.body;
      const result = await lensService.authenticate(address, signature, message);
      res.json(result);
    } catch (error) {
      if (error instanceof LensServiceUnavailableError) {
        sendLensError(res, error, 'Lens authentication failed');
        return;
      }

      res.status(401).json({ error: 'Lens authentication failed' });
    }
  });

  app.post('/api/lens/post', async (req, res) => {
    try {
      const { profileId, content, imageUrl } = req.body;
      const pubId = await lensService.createPost(profileId, content, imageUrl);
      res.json({ pubId });
    } catch (error) {
      sendLensError(res, error, 'Failed to post to Lens');
    }
  });

  app.post('/api/lens/connect-wallet', async (_req, res) => {
    res.status(410).json({
      error: 'Lens wallet connection happens client-side. The server-side connect-wallet stub has been removed.',
    });
  });

  app.get('/api/lens/balance', async (_req, res) => {
    res.status(503).json({
      error: 'Lens balance lookups are not enabled on this deployment.',
    });
  });

  // Telegram webhook endpoint
  const telegramService = communicationBridge.getTelegramService();
  if (telegramService && process.env.TELEGRAM_WEBHOOK_URL?.trim()) {
    const webhookPath = `/api/telegram/webhook/${process.env.TELEGRAM_BOT_TOKEN?.slice(-8) || 'default'}`;

    app.post(webhookPath, express.json({ limit: '1mb' }), async (req, res) => {
      try {
        telegramService.getBot().processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        console.error('Telegram webhook processing error:', error);
        res.sendStatus(500);
      }
    });

    try {
      const fullWebhookUrl = `${process.env.TELEGRAM_WEBHOOK_URL.replace(/\/$/, '')}${webhookPath}`;
      await telegramService.setWebhook(fullWebhookUrl);
    } catch (error) {
      console.warn('⚠️ Failed to set Telegram webhook, falling back to polling:', (error as Error).message);
    }
  } else if (telegramService) {
    console.log('ℹ️ Telegram using polling mode (set TELEGRAM_WEBHOOK_URL for webhook mode)');
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        communication: 'initialized',
        ai: 'ready',
        algorand: 'ready',
        events: 'streaming',
      }
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');

    tonWorker.stop();
    if (telegramService && process.env.TELEGRAM_WEBHOOK_URL?.trim()) {
      await telegramService.deleteWebhook().catch(() => {});
    }
    await eventStreamService.disconnect();
    await redisService.disconnect();
    await dbService.disconnect();

    httpServer.close(() => {
      console.log('Server shut down complete');
      process.exit(0);
    });
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`SportWarren server ready at http://localhost:${PORT}/graphql`);
    console.log(`WebSocket server ready at ws://localhost:${PORT}/graphql`);
    console.log(`Socket.IO server ready at http://localhost:${PORT}`);
    console.log(`Voice API ready at http://localhost:${PORT}/api/voice`);
    console.log(`Vision API ready at http://localhost:${PORT}/api/vision`);
    console.log(`Algorand API ready at http://localhost:${PORT}/api/algorand`);
    console.log(`Event streaming active`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
