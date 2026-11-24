import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  createTaskForUser,
  deleteTaskForUser,
  getTasksForUser,
  updateTaskForUser,
} from './src/db/tasks.ts';
import { AuthRequest, requireAuth } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.dbUser!.id;
      const rows = await getTasksForUser(userId);
      res.json({
        tasks: rows.map((row) => ({
          id: row.id,
          title: row.title,
          completed: row.completed,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load tasks right now.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    const rawTitle = req.body?.title;
    if (typeof rawTitle !== 'string') {
      res.status(400).json({ error: 'Task title must be a string.' });
      return;
    }

    const trimmedTitle = rawTitle.trim();
    if (!trimmedTitle) {
      res.status(400).json({ error: 'Task title cannot be empty.' });
      return;
    }
    if (trimmedTitle.length > 200) {
      res.status(400).json({ error: 'Task title must be 200 characters or fewer.' });
      return;
    }

    try {
      const created = await createTaskForUser(req.dbUser!.id, trimmedTitle);
      res.status(201).json({
        task: {
          id: created.id,
          title: created.title,
          completed: created.completed,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create task right now.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    const taskId = String(req.params.id ?? '').trim();
    if (!taskId) {
      res.status(400).json({ error: 'Invalid task ID.' });
      return;
    }

    const updates: { title?: string; completed?: boolean } = {};

    if (req.body?.title !== undefined) {
      if (typeof req.body.title !== 'string') {
        res.status(400).json({ error: 'Task title must be a string.' });
        return;
      }
      const trimmedTitle = req.body.title.trim();
      if (!trimmedTitle) {
        res.status(400).json({ error: 'Task title cannot be empty.' });
        return;
      }
      if (trimmedTitle.length > 200) {
        res.status(400).json({ error: 'Task title must be 200 characters or fewer.' });
        return;
      }
      updates.title = trimmedTitle;
    }

    if (req.body?.completed !== undefined) {
      if (typeof req.body.completed !== 'boolean') {
        res.status(400).json({ error: 'Task completion flag must be a boolean.' });
        return;
      }
      updates.completed = req.body.completed;
    }

    if (updates.title === undefined && updates.completed === undefined) {
      res.status(400).json({ error: 'No valid update fields provided.' });
      return;
    }

    try {
      const updated = await updateTaskForUser(req.dbUser!.id, taskId, updates);
      if (!updated) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      res.json({
        task: {
          id: updated.id,
          title: updated.title,
          completed: updated.completed,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update task right now.';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    const taskId = String(req.params.id ?? '').trim();
    if (!taskId) {
      res.status(400).json({ error: 'Invalid task ID.' });
      return;
    }

    try {
      const deleted = await deleteTaskForUser(req.dbUser!.id, taskId);
      if (!deleted) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.json({ deletedId: deleted.id });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete task right now.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
      res.status(404).send('Application build not found.');
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
