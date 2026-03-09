"use client";

import Link from "next/link";
import { PlayerReputation } from "@/components/player/PlayerReputation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, History } from "lucide-react";

export default function ReputationPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Contextual nav — connects reputation back to the match journey */}
      <Card className="border-gray-100 bg-gray-50 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Reputation is earned through verified matches. Submit and verify results to grow your score.
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/match?mode=history">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Match History
              </Button>
            </Link>
            <Link href="/match">
              <Button size="sm" className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Play a Match
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <PlayerReputation />
    </div>
  );
}
