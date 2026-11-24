import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardList, SearchX } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PokeballIcon, StickerBadge } from './components/PokemonSprites';
import { RoamingPokemon } from './components/RoamingPokemon';
import { StatsCards } from './components/StatsCards';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { TaskToolbar } from './components/TaskToolbar';
import { Task, TaskFilter, TaskStats } from './types/todo';
import { generateTaskId, loadTasks, saveTasks } from './utils/storage';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const handleStorageSync = (event: StorageEvent) => {
      if (event.key === 'my_todo_list_tasks_v1') {
        setTasks(loadTasks());
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const stats: TaskStats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      pending: tasks.length - completed,
      completed,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && !task.completed) ||
        (activeFilter === 'completed' && task.completed);

      const matchesSearch =
        normalizedQuery === '' || task.title.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  const handleAddTask = (title: string) => {
    const newTask: Task = {
      id: generateTaskId(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    let becameCompleted = false;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        becameCompleted = !task.completed;
        return {
          ...task,
          completed: !task.completed,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (becameCompleted) {
      setCelebrationCount((count) => count + 1);
    }
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              title: newTitle,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const handleConfirmDelete = () => {
    if (!taskPendingDelete) return;
    const idToDelete = taskPendingDelete.id;
    setTasks((prev) => prev.filter((task) => task.id !== idToDelete));
    setTaskPendingDelete(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
  };

  const todayFormatted = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  return (
    <div className="bg-trainer-grid min-h-screen text-slate-900">
      {/* Pokedex crimson top trim */}
      <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="relative mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
          {/* Playful die-cut stickers tucked around header corners */}
          <div className="absolute -left-3 -top-3">
            <StickerBadge type="pikachu-face" rotate={-14} title="Pikachu" />
          </div>
          <div className="absolute -right-3 -top-3">
            <StickerBadge type="greatball" rotate={12} title="Great Ball" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 pl-2 sm:pl-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-red-50">
                <PokeballIcon caught={true} className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  My Todo List
                </h1>
                <p className="text-sm text-slate-500">
                  Trainer task log with roaming companions and local save.
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 sm:text-right">{todayFormatted}</p>
          </div>

          {/* Meadow strip where small Pokemon run around */}
          <div className="mt-5">
            <RoamingPokemon celebrationTrigger={celebrationCount} />
          </div>
        </header>

        <main className="space-y-6">
          <StatsCards stats={stats} />

          <TaskForm onAddTask={handleAddTask} inputRef={newTaskInputRef} />

          <TaskToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            stats={stats}
          />

          <section
            aria-label="Task list"
            className="relative rounded-xl border border-slate-200 bg-white shadow-2xs"
          >
            {/* Extra playful stickers placed around the task notebook */}
            <div className="pointer-events-none absolute -bottom-3 -left-3 z-10 hidden sm:block">
              <div className="pointer-events-auto">
                <StickerBadge type="bulbasaur-face" rotate={-10} title="Bulbasaur" />
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-3 -right-3 z-10 hidden sm:block">
              <div className="pointer-events-auto">
                <StickerBadge type="charmander-face" rotate={11} title="Charmander" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
              <h2 className="font-display text-sm font-semibold text-slate-800">
                Trainer Tasks
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Showing {filteredTasks.length} of {stats.total}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <ClipboardList className="h-7 w-7" aria-hidden="true" />
                  <div className="absolute -right-2 -top-2">
                    <StickerBadge type="oran-berry" rotate={14} title="Oran Berry" className="scale-75" />
                  </div>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                  No tasks yet
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Your trainer log is clear. Add your first task above to start catching goals.
                </p>
                <button
                  type="button"
                  onClick={() => newTaskInputRef.current?.focus()}
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[40px] cursor-pointer"
                >
                  Create First Task
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <SearchX className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
                  No matching tasks
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  No tasks match your current search or filter selection.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[40px] cursor-pointer"
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-b-xl">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onUpdateTitle={handleUpdateTitle}
                      onRequestDelete={setTaskPendingDelete}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>

          {/* Compact sticker strip & subtle trainer footer */}
          <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <p>Click any pixelated companion or sticker for a surprise.</p>
            <div className="flex items-center gap-2">
              <StickerBadge type="squirtle-face" rotate={-8} title="Squirtle" className="scale-90" />
              <StickerBadge type="ultraball" rotate={6} title="Ultra Ball" className="scale-90" />
              <StickerBadge type="bulbasaur-face" rotate={-6} title="Bulbasaur" className="scale-90 sm:hidden" />
              <StickerBadge type="charmander-face" rotate={8} title="Charmander" className="scale-90 sm:hidden" />
            </div>
          </footer>
        </main>
      </div>

      <DeleteConfirmModal
        task={taskPendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskPendingDelete(null)}
      />
    </div>
  );
}
