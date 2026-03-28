import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-7 w-24 rounded" />
          <Skeleton variant="text-sm" className="w-56" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-none border-b-2 -mb-px" />
        ))}
      </div>

      {/* Profile form card */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton variant="text" className="w-64" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Skeleton variant="text-sm" className="w-20 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton variant="text-sm" className="w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </Card>

      {/* Account card */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton variant="text" className="w-56" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <Skeleton variant="text-sm" className="w-20 mb-2" />
              <Skeleton variant="text" className="w-32" />
            </div>
          ))}
        </div>
      </Card>

      {/* Stats row */}
      <Card>
        <Skeleton className="h-5 w-24 mb-4 rounded" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
              <Skeleton className="w-5 h-5 mx-auto mb-1 rounded" />
              <Skeleton className="h-6 w-8 mx-auto mb-1 rounded" />
              <Skeleton variant="text-sm" className="w-12 mx-auto" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
