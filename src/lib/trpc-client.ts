/**
 * SportWarren tRPC Client
 * React Query hooks for type-safe API calls
 */

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/root';

export const trpc = createTRPCReact<AppRouter>();
