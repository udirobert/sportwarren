import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface KiteVerificationBadgeProps {
  verified?: boolean;
  passportId?: string;
  className?: string;
}

/**
 * KiteVerificationBadge - Displays the verification status of an AI Agent on the Kite Chain.
 * High-signal indicator for the Kites Hackathon.
 */
export const KiteVerificationBadge: React.FC<KiteVerificationBadgeProps> = ({
  verified = true,
  passportId,
  className = "",
}) => {
  return (
    <div className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 transition-all hover:bg-emerald-500/10 ${className}`}>
      <div className="relative">
        <ShieldCheck className={`w-3.5 h-3.5 ${verified ? 'text-emerald-500' : 'text-gray-400'}`} />
        {verified && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        )}
      </div>
      
      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        Kite Verified {passportId && <span className="opacity-40 ml-1">#{passportId}</span>}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 rounded-lg text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-gray-800 z-50">
        <div className="flex items-start gap-2">
          <Info className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-tight">
            This agent identity is anchored on the <span className="text-emerald-400 font-bold">Kite Chain</span>. All actions are cryptographically signed and verifiable.
          </p>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex justify-between items-center text-[8px] font-mono">
          <span className="opacity-60 text-emerald-300">KITE PASSPORT</span>
          <span className="font-bold">0x...{passportId?.slice(-4) || 'ACTIVE'}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};
