"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PaymentRailNotice } from '@/components/payments/PaymentRailNotice';
import {
  ArrowRightLeft, DollarSign, Clock, Check, X,
  Search, Filter, TrendingUp, User, Trophy, Zap
} from 'lucide-react';
import type { TransferOffer, SquadPlayer, PlayerAttributes } from '@/types';
import { MOCK_OFFERS, MOCK_AVAILABLE_PLAYERS } from '@/lib/mocks';
import { DraftEngine } from './DraftEngine';
import { calculateMarketValuation } from '@/lib/utils/calculations';

interface TransferMarketProps {
  squadBalance: number;
  incomingOffers?: TransferOffer[];
  outgoingOffers?: TransferOffer[];
  currencyLabel?: string;
  paymentRailEnabled?: boolean;
  onMakeOffer?: (playerId: string, amount: number, type: 'transfer' | 'loan') => void;
  onRespondToOffer?: (offerId: string, accept: boolean) => void;
}

export const TransferMarket: React.FC<TransferMarketProps> = ({
  squadBalance,
  incomingOffers = MOCK_OFFERS.filter(o => o.toSquad === 'Northside United'),
  outgoingOffers = MOCK_OFFERS.filter(o => o.fromSquad === 'Northside United'),
  currencyLabel = 'ALGO',
  paymentRailEnabled = false,
  onMakeOffer,
  onRespondToOffer,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'offers' | 'drafts' | 'my-players'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<typeof MOCK_AVAILABLE_PLAYERS[0] | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerType, setOfferType] = useState<'transfer' | 'loan'>('transfer');

  const filteredPlayers = MOCK_AVAILABLE_PLAYERS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleMakeOffer = () => {
    if (selectedPlayer && offerAmount) {
      onMakeOffer?.(selectedPlayer.id, parseInt(offerAmount), offerType);
      setSelectedPlayer(null);
      setOfferAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ArrowRightLeft className="w-6 h-6 mr-2 text-blue-600" />
              Transfer Market
            </h2>
            <p className="text-gray-600">Buy, sell, and loan players</p>
          </div>
          <div className="flex items-center space-x-4 bg-green-50 px-4 py-2 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Squad Balance</div>
              <div className="text-xl font-bold text-green-600">{squadBalance.toLocaleString()} {currencyLabel}</div>
              {paymentRailEnabled && (
                <div className="text-xs text-gray-500">Escrow rail active via Yellow</div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'browse', label: 'Browse', count: MOCK_AVAILABLE_PLAYERS.length },
          { key: 'drafts', label: 'Drafts', count: MOCK_AVAILABLE_PLAYERS.filter(p => p.isDraftEligible).length },
          { key: 'offers', label: 'Market Feed', count: incomingOffers.length + outgoingOffers.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${activeTab === key
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <span className="font-medium">{label}</span>
            {count > 0 && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <PaymentRailNotice
        title="Transfer escrow rail"
        assetSymbol={currencyLabel}
        enabled={paymentRailEnabled}
        mode={paymentRailEnabled ? 'shared session' : 'disabled'}
        body="Incoming and outgoing offers can lock funds in Yellow escrow so both squads can settle the same transfer session."
      />

      {/* Browse Players */}
      {activeTab === 'browse' && (
        <>
          {/* Search & Filter */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Positions</option>
                <option value="GK">Goalkeeper</option>
                <option value="DF">Defender</option>
                <option value="MF">Midfielder</option>
                <option value="ST">Striker</option>
                <option value="WG">Winger</option>
              </select>
            </div>
          </Card>

          {/* Player List */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPlayers.map((player) => (
              <Card
                key={player.id}
                className={`cursor-pointer transition-all ${selectedPlayer?.id === player.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-900 truncate">{player.name}</h4>
                        {getReputationBadge(player.reputationTier)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs mt-0.5">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-gray-600">{player.position}</span>
                        <span className="text-gray-400">AGE {player.age}</span>
                        {player.isDraftEligible && (
                          <span className="text-blue-500 font-black tracking-tighter uppercase italic">Draft Eligible</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-black leading-none ${player.overall >= 80 ? 'text-blue-600' : 'text-gray-900'}`}>
                        {player.overall}
                      </div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">OVR</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Market Valuation</div>
                    <div className="text-sm font-bold text-gray-900 flex items-center space-x-1">
                      <span>{player.marketValuation.toLocaleString()}</span>
                      <TrendingUp className={`w-3 h-3 ${player.marketValuation > player.askingPrice ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Asking Price</div>
                    <div className="text-sm font-bold text-blue-600">{player.askingPrice.toLocaleString()} {currencyLabel}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="text-gray-500 italic">Reputation: {player.reputationScore} pts</div>
                  <div className="font-mono text-gray-400 uppercase">{player.currentClub}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Make Offer Modal */}
          {selectedPlayer && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <h3 className="font-semibold text-gray-900 mb-4">
                Make Offer for {selectedPlayer.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setOfferType('transfer')}
                      className={`flex-1 py-2 px-4 rounded-lg ${offerType === 'transfer'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                    >
                      Permanent Transfer
                    </button>
                    <button
                      onClick={() => setOfferType('loan')}
                      className={`flex-1 py-2 px-4 rounded-lg ${offerType === 'loan'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                    >
                      Loan
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Amount ({currencyLabel})
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder={`Asking: ${selectedPlayer.askingPrice}`}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Asking price: {selectedPlayer.askingPrice.toLocaleString()} {currencyLabel}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleMakeOffer} className="flex-1">
                    Submit Offer
                  </Button>
                  <Button onClick={() => setSelectedPlayer(null)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          {/* Incoming Offers */}
          {incomingOffers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Incoming Offers</h3>
              <div className="space-y-3">
                {incomingOffers.map((offer) => (
                  <Card key={offer.id} className="border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{offer.player.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${offer.offerType === 'transfer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {offer.offerType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          From: {offer.fromSquad}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="flex items-center text-green-600 font-bold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {offer.offerAmount.toLocaleString()} {currencyLabel}
                          </span>
                          <span className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Expires: {offer.expiry?.toLocaleDateString() || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => onRespondToOffer?.(offer.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => onRespondToOffer?.(offer.id, false)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Offers */}
          {outgoingOffers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Outgoing Offers</h3>
              <div className="space-y-3">
                {outgoingOffers.map((offer) => (
                  <Card key={offer.id} className="border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{offer.player.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${offer.offerType === 'transfer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                            {offer.offerType.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {offer.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          To: {offer.toSquad}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="flex items-center text-green-600 font-bold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {offer.offerAmount.toLocaleString()} {currencyLabel}
                          </span>
                          <span className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Expires: {offer.expiry?.toLocaleDateString() || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {incomingOffers.length === 0 && outgoingOffers.length === 0 && (
            <Card className="text-center py-12">
              <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Offers</h3>
              <p className="text-gray-600">Browse players to make your first offer</p>
            </Card>
          )}
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === 'drafts' && (
        <div className="space-y-6">
          <DraftEngine />

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 px-1">Available Prospects</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {MOCK_AVAILABLE_PLAYERS.filter(p => p.isDraftEligible).map(player => (
                <Card key={player.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <User className="w-6 h-6 text-blue-600 group-hover:text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-gray-900">{player.name}</h4>
                          <span className="text-[8px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">U21</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">POTENTIAL: A+</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-blue-600 uppercase">Valuation</div>
                      <div className="text-sm font-black text-gray-900">{(player.marketValuation * 1.2).toLocaleString()}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Players Tab */}
      {activeTab === 'my-players' && (
        <Card className="text-center py-12">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Squad Management</h3>
          <p className="text-gray-600 mb-4">View and manage your current squad players</p>
          <Button onClick={() => window.location.href = '/squad'}>
            Go to Squad Page
          </Button>
        </Card>
      )}
    </div>
  );
};

const getReputationBadge = (tier: string) => {
  switch (tier) {
    case 'platinum': return <div className="px-1.5 py-0.5 bg-blue-600 text-xs font-black text-white rounded uppercase shadow-lg shadow-blue-500/20">Platinum</div>;
    case 'gold': return <div className="px-1.5 py-0.5 bg-yellow-500 text-xs font-black text-white rounded uppercase">Gold</div>;
    case 'silver': return <div className="px-1.5 py-0.5 bg-gray-400 text-xs font-black text-white rounded uppercase">Silver</div>;
    default: return <div className="px-1.5 py-0.5 bg-orange-700 text-xs font-black text-white rounded uppercase">Bronze</div>;
  }
};
