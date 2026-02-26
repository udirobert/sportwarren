"use client";

import { useState, useCallback } from 'react';
import type { TransferOffer, SquadPlayer } from '@/types';
import { MOCK_OFFERS } from '@/lib/mocks';

interface UseTransfersReturn {
  offers: TransferOffer[];
  loading: boolean;
  makeOffer: (player: SquadPlayer, amount: number, type: 'transfer' | 'loan') => Promise<void>;
  respondToOffer: (offerId: string, accept: boolean) => Promise<void>;
  cancelOffer: (offerId: string) => Promise<void>;
  refreshOffers: () => Promise<void>;
}

export function useTransfers(squadId?: string): UseTransfersReturn {
  const [offers, setOffers] = useState<TransferOffer[]>(MOCK_OFFERS);
  const [loading, setLoading] = useState(false);

  const refreshOffers = useCallback(async () => {
    setLoading(true);
    try {
      // In production: fetch from API
      // const response = await fetch(`/api/squads/${squadId}/offers`);
      // const data = await response.json();
      // setOffers(data);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  const makeOffer = useCallback(async (
    player: SquadPlayer, 
    amount: number, 
    type: 'transfer' | 'loan'
  ) => {
    setLoading(true);
    try {
      // In production: submit to API
      // await fetch(`/api/squads/${squadId}/offers`, {
      //   method: 'POST',
      //   body: JSON.stringify({ playerId: player.id, amount, type }),
      // });
      
      // Optimistic update
      const newOffer: TransferOffer = {
        id: `offer_${Date.now()}`,
        fromSquad: squadId || 'unknown',
        toSquad: 'target_squad',
        player,
        offerAmount: amount,
        offerType: type,
        status: 'pending',
        timestamp: new Date(),
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      setOffers(prev => [newOffer, ...prev]);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  const respondToOffer = useCallback(async (offerId: string, accept: boolean) => {
    setLoading(true);
    try {
      // In production: submit to API
      // await fetch(`/api/offers/${offerId}/respond`, {
      //   method: 'POST',
      //   body: JSON.stringify({ accept }),
      // });
      
      // Optimistic update
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: accept ? 'accepted' : 'rejected' }
          : offer
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOffer = useCallback(async (offerId: string) => {
    setLoading(true);
    try {
      // In production: submit to API
      // await fetch(`/api/offers/${offerId}`, { method: 'DELETE' });
      
      // Optimistic update
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offers,
    loading,
    makeOffer,
    respondToOffer,
    cancelOffer,
    refreshOffers,
  };
}
