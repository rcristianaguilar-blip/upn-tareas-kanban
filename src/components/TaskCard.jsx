import {
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';
import CountdownTimer from './CountdownTimer.jsx';
import {
  formatDate,
  getDueState,
  getPriorityMeta,
  getStatusMeta,
  normalizeStatus,
} from '../lib/taskHelpers.js';

function Badge({ className, children }) {
  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export default function TaskCard({
  task,
  isAdmin,
  onEdit,
  onDelete,
  onToggleHidden,
  onComplete,
}) {
  const status = normalizeStatus(task.status);
  const completed = status === 'completado';
  const priorityMeta = getPriorityMeta(task.priority);
  const statusMeta = getStatusMeta(task.status);
  const dueState = getDueState(task.due_at);

  const urgencyClass =
    !completed && dueState.isOverdue
      ? 'border-red-300 bg-red-50/80'
      : !completed && dueState.isUrgent
        ? 'border-upn-yellow bg-upn-soft/85'
        : 'border-neutral-200 bg-white';

  return (
    <article
      className={`group rounded-lg border p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-column ${
        completed ? 'opacity-75' : ''
      } ${urgencyClass} ${task.is_hidden ? 'border-dashed border-neutral-300 bg-neutral-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`line-clamp-2 text-base font-black text-upn-black ${
              completed ? 'line-through decoration-2 decoration-neutral-500' : ''
            }`}
          >
            {task.title}
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {task.course || 'Curso por definir'}
          </p>
        </div>

        {task.is_hidden && (
          <span className="rounded-md bg-neutral-200 px-2 py-1 text-xs font-bold text-neutral-700">
            Oculta
          </span>
        )}
      </div>

      {task.description && (
        <p
          className={`mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-neutral-600 ${
            completed ? 'line-through decoration-neutral-400' : ''
          }`}
        >
          {task.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className={priorityMeta.badgeClass}>{priorityMeta.label}</Badge>
        <Badge className={statusMeta.badgeClass}>{statusMeta.shortLabel}</Badge>
        {task.week_label && (
          <Badge className="border-neutral-200 bg-neutral-50 text-neutral-700">{task.week_label}</Badge>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
          <CalendarDays size={15} className="text-neutral-400" />
          <span>{formatDate(task.due_at)}</span>
        </div>
        <CountdownTimer dueAt={task.due_at} completed={completed} />
      </div>

      {task.link_url && (
        <a
          href={task.link_url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring mt-4 inline-flex max-w-full items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-upn-black transition hover:border-upn-yellow hover:bg-upn-soft"
        >
          <LinkIcon size={16} />
          <span className="truncate">Abrir enlace</span>
        </a>
      )}

      {isAdmin && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3">
          <button
            type="button"
            title="Editar tarea"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition hover:border-upn-yellow hover:text-upn-black"
            onClick={() => onEdit(task)}
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            title={completed ? 'Reabrir tarea' : 'Marcar como terminada'}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-lime-700 transition hover:border-lime-300 hover:bg-lime-50"
            onClick={() => onComplete(task)}
          >
            <CheckCircle2 size={17} />
          </button>
          <button
            type="button"
            title={task.is_hidden ? 'Mostrar tarea' : 'Ocultar tarea'}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition hover:border-upn-yellow hover:bg-upn-soft"
            onClick={() => onToggleHidden(task)}
          >
            {task.is_hidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            type="button"
            title="Eliminar tarea"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-white text-red-600 transition hover:border-red-200 hover:bg-red-50"
            onClick={() => onDelete(task)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </article>
  );
}
