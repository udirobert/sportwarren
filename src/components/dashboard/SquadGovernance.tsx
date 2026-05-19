"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, ExternalLink } from 'lucide-react';
import { ChainLabel } from '@/components/common/ChainLabel';
import { trpc } from '@/lib/trpc-client';

export const SquadGovernance: React.FC<{ squadId: string }> = ({ squadId }) => {
    const { data: proposals } = trpc.squad.getProposals.useQuery({ squadId });

    // Governance is now handled on-chain via the Avalanche Governor
    // This component shows the current proposal status from the on-chain indexer
    if (!proposals || proposals.length === 0) return (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
            <div className="text-center py-6">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700 mb-1">On-Chain Governance Active</p>
                <p className="text-xs text-gray-500">Squad proposals are managed via the <ChainLabel chain="avalanche" /> Governor contract.</p>
                <a 
                    href="https://snowtrace.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                    View on Snowtrace <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </Card>
    );

    return (
        <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">Squad DAO</h2>
                </div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">On-Chain</span>
            </div>

            <div className="space-y-4">
                {proposals.filter((p: any) => p.status === 'active').map((proposal: any) => (
                    <div key={proposal.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">{proposal.title}</h3>
                                <p className="text-[10px] text-gray-500 line-clamp-1">{proposal.description}</p>
                            </div>
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {proposal.type?.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Vote via Avalanche Governor</span>
                            <a 
                                href={`https://snowtrace.io/address/${proposal.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
                            >
                                View Contract <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};