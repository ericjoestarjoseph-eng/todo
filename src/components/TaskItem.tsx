import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, Clock, Pencil, RotateCcw, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '../types/todo';
import { formatCreatedDate } from '../utils/storage';
import { PokeballIcon } from './PokemonSprites';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onRequestDelete: (task: Task) => void;
}

export function TaskItem({
  task,
  onToggleComplete,
  onUpdateTitle,
  onRequestDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraftTitle(task.title);
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftTitle(task.title);
    setEditError(null);
    setIsEditing(false);
  };

  const handleSave = (event?: FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      setEditError('Task title cannot be empty.');
      editInputRef.current?.focus();
      return;
    }

    if (trimmed !== task.title) {
      onUpdateTitle(task.id, trimmed);
    }
    setEditError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="group px-4 py-3.5 transition-colors duration-150 hover:bg-slate-50/90 sm:px-5 sm:py-4"
    >
      {isEditing ? (
        <form onSubmit={handleSave} noValidate className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor={`edit-task-${task.id}`} className="sr-only">
              Edit task title
            </label>
            <input
              ref={editInputRef}
              id={`edit-task-${task.id}`}
              type="text"
              value={draftTitle}
              onChange={(event) => {
                setDraftTitle(event.target.value);
                if (editError) {
                  setEditError(null);
                }
              }}
              onKeyDown={handleKeyDown}
              maxLength={200}
              aria-invalid={editError ? 'true' : 'false'}
              aria-describedby={editError ? `edit-error-${task.id}` : undefined}
              className="min-h-[44px] flex-1 rounded-lg border border-red-500 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 sm:min-h-[40px]"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-red-600 px-3.5 py-2 text-xs font-medium text-white transition-colors duration-150 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[40px] cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:min-h-[40px] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
          {editError && (
            <p
              id={`edit-error-${task.id}`}
              role="alert"
              className="text-xs font-medium text-red-600"
            >
              {editError}
            </p>
          )}
        </form>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3.5">
            <button
              type="button"
              onClick={() => onToggleComplete(task.id)}
              aria-label={
                task.completed
                  ? `Mark "${task.title}" as pending`
                  : `Mark "${task.title}" as completed`
              }
              aria-pressed={task.completed}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              <PokeballIcon caught={task.completed} className="h-6 w-6" />
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`break-words text-sm font-medium leading-snug transition-colors duration-150 sm:text-[15px] ${
                  task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                }`}
              >
                {task.title}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    task.completed ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{task.completed ? 'Completed' : 'Pending'}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <time
                  dateTime={task.createdAt}
                  className="font-mono text-[11px] text-slate-500 tabular-nums"
                >
                  Created {formatCreatedDate(task.createdAt)}
                </time>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => onToggleComplete(task.id)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[40px] cursor-pointer ${
                task.completed
                  ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100/80'
              }`}
              aria-label={task.completed ? 'Mark task as pending' : 'Complete task'}
            >
              {task.completed ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reopen</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Complete</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={startEditing}
              aria-label={`Edit "${task.title}"`}
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:min-h-[40px] cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onRequestDelete(task)}
              aria-label={`Delete "${task.title}"`}
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[40px] cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </motion.li>
  );
}
