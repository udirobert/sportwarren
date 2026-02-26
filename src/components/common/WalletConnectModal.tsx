"use client";

import React, { useState } from 'react';
import { X, Wallet, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { connect } = useWallet();
  const [selectedChain, setSelectedChain] = useState<'algorand' | 'avalanche' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (chain: 'algorand' | 'avalanche') => {
    setSelectedChain(chain);
    setIsConnecting(true);
    setError(null);

    try {
      await connect(chain);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
      setSelectedChain(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-md w-full relative animate-scale-in-bounce overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600">
              Choose your preferred blockchain to get started
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleConnect('algorand')}
              disabled={isConnecting}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900">Algorand</h3>
                <p className="text-sm text-gray-500">Secure Blockchain Connection</p>
              </div>
              {selectedChain === 'algorand' && isConnecting && (
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              )}
            </button>

            <button
              onClick={() => handleConnect('avalanche')}
              disabled={isConnecting}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AVAX</span>
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900">Avalanche</h3>
                <p className="text-sm text-gray-500">Fast & Low Fees</p>
              </div>
              {selectedChain === 'avalanche' && isConnecting && (
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
              )}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
