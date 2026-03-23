'use client';

import type { ReactNode } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

interface TelegramMiniAppProvidersProps {
  children: ReactNode;
}

export function TelegramMiniAppProviders({ children }: TelegramMiniAppProvidersProps) {
  return (
    <TonConnectUIProvider restoreConnection>
      {children}
    </TonConnectUIProvider>
  );
}
