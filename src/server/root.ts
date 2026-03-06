import { createTRPCRouter } from './trpc';
import { matchRouter } from './routers/match';
import { playerRouter } from './routers/player';
import { squadRouter } from './routers/squad';
import { marketRouter } from './routers/market';

export const appRouter = createTRPCRouter({
  match: matchRouter,
  player: playerRouter,
  squad: squadRouter,
  market: marketRouter,
});

export type AppRouter = typeof appRouter;
