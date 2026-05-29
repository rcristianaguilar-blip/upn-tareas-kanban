import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const normalize = (value) => String(value || '').trim().toLowerCase();

export function adminRecordMatchesUser(record, user) {
  if (!record || !user) return false;

  const email = normalize(user.email);
  const knownUserIds = [
    record.user_id,
    record.auth_user_id,
    record.uid,
    record.profile_id,
    record.id,
  ].filter(Boolean);

  const knownEmails = [record.email, record.user_email, record.admin_email].map(normalize).filter(Boolean);

  return knownUserIds.includes(user.id) || (email && knownEmails.includes(email));
}

export async function fetchAdminRecord(user) {
  if (!supabase || !user) return null;

  const { data, error } = await supabase.from('admin_users').select('*');

  if (error) {
    throw error;
  }

  const records = Array.isArray(data) ? data : [];
  const directMatch = records.find((record) => adminRecordMatchesUser(record, user));

  if (directMatch) {
    return directMatch;
  }

  const onlyRecord = records.length === 1 ? records[0] : null;
  const hasKnownIdentityField =
    onlyRecord &&
    ['user_id', 'auth_user_id', 'uid', 'profile_id', 'id', 'email', 'user_email', 'admin_email'].some(
      (field) => Object.prototype.hasOwnProperty.call(onlyRecord, field),
    );

  return onlyRecord && !hasKnownIdentityField ? onlyRecord : null;
}
