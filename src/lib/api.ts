import { User } from 'firebase/auth';
import { Task } from '../types/todo';

async function authFetch<T>(user: User, url: string, options: RequestInit = {}): Promise<T> {
  const token = await user.getIdToken();
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : 'Request failed. Please try again.';
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchTasks(user: User): Promise<Task[]> {
  const data = await authFetch<{ tasks: Task[] }>(user, '/api/tasks');
  return data.tasks;
}

export async function createTask(user: User, title: string): Promise<Task> {
  const data = await authFetch<{ task: Task }>(user, '/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  return data.task;
}

export async function updateTask(
  user: User,
  taskId: string,
  updates: { title?: string; completed?: boolean }
): Promise<Task> {
  const data = await authFetch<{ task: Task }>(
    user,
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }
  );
  return data.task;
}

export async function deleteTask(user: User, taskId: string): Promise<void> {
  await authFetch<{ deletedId: string }>(
    user,
    `/api/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
    }
  );
}
