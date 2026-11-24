import { TaskStats } from '../types/todo';
import { StickerBadge } from './PokemonSprites';

interface StatsCardsProps {
  stats: TaskStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <section aria-label="Task statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors duration-150">
        <div className="absolute -right-2.5 -top-2.5 hidden sm:block">
          <StickerBadge type="pokeball" rotate={10} title="Pokeball" className="scale-90" />
        </div>
        <p className="text-sm font-medium text-slate-500">Total Tasks</p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="font-display text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {stats.total}
          </span>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {completionRate}% caught
          </span>
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors duration-150">
        <div className="absolute -right-2 -top-2.5 hidden sm:block">
          <StickerBadge type="thunderbolt" rotate={-12} title="Thunderbolt" className="scale-90" />
        </div>
        <p className="text-sm font-medium text-slate-500">Pending Tasks</p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="font-display text-3xl font-semibold tracking-tight text-amber-600 tabular-nums">
            {stats.pending}
          </span>
          <span className="text-xs font-medium text-slate-500">In Tall Grass</span>
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors duration-150">
        <div className="absolute -right-2.5 -top-2.5 hidden sm:block">
          <StickerBadge type="gym-badge" rotate={8} title="Gym Badge" className="scale-90" />
        </div>
        <p className="text-sm font-medium text-slate-500">Completed Tasks</p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="font-display text-3xl font-semibold tracking-tight text-emerald-600 tabular-nums">
            {stats.completed}
          </span>
          <span className="text-xs font-medium text-slate-500">Captured</span>
        </div>
      </div>
    </section>
  );
}
