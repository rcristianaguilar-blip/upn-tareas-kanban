# Tablero UPN de tareas pendientes

Aplicación web en React + Vite + Tailwind CSS para publicar tareas, avisos y fechas de entrega de un curso universitario. El público ve solo tareas visibles; el delegado administrador puede iniciar sesión con Supabase Auth y administrar el tablero.

## Funciones

- Tablero Kanban con columnas: tareas nuevas, importantes, en progreso y terminado.
- Búsqueda por texto y filtros por semana, estado, prioridad y visibilidad admin.
- Cuenta regresiva por `due_at`, resaltado de urgentes y vencidas.
- Login privado para delegado con Supabase Auth.
- CRUD de tareas usando la tabla `public.tasks`.
- Validación de delegado con `public.admin_users`.
- Diseño responsive con identidad UPN y logo discreto en `public/upn-logo.png`.
- Workflow preparado para GitHub Pages.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Edita `.env.local`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_publica
```

Coloca el logo oficial en:

```text
public/upn-logo.png
```

## Supabase

El frontend nunca usa `service_role`. Configura RLS en Supabase para que la seguridad no dependa solo de la interfaz.

La app espera que `public.admin_users` permita identificar al delegado por alguno de estos campos: `user_id`, `auth_user_id`, `uid`, `profile_id`, `id`, `email`, `user_email` o `admin_email`. Lo más simple es usar:

```sql
-- Ejemplo recomendado
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id),
  email text unique,
  created_at timestamptz default now()
);
```

Ejemplo de políticas RLS para las tablas existentes:

```sql
alter table public.tasks enable row level security;
alter table public.admin_users enable row level security;

create policy "Public can read visible tasks"
on public.tasks
for select
using (
  is_hidden = false
  or auth.uid() in (select user_id from public.admin_users)
);

create policy "Admins can insert tasks"
on public.tasks
for insert
with check (auth.uid() in (select user_id from public.admin_users));

create policy "Admins can update tasks"
on public.tasks
for update
using (auth.uid() in (select user_id from public.admin_users))
with check (auth.uid() in (select user_id from public.admin_users));

create policy "Admins can delete tasks"
on public.tasks
for delete
using (auth.uid() in (select user_id from public.admin_users));

create policy "Admins can read admin users"
on public.admin_users
for select
using (auth.uid() = user_id);
```

## GitHub Pages

1. Sube el proyecto a GitHub.
2. En el repositorio, agrega estos secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Activa GitHub Pages con fuente "GitHub Actions".
4. Haz push a `main`.

El archivo `.github/workflows/deploy.yml` compila con Vite y publica `dist`. La configuración de Vite ajusta automáticamente `base` usando el nombre del repositorio durante el build de GitHub Pages.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
