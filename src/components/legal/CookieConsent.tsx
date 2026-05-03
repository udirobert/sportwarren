'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const CONSENT_KEY = 'sw_cookie_consent';

type ConsentState = 'accepted' | 'rejected' | null;

function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === 'accepted' || value === 'rejected') return value;
  return null;
}

function storeConsent(state: 'accepted' | 'rejected') {
  localStorage.setItem(CONSENT_KEY, state);
}

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent === null) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    storeConsent('accepted');
    setVisible(false);
  };

  const handleReject = () => {
    storeConsent('rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
    >
      <div className="max-w-3xl mx-auto bg-gray-900 border border-white/10 rounded-xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 text-xs sm:text-sm text-gray-300">
            <p>
              We use essential cookies to keep you signed in and remember your preferences.
              Optional analytics cookies help us improve SportWarren.{' '}
              <Link href="/cookies" className="text-green-400 hover:underline">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              Reject optional
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-medium text-gray-950 bg-green-400 hover:bg-green-300 rounded-lg transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
