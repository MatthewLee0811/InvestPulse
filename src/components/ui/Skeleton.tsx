// components/ui/Skeleton.tsx - 스켈레톤 로딩 UI
// v1.0.0 | 2026-02-17

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-700/50 ${className}`}
    />
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#111827] p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="mb-2 h-7 w-28" />
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function EventRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-gray-800 px-4 py-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-4 w-40" />
      <div className="ml-auto flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="border-b border-gray-800 px-4 py-4">
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
