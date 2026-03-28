"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { WaitlistForm } from '@/components/common/WaitlistForm';

export function ExitIntentWaitlist() {
  const { hasAccount, isGuest } = useWallet();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasAccount || isGuest) return; // Only for public visitors
    if (pathname !== '/') return; // Only on landing
    if (localStorage.getItem('sw_exit_wl_shown') === 'true') return;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        localStorage.setItem('sw_exit_wl_shown', 'true');
        setVisible(true);
      }
    };
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (depth > 0.7) {
        localStorage.setItem('sw_exit_wl_shown', 'true');
        setVisible(true);
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('mouseout', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mouseout', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasAccount, isGuest, pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900/90 backdrop-blur-md p-4">
        <div className="text-center mb-3 text-sm text-gray-300">Get early access updates</div>
        <WaitlistForm variant="inline" source="exit" autoFocus />
        <div className="text-center mt-2">
          <button onClick={() => setVisible(false)} className="text-xs text-gray-400 hover:text-gray-200">No thanks</button>
        </div>
      </div>
    </div>
  );
}

