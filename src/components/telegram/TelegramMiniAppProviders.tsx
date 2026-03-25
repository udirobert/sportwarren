"use client";

import type { ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

interface TelegramMiniAppProvidersProps {
  children: ReactNode;
}

// Get the manifest URL for TON Connect
function getManifestUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/tonconnect-manifest.json`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "";
  return `${baseUrl}/tonconnect-manifest.json`;
}

export function TelegramMiniAppProviders({
  children,
}: TelegramMiniAppProvidersProps) {
  const manifestUrl = getManifestUrl();

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} restoreConnection>
      {children}
    </TonConnectUIProvider>
  );
}

export default TelegramMiniAppProviders;
