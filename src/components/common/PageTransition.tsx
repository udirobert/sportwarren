'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const [displayPathname, setDisplayPathname] = useState(pathname);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

  useEffect(() => {
    if (pathname !== displayPathname) {
      setTransitionStage('fadeOut');
    }
  }, [pathname, displayPathname]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayPathname(pathname);
    }
  };

  return (
    <div
      className={`${
        transitionStage === 'fadeOut' ? 'animate-fade-out' : 'animate-fade-in-up'
      }`}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};
