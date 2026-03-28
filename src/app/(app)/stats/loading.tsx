import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StatsLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6 text-gray-900 dark:text-gray-100">
      {/* Season header */}
      <Card className="border-gray-100 bg-gray-50">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton variant="text-sm" className="w-32" />
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton variant="text-sm" className="w-64" />
            <Skeleton variant="text" className="w-full max-w-2xl" />
          </div>
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>
      </Card>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Skeleton variant="text-sm" className="w-16 mb-2" />
                <Skeleton variant="stat" />
              </div>
              <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Skill ratings */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Skeleton className="h-5 w-32 mb-4 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <Skeleton variant="text-sm" className="w-12" />
                  <Skeleton variant="text-sm" className="w-6" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom two-column */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton variant="text-sm" className="w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <Skeleton variant="text-sm" className="w-40 mb-5" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Skeleton variant="text-sm" className="w-20 mb-2" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton variant="text-sm" className="w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton variant="text-sm" className="w-32" />
                  <Skeleton variant="text-sm" className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
