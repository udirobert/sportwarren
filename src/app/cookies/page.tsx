import React from "react";
import Link from "next/link";
import { Target } from "lucide-react";

export const metadata = {
  title: "Cookie Policy — SportWarren",
  description: "Cookie Policy for SportWarren platform",
};

export default function CookiePolicy() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: May 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us
              provide you with a better experience by remembering your preferences and understanding how
              you use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cookies We Use</h2>

            <h3 className="text-base font-medium text-white/80 mt-4 mb-2">Essential (always active)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Authentication:</strong> Wallet session tokens and signature verification</li>
              <li><strong>Preferences:</strong> Theme (dark/light), language, active squad</li>
              <li><strong>Security:</strong> CSRF tokens, rate limiting identifiers</li>
              <li><strong>Onboarding:</strong> Tour progress and checklist completion state</li>
            </ul>

            <h3 className="text-base font-medium text-white/80 mt-4 mb-2">Analytics (optional)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>PostHog:</strong> Anonymous usage analytics to help us improve the Platform</li>
              <li><strong>Sentry:</strong> Error tracking and performance monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Managing Cookies</h2>
            <p className="mb-3">
              You can manage your cookie preferences at any time using the cookie consent banner that
              appears on your first visit. You can also clear cookies through your browser settings.
            </p>
            <p>
              Note: Disabling essential cookies may prevent the Platform from functioning correctly.
              Wallet authentication and session management require these cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Local Storage</h2>
            <p>
              We also use browser localStorage to store non-sensitive preferences such as onboarding
              progress, tour state, and UI preferences. This data is not transmitted to our servers
              and can be cleared through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions about our use of cookies? Contact us at{" "}
              <a href="mailto:privacy@sportwarren.com" className="text-green-400 hover:underline">
                privacy@sportwarren.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
