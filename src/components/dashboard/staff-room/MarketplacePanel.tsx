"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChainLabel } from "@/components/common/ChainLabel";
import { trpc } from "@/lib/trpc-client";

interface MarketplacePanelProps {
  squadId: string;
}

export const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ squadId }) => {
  const [marketQuery, setMarketQuery] = React.useState("");
  const marketSearch = trpc.agent.searchMarketplace.useQuery(
    { query: marketQuery },
    { enabled: marketQuery.length > 2 },
  );
  const hireMutation = trpc.agent.hireMarketplaceAgent.useMutation();

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
            Kite Agent Marketplace
          </div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Hire Experts
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Expand your backroom staff with specialized AI agents from the global{" "}
            <ChainLabel chain="kite" />. Each agent is a verified on-chain identity with unique
            tactical models.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={marketQuery}
            onChange={(e) => setMarketQuery(e.target.value)}
            placeholder="Search for 'striker coach', 'scout', 'analyst'..."
            aria-label="Search marketplace"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all shadow-2xl"
          />
          {marketSearch.isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketSearch.data?.agents?.map((agent: any) => (
            <Card
              key={agent.id}
              className="bg-white/5 border-white/10 p-6 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black text-lg">{agent.price}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Per Week
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic mb-1">{agent.name}</h3>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-3">
                By {agent.author}
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">{agent.description}</p>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-3 shadow-lg shadow-emerald-600/20"
                onClick={() => {
                  hireMutation.mutate({ agentId: agent.id, squadId });
                  alert(`${agent.name} hired! They will appear in your staff room shortly.`);
                }}
                disabled={hireMutation.isPending}
              >
                {hireMutation.isPending ? "Hiring..." : "Hire Agent"}
              </Button>
            </Card>
          ))}
          {marketQuery.length > 2 &&
            marketSearch.data?.agents?.length === 0 &&
            !marketSearch.isLoading && (
              <div className="col-span-full py-20 text-center text-gray-500 font-bold uppercase tracking-widest">
                No specialized agents found for &quot;{marketQuery}&quot;. Try &quot;striker&quot;.
              </div>
            )}
          {marketQuery.length <= 2 && (
            <div className="col-span-full py-20 text-center text-gray-500 font-bold uppercase tracking-widest opacity-50 italic">
              Start typing to search the Kite marketplace...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
