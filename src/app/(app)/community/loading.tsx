import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CommunityLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom space-y-4 text-gray-900 dark:text-gray-100">
      {/* Context bar */}
      <Card className="border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Skeleton variant="text" className="w-full max-w-md" />
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </Card>

      {/* Two-column: Leaderboard + Squads */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-36 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-6 h-4 rounded" />
                <Skeleton variant="avatar-sm" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton variant="text-sm" className="w-24" />
                  <Skeleton variant="text-sm" className="w-32" />
                </div>
                <Skeleton className="w-8 h-4 rounded" />
              </div>
            ))}
          </div>
        </Card>

        {/* Squads */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton variant="avatar-sm" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton variant="text-sm" className="w-28" />
                  <Skeleton variant="text-sm" className="w-20" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton variant="text-sm" className="w-20" />
                <Skeleton className="h-6 w-12 rounded" />
                <Skeleton variant="text-sm" className="w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
