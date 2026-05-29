export const STATUSES = [
  {
    value: 'pendiente',
    label: 'Pendiente',
    shortLabel: 'Pendiente',
    badgeClass: 'bg-upn-soft text-upn-black border-upn-yellow/70',
  },
  {
    value: 'completado',
    label: 'Completado',
    shortLabel: 'Completado',
    badgeClass: 'bg-lime-50 text-lime-700 border-lime-200',
  },
];

export const PRIORITIES = [
  {
    value: 'baja',
    label: 'Baja',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  {
    value: 'media',
    label: 'Media',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'alta',
    label: 'Alta',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
];

export const BOARD_COLUMNS = [
  {
    value: 'new',
    label: 'Tareas nuevas',
    headerClass: 'bg-upn-yellow text-upn-black',
  },
  {
    value: 'important',
    label: 'Tareas importantes',
    headerClass: 'bg-red-500 text-white',
  },
  {
    value: 'done',
    label: 'Terminado',
    headerClass: 'bg-lime-500 text-upn-black',
  },
];

const statusAliases = {
  todo: 'pendiente',
  pending: 'pendiente',
  pendiente: 'pendiente',
  nueva: 'pendiente',
  nuevo: 'pendiente',
  new: 'pendiente',
  open: 'pendiente',
  important: 'pendiente',
  importante: 'pendiente',
  importantes: 'pendiente',
  priority: 'pendiente',
  inprogress: 'pendiente',
  in_progress: 'pendiente',
  progress: 'pendiente',
  proceso: 'pendiente',
  'en progreso': 'pendiente',
  done: 'completado',
  completed: 'completado',
  complete: 'completado',
  terminado: 'completado',
  terminada: 'completado',
  completado: 'completado',
  completada: 'completado',
  closed: 'completado',
};

const priorityAliases = {
  baja: 'baja',
  low: 'baja',
  normal: 'media',
  media: 'media',
  medium: 'media',
  alta: 'alta',
  high: 'alta',
  urgente: 'alta',
  urgent: 'alta',
  critical: 'alta',
};

export function normalizeStatus(status) {
  const raw = String(status || 'pendiente').trim().toLowerCase();
  const compact = raw.replace(/[\s-]+/g, '_');
  return statusAliases[raw] || statusAliases[compact] || 'pendiente';
}

export function normalizePriority(priority) {
  const raw = String(priority || 'media').trim().toLowerCase();
  return priorityAliases[raw] || 'media';
}

export function getStatusMeta(status) {
  return STATUSES.find((item) => item.value === normalizeStatus(status)) || STATUSES[0];
}

export function getPriorityMeta(priority) {
  return PRIORITIES.find((item) => item.value === normalizePriority(priority)) || PRIORITIES[1];
}

export function getBoardColumnValue(task) {
  if (normalizeStatus(task.status) === 'completado') return 'done';
  return normalizePriority(task.priority) === 'alta' ? 'important' : 'new';
}

export function formatDate(value) {
  if (!value) return 'Sin fecha límite';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no válida';

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export function toIsoDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function getDueState(value, now = new Date()) {
  if (!value) {
    return {
      isOverdue: false,
      isUrgent: false,
      diffMs: null,
    };
  }

  const due = new Date(value);
  if (Number.isNaN(due.getTime())) {
    return {
      isOverdue: false,
      isUrgent: false,
      diffMs: null,
    };
  }

  const diffMs = due.getTime() - now.getTime();
  return {
    diffMs,
    isOverdue: diffMs < 0,
    isUrgent: diffMs >= 0 && diffMs <= 48 * 60 * 60 * 1000,
  };
}

export function humanizeDuration(diffMs) {
  if (diffMs === null || diffMs === undefined) return 'Sin cuenta regresiva';

  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);

  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${Math.max(minutes, 0)} min`;
}

export function getSearchText(task) {
  return [
    task.title,
    task.description,
    task.course,
    task.week_label,
    task.priority,
    task.status,
    task.link_url,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getEmptyTask(defaultColumn = 'new') {
  const column = String(defaultColumn || 'new').trim().toLowerCase();
  const status = normalizeStatus(column === 'done' ? 'completado' : defaultColumn);
  const priority = column === 'important' ? 'alta' : 'media';

  return {
    title: '',
    description: '',
    course: '',
    week_label: '',
    due_at: '',
    priority,
    status,
    is_hidden: false,
    link_url: '',
  };
}

export function buildTaskPayload(formTask) {
  return {
    title: formTask.title.trim(),
    description: formTask.description?.trim() || null,
    course: formTask.course?.trim() || null,
    week_label: formTask.week_label?.trim() || null,
    due_at: toIsoDateTime(formTask.due_at),
    priority: normalizePriority(formTask.priority || 'media'),
    status: normalizeStatus(formTask.status || 'pendiente'),
    is_hidden: Boolean(formTask.is_hidden),
    link_url: formTask.link_url?.trim() || null,
  };
}
