"use client";

import Link from "next/link";
import { Community } from "@/legacy-pages/Community";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, Users } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Contextual nav — connects community back to the match and squad journey */}
      <Card className="border-gray-100 bg-gray-50 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Rivalries and leaderboards are built from verified match results. Play more to climb the rankings.
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/squad">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                My Squad
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

      <Community />
    </div>
  );
}
