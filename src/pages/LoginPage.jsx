import AdminLogin from '../components/AdminLogin.jsx';
import LogoUPN from '../components/LogoUPN.jsx';

export default function LoginPage({ onBack, onSuccess, authError }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <LogoUPN />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-upn-gold">UPN</p>
            <h1 className="text-2xl font-black text-upn-black">Acceso del delegado</h1>
          </div>
        </div>

        {authError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {authError}
          </div>
        )}

        <AdminLogin onBack={onBack} onSuccess={onSuccess} />
      </section>
    </main>
  );
}
