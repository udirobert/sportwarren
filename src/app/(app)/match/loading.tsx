import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SoccerLoader } from "@/components/ui/SoccerLoader";

export default function MatchLoading() {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3 px-2 mb-2">
        <SoccerLoader size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Loading Match Center
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
            <div className="flex items-center justify-center gap-6 py-8">
              <div className="text-center space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
              <div className="text-center space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <Skeleton className="h-5 w-40 mb-4 rounded" />
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <Skeleton className="h-5 w-36 mb-4 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <Skeleton className="h-5 w-28 mb-4 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
