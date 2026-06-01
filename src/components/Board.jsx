import { ClipboardList, Plus } from 'lucide-react';
import Column from './Column.jsx';
import { BOARD_COLUMNS, getBoardColumnValue } from '../lib/taskHelpers.js';

export default function Board({
  tasks,
  isAdmin,
  onCreate,
  onEdit,
  onDelete,
  onDeleteFile,
  onToggleHidden,
  onComplete,
}) {
  const tasksByColumn = BOARD_COLUMNS.reduce((acc, column) => {
    acc[column.value] = [];
    return acc;
  }, {});

  tasks.forEach((task) => {
    const column = getBoardColumnValue(task);
    tasksByColumn[column] = [...(tasksByColumn[column] || []), task];
  });

  const activeColumns = BOARD_COLUMNS.map((column) => ({
    ...column,
    tasks: tasksByColumn[column.value] || [],
  })).filter((column) => column.tasks.length > 0);

  if (tasks.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[22rem] w-full max-w-2xl flex-col items-center justify-center rounded-xl border border-upn-yellow/50 bg-white/90 px-6 py-12 text-center shadow-card">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-upn-yellow text-upn-black">
            <ClipboardList size={28} />
          </div>
          <h2 className="text-2xl font-black text-upn-black">Aún no hay tareas registradas</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
            Cuando el delegado cree una tarea, aparecerá aquí automáticamente.
          </p>

          {isAdmin && (
            <button
              type="button"
              className="focus-ring mt-6 inline-flex items-center gap-2 rounded-md bg-upn-yellow px-5 py-2.5 text-sm font-black text-upn-black shadow-sm transition hover:bg-upn-gold"
              onClick={() => onCreate('new')}
            >
              <Plus size={18} />
              Crear primera tarea
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${activeColumns.length}, minmax(260px, 1fr))`,
            minWidth: `${activeColumns.length * 280}px`,
          }}
        >
          {activeColumns.map((column) => (
            <Column
              key={column.value}
              column={column}
              tasks={column.tasks}
              isAdmin={isAdmin}
              onCreate={onCreate}
              onEdit={onEdit}
              onDelete={onDelete}
              onDeleteFile={onDeleteFile}
              onToggleHidden={onToggleHidden}
              onComplete={onComplete}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
