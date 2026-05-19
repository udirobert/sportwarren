"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LucideIcon } from "lucide-react";

interface NavAction {
  label: string;
  href: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

interface ContextualNavCardProps {
  contextMessage: string;
  actions: NavAction[];
  className?: string;
}

export function ContextualNavCard({
  contextMessage,
  actions,
  className = "",
}: ContextualNavCardProps) {
  return (
    <Card className={`border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 py-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-200">
          {contextMessage}
        </p>
        <div className="flex gap-2 shrink-0">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                size="sm"
                variant={action.variant || "outline"}
                className="flex items-center gap-1.5"
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}