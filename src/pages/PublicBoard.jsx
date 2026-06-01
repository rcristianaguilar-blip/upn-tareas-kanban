import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPanel from '../components/AdminPanel.jsx';
import Board from '../components/Board.jsx';
import Header from '../components/Header.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import {
  buildTaskFilePath,
  buildTaskPayload,
  getSearchText,
  normalizePriority,
  normalizeStatus,
  normalizeTaskFileRecord,
} from '../lib/taskHelpers.js';

const initialFilters = {
  search: '',
  priority: 'all',
  status: 'all',
  week: 'all',
  visibility: 'visible',
};

function sortTasks(a, b) {
  const aDone = normalizeStatus(a.status) === 'completado';
  const bDone = normalizeStatus(b.status) === 'completado';

  if (aDone !== bDone) return aDone ? 1 : -1;

  const aDate = a.due_at ? new Date(a.due_at).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b.due_at ? new Date(b.due_at).getTime() : Number.MAX_SAFE_INTEGER;

  if (aDate !== bDate) return aDate - bDate;

  return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
}

export default function PublicBoard({
  session,
  isAdmin,
  authLoading,
  authError,
  onOpenLogin,
  onSignOut,
}) {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    open: false,
    task: null,
    defaultStatus: 'new',
  });
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!supabase) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    let query = supabase.from('tasks').select('*');

    if (!isAdmin) {
      query = query.eq('is_hidden', false);
    }

    const { data, error: fetchError } = await query
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message || 'No se pudieron cargar las tareas.');
      setLoading(false);
      return;
    }

    const taskRows = data || [];
    const taskIds = taskRows.map((task) => task.id).filter(Boolean);
    let tasksWithFiles = taskRows.map((task) => ({
      ...task,
      files: [],
    }));

    if (taskIds.length > 0) {
      const { data: fileRows, error: fileError } = await supabase
        .from('task_files')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: true });

      if (fileError) {
        setError(fileError.message || 'No se pudieron cargar los archivos adjuntos.');
      } else {
        const filesByTask = (fileRows || []).reduce((acc, fileRow) => {
          const file = normalizeTaskFileRecord(fileRow);

          if (!file.file_url && file.file_path) {
            const { data: publicUrlData } = supabase.storage.from('task-files').getPublicUrl(file.file_path);
            file.file_url = publicUrlData.publicUrl;
          }

          acc[file.task_id] = [...(acc[file.task_id] || []), file];
          return acc;
        }, {});

        tasksWithFiles = taskRows.map((task) => ({
          ...task,
          files: filesByTask[task.id] || [],
        }));
      }
    }

    setTasks(tasksWithFiles.sort(sortTasks));
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!supabase) return undefined;

    const channel = supabase
      .channel('tasks-board-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_files' }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTasks]);

  useEffect(() => {
    if (!isAdmin && filters.visibility !== 'visible') {
      setFilters((current) => ({
        ...current,
        visibility: 'visible',
      }));
    }
  }, [filters.visibility, isAdmin]);

  const weekOptions = useMemo(() => {
    return Array.from(new Set(tasks.map((task) => task.week_label).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'es', { numeric: true }),
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (!isAdmin && task.is_hidden) return false;
        if (isAdmin && filters.visibility === 'visible' && task.is_hidden) return false;
        if (isAdmin && filters.visibility === 'hidden' && !task.is_hidden) return false;
        if (filters.priority !== 'all' && normalizePriority(task.priority) !== filters.priority) return false;
        if (filters.status !== 'all' && normalizeStatus(task.status) !== filters.status) return false;
        if (filters.week !== 'all' && task.week_label !== filters.week) return false;
        if (search && !getSearchText(task).includes(search)) return false;
        return true;
      })
      .sort(sortTasks);
  }, [filters, isAdmin, tasks]);

  const hiddenTasks = useMemo(() => tasks.filter((task) => task.is_hidden).length, [tasks]);

  const openCreateForm = (defaultStatus = 'new') => {
    setFormState({
      open: true,
      task: null,
      defaultStatus,
    });
  };

  const openEditForm = (task) => {
    setFormState({
      open: true,
      task,
      defaultStatus: normalizeStatus(task.status),
    });
  };

  const closeForm = () => {
    if (!saving) {
      setFormState({
        open: false,
        task: null,
        defaultStatus: 'new',
      });
    }
  };

  const uploadTaskFiles = async (taskId, files = []) => {
    for (const [index, file] of files.entries()) {
      const filePath = buildTaskFilePath(taskId, file.name, index);

      const { error: uploadError } = await supabase.storage.from('task-files').upload(filePath, file, {
        contentType: file.type || undefined,
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('task-files').getPublicUrl(filePath);

      const { error: fileInsertError } = await supabase.from('task_files').insert({
        task_id: taskId,
        file_name: file.name,
        file_path: filePath,
        file_url: publicUrlData.publicUrl,
        file_type: file.type || null,
        file_size: file.size,
      });

      if (fileInsertError) {
        await supabase.storage.from('task-files').remove([filePath]);
        throw fileInsertError;
      }
    }
  };

  const persistTask = async (formTask) => {
    if (!supabase || !isAdmin || !session?.user) return;

    setSaving(true);
    setError('');

    try {
      const payload = buildTaskPayload(formTask);
      const files = Array.isArray(formTask.files) ? formTask.files : [];
      const isDone = normalizeStatus(payload.status) === 'completado';
      const completedAt = isDone ? formState.task?.completed_at || new Date().toISOString() : null;

      const finalPayload = {
        ...payload,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      };

      let taskId = formState.task?.id;

      if (formState.task) {
        const { error: updateError } = await supabase.from('tasks').update(finalPayload).eq('id', formState.task.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data: createdTask, error: insertError } = await supabase
          .from('tasks')
          .insert({
            ...finalPayload,
            created_by: session.user.id,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError) {
          throw insertError;
        }

        taskId = createdTask.id;
      }

      if (files.length > 0) {
        await uploadTaskFiles(taskId, files);
      }

      setSaving(false);
      closeForm();
      loadTasks();
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar la tarea.');
      setSaving(false);
    }
  };

  const updateTask = async (task, changes) => {
    if (!supabase || !isAdmin) return;

    const nextChanges = {
      ...changes,
      updated_at: new Date().toISOString(),
    };

    if (Object.prototype.hasOwnProperty.call(changes, 'status')) {
      const isDone = normalizeStatus(changes.status) === 'completado';
      nextChanges.completed_at = isDone ? task.completed_at || new Date().toISOString() : null;
      nextChanges.status = normalizeStatus(changes.status);
    }

    const { error: updateError } = await supabase.from('tasks').update(nextChanges).eq('id', task.id);

    if (updateError) {
      setError(updateError.message || 'No se pudo actualizar la tarea.');
      return;
    }

    loadTasks();
  };

  const handleComplete = (task) => {
    const isDone = normalizeStatus(task.status) === 'completado';
    updateTask(task, {
      status: isDone ? 'pendiente' : 'completado',
    });
  };

  const handleToggleHidden = (task) => {
    updateTask(task, {
      is_hidden: !task.is_hidden,
    });
  };

  const handleDeleteFile = async (file) => {
    if (!supabase || !isAdmin) return;

    const confirmed = window.confirm(`¿Eliminar el archivo "${file.file_name}"?`);
    if (!confirmed) return;

    setError('');

    if (file.file_path) {
      const { error: storageError } = await supabase.storage.from('task-files').remove([file.file_path]);

      if (storageError) {
        setError(storageError.message || 'No se pudo eliminar el archivo del bucket.');
        return;
      }
    }

    const deleteQuery = supabase.from('task_files').delete();
    const { error: deleteError } = file.id
      ? await deleteQuery.eq('id', file.id)
      : await deleteQuery.eq('file_path', file.file_path);

    if (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar el registro del archivo.');
      return;
    }

    loadTasks();
  };

  const handleDelete = async (task) => {
    if (!supabase || !isAdmin) return;

    const confirmed = window.confirm(`¿Eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    const taskFiles = Array.isArray(task.files) ? task.files : [];
    const filePaths = taskFiles.map((file) => file.file_path).filter(Boolean);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from('task-files').remove(filePaths);

      if (storageError) {
        setError(storageError.message || 'No se pudieron eliminar los archivos adjuntos.');
        return;
      }

      const { error: fileDeleteError } = await supabase.from('task_files').delete().eq('task_id', task.id);

      if (fileDeleteError) {
        setError(fileDeleteError.message || 'No se pudieron eliminar los registros de archivos.');
        return;
      }
    }

    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', task.id);

    if (deleteError) {
      setError(deleteError.message || 'No se pudo eliminar la tarea.');
      return;
    }

    loadTasks();
  };

  return (
    <div className="min-h-screen">
      <Header
        isAdmin={isAdmin}
        authLoading={authLoading}
        userEmail={session?.user?.email}
        onOpenLogin={onOpenLogin}
        onSignOut={onSignOut}
        onCreate={() => openCreateForm('new')}
      />

      {isAdmin && (
        <AdminPanel
          totalTasks={tasks.length}
          hiddenTasks={hiddenTasks}
          onCreate={openCreateForm}
        />
      )}

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        weekOptions={weekOptions}
        isAdmin={isAdmin}
      />

      <main>
        {!isSupabaseConfigured && (
          <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-upn-yellow bg-upn-soft px-4 py-3 text-sm font-semibold text-upn-black">
              Configura las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local
              para conectar el tablero con Supabase.
            </div>
          </div>
        )}

        {authError && (
          <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {authError}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm font-semibold text-neutral-600 shadow-card">
              Cargando tareas...
            </div>
          </div>
        ) : (
          <Board
            tasks={filteredTasks}
            isAdmin={isAdmin}
            onCreate={openCreateForm}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onDeleteFile={handleDeleteFile}
            onToggleHidden={handleToggleHidden}
            onComplete={handleComplete}
          />
        )}
      </main>

      {formState.open && (
        <TaskForm
          initialTask={formState.task}
          defaultStatus={formState.defaultStatus}
          saving={saving}
          onClose={closeForm}
          onSubmit={persistTask}
        />
      )}
    </div>
  );
}
