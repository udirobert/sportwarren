import { createTRPCRouter } from './trpc';
import { matchRouter } from './routers/match';
import { playerRouter } from './routers/player';
import { squadRouter } from './routers/squad';
import { marketRouter } from './routers/market';
import { authRouter } from './routers/auth';
import { agentRouter } from './routers/agent';

export const appRouter = createTRPCRouter({
  match: matchRouter,
  player: playerRouter,
  squad: squadRouter,
  market: marketRouter,
  auth: authRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
