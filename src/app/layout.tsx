import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieConsent } from "@/components/legal/CookieConsent";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sportwarren.com";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: "SportWarren — Rec Football, Tactically Elevated",
  description: "Design your squad DNA. Simulate tactics. Dominate the pitch. The ultimate tactical command center for your real-world squad.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚽</text></svg>",
  },
  openGraph: {
    title: "SportWarren — Rec Football, Tactically Elevated",
    description: "Design your squad DNA. Simulate tactics. Dominate the pitch. The ultimate tactical command center for your real-world squad.",
    type: "website",
    siteName: "SportWarren",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SportWarren — Rec Football, Tactically Elevated",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SportWarren — Rec Football, Tactically Elevated",
    description: "Design your squad DNA. Simulate tactics. Dominate the pitch.",
    creator: "@sportwarren",
  },
  keywords: ["football", "soccer", "tactics", "squad", "5-a-side", "recreational football", "stats", "simulation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
