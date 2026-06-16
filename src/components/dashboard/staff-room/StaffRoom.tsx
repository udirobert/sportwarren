"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { trpc } from "@/lib/trpc-client";
import { useSquadDetails } from "@/hooks/squad/useSquad";
import { useAgentAlerts } from "@/hooks/squad/useAgentAlerts";
import { useAgentContext } from "@/context/AgentContext";
import { useYellowSession } from "@/hooks/useYellowSession";
import { useWallet } from "@/contexts/WalletContext";
import { ContractNegotiationModal } from "../ContractNegotiationModal";

import type { StaffMember, ChatMessage, StaffRoomProps } from "./types";
import { STAFF_MEMBERS } from "./constants";
import { StaffSidebar } from "./StaffSidebar";
import { MarketplacePanel } from "./MarketplacePanel";
import { StaffIntelSidebar } from "./StaffIntelSidebar";
import { handlePredefinedResponse, type ChatResponseContext } from "./chatResponses";
import { getQuickActions } from "./utils";

export const StaffRoom: React.FC<StaffRoomProps> = ({ squadId, onClose }) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(STAFF_MEMBERS[0]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [usedActions, setUsedActions] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [negotiatingPlayer, setNegotiatingPlayer] = useState("");
  const [negotiatingWage, setNegotiatingWage] = useState(500);
  const [inputText, setInputText] = useState("");
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const { isVerified } = useWallet();

  const agentChat = trpc.agent.chat.useMutation();
  const logDecision = trpc.memory.logDecision.useMutation();
  const { data: decisionData } = trpc.memory.getDecisions.useQuery(
    { staffId: selectedStaff?.id ?? "agent-1", limit: 5 },
    { enabled: !!selectedStaff },
  );
  const recentDecisions = decisionData?.decisions ?? [];

  const chatHistory = useMemo(
    () => (selectedStaff ? chatHistories[selectedStaff.id] || [] : []),
    [selectedStaff, chatHistories],
  );
  const setChatHistory = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    if (!selectedStaff) return;
    const staffId = selectedStaff.id;
    setChatHistories((prev) => {
      const current = prev[staffId] || [];
      const next = typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [staffId]: next };
    });
  };

  // Fetch real-time data
  const {
    data: treasury,
    isLoading: treasuryLoading,
    isError: treasuryError,
  } = trpc.squad.getTreasury.useQuery(
    { squadId: squadId || "" },
    { enabled: !!squadId && isVerified },
  );
  const { data: tactics, isLoading: tacticsLoading } = trpc.squad.getTactics.useQuery(
    { squadId: squadId || "" },
    { enabled: !!squadId && isVerified },
  );
  const { members, loading: membersLoading } = useSquadDetails(squadId);

  const dataLoading = squadId && (treasuryLoading || tacticsLoading || membersLoading);
  const dataError = squadId && treasuryError;
  const dataReady = !dataLoading && !!squadId;
  const hasLiveMembers = members.length > 0;
  const hasLiveTreasury = Boolean(treasury);
  const activeFormation =
    typeof (tactics as { formation?: unknown } | null | undefined)?.formation === "string"
      ? (tactics as { formation: string }).formation
      : null;
  const averageLevel = hasLiveMembers
    ? Math.round(
        members.reduce((acc, member) => acc + (member.stats?.level ?? 0), 0) / members.length,
      )
    : 0;
  const membersByMatchLoad = [...members].sort(
    (l, r) => (r.stats?.matches ?? 0) - (l.stats?.matches ?? 0),
  );
  const highLoadMembers = membersByMatchLoad.filter((m) => (m.stats?.matches ?? 0) >= 16);
  const freshMembers = [...membersByMatchLoad].reverse().slice(0, Math.min(2, members.length));
  const developmentMembers = [...members]
    .sort((l, r) => (l.stats?.level ?? 0) - (r.stats?.level ?? 0))
    .slice(0, Math.min(2, members.length));
  const contractCandidates = membersByMatchLoad.slice(0, Math.min(3, members.length));
  const squadDepthTarget = 8;
  const rotationGap = Math.max(0, squadDepthTarget - members.length);
  const positionCounts = members.reduce<Record<string, number>>((counts, m) => {
    if (m.position) counts[m.position] = (counts[m.position] ?? 0) + 1;
    return counts;
  }, {});
  const missingPositions = ["GK", "DF", "MF", "ST", "WG"].filter((p) => !positionCounts[p]);

  const alertMembers = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    stats: m.stats,
  }));
  const alertTreasury = treasury
    ? { balance: treasury.balance, transactions: treasury.transactions }
    : null;
  const alertTactics = (tactics as Record<string, unknown> | null | undefined)
    ? {
        formation:
          typeof (tactics as Record<string, unknown>).formation === "string"
            ? (tactics as { formation: string }).formation
            : undefined,
      }
    : null;

  const { state: agentCtx, dispatch: agentDispatch } = useAgentContext();
  const yellowSession = useYellowSession(squadId);
  const lensPost = trpc.lens.postUpdate.useMutation();

  const agentAlerts = useAgentAlerts({
    members: alertMembers,
    treasury: alertTreasury,
    tactics: alertTactics,
    dataReady,
  });

  // Welcome message on staff selection
  useEffect(() => {
    if (selectedStaff) {
      setChatHistories((prev) => {
        if (prev[selectedStaff.id]) return prev;
        return {
          ...prev,
          [selectedStaff.id]: [
            {
              sender: selectedStaff.name,
              text: "Welcome to the backroom, Boss. How can I help you today?",
            },
          ],
        };
      });
      setUsedActions(new Set());
    }
  }, [selectedStaff]);

  // Inject proactive agent alerts
  const alertsInjectedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!agentAlerts.length) return;
    setChatHistories((prev) => {
      const next = { ...prev };
      for (const alert of agentAlerts) {
        const key = `${alert.staffId}:${alert.text.slice(0, 40)}`;
        if (alertsInjectedRef.current.has(key)) continue;
        alertsInjectedRef.current.add(key);
        const existing = next[alert.staffId] || [
          {
            sender: STAFF_MEMBERS.find((s) => s.id === alert.staffId)?.name ?? alert.sender,
            text: "Welcome to the backroom, Boss. How can I help you today?",
          },
        ];
        next[alert.staffId] = [...existing, { sender: alert.sender, text: alert.text }];
      }
      return next;
    });
  }, [agentAlerts]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Cross-staff reactive messages
  const crossStaffInjectedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const { flaggedProspect, flaggedInjury, closedDeal, activeFormation: ctxFormation } = agentCtx;
    setChatHistories((prev) => {
      const next = { ...prev };
      const inject = (staffId: string, sender: string, text: string, key: string) => {
        if (crossStaffInjectedRef.current.has(key)) return;
        crossStaffInjectedRef.current.add(key);
        const existing = next[staffId] || [
          {
            sender: STAFF_MEMBERS.find((s) => s.id === staffId)?.name ?? sender,
            text: "Welcome to the backroom, Boss. How can I help you today?",
          },
        ];
        next[staffId] = [...existing, { sender, text }];
      };
      if (flaggedProspect) {
        inject(
          "agent-1",
          "The Agent",
          `📋 Boss, The Scout just flagged ${flaggedProspect.name} (${flaggedProspect.position}, age ${flaggedProspect.age}) for a trial. If the report comes back positive, we should have contract terms ready.`,
          `prospect:${flaggedProspect.name}:${flaggedProspect.flaggedAt}`,
        );
      }
      if (flaggedInjury) {
        inject(
          "coach-1",
          "Coach Kite",
          `⚠️ The Physio has flagged ${flaggedInjury.playerName} as ${flaggedInjury.riskLevel} risk (${flaggedInjury.recoveryDays} days recovery). I've adjusted the training plan to cover their position.`,
          `injury:${flaggedInjury.playerName}:${flaggedInjury.flaggedAt}`,
        );
      }
      if (closedDeal) {
        inject(
          "agent-1",
          "The Agent",
          `💰 Commercial Lead just opened negotiations with ${closedDeal.brand} (${closedDeal.value.toLocaleString()} credits, ${closedDeal.duration}). That would boost our transfer budget significantly.`,
          `deal:${closedDeal.brand}:${closedDeal.flaggedAt}`,
        );
      }
      if (ctxFormation) {
        inject(
          "physio-1",
          "The Physio",
          `🏃 Coach Kite has switched to ${ctxFormation.formation} (${ctxFormation.winRate}% win rate). I'll adjust the conditioning programme to match the physical demands of that shape.`,
          `formation:${ctxFormation.formation}:${ctxFormation.flaggedAt}`,
        );
      }
      return next;
    });
  }, [agentCtx]);

  const handleSendMessage = (text: string) => {
    setChatHistory((prev) => [...prev, { sender: "You", text }]);
    setIsTyping(true);

    const staffName = selectedStaff?.name || "Staff";

    const responseCtx: ChatResponseContext = {
      treasury: treasury ? { balance: treasury.balance, transactions: treasury.transactions } : null,
      members: members as unknown as import("./chatResponses").ChatResponseMember[],
      activeFormation,
      averageLevel,
      highLoadMembers: highLoadMembers as unknown as import("./chatResponses").ChatResponseMember[],
      freshMembers: freshMembers as unknown as import("./chatResponses").ChatResponseMember[],
      developmentMembers: developmentMembers as unknown as import("./chatResponses").ChatResponseMember[],
      contractCandidates: contractCandidates as unknown as import("./chatResponses").ChatResponseMember[],
      rotationGap,
      missingPositions,
      hasLiveMembers,
      yellowSessionStatus: yellowSession.status,
    };

    const result = handlePredefinedResponse(text, staffName, responseCtx, {
      setChatHistory,
      setIsTyping,
      setIsNegotiationOpen,
      setNegotiatingPlayer,
      setNegotiatingWage,
      agentDispatch: agentDispatch as (action: { type: string; payload?: any }) => void,
    });

    if (result) return; // Handled by predefined response

    // Free-text: call LLM with squad context
    const avgLevel = members?.length
      ? Math.round(members.reduce((acc, m) => acc + (m.stats?.level || 0), 0) / members.length)
      : undefined;
    agentChat.mutate(
      {
        staffId: selectedStaff?.id || "agent-1",
        message: text,
        recentDecisions,
        squadContext: {
          balance: treasury?.balance,
          memberCount: members?.length,
          avgLevel,
          formation: tactics?.formation ?? undefined,
          members: members?.slice(0, 8).map((m) => ({
            name: m.name,
            level: m.stats?.level,
            matches: m.stats?.matches,
            role: m.role,
          })),
        },
      },
      {
        onSuccess: (data) => {
          if (data) {
            setChatHistory((prev) => [...prev, { sender: staffName, text: data.reply }]);
          }
          setIsTyping(false);
        },
        onError: () => {
          setChatHistory((prev) => [
            ...prev,
            {
              sender: staffName,
              text: "Sorry Boss, I'm having trouble connecting right now. Try again in a moment.",
            },
          ]);
          setIsTyping(false);
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-6xl h-[90vh] md:h-[85vh] bg-gray-900 border-gray-800 overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <StaffSidebar
          selectedStaff={selectedStaff}
          isMarketplaceOpen={isMarketplaceOpen}
          onSelectStaff={(m) => {
            setSelectedStaff(m);
            setIsMarketplaceOpen(false);
          }}
          onOpenMarketplace={() => {
            setIsMarketplaceOpen(true);
            setSelectedStaff(null);
          }}
        />

        <div className="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-black">
          {isMarketplaceOpen ? (
            <MarketplacePanel squadId={squadId || ""} />
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl relative">
                    {selectedStaff?.avatar}
                    {selectedStaff?.agentId && (
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg"
                        title="Verified Identity"
                      >
                        <ShieldCheck className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white uppercase italic">
                        {selectedStaff?.name}
                      </h3>
                      {selectedStaff?.agentId && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-2 h-2" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                        {selectedStaff?.role}
                      </p>
                      {selectedStaff?.agentId && (
                        <>
                          <span className="text-gray-600">|</span>
                          <a
                            href={`https://explorer.gokite.ai/passport/${selectedStaff.agentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-500 hover:text-blue-400 font-mono transition-colors underline decoration-dotted"
                          >
                            {selectedStaff.agentId}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  {selectedStaff?.walletAddress && (
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Agent Wallet
                      </div>
                      <div className="text-xs font-mono text-gray-400">
                        {selectedStaff.walletAddress}
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                      NEGOTIATION POWER
                    </div>
                    <div className="w-24 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blue-500 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                {dataLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center space-x-2 section-title text-gray-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      <span>Loading squad data...</span>
                    </div>
                  </div>
                )}
                {dataError && (
                  <div className="mx-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    ⚠️ Could not load part of the live squad record. Only confirmed data and
                    planning guidance are available right now.
                  </div>
                )}
                {chatHistory.map((chat: ChatMessage, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${chat.sender === "You" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        chat.sender === "You"
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-500/10"
                          : "bg-white/5 text-gray-200 border border-white/10"
                      }`}
                    >
                      {chat.text}
                    </div>
                    {chat.actions && chat.actions.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {chat.actions.map(
                          (action: { label: string; onClick: () => void }, ai: number) => {
                            const actionKey = `${i}-${ai}`;
                            const consumed = usedActions.has(actionKey);
                            return (
                              <button
                                key={ai}
                                onClick={() => {
                                  if (consumed) return;
                                  setUsedActions((prev) => new Set(prev).add(actionKey));
                                  const isConfirm = action.label.startsWith("✅");
                                  const isDecline = action.label.startsWith("❌");
                                  if ((isConfirm || isDecline) && selectedStaff) {
                                    logDecision.mutate({
                                      staffId: selectedStaff.id,
                                      action: action.label.replace(/^[✅❌]\s*/, ""),
                                      decision: isConfirm ? "confirmed" : "declined",
                                      context: chatHistory[i]?.text?.slice(0, 80),
                                      timestamp: new Date().toISOString(),
                                    });
                                  }
                                  action.onClick();
                                }}
                                disabled={consumed}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                  consumed
                                    ? "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed"
                                    : "bg-white/10 border-white/10 text-gray-200 hover:bg-white/20 hover:text-white"
                                }`}
                              >
                                {action.label}
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
                {agentCtx.pendingOnChainAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start"
                  >
                    <div className="max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed border border-yellow-500/30 bg-yellow-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="section-title text-yellow-400">
                          {agentCtx.pendingOnChainAction.type === "yellow_payment"
                            ? "⛓️ Yellow Approval Pending"
                            : "⛓️ Action Pending"}
                        </span>
                      </div>
                      <p className="text-gray-200 text-xs mb-1">
                        {agentCtx.pendingOnChainAction.description}
                      </p>
                      {agentCtx.pendingOnChainAction.amount && (
                        <p className="text-yellow-300 text-[10px] font-bold">
                          💰 {agentCtx.pendingOnChainAction.amount.toLocaleString()}{" "}
                          {agentCtx.pendingOnChainAction.assetSymbol || "USDC"}
                        </p>
                      )}
                      {agentCtx.pendingOnChainAction.postText && (
                        <p className="text-gray-400 text-[10px] italic mt-1">
                          &ldquo;{agentCtx.pendingOnChainAction.postText}&rdquo;
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={async () => {
                            const action = agentCtx.pendingOnChainAction!;
                            if (action.type === "yellow_payment") {
                              if (yellowSession.status === "authenticated") {
                                setChatHistory((prev) => [
                                  ...prev,
                                  {
                                    sender: "⚡ Yellow Network",
                                    text: `✅ Payment of ${action.amount?.toLocaleString()} ${action.assetSymbol || "USDC"} authorised for Yellow off-chain settlement.`,
                                  },
                                ]);
                              } else {
                                setChatHistory((prev) => [
                                  ...prev,
                                  {
                                    sender: "⚡ Yellow Network",
                                    text: `⚠️ Yellow off-chain rail not active (status: ${yellowSession.status}). Connect an eligible EVM wallet to open the session.`,
                                  },
                                ]);
                              }
                            } else if (action.type === "lens_post") {
                              try {
                                const result = await lensPost.mutateAsync({
                                  text: action.postText || action.description,
                                  tags: ["SportWarren", "Phygital"],
                                });
                                setChatHistory((prev) => [
                                  ...prev,
                                  {
                                    sender: "📡 Lens Protocol",
                                    text: result.success
                                      ? "✅ Lens post submitted."
                                      : `⚠️ ${result.message}`,
                                  },
                                ]);
                              } catch {
                                setChatHistory((prev) => [
                                  ...prev,
                                  {
                                    sender: "📡 Lens Protocol",
                                    text: "⚠️ Lens publishing is unavailable right now.",
                                  },
                                ]);
                              }
                            }
                            agentDispatch({ type: "CLEAR_ONCHAIN_ACTION" });
                          }}
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 transition-all"
                        >
                          {agentCtx.pendingOnChainAction.type === "yellow_payment"
                            ? "⚡ Authorise Yellow"
                            : "✅ Sign & Execute"}
                        </button>
                        <button
                          onClick={() => agentDispatch({ type: "CLEAR_ONCHAIN_ACTION" })}
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 transition-all"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-4 rounded-2xl flex space-x-1">
                      <div
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions & Input */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1">
                  {getQuickActions(selectedStaff?.id || "", {
                    contractCandidates: contractCandidates.map((m) => m.name.split(" ")[0]),
                  }).map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(action)}
                      className="bg-white/5 border-white/10 text-gray-200 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = inputText.trim();
                    if (!trimmed || isTyping) return;
                    setInputText("");
                    handleSendMessage(trimmed);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask your staff anything..."
                    disabled={isTyping}
                    aria-label="Ask your staff"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        <StaffIntelSidebar
          squadId={squadId || ""}
          rotationGap={rotationGap}
          hasLiveTreasury={hasLiveTreasury}
          treasuryBalance={treasury?.balance ?? 0}
        />
      </Card>

      <ContractNegotiationModal
        playerName={negotiatingPlayer}
        currentWage={negotiatingWage}
        isOpen={isNegotiationOpen}
        onClose={() => setIsNegotiationOpen(false)}
        onFinalize={(newWage) => {
          setIsNegotiationOpen(false);
          setChatHistory((prev) => [
            ...prev,
            {
              sender: selectedStaff?.name || "Staff",
              text: `Excellent. ${negotiatingPlayer} is signed for ${newWage} credits per week. The paperwork is finalized.`,
            },
          ]);
        }}
      />
    </motion.div>
  );
};
