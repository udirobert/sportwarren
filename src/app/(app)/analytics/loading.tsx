import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom space-y-4 text-gray-900 dark:text-gray-100">
      {/* Context bar */}
      <Card className="border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Skeleton variant="text" className="w-full max-w-md" />
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Growth funnel */}
      <Card className="border-emerald-200 bg-emerald-50/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton variant="text-sm" className="w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
              <Skeleton variant="text-sm" className="w-24 mb-2" />
              <Skeleton className="h-8 w-12 rounded" />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
              <Skeleton variant="text-sm" className="w-28 mb-2" />
              <Skeleton variant="text" className="w-36 mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j}>
                    <Skeleton variant="text-sm" className="w-12 mb-1" />
                    <Skeleton className="h-5 w-8 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Two-column: Form + Attributes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Form */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-28 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton variant="text-sm" className="w-32" />
                  <Skeleton variant="text-sm" className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Attribute Ratings */}
        <Card>
          <Skeleton className="h-5 w-36 mb-4 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton variant="text-sm" className="w-16" />
                  <Skeleton variant="text-sm" className="w-6" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
