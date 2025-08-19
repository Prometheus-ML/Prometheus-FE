import GlassCard from './GlassCard';

export default function EventCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden border border-white/20">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="h-6 bg-white/10 rounded mb-2 animate-pulse"></div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="h-5 w-16 bg-white/10 rounded-full animate-pulse"></div>
              <div className="h-5 w-20 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="h-4 bg-white/10 rounded mb-3 animate-pulse"></div>
        <div className="h-4 bg-white/10 rounded mb-3 animate-pulse w-3/4"></div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
