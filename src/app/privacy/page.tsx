import React from "react";
import Link from "next/link";
import { Target } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — SportWarren",
  description: "Privacy Policy for SportWarren platform",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="flex items-center gap-3 mb-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
            <Target className="h-5 w-5" />
          </div>
          <Link href="/" className="text-lg font-black uppercase tracking-widest text-white/80">
            SportWarren
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: May 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>

            <h3 className="text-base font-medium text-white/80 mt-4 mb-2">Information you provide:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Wallet addresses (Algorand, GOAT Network, EVM, TON)</li>
              <li>Profile information (name, avatar, position preference)</li>
              <li>Match results and peer ratings</li>
              <li>Squad data (names, formations, tactics)</li>
              <li>Messages sent to AI staff</li>
              <li>Media uploads (photos, videos)</li>
            </ul>

            <h3 className="text-base font-medium text-white/80 mt-4 mb-2">Information collected automatically:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address and device information</li>
              <li>Usage analytics (pages visited, features used)</li>
              <li>Telegram user ID (when using Telegram Mini App)</li>
              <li>Blockchain transaction hashes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and maintain the Platform</li>
              <li>Calculate player attributes, XP, and reputation scores</li>
              <li>Enable peer verification of match results</li>
              <li>Power AI staff insights and tactical recommendations</li>
              <li>Process prediction market bets and treasury transactions</li>
              <li>Send notifications via Telegram or in-app</li>
              <li>Improve the Platform through analytics</li>
              <li>Prevent fraud and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Data Sharing</h2>
            <p className="mb-3">We share data with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Squad members:</strong> Your match stats, ratings, and profile are visible to squad mates</li>
              <li><strong>Blockchain networks:</strong> Match verification data is recorded on-chain (Algorand, GOAT Network)</li>
              <li><strong>Service providers:</strong> Sentry (error tracking), PostHog (analytics), Venice AI / OpenAI (AI inference)</li>
              <li><strong>Telegram:</strong> If you connect Telegram, your Telegram ID is linked to your account</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage &amp; Security</h2>
            <p>
              Data is stored on encrypted PostgreSQL databases. Media files are encrypted with AES-256 using
              AWS KMS-managed keys. We use industry-standard security practices but cannot guarantee absolute
              security. Blockchain data is public and immutable by design.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Your Rights (GDPR)</h2>
            <p className="mb-3">If you are in the EU/EEA, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Rectify</strong> inaccurate data</li>
              <li><strong>Erase</strong> your personal data (subject to blockchain immutability)</li>
              <li><strong>Port</strong> your data in a machine-readable format</li>
              <li><strong>Object</strong> to processing based on legitimate interests</li>
              <li><strong>Withdraw consent</strong> at any time</li>
            </ul>
            <p className="mt-3">
              Note: Data recorded on public blockchains cannot be erased. We can delete off-chain data
              (profile, match history, AI memory) upon request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. Analytics cookies (PostHog)
              are optional and require your consent. See our{" "}
              <Link href="/cookies" className="text-green-400 hover:underline">Cookie Policy</Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Data Retention</h2>
            <p>
              We retain your data while your account is active. Match data and blockchain records are retained
              indefinitely. AI conversation history is capped at 20 messages per context. Inactive accounts
              may be archived after 24 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>
              SportWarren is not directed at children under 16. We do not knowingly collect data from
              children under 16. If you believe a child has provided data, contact us for deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this policy. Material changes will be communicated via the Platform or email.
              The &quot;Last updated&quot; date at the top reflects the latest revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              Privacy questions or data requests? Contact us at{" "}
              <a href="mailto:privacy@sportwarren.com" className="text-green-400 hover:underline">
                privacy@sportwarren.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
