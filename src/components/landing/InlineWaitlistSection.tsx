import React from 'react';
import { WaitlistForm } from '@/components/common/WaitlistForm';

export const InlineWaitlistSection: React.FC = () => (
  <section className="py-16 bg-gray-900/40 border-t border-white/5">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h3 className="text-2xl font-extrabold text-white mb-2">Be a founding member</h3>
      <p className="text-sm text-gray-400 mb-6">Get early access updates and perks. No wallet required.</p>
      <div className="flex justify-center">
        <WaitlistForm variant="inline" source="inline" />
      </div>
    </div>
  </section>
);
