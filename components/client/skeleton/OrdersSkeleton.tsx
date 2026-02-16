import { Skeleton } from "@/components/ui/skeleton";
export default function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Skeleton for the Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center px-1">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-8 w-[140px] rounded-md" />
      </div>

      {/* Skeleton for the Orders List */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border bg-transparent p-6"
          >
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="size-12 rounded-xl shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="size-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
