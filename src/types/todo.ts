export type TaskFilter = 'all' | 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
}
