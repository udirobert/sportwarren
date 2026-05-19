"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import { PageContextualHints } from "@/components/common/PageContextualHints";

const SmartNavigation = dynamic(
  () => import("@/components/adaptive/SmartNavigation").then(mod => ({ default: mod.SmartNavigation })),
  { ssr: false }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmartNavigation />
      <div className="min-h-screen overflow-x-hidden">
        <Suspense fallback={null}>
          <VerificationBanner className="sticky top-16 z-30 mx-4 mt-4 md:mx-6" />
        </Suspense>
        <Suspense fallback={null}>
          <PageContextualHints />
        </Suspense>
        {children}
      </div>
    </>
  );
}
