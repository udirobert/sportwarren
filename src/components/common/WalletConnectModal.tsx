"use client";

import React, { useState } from 'react';
import { X, Wallet, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useLens } from '@/contexts/LensContext';
import { useToast } from '@/contexts/ToastContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnected }) => {
  const { connect, connected, chain, loginAsGuest, authStatus, refreshAuthSignature, isGuest } = useWallet();
  const { login, isConnected: lensConnected, profile: lensProfile } = useLens();
  const { addToast } = useToast();
  const [selectedChain, setSelectedChain] = useState<'algorand' | 'avalanche' | 'lens' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasWallet = connected && !isGuest;
  const needsVerification = authStatus.state === 'missing' || authStatus.state === 'expired';
  const isVerified = authStatus.state === 'valid';
  const showAuthBanner = authStatus.state !== 'none' && authStatus.state !== 'guest';

  if (!isOpen) return null;

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect & Verify
            </h2>
            <p className="text-gray-600">
              Choose a wallet network. You'll sign a one-time message to verify ownership — no gas.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="section-kicker bg-gray-100 text-gray-900">1 Choose</span>
            <span className="w-6 h-px bg-gray-200" />
            <span className={`section-kicker ${
              isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              2 Sign
            </span>
            <span className="w-6 h-px bg-gray-200" />
            <span className={`section-kicker ${
              lensConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              3 Social
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {hasWallet && showAuthBanner && (
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
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleConnect('algorand')}
              disabled={isConnecting}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">Player Profile</h3>
                <p className="text-xs text-gray-500">Algorand • Track XP, stats & reputation</p>
              </div>
              {selectedChain === 'algorand' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
              {hasWallet && chain === 'algorand' && !isConnecting && (
                <span className="section-title text-blue-600">Connected</span>
              )}
            </button>

            <button
              onClick={() => handleConnect('avalanche')}
              disabled={isConnecting}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all flex items-center gap-4 disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-white text-xs text-center p-1">AVAX</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">Squad Governance</h3>
                <p className="text-xs text-gray-500">Avalanche • Vote, manage treasury & transfers</p>
              </div>
              {selectedChain === 'avalanche' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-red-600" />}
              {hasWallet && chain === 'avalanche' && !isConnecting && (
                <span className="section-title text-red-600">Connected</span>
              )}
            </button>

            <button
              onClick={() => handleConnect('lens')}
              disabled={isConnecting}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all flex items-center gap-4 disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white italic">L</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">Social Layer</h3>
                <p className="text-xs text-gray-500">Lens • Share highlights & follow players</p>
              </div>
              {selectedChain === 'lens' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
              {hasWallet && chain === 'lens' && !isConnecting && (
                <span className="section-title text-green-600">Connected</span>
              )}
            </button>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
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
            {!hasWallet && (
              <p className="text-[11px] text-gray-400 mt-2">Connect any wallet first to enable social linking.</p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                loginAsGuest();
                onConnected?.();
                onClose();
              }}
              className="w-full py-3 text-sm font-black text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue as Guest</span>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between section-title">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              <span>Verified</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
