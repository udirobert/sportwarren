import React from 'react';
import { Target } from 'lucide-react';
import { WaitlistForm } from '@/components/common/WaitlistForm';

export const LandingFooter: React.FC = () => (
  <footer className="relative py-10 sm:py-16 bg-gray-950 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-green-500/10 text-green-400">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white/80">SportWarren</div>
            <div className="text-[10px] sm:text-xs text-gray-500">Rec football, with stats that stick</div>
          </div>
        </div>

        <nav aria-label="Social links" className="flex items-center gap-4 sm:gap-6">
          <a href="https://t.me/sportwarrenbot" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
            Telegram
          </a>
          <a href="https://x.com/sportwarren" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
            X / Twitter
          </a>
          <a href="mailto:hello@sportwarren.com" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
            Contact
          </a>
        </nav>
      </div>

      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <p className="text-[10px] sm:text-xs text-gray-600">
          &copy; {new Date().getFullYear()} SportWarren. All rights reserved.
        </p>
        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-600 w-full md:w-auto md:justify-end">
          <div className="hidden md:block">Built for 5-a-side warriors</div>
          <span className="hidden md:block w-1 h-1 rounded-full bg-gray-700" aria-hidden="true" />
          <div className="w-full md:w-auto">
            <WaitlistForm variant="footer" source="footer" />
          </div>
        </div>
      </div>
    </div>
  </footer>
);
