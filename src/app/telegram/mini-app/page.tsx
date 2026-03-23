import { Suspense } from 'react';
import { TelegramMiniAppProviders } from '@/components/telegram/TelegramMiniAppProviders';
import { TelegramTreasuryMiniApp } from '@/components/telegram/TelegramTreasuryMiniApp';

export default function TelegramMiniAppPage() {
  return (
    <TelegramMiniAppProviders>
      <Suspense fallback={null}>
        <TelegramTreasuryMiniApp />
      </Suspense>
    </TelegramMiniAppProviders>
  );
}
