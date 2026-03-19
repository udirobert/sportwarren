"use client";

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';

interface VerificationBannerProps {
  className?: string;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ className }) => {
  const { authStatus, refreshAuthSignature, isGuest, hasWallet } = useWallet();
  const { addToast } = useToast();

  if (isGuest) return null;
  if (!hasWallet) return null;

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
          <div className="section-title text-amber-700">Verification Required</div>
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
