import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { AlertCircle, ClipboardList, LogOut, RefreshCw, SearchX } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoginScreen } from './components/LoginScreen';
import { PokeballIcon, StickerBadge } from './components/PokemonSprites';
import { RoamingPokemon } from './components/RoamingPokemon';
import { StatsCards } from './components/StatsCards';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { TaskToolbar } from './components/TaskToolbar';
import { createTask, deleteTask, fetchTasks, updateTask } from './lib/api';
import { auth } from './lib/firebase';
import { Task, TaskFilter, TaskStats } from './types/todo';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (!firebaseUser) {
        setTasks([]);
        setApiError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserTasks = useCallback(async (currentUser: User) => {
    setTasksLoading(true);
    setApiError(null);
    try {
      const loaded = await fetchTasks(currentUser);
      setTasks(loaded);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load your tasks right now.';
      setApiError(message);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadUserTasks(user);
    }
  }, [user, loadUserTasks]);

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

  const handleAddTask = async (title: string): Promise<boolean> => {
    if (!user) return false;
    setIsCreating(true);
    setApiError(null);
    try {
      const created = await createTask(user, title);
      setTasks((prev) => [created, ...prev]);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create task right now.';
      setApiError(message);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return;

    const nextCompleted = !existing.completed;
    setApiError(null);

    // Optimistic update for crisp feedback
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: nextCompleted,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
    if (nextCompleted) {
      setCelebrationCount((count) => count + 1);
    }

    try {
      const updated = await updateTask(user, id, { completed: nextCompleted });
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } catch (error) {
      // Revert on failure
      setTasks((prev) => prev.map((task) => (task.id === id ? existing : task)));
      const message =
        error instanceof Error ? error.message : 'Unable to update task status.';
      setApiError(message);
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    if (!user) return;
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return;

    setApiError(null);
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

    try {
      const updated = await updateTask(user, id, { title: newTitle });
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
    } catch (error) {
      setTasks((prev) => prev.map((task) => (task.id === id ? existing : task)));
      const message =
        error instanceof Error ? error.message : 'Unable to save task changes.';
      setApiError(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !taskPendingDelete) return;
    const target = taskPendingDelete;
    setTaskPendingDelete(null);
    setApiError(null);

    setTasks((prev) => prev.filter((task) => task.id !== target.id));

    try {
      await deleteTask(user, target.id);
    } catch (error) {
      // Restore deleted item on failure
      setTasks((prev) => [target, ...prev]);
      const message =
        error instanceof Error ? error.message : 'Unable to delete task right now.';
      setApiError(message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setApiError('Unable to sign out right now.');
    }
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

  if (authLoading) {
    return (
      <div className="bg-trainer-grid flex min-h-screen flex-col text-slate-900">
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400" />
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <PokeballIcon caught={true} className="h-7 w-7" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">Loading your trainer log...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const userInitial = (user.displayName || user.email || 'T').slice(0, 1).toUpperCase();

  return (
    <div className="bg-trainer-grid min-h-screen text-slate-900">
      <div className="h-2 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400" />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="relative mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
          <div className="absolute -left-3 -top-3">
            <StickerBadge type="pikachu-face" rotate={-14} title="Pikachu" />
          </div>
          <div className="absolute -right-3 -top-3">
            <StickerBadge type="greatball" rotate={12} title="Great Ball" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5 pl-2 sm:pl-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-red-50">
                <PokeballIcon caught={true} className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  My Todo List
                </h1>
                <p className="text-sm text-slate-500">{todayFormatted}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
              <div className="flex min-w-0 items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Trainer avatar'}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                    {userInitial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 max-w-[160px]">
                    {user.displayName || 'Trainer'}
                  </p>
                  <p className="truncate text-xs text-slate-500 max-w-[160px]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="mt-5">
            <RoamingPokemon celebrationTrigger={celebrationCount} />
          </div>
        </header>

        <main className="space-y-6">
          {apiError && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{apiError}</span>
              </div>
              <button
                type="button"
                onClick={() => void loadUserTasks(user)}
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 sm:self-auto cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          )}

          <StatsCards stats={stats} />

          <TaskForm
            onAddTask={handleAddTask}
            inputRef={newTaskInputRef}
            isSubmitting={isCreating}
          />

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

            {tasksLoading ? (
              <div aria-busy="true" aria-label="Loading tasks" className="divide-y divide-slate-100">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                    <div className="flex flex-1 items-center gap-3.5">
                      <div className="h-6 w-6 rounded-full bg-slate-200/80" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded bg-slate-200/80" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="hidden h-9 w-40 rounded-lg bg-slate-100 sm:block" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <ClipboardList className="h-7 w-7" aria-hidden="true" />
                  <div className="absolute -right-2 -top-2">
                    <StickerBadge
                      type="oran-berry"
                      rotate={14}
                      title="Oran Berry"
                      className="scale-75"
                    />
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
