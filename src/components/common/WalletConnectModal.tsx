"use client";

import React, { useState } from 'react';
import { X, Wallet, Loader2, Shield, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useLens } from '@/contexts/LensContext';
import { useToast } from '@/contexts/ToastContext';
import { getJourneyContent } from '@/lib/journey/content';
import { usePrivy } from '@privy-io/react-auth';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnected }) => {
  const { connect, hasWallet, refreshAuthSignature, authStatus } = useWallet();
  const { login: privyLogin, authenticated, ready } = usePrivy();
  const { login, isConnected: lensConnected, profile: lensProfile } = useLens();
  const { addToast } = useToast();
  const [selectedChain, setSelectedChain] = useState<'algorand' | 'avalanche' | 'lens' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const needsVerification = authStatus.state === 'missing' || authStatus.state === 'expired';
  const showAuthBanner = hasWallet && authStatus.state !== 'none' && authStatus.state !== 'guest';
  const publicContent = getJourneyContent('public_visitor');
  const accountReadyContent = getJourneyContent('account_ready');

  if (!isOpen) return null;

  const handlePrivyLogin = async () => {
    setError(null);
    try {
      await privyLogin();
      onConnected?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    }
  };

  const handleConnect = async (targetChain: 'algorand' | 'avalanche' | 'lens') => {
    setSelectedChain(targetChain);
    setIsConnecting(true);
    setError(null);

    try {
      await connect(targetChain);
      onConnected?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLensLogin = async () => {
    setIsConnecting(true);
    try {
      await login();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lens login failed');
    } finally {
      setIsConnecting(false);
    }
  };

  // State 1: Not authenticated — simple social sign-in
  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <Card className="max-w-sm w-full relative animate-scale-in-bounce overflow-hidden p-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                <span className="text-3xl">⚽</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{publicContent.authModal.title}</h2>
              <p className="text-gray-600 text-sm">{publicContent.authModal.description}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePrivyLogin}
              disabled={!ready}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {!ready && <Loader2 className="w-5 h-5 animate-spin" />}
              {publicContent.authModal.primaryActionLabel}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Continue with Google, Email, Discord, or Apple
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
              <span>•</span>
              <span>Free to start</span>
              <span>•</span>
              <span>No credit card</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // State 2: Authenticated with wallet — verification + Lens linking
  if (hasWallet && showAuthBanner) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <Card className="max-w-md w-full relative animate-scale-in-bounce overflow-hidden p-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connected</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className={`mb-4 p-3 rounded-lg border ${
              needsVerification
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="section-title text-current">Wallet verification</div>
                  <div className="text-sm font-medium">
                    {needsVerification
                      ? (authStatus.state === 'expired'
                        ? 'Session expired. Re-verify to continue.'
                        : 'Signature required to unlock protected features.')
                      : 'Verified • Protected features unlocked.'}
                  </div>
                </div>
                {needsVerification && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      const ok = await refreshAuthSignature();
                      if (ok) {
                        setError(null);
                        addToast({
                          tone: 'success',
                          title: 'Wallet Verified',
                          message: 'Protected features are now unlocked.',
                        });
                      } else {
                        setError('Unable to verify wallet. Please try again.');
                        addToast({
                          tone: 'error',
                          title: 'Verification Failed',
                          message: 'Please approve the signature request to continue.',
                        });
                      }
                    }}
                    disabled={authStatus.isRefreshing || isConnecting}
                    className="h-8 text-xs font-black uppercase tracking-widest"
                  >
                    {authStatus.isRefreshing ? 'Verifying...' : 'Verify'}
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Link Lens Profile (Optional)</h4>
                  <p className="text-xs text-gray-500">Connect once to post highlights and match proofs.</p>
                  {lensConnected && lensProfile?.handle && (
                    <p className="text-[11px] text-gray-400 mt-1">Connected as @{lensProfile.handle}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleLensLogin}
                  disabled={!hasWallet || lensConnected || isConnecting}
                  className="h-9 text-xs font-black uppercase tracking-widest"
                >
                  {lensConnected ? 'Linked' : 'Link Lens'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // State 3: Authenticated, no wallet — dashboard CTA + optional wallet upgrade
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-md w-full relative animate-scale-in-bounce overflow-hidden p-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{accountReadyContent.authModal.title}</h2>
              <p className="text-gray-600 text-sm">{accountReadyContent.authModal.description}</p>
            </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!showWalletOptions && (
            <div className="mb-4 grid gap-2">
              {accountReadyContent.authModal.benefits.map((item) => (
                <div key={item} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {item}
                </div>
              ))}
            </div>
          )}

          {!showWalletOptions ? (
            <div className="space-y-3">
              <button
                onClick={() => { onConnected?.(); onClose(); }}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {accountReadyContent.authModal.primaryActionLabel}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowWalletOptions(true)}
                className="w-full py-3 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                {accountReadyContent.authModal.secondaryActionLabel} →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => handleConnect('algorand')}
                disabled={isConnecting}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">Algorand</h3>
                  <p className="text-xs text-gray-500">Player profile, XP & reputation</p>
                </div>
                {selectedChain === 'algorand' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
              </button>

              <button
                onClick={() => handleConnect('avalanche')}
                disabled={isConnecting}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">AVAX</div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">Avalanche</h3>
                  <p className="text-xs text-gray-500">Squad governance & treasury</p>
                </div>
                {selectedChain === 'avalanche' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-red-600" />}
              </button>

              <button
                onClick={() => handleConnect('lens')}
                disabled={isConnecting}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white italic text-sm">L</div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">Lens</h3>
                  <p className="text-xs text-gray-500">Social layer & highlights</p>
                </div>
                {selectedChain === 'lens' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
              </button>

              <button
                onClick={() => setShowWalletOptions(false)}
                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Skip for now
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
