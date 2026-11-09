import { useCallback, useEffect, useState } from 'react';
import { changeTaskStatus, createTask, listTasks } from '../api.js';

function formatDue(dueDate) {
  if (!dueDate) return { day: '—', month: 'No date' };
  const [year, month, day] = dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    day: String(day),
    month: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
  };
}

export default function TasksView({ token, user, onLogout, onUnauthorized }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) onUnauthorized();
      else setError(err.message);
    },
    [onUnauthorized],
  );

  useEffect(() => {
    let active = true;
    listTasks(token)
      .then((page) => active && setTasks(page.content))
      .catch((err) => active && handleError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, handleError]);

  async function handleAdd(event) {
    event.preventDefault();
    setError('');
    try {
      const created = await createTask(token, { title: title.trim(), dueDate: dueDate || null });
      setTasks((current) => [...current, created]);
      setTitle('');
      setDueDate('');
    } catch (err) {
      handleError(err);
    }
  }

  async function handleToggle(task) {
    setError('');
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updated = await changeTaskStatus(token, task.id, next);
      setTasks((current) => current.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <main className="board">
      <header className="board__header">
        <h1 className="brand">Task Manager</h1>
        <div className="board__user">
          <span>{user?.email}</span>
          <button type="button" className="link" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <form className="add" onSubmit={handleAdd}>
        <label htmlFor="title" className="sr-only">Task title</label>
        <input
          id="title"
          placeholder="What needs doing?"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="due" className="sr-only">Due date</label>
        <input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" disabled={!title.trim()}>Add task</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? (
        <p className="muted">Loading your tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="muted">No tasks yet. Add the first one above.</p>
      ) : (
        <ul className="agenda" aria-label="Your tasks">
          {tasks.map((task) => {
            const due = formatDue(task.dueDate);
            const done = task.status === 'COMPLETED';
            return (
              <li key={task.id} className={`agenda__item${done ? ' is-done' : ''}${task.overdue ? ' is-overdue' : ''}`}>
                <div className="agenda__date" aria-hidden="true">
                  <span className="agenda__day">{due.day}</span>
                  <span className="agenda__month">{due.month}</span>
                </div>
                <div className="agenda__body">
                  <span className="agenda__title">{task.title}</span>
                  {task.overdue && <span className="tag">Overdue</span>}
                </div>
                <label className="agenda__check">
                  <input type="checkbox" checked={done} onChange={() => handleToggle(task)} />
                  <span className="sr-only">Mark “{task.title}” as {done ? 'pending' : 'completed'}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
