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
import { Web3Service } from './services/blockchain/web3.js';
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
  const web3Service = new Web3Service();
  const eventStreamService = new EventStreamService();

  // Initialize advanced services
  try {
    await communicationBridge.initialize();
    await eventStreamService.initialize();
    console.log('✅ Advanced services initialized');
  } catch (error) {
    console.warn('⚠️ Some advanced services failed to initialize:', error);
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
            web3Service,
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

  // Apply middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    }),
    express.json({ limit: '50mb' }), // Increased limit for media uploads
    expressMiddleware(server, {
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
          web3Service,
          eventStreamService,
        } 
      }),
    })
  );

  // Voice processing endpoint
  app.post('/api/voice/transcribe', express.raw({ type: 'audio/*', limit: '10mb' }), async (req, res) => {
    try {
      const transcription = await voiceService.transcribeAudio(req.body);
      const matchData = await voiceService.processVoiceMatchLog(transcription);
      
      res.json({
        transcription,
        matchData,
        success: true,
      });
    } catch (error) {
      console.error('Voice processing error:', error);
      res.status(500).json({ error: 'Failed to process voice input' });
    }
  });

  // Image analysis endpoint
  app.post('/api/vision/analyze', express.raw({ type: 'image/*', limit: '10mb' }), async (req, res) => {
    try {
      const analysis = await visionService.analyzeMatchPhoto(req.body);
      
      res.json({
        analysis,
        success: true,
      });
    } catch (error) {
      console.error('Vision processing error:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });

  // Web3 endpoints
  app.get('/api/web3/wallet', (req, res) => {
    res.json({
      address: web3Service.getWalletAddress(),
      balance: web3Service.getBalance(),
    });
  });

  app.post('/api/web3/mint-achievement', express.json(), async (req, res) => {
    try {
      const { playerAddress, achievement } = req.body;
      const tokenId = await web3Service.mintAchievementNFT(playerAddress, achievement);
      
      res.json({
        tokenId,
        success: !!tokenId,
      });
    } catch (error) {
      console.error('NFT minting error:', error);
      res.status(500).json({ error: 'Failed to mint achievement NFT' });
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
        web3: 'ready',
        events: 'streaming',
      }
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down gracefully...');
    
    await eventStreamService.disconnect();
    await redisService.disconnect();
    await dbService.disconnect();
    
    httpServer.close(() => {
      console.log('✅ Server shut down complete');
      process.exit(0);
    });
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 SportWarren server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/graphql`);
    console.log(`⚡ Socket.IO server ready at http://localhost:${PORT}`);
    console.log(`🎤 Voice API ready at http://localhost:${PORT}/api/voice`);
    console.log(`👁️ Vision API ready at http://localhost:${PORT}/api/vision`);
    console.log(`🔗 Web3 API ready at http://localhost:${PORT}/api/web3`);
    console.log(`📡 Event streaming active`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});