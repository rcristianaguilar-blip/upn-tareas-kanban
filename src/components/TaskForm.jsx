import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  PRIORITIES,
  STATUSES,
  getEmptyTask,
  normalizePriority,
  normalizeStatus,
  toDateTimeLocal,
} from '../lib/taskHelpers.js';

export default function TaskForm({ initialTask, defaultStatus, saving, onClose, onSubmit }) {
  const startingTask = useMemo(() => {
    if (!initialTask) return getEmptyTask(defaultStatus);

    return {
      ...getEmptyTask(defaultStatus),
      ...initialTask,
      status: normalizeStatus(initialTask.status),
      priority: normalizePriority(initialTask.priority),
      due_at: toDateTimeLocal(initialTask.due_at),
      link_url: initialTask.link_url || '',
      description: initialTask.description || '',
      course: initialTask.course || '',
      week_label: initialTask.week_label || '',
    };
  }, [defaultStatus, initialTask]);

  const [formTask, setFormTask] = useState(startingTask);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormTask(startingTask);
  }, [startingTask]);

  const updateField = (field, value) => {
    setFormTask((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formTask.title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    setError('');
    onSubmit(formTask);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-upn-black/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-upn-gold">
              Panel del delegado
            </p>
            <h2 className="text-xl font-black text-upn-black">
              {initialTask ? 'Editar tarea' : 'Crear tarea'}
            </h2>
          </div>
          <button
            type="button"
            title="Cerrar"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-5 p-5" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <AlertTriangle size={17} />
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Título</span>
              <input
                type="text"
                value={formTask.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
                placeholder="Ej. Preparar exposición de investigación"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Curso</span>
              <input
                type="text"
                value={formTask.course}
                onChange={(event) => updateField('course', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
                placeholder="Ej. Estadística Aplicada"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Semana</span>
              <input
                type="text"
                value={formTask.week_label}
                onChange={(event) => updateField('week_label', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
                placeholder="Ej. Semana 7"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Fecha límite</span>
              <input
                type="datetime-local"
                value={formTask.due_at}
                onChange={(event) => updateField('due_at', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Enlace opcional</span>
              <input
                type="url"
                value={formTask.link_url}
                onChange={(event) => updateField('link_url', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
                placeholder="https://..."
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Prioridad</span>
              <select
                value={formTask.priority}
                onChange={(event) => updateField('priority', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-semibold text-neutral-700">Estado</span>
              <select
                value={formTask.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.shortLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span className="mb-1 block text-sm font-semibold text-neutral-700">Descripción</span>
            <textarea
              value={formTask.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="focus-ring min-h-28 w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
              placeholder="Resumen breve de indicaciones, entregables o avisos importantes."
            />
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3">
            <input
              type="checkbox"
              checked={Boolean(formTask.is_hidden)}
              onChange={(event) => updateField('is_hidden', event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-upn-yellow focus:ring-upn-yellow"
            />
            <span className="text-sm font-semibold text-neutral-700">Ocultar al público</span>
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="focus-ring rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="focus-ring rounded-md bg-upn-yellow px-5 py-2.5 text-sm font-black text-upn-black transition hover:bg-upn-gold disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : initialTask ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
