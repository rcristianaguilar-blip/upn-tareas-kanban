import { Clock, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getDueState, humanizeDuration } from '../lib/taskHelpers.js';

export default function CountdownTimer({ dueAt, completed }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const dueState = useMemo(() => getDueState(dueAt, now), [dueAt, now]);

  if (!dueAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-600">
        <Clock size={14} />
        Sin fecha límite
      </span>
    );
  }

  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-lime-200 bg-lime-50 px-2 py-1 text-xs font-medium text-lime-700">
        <TimerReset size={14} />
        Entregada
      </span>
    );
  }

  const label = dueState.isOverdue
    ? `Vencida hace ${humanizeDuration(dueState.diffMs)}`
    : `Faltan ${humanizeDuration(dueState.diffMs)}`;

  const stateClass = dueState.isOverdue
    ? 'border-red-200 bg-red-50 text-red-700'
    : dueState.isUrgent
      ? 'border-upn-yellow bg-upn-soft text-upn-black'
      : 'border-neutral-200 bg-white text-neutral-700';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${stateClass}`}
    >
      <Clock size={14} />
      {label}
    </span>
  );
}
