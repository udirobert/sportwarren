import { createTRPCRouter } from './trpc';
import { matchRouter } from './routers/match';
import { playerRouter } from './routers/player';
import { squadRouter } from './routers/squad';
import { marketRouter } from './routers/market';
import { sessionRouter } from './routers/session';
import { authRouter } from './routers/auth';
import { agentRouter } from './routers/agent';
import { memoryRouter } from './routers/memory';
import { lensRouter } from './routers/lens';
import { communicationRouter } from './routers/communication';
import { peerRatingRouter } from './routers/peer-rating';

export const appRouter = createTRPCRouter({
  match: matchRouter,
  player: playerRouter,
  squad: squadRouter,
  market: marketRouter,
  session: sessionRouter,
  auth: authRouter,
  agent: agentRouter,
  memory: memoryRouter,
  lens: lensRouter,
  communication: communicationRouter,
  peerRating: peerRatingRouter,
});

export type AppRouter = typeof appRouter;