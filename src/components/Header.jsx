import { LogIn, LogOut, Plus, ShieldCheck } from 'lucide-react';
import LogoUPN from './LogoUPN.jsx';

export default function Header({
  isAdmin,
  authLoading,
  userEmail,
  onOpenLogin,
  onSignOut,
  onCreate,
}) {
  return (
    <header className="border-b border-upn-yellow/50 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <LogoUPN />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-upn-gold">
                Universidad Privada del Norte
              </p>
              <h1 className="truncate text-2xl font-black text-upn-black sm:text-3xl">
                Tareas Pendientes
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Tareas del grupo de trabajo y fechas de entrega del curso
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-upn-yellow px-4 py-2 text-sm font-bold text-upn-black shadow-sm transition hover:bg-upn-gold"
                onClick={onCreate}
              >
                <Plus size={18} />
                Crear
              </button>
            )}

            {isAdmin ? (
              <button
                type="button"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-upn-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                onClick={onSignOut}
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            ) : (
              <button
                type="button"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-upn-black transition hover:border-upn-yellow hover:bg-upn-soft"
                onClick={onOpenLogin}
              >
                <LogIn size={18} />
                Delegado
              </button>
            )}
          </div>
        </div>

        {(isAdmin || authLoading) && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-upn-yellow/50 bg-upn-soft px-3 py-2 text-sm text-upn-black">
            <ShieldCheck size={17} />
            {authLoading ? (
              <span>Validando permisos del delegado...</span>
            ) : (
              <span>
                Modo administrador activo
                {userEmail ? <strong className="font-semibold">: {userEmail}</strong> : null}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
