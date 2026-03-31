import React from 'react';
import { WaitlistForm } from '@/components/common/WaitlistForm';

export const InlineWaitlistSection: React.FC = () => (
  <section className="py-12 sm:py-16 bg-gray-900/40 border-t border-white/5">
    <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
      <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Be a founding member</h3>
      <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Get early access updates and perks. No wallet required.</p>
      <div className="flex justify-center">
        <WaitlistForm variant="inline" source="inline" />
      </div>
    </div>
  </section>
);
