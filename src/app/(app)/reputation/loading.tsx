import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ReputationLoading() {
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
      </Card>

      {/* Stat summary row */}
      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <Skeleton variant="text-sm" className="w-16 mb-2" />
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton variant="text-sm" className="w-20 mt-1" />
            </div>
          ))}
        </div>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Player Reputation placeholder */}
          <Card>
            <Skeleton className="h-6 w-40 mb-4 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <Skeleton variant="text-sm" className="w-16" />
                      <Skeleton variant="text-sm" className="w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Match Contributions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <Skeleton variant="text-sm" className="w-28" />
                    <Skeleton variant="text-sm" className="w-36" />
                  </div>
                  <Skeleton className="w-12 h-4 rounded" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Trophy Room sidebar */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-28 rounded" />
          </div>
          <Card>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex flex-col items-center p-3 rounded-xl border border-gray-100">
                  <Skeleton className="w-10 h-10 rounded-xl mb-2" />
                  <Skeleton variant="text-sm" className="w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
