"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';

interface VerificationBannerProps {
  className?: string;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ className }) => {
  const { authStatus, refreshAuthSignature, isGuest, connected } = useWallet();
  const { addToast } = useToast();

  if (isGuest) return null;

  if (!connected) {
    return (
      <div className={`flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 ${className || ''}`}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-700">Connect Wallet</div>
            <div className="text-sm text-blue-900">
              Connect a wallet to unlock protected data and verify matches.
            </div>
          </div>
        </div>
        <Link href="/?connect=1">
          <Button size="sm" className="h-9 text-xs font-black uppercase tracking-widest">
            Connect
          </Button>
        </Link>
      </div>
    );
  }

  const needsVerification = authStatus.state === 'missing' || authStatus.state === 'expired';
  if (!needsVerification) return null;

  const handleVerify = async () => {
    const ok = await refreshAuthSignature();
    if (ok) {
      addToast({
        tone: 'success',
        title: 'Wallet Verified',
        message: 'Protected features are now unlocked.',
      });
    } else {
      addToast({
        tone: 'error',
        title: 'Verification Failed',
        message: 'Please approve the signature request to continue.',
      });
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 ${className || ''}`}>
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Verification Required</div>
          <div className="text-sm text-amber-900">
            {authStatus.state === 'expired' ? 'Session expired — re-verify to continue.' : 'Verify your wallet to unlock protected data.'}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleVerify}
        disabled={authStatus.isRefreshing}
        className="h-9 text-xs font-black uppercase tracking-widest"
      >
        {authStatus.isRefreshing ? 'Verifying…' : 'Verify'}
      </Button>
    </div>
  );
};
