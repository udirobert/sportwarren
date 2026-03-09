import { createTRPCRouter } from './trpc';
import { matchRouter } from './routers/match';
import { playerRouter } from './routers/player';
import { squadRouter } from './routers/squad';
import { marketRouter } from './routers/market';
import { authRouter } from './routers/auth';
import { agentRouter } from './routers/agent';
import { memoryRouter } from './routers/memory';
import { lensRouter } from './routers/lens';

export const appRouter = createTRPCRouter({
  match: matchRouter,
  player: playerRouter,
  squad: squadRouter,
  market: marketRouter,
  auth: authRouter,
  agent: agentRouter,
  memory: memoryRouter,
  lens: lensRouter,
});

export type AppRouter = typeof appRouter;
