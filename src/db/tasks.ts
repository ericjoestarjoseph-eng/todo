import crypto from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { tasks } from './schema.ts';

export async function getTasksForUser(userId: number) {
  try {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw new Error('Unable to load your tasks right now.', { cause: error });
  }
}

export async function createTaskForUser(userId: number, title: string) {
  try {
    const now = new Date();
    const id = crypto.randomUUID();
    const [created] = await db
      .insert(tasks)
      .values({
        id,
        userId,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return created;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw new Error('Unable to save your new task.', { cause: error });
  }
}

export async function updateTaskForUser(
  userId: number,
  taskId: string,
  updates: { title?: string; completed?: boolean }
) {
  try {
    const values: { title?: string; completed?: boolean; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (typeof updates.title === 'string') {
      values.title = updates.title;
    }
    if (typeof updates.completed === 'boolean') {
      values.completed = updates.completed;
    }

    const [updated] = await db
      .update(tasks)
      .set(values)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return updated ?? null;
  } catch (error) {
    console.error('Failed to update task:', error);
    throw new Error('Unable to update the task.', { cause: error });
  }
}

export async function deleteTaskForUser(userId: number, taskId: string) {
  try {
    const [deleted] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning({ id: tasks.id });

    return deleted ?? null;
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw new Error('Unable to delete the task.', { cause: error });
  }
}
