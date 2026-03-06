"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc-client';

export const SquadGovernance: React.FC<{ squadId: string }> = ({ squadId }) => {
    const { data: proposals, refetch } = trpc.squad.getProposals.useQuery({ squadId });

    const voteMutation = trpc.squad.voteOnProposal.useMutation({
        onSuccess: () => refetch()
    });

    const executeMutation = trpc.squad.executeProposal.useMutation({
        onSuccess: () => refetch()
    });

    if (!proposals || proposals.length === 0) return (
        <Card className="bg-gray-50 border-dashed border-gray-200">
            <div className="text-center py-6">
                <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">No active squad proposals.</p>
            </div>
        </Card>
    );

    return (
        <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">Squad DAO</h2>
                </div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Voting Active</span>
            </div>

            <div className="space-y-4">
                {(proposals as any[]).filter((p: any) => p.status === 'active').map((proposal: any) => {
                    const yesVotes = proposal.votes.filter((v: any) => v.vote === 'yes').length;
                    const noVotes = proposal.votes.filter((v: any) => v.vote === 'no').length;
                    const totalVotes = yesVotes + noVotes;
                    const progress = totalVotes > 0 ? (yesVotes / proposal.quorum) * 100 : 0;

                    return (
                        <div key={proposal.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{proposal.title}</h3>
                                    <p className="text-[10px] text-gray-500 line-clamp-1">{proposal.description}</p>
                                </div>
                                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    {proposal.type.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Vote Progress */}
                            <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                                    <span>Progress to Quorum</span>
                                    <span>{yesVotes} / {proposal.quorum} Yes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, progress)}%` }}
                                        className="h-full bg-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex items-center gap-2">
                                <button
                                    onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: 'yes' })}
                                    className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-green-600 hover:bg-green-50 hover:border-green-200 transition-all"
                                >
                                    Vote Yes
                                </button>
                                <button
                                    onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: 'no' })}
                                    className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                                >
                                    Vote No
                                </button>
                                {yesVotes >= proposal.quorum && (
                                    <button
                                        onClick={() => executeMutation.mutate({ proposalId: proposal.id })}
                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        Execute
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
