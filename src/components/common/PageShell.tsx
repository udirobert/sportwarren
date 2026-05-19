"use client";

import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "6xl" | "4xl" | "2xl";
  ref?: React.Ref<HTMLDivElement>;
}

export function PageShell({ children, className, maxWidth = "6xl", ref }: PageShellProps) {
  const maxWidthClasses: Record<string, string> = {
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
  };
  const maxWidthClass = maxWidthClasses[maxWidth] || "max-w-6xl";
  return (
    <main
      ref={ref as React.Ref<HTMLElement>}
      className={`${maxWidthClass} mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom text-gray-900 dark:text-gray-100 ${className || ""}`}
    >
      {children}
    </main>
  );
}
