"use client";

import Link from "next/link";
import { PlayerAnalytics } from "@/legacy-pages/PlayerAnalytics";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Contextual nav — analytics are driven by match and player data */}
      <Card className="border-gray-100 bg-gray-50 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Performance analytics improve as you log more verified matches. Submit results to build your data set.
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/stats">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                My Stats
              </Button>
            </Link>
            <Link href="/match?mode=capture">
              <Button size="sm" className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Log a Match
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <PlayerAnalytics />
    </div>
  );
}
