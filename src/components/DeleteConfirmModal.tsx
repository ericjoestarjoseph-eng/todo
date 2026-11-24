import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Task } from '../types/todo';
import { StickerBadge } from './PokemonSprites';

interface DeleteConfirmModalProps {
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ task, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!task) return;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, onCancel]);

  if (!task) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        <div className="absolute -right-3 -top-3">
          <StickerBadge type="oran-berry" rotate={12} title="Oran Berry" />
        </div>

        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="delete-modal-title"
              className="font-display text-base font-semibold text-slate-900"
            >
              Delete Task
            </h2>
            <p id="delete-modal-description" className="mt-1.5 text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-medium text-slate-900 break-words">
                &ldquo;{task.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:min-h-[40px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:min-h-[40px] cursor-pointer"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
