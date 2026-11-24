import { FormEvent, RefObject, useState } from 'react';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (title: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function TaskForm({ onAddTask, inputRef }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Please enter a task title before adding.');
      inputRef.current?.focus();
      return;
    }

    onAddTask(trimmed);
    setTitle('');
    setError(null);
  };

  return (
    <section aria-label="Create a new task">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs sm:flex-row sm:items-center sm:gap-3"
      >
        <div className="relative flex-1">
          <label htmlFor="new-task-input" className="sr-only">
            New task title
          </label>
          <input
            ref={inputRef}
            id="new-task-input"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="Add a new task (e.g., Prepare quarterly review deck)..."
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'new-task-error' : undefined}
            maxLength={200}
            className="min-h-[44px] w-full rounded-lg bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 sm:min-h-[42px]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 active:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:min-h-[42px] cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </form>
      {error && (
        <p id="new-task-error" role="alert" className="mt-2 px-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
