import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLens } from '@/contexts/LensContext';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Share2, Users, CheckCircle2, Globe, MessageSquare, Zap, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LensSocialHub: React.FC = () => {
    const { isConnected, profile, login, postMatchProof } = useLens();
    const { loginMethod, chain } = useWallet();
    const { venue, city } = useEnvironment();
    const [isSharing, setIsSharing] = useState(false);
    const [lastPubId, setLastPubId] = useState<string | null>(null);

    const isSocialUser = loginMethod === 'social';

    const handleShareProof = async () => {
        setIsSharing(true);
        // Simulate a verified match for demo
        const demoMatch = {
            venue,
            homeScore: 2,
            awayScore: 1,
            workflowId: 'cre_verify_nairobi_001'
        };
        const pubId = await postMatchProof(demoMatch);
        if (pubId) setLastPubId(pubId);
        setIsSharing(false);
    };

    return (
        <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Share2 className="w-16 h-16" />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#00501e] rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">Social Layer</div>
                        <h2 className="text-lg font-black text-gray-900 uppercase italic tracking-tight">Lens Hub</h2>
                    </div>
                </div>
                {isConnected && (
                    <div className="px-2 py-1 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-green-600" />
                        <span className="text-[8px] font-black text-green-700 uppercase tracking-tighter">Native Identity</span>
                    </div>
                )}
            </div>

            {!isConnected ? (
                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                            {isSocialUser
                                ? "You're logged in with Socials. Upgrade to a Lens Identity to unlock cross-chain verified reputation and the Global Grassroots Feed."
                                : "Connect your Lens V3 identity to bridge your real-world football achievements to the decentralized social graph."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <Button
                            onClick={login}
                            className={`w-full ${isSocialUser ? 'bg-green-600' : 'bg-[#00501e]'} hover:opacity-90 text-white rounded-xl py-6 flex items-center justify-center space-x-2 group/btn shadow-xl`}
                        >
                            <Globe className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                            <span className="font-black uppercase tracking-widest text-xs">
                                {isSocialUser ? 'Upgrade to Lens' : 'Connect Lens'}
                            </span>
                        </Button>
                        <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
                            Join the web3-native Phygital community
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Profile Summary */}
                    <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-2xl border border-green-100">
                        <img
                            src={profile?.avatarUrl}
                            alt={profile?.handle}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">
                                {profile?.handle}
                            </h3>
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Asset Player</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-lg border border-gray-100 text-center">
                            <div className="text-xs font-black text-gray-900">{profile?.stats.totalFollowers || 0}</div>
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Followers</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-100 text-center">
                            <div className="text-xs font-black text-gray-900">{profile?.stats.totalPosts || 0}</div>
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Posts</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-gray-100 text-center">
                            <div className="text-xs font-black text-gray-900">4.8</div>
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Social XP</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <Button
                            onClick={handleShareProof}
                            disabled={isSharing}
                            className="w-full bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest py-3 flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] transition-all"
                        >
                            {isSharing ? (
                                <Zap className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4 text-yellow-400" />
                            )}
                            <span>Post Phygital Proof</span>
                        </Button>

                        <AnimatePresence>
                            {lastPubId && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Post Live on Lens!</span>
                                    </div>
                                    <a href="#" className="text-[10px] font-black text-blue-900 uppercase flex items-center space-x-1">
                                        <span>View</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">
                        Active Chapter: {city} • {venue}
                    </p>
                </div>
            )}
        </Card>
    );
};
