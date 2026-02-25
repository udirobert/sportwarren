"use client";

import { useState } from "react";
import { SquadDAO } from "@/components/squad/SquadDAO";
import { TacticsBoard } from "@/components/squad/TacticsBoard";
import { TransferMarket } from "@/components/squad/TransferMarket";
import { Treasury } from "@/components/squad/Treasury";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Users, Target, ArrowRightLeft, Wallet, 
  Shield, Vote, Trophy 
} from "lucide-react";
import type { Player } from "@/types";

// Mock players for tactics board
const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Marcus Johnson', position: 'ST', status: 'available', address: 'addr1' },
  { id: 'p2', name: 'Jamie Smith', position: 'MF', status: 'available', address: 'addr2' },
  { id: 'p3', name: 'Alex Chen', position: 'DF', status: 'available', address: 'addr3' },
  { id: 'p4', name: 'Sam Wilson', position: 'GK', status: 'available', address: 'addr4' },
  { id: 'p5', name: 'Jordan Lee', position: 'WG', status: 'available', address: 'addr5' },
  { id: 'p6', name: 'Casey Brown', position: 'MF', status: 'available', address: 'addr6' },
  { id: 'p7', name: 'Riley Davis', position: 'DF', status: 'available', address: 'addr7' },
  { id: 'p8', name: 'Morgan Taylor', position: 'ST', status: 'available', address: 'addr8' },
];

type SquadTab = "overview" | "tactics" | "transfers" | "treasury" | "governance";

export default function SquadPage() {
  const [activeTab, setActiveTab] = useState<SquadTab>("overview");
  const [squadBalance, setSquadBalance] = useState(15000);

  const handleMakeOffer = (playerId: string, amount: number, type: 'transfer' | 'loan') => {
    console.log(`Making ${type} offer for player ${playerId}: ${amount} ALGO`);
    // Deduct from balance (mock)
    if (type === 'transfer') {
      setSquadBalance(prev => prev - amount);
    }
  };

  const handleRespondToOffer = (offerId: string, accept: boolean) => {
    console.log(`${accept ? 'Accepting' : 'Rejecting'} offer ${offerId}`);
  };

  const handleDeposit = (amount: number) => {
    console.log(`Depositing ${amount} ALGO`);
    setSquadBalance(prev => prev + amount);
  };

  const handleWithdraw = (amount: number, reason: string) => {
    console.log(`Withdrawing ${amount} ALGO: ${reason}`);
    setSquadBalance(prev => prev - amount);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Squad Management</h1>
        <p className="text-gray-600">Manage your team, tactics, transfers, and finances</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">16</div>
          <div className="text-sm text-gray-600">Players</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{squadBalance.toLocaleString()}</div>
          <div className="text-sm text-gray-600">ALGO Balance</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">4-3-3</div>
          <div className="text-sm text-gray-600">Formation</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">3</div>
          <div className="text-sm text-gray-600">Active Offers</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: Users },
          { key: 'tactics', label: 'Tactics', icon: Target },
          { key: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
          { key: 'treasury', label: 'Treasury', icon: Wallet },
          { key: 'governance', label: 'Governance', icon: Vote },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as SquadTab)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Northside United</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Squad Overview</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Founded: 2018</li>
                  <li>• Home Ground: Hackney Marshes</li>
                  <li>• League Position: 3rd</li>
                  <li>• Form: WWDLW</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Recent Activity</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Won vs Red Lions (3-1)</li>
                  <li>• New offer for Marcus Johnson</li>
                  <li>• Tactics updated by captain</li>
                  <li>• Treasury deposit: +500 ALGO</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('tactics')}>
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Current Tactics</h3>
              </div>
              <p className="text-gray-600">Formation: 4-3-3</p>
              <p className="text-gray-600">Style: Balanced</p>
              <Button variant="outline" className="mt-4 w-full">
                Edit Tactics
              </Button>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('transfers')}>
              <div className="flex items-center space-x-3 mb-3">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Transfer Activity</h3>
              </div>
              <p className="text-gray-600">Incoming offers: 1</p>
              <p className="text-gray-600">Outgoing offers: 2</p>
              <Button variant="outline" className="mt-4 w-full">
                View Transfers
              </Button>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tactics' && (
        <TacticsBoard
          players={MOCK_PLAYERS}
          onSave={(tactics) => console.log('Saving tactics:', tactics)}
        />
      )}

      {activeTab === 'transfers' && (
        <TransferMarket
          squadBalance={squadBalance}
          onMakeOffer={handleMakeOffer}
          onRespondToOffer={handleRespondToOffer}
        />
      )}

      {activeTab === 'treasury' && (
        <Treasury
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      )}

      {activeTab === 'governance' && (
        <SquadDAO />
      )}
    </div>
  );
}
