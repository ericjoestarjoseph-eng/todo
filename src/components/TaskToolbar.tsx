import { Search, X } from 'lucide-react';
import { TaskFilter, TaskStats } from '../types/todo';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  stats: TaskStats;
}

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  stats,
}: TaskToolbarProps) {
  const getCountForFilter = (filter: TaskFilter): number => {
    if (filter === 'all') return stats.total;
    if (filter === 'pending') return stats.pending;
    return stats.completed;
  };

  return (
    <section
      aria-label="Search and filter tasks"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <label htmlFor="task-search-input" className="sr-only">
          Search tasks by title
        </label>
        <input
          id="task-search-input"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks..."
          className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 sm:min-h-[40px]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter tasks by status"
        className="inline-flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-slate-100/90 p-1 sm:self-auto"
      >
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.value;
          const count = getCountForFilter(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              aria-pressed={isActive}
              className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[34px] cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{option.label}</span>
              <span
                className={`font-mono text-xs tabular-nums ${
                  isActive ? 'text-red-600' : 'text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
