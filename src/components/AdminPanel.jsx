import { EyeOff, Plus, ShieldCheck } from 'lucide-react';

export default function AdminPanel({ totalTasks, hiddenTasks, onCreate }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-xl border border-upn-yellow/60 bg-upn-soft p-4 shadow-card md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-upn-black text-upn-yellow">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-upn-black">Panel privado del delegado</h2>
            <p className="mt-1 text-sm text-neutral-700">
              Puedes crear, editar, completar, ocultar y eliminar tareas. Las tareas ocultas no se
              muestran al público.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-neutral-700">
              <span className="rounded-md bg-white px-2 py-1">{totalTasks} tareas registradas</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1">
                <EyeOff size={14} />
                {hiddenTasks} ocultas
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-upn-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
          onClick={() => onCreate('new')}
        >
          <Plus size={18} />
          Crear tarea
        </button>
      </div>
    </section>
  );
}
