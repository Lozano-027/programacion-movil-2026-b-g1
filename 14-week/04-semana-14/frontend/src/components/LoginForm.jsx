import { useState } from 'react';
import { login } from '../api.js';

export default function LoginForm({ onLogin, notice = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      const auth = await login(email.trim(), password);
      onLogin(auth);
    } catch (err) {
      setError(
        err.code === 'INVALID_CREDENTIALS'
          ? 'Email or password is incorrect. Check them and try again.'
          : err.message,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="login">
      <div className="login__panel">
        <h1 className="brand">Task Manager</h1>
        <p className="login__lead">Log in to see what is due.</p>

        {notice && <p className="notice" role="status">{notice}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error" role="alert">{error}</p>}

          <button type="submit" disabled={sending || !email || !password}>
            {sending ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
