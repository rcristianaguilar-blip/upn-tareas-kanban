import { useState } from 'react';
import { AlertTriangle, ArrowLeft, LockKeyhole, LogIn } from 'lucide-react';
import { fetchAdminRecord, isSupabaseConfigured, supabase } from '../lib/supabase.js';

export default function AdminLogin({ onBack, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isSupabaseConfigured || !supabase) {
      setError('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY antes de iniciar sesión.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const adminRecord = await fetchAdminRecord(data.user);

      if (!adminRecord) {
        await supabase.auth.signOut();
        throw new Error('Tu cuenta no está registrada como delegado administrador.');
      }

      onSuccess();
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={17} />
          <span>{error}</span>
        </div>
      )}

      <label>
        <span className="mb-1 block text-sm font-semibold text-neutral-700">Correo institucional</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
          placeholder="delegado@upn.edu.pe"
          autoComplete="email"
          required
        />
      </label>

      <label>
        <span className="mb-1 block text-sm font-semibold text-neutral-700">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="focus-ring w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm"
          placeholder="Tu contraseña"
          autoComplete="current-password"
          required
        />
      </label>

      <button
        type="submit"
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-upn-yellow px-4 py-2.5 text-sm font-black text-upn-black transition hover:bg-upn-gold disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        <LogIn size={18} />
        {loading ? 'Validando...' : 'Ingresar como delegado'}
      </button>

      <button
        type="button"
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        Volver al tablero
      </button>

      <div className="flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-3 text-xs leading-5 text-neutral-500">
        <LockKeyhole className="mt-0.5 shrink-0 text-neutral-400" size={15} />
        <span>
          El frontend usa la clave anon pública de Supabase. Las acciones privadas deben estar
          protegidas también con RLS en la base de datos.
        </span>
      </div>
    </form>
  );
}
