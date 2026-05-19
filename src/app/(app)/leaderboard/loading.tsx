import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SoccerLoader } from "@/components/ui/SoccerLoader";

export default function LeaderboardLoading() {
  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3 px-2 mb-2">
        <SoccerLoader size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Loading Leaderboard
        </span>
      </div>

      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="grid grid-cols-12 gap-2 md:gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-700">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-16 col-span-6 md:col-span-7" />
          <Skeleton className="h-3 w-20 col-span-3 md:col-span-2 ml-auto" />
          <Skeleton className="h-3 w-10 col-span-2 ml-auto" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center">
              <Skeleton className="h-5 w-5 col-span-1" />
              <div className="col-span-6 md:col-span-7 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 col-span-3 md:col-span-2 ml-auto" />
              <Skeleton className="h-4 w-10 col-span-2 ml-auto" />
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
