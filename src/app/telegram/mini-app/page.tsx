import Script from "next/script";
import { TelegramMiniAppPageClient } from "@/components/telegram/TelegramMiniAppPageClient";

export default function TelegramMiniAppPage() {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TelegramMiniAppPageClient />
    </>
  );
}

// Metadata for the page
export const metadata = {
  title: "SportWarren | Telegram",
  description: "Championship Manager in Telegram, powered by TON",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#09111f",
};

// Force dynamic rendering (no static generation for Mini App)
export const dynamic = "force-dynamic";
