"use client";

import React, { useState } from 'react';
import { X, Wallet, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useLens } from '@/contexts/LensContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { connect, connected, chain, loginAsGuest } = useWallet();
  const { login, isConnected: lensConnected, profile: lensProfile } = useLens();
  const [selectedChain, setSelectedChain] = useState<'algorand' | 'avalanche' | 'lens' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (targetChain: 'algorand' | 'avalanche' | 'lens') => {
    setSelectedChain(targetChain);
    setIsConnecting(true);
    setError(null);

    try {
      await connect(targetChain);
      // If connecting to Base, we don't close yet - we show Lens option
      if (targetChain !== 'lens') {
        onClose();
      }
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
              {connected && chain === 'lens' ? 'Social Identity' : 'Connect Your Wallet'}
            </h2>
            <p className="text-gray-600">
              {connected && chain === 'lens'
                ? 'Link your Lens Profile to share highlights'
                : 'Choose your preferred blockchain to get started'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!(connected && chain === 'lens') ? (
              <>
                <button
                  onClick={() => handleConnect('algorand')}
                  disabled={isConnecting}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight">Algorand</h3>
                    <p className="text-xs text-gray-500">Core Loop & XP Storage</p>
                  </div>
                  {selectedChain === 'algorand' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                </button>

                <button
                  onClick={() => handleConnect('avalanche')}
                  disabled={isConnecting}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-white text-xs text-center p-1">AVAX</div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight">Avalanche</h3>
                    <p className="text-xs text-gray-500">Premium Agents & AI</p>
                  </div>
                  {selectedChain === 'avalanche' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-red-600" />}
                </button>

                <button
                  onClick={() => handleConnect('lens')}
                  disabled={isConnecting}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white italic">L</div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight">Lens Chain</h3>
                    <p className="text-xs text-gray-500">Lens v3 Social Graph</p>
                  </div>
                  {selectedChain === 'lens' && isConnecting && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
                </button>
              </>
            ) : (
              <button
                onClick={handleLensLogin}
                disabled={isConnecting || lensConnected}
                className="w-full p-6 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl hover:from-green-500 hover:to-green-700 transition-all shadow-lg shadow-green-500/20 group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <span className="text-3xl font-black italic">L</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black uppercase tracking-tight">Login with Lens</h3>
                    <p className="text-sm opacity-90 font-medium">Link your Athlete Profile</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                loginAsGuest();
                onClose();
              }}
              className="w-full py-3 text-sm font-black text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue as Guest</span>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
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
