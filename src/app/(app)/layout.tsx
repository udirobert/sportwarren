"use client";

import dynamic from "next/dynamic";

const SmartNavigation = dynamic(
  () => import("@/components/adaptive/SmartNavigation").then(mod => ({ default: mod.SmartNavigation })),
  { ssr: false }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmartNavigation />
      {children}
    </>
  );
}
