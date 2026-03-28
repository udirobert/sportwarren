import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
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
      <body className="antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
