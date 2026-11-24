import { Task } from '../types/todo';

const STORAGE_KEY = 'my_todo_list_tasks_v1';

export function loadTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is Task =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Task).id === 'string' &&
        typeof (item as Task).title === 'string' &&
        typeof (item as Task).completed === 'boolean' &&
        typeof (item as Task).createdAt === 'string'
    );
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCreatedDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
