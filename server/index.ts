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
import { EventStreamService } from './services/events/kafka.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

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
  const eventStreamService = new EventStreamService();

  // Initialize advanced services
  try {
    await communicationBridge.initialize();
    await eventStreamService.initialize();
    
    // Deploy blockchain contracts
    const squadDAOAppId = await algorandService.deploySquadDAO();
    if (squadDAOAppId) {
      console.log(`Squad DAO deployed with ID: ${squadDAOAppId}`);
    } else {
      console.warn('Failed to deploy Squad DAO.');
    }

    const matchVerificationAppId = await algorandService.deployMatchVerification();
    if (matchVerificationAppId) {
      console.log(`Match Verification deployed with ID: ${matchVerificationAppId}`);
    } else {
      console.warn('Failed to deploy Match Verification.');
    }
    
    console.log('Advanced services initialized');
  } catch (error) {
    console.warn('Some advanced services failed to initialize:', error);
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
  app.get('/api/algorand/squad-dao-info', async (req, res) => {
    try {
      const daoInfo = await algorandService.getSquadDAOInfo();
      res.json({ daoInfo });
    } catch (error) {
      console.error('DAO info error:', error);
      res.status(500).json({ error: 'Failed to get DAO info' });
    }
  });

  app.get('/api/algorand/proposals', async (req, res) => {
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

  // Health check endpoint
  app.get('/health', (req, res) => {
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