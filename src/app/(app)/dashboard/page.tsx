"use client";

import dynamic from "next/dynamic";

const AdaptiveDashboard = dynamic(
  () => import("@/components/adaptive/AdaptiveDashboard").then(mod => ({ default: mod.AdaptiveDashboard })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  return <AdaptiveDashboard />;
}
