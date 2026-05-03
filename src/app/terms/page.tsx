import React from "react";
import Link from "next/link";
import { Target } from "lucide-react";

export const metadata = {
  title: "Terms of Service — SportWarren",
  description: "Terms of Service for SportWarren platform",
};

export default function TermsOfService() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: May 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SportWarren (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Platform. These terms constitute a legally binding agreement
              between you and SportWarren Ltd.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Eligibility</h2>
            <p>
              You must be at least 16 years old to use SportWarren. By using the Platform, you represent that
              you meet this age requirement. If you are under 18, you must have parental or guardian consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Account &amp; Wallet</h2>
            <p className="mb-3">
              SportWarren uses blockchain wallet-based authentication. You are responsible for maintaining the
              security of your wallet and private keys. We do not store private keys and cannot recover them.
            </p>
            <p>
              You may also authenticate via social login (Google, Discord, Apple, email) through our identity
              provider, which creates an embedded wallet on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. User Content</h2>
            <p className="mb-3">
              You retain ownership of content you submit (match results, ratings, media). By submitting content,
              you grant SportWarren a non-exclusive, worldwide, royalty-free license to display, distribute,
              and store such content in connection with operating the Platform.
            </p>
            <p>
              You must not submit false, misleading, or fraudulent match data. Peer-verified match results
              rely on honest reporting from all participants.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Prediction Markets</h2>
            <p className="mb-3">
              Prediction markets on SportWarren involve cryptocurrency (TON) and are provided for entertainment
              purposes. Participation is at your own risk.
            </p>
            <p className="mb-3">
              Prediction markets may not be available in all jurisdictions. It is your responsibility to ensure
              that participation complies with local laws. SportWarren does not provide financial advice.
            </p>
            <p>
              All bets are final once placed. Market outcomes are determined by verifiable events or
              consensus mechanisms. Disputed markets may be refunded at the platform&apos;s discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Blockchain &amp; Digital Assets</h2>
            <p className="mb-3">
              SportWarren integrates with multiple blockchain networks (Algorand, Avalanche, TON). Transactions
              on these networks are irreversible. Gas fees and transaction costs are your responsibility.
            </p>
            <p>
              Digital assets (NFTs, tokens, reputation scores) have no guaranteed monetary value and are not
              investments. We make no promises about the future value of any digital assets.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Prohibited Conduct</h2>
            <p>You must not:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Submit false match results or manipulate peer ratings</li>
              <li>Use bots or automated tools to interact with the Platform</li>
              <li>Attempt to exploit vulnerabilities in smart contracts</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Use the Platform for money laundering or illegal gambling</li>
              <li>Circumvent rate limits or security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              SportWarren is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
              indirect, incidental, or consequential damages arising from your use of the Platform. Our total
              liability shall not exceed the amount you paid to use the Platform in the 12 months preceding
              the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your access at any time for violating these terms. You may stop
              using the Platform at any time. Sections regarding liability, indemnification, and dispute
              resolution survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Material changes will be communicated via the
              Platform. Continued use after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
              <a href="mailto:legal@sportwarren.com" className="text-green-400 hover:underline">
                legal@sportwarren.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
