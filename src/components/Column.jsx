import { Plus } from 'lucide-react';
import TaskCard from './TaskCard.jsx';

export default function Column({
  column,
  tasks,
  isAdmin,
  onCreate,
  onEdit,
  onDelete,
  onToggleHidden,
  onComplete,
}) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="flex min-h-[28rem] flex-col rounded-xl border border-neutral-200 bg-white/65 shadow-column">
      <div className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${column.headerClass}`}>
        <h2 className="text-sm font-black">{column.label}</h2>
        <span className="rounded-full bg-white/75 px-2 py-0.5 text-xs font-black text-upn-black">
          {tasks.length}
        </span>
      </div>

      {isAdmin && (
        <button
          type="button"
          className="focus-ring mx-3 mt-3 inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 bg-white/80 py-2 text-sm font-semibold text-neutral-700 transition hover:border-upn-yellow hover:bg-upn-soft"
          onClick={() => onCreate(column.value)}
        >
          <Plus size={16} />
          Nueva tarea
        </button>
      )}

      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleHidden={onToggleHidden}
            onComplete={onComplete}
          />
        ))}
      </div>
    </section>
  );
}
