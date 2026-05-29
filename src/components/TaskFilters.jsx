import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PRIORITIES, STATUSES } from '../lib/taskHelpers.js';

export default function TaskFilters({ filters, onChange, weekOptions, isAdmin }) {
  const updateFilter = (field, value) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      priority: 'all',
      status: 'all',
      week: 'all',
      visibility: 'visible',
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Buscar tareas</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Buscar por tarea, curso, semana o descripción"
              className="focus-ring w-full rounded-md border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
            <label>
              <span className="sr-only">Prioridad</span>
              <select
                value={filters.priority}
                onChange={(event) => updateFilter('priority', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800"
              >
                <option value="all">Todas las prioridades</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Estado</span>
              <select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800"
              >
                <option value="all">Todos los estados</option>
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.shortLabel}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Semana</span>
              <select
                value={filters.week}
                onChange={(event) => updateFilter('week', event.target.value)}
                className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800"
              >
                <option value="all">Todas las semanas</option>
                {weekOptions.map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </label>

            {isAdmin && (
              <label>
                <span className="sr-only">Visibilidad</span>
                <select
                  value={filters.visibility}
                  onChange={(event) => updateFilter('visibility', event.target.value)}
                  className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800"
                >
                  <option value="visible">Visibles</option>
                  <option value="hidden">Ocultas</option>
                  <option value="all">Todas</option>
                </select>
              </label>
            )}
          </div>

          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-upn-yellow hover:bg-upn-soft"
            onClick={clearFilters}
          >
            <X size={17} />
            Limpiar
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-500">
          <SlidersHorizontal size={15} />
          <span>Filtros activos para búsqueda, semana, estado y prioridad.</span>
        </div>
      </div>
    </section>
  );
}
