import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SquadLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 nav-spacer-top nav-spacer-bottom space-y-4 md:space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 md:block md:text-center">
        <Skeleton className="w-10 h-10 md:w-16 md:h-16 md:mx-auto md:mb-4 rounded-xl" />
        <div className="min-w-0 flex-1 md:flex-none">
          <Skeleton className="h-7 w-48 md:mx-auto rounded" />
          <Skeleton variant="text-sm" className="w-32 mt-1 md:mx-auto" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-md" />
        ))}
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="text-center py-3">
            <Skeleton className="h-8 w-16 mx-auto mb-2 rounded" />
            <Skeleton variant="text-sm" className="w-20 mx-auto" />
          </Card>
        ))}
      </div>

      {/* Main content card */}
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton variant="text" className="w-full max-w-md" />
          </div>
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {/* Squad Profile */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
            <Skeleton className="h-5 w-28 mb-4 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton variant="text-sm" className="w-20" />
                  <Skeleton variant="text-sm" className="w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <Skeleton className="h-5 w-28 mb-4 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 px-4 py-3">
                  <Skeleton variant="text-sm" className="w-48 mb-2" />
                  <Skeleton variant="text-sm" className="w-36" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Two-column cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i}>
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>
            <Skeleton variant="text" className="w-full mb-1" />
            <Skeleton variant="text" className="w-3/4 mb-1" />
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton className="h-9 w-full mt-4 rounded-lg" />
          </Card>
        ))}
      </div>
    </div>
  );
}
