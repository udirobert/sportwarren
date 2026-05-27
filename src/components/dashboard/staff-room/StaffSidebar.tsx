"use client";

import React from "react";
import { Coffee, ShieldCheck } from "lucide-react";
import { STAFF_MEMBERS } from "./constants";
import type { StaffMember } from "./types";

interface StaffSidebarProps {
  selectedStaff: StaffMember | null;
  isMarketplaceOpen: boolean;
  onSelectStaff: (member: StaffMember) => void;
  onOpenMarketplace: () => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  selectedStaff,
  isMarketplaceOpen,
  onSelectStaff,
  onOpenMarketplace,
}) => (
  <div className="w-full md:w-72 bg-black/40 border-r border-white/5 flex flex-col shrink-0 max-h-48 md:max-h-full overflow-hidden">
    <div className="p-6 border-b border-white/5">
      <div className="flex items-center space-x-2 text-blue-400 mb-1">
        <Coffee className="w-4 h-4" />
        <span className="text-xs font-black uppercase tracking-[0.2em]">The Staff Room</span>
      </div>
      <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Office</h2>
    </div>
    <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-y-auto p-4 gap-2 md:space-y-2">
      {STAFF_MEMBERS.map((member) => (
        <button
          key={member.id}
          onClick={() => onSelectStaff(member)}
          className={`shrink-0 md:w-full p-3 md:p-4 rounded-xl flex items-center space-x-3 md:space-x-4 transition-all ${
            selectedStaff?.id === member.id && !isMarketplaceOpen
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-gray-200 hover:bg-white/5"
          }`}
        >
          <div className="text-2xl">{member.avatar}</div>
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-black uppercase truncate">{member.name}</div>
            <div
              className={`text-xs uppercase font-bold ${
                selectedStaff?.id === member.id && !isMarketplaceOpen
                  ? "text-blue-100"
                  : "text-gray-300"
              }`}
            >
              {member.role}
            </div>
          </div>
          {member.mood === "busy" && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </button>
      ))}

      <div className="h-px bg-white/5 my-2 hidden md:block" />

      <button
        onClick={onOpenMarketplace}
        className={`shrink-0 md:w-full p-3 md:p-4 rounded-xl flex items-center space-x-3 md:space-x-4 transition-all ${
          isMarketplaceOpen
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            : "text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
        }`}
      >
        <div className="text-2xl">🏪</div>
        <div className="text-left flex-1 min-w-0">
          <div className="text-sm font-black uppercase truncate">Marketplace</div>
          <div
            className={`text-xs uppercase font-bold ${
              isMarketplaceOpen ? "text-emerald-100" : "text-emerald-500/70"
            }`}
          >
            Hire Experts
          </div>
        </div>
      </button>
    </div>
    <div className="p-4 bg-black/20 text-xs text-gray-400 font-mono flex items-center justify-between">
      <span>SECURITY LEVEL: 4 (MANAGER)</span>
      <ShieldCheck className="w-3 h-3" />
    </div>
  </div>
);
