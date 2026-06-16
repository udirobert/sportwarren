import { notFound } from 'next/navigation';
import { isEnabled } from '@/lib/feature-flags';
import CoachingMarketplace from './CoachingMarketplace';

export default function CoachingPage() {
  if (!isEnabled('COACHING')) {
    notFound();
  }
  return <CoachingMarketplace />;
}
