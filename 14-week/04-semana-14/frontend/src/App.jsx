import { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import TasksView from './components/TasksView.jsx';
import { clearSession, loadSession, saveSession } from './session.js';

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [notice, setNotice] = useState('');

  function handleLogin(auth) {
    const next = { token: auth.token, user: auth.user };
    saveSession(next);
    setNotice('');
    setSession(next);
  }

  function handleLogout(message = '') {
    clearSession();
    setNotice(message);
    setSession(null);
  }

  if (!session) return <LoginForm onLogin={handleLogin} notice={notice} />;

  return (
    <TasksView
      token={session.token}
      user={session.user}
      onLogout={() => handleLogout()}
      onUnauthorized={() => handleLogout('Your session expired. Log in again.')}
    />
  );
}
