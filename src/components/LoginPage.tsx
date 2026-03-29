import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { login, setToken } from '../api';

export default function LoginPage() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({
        username: username(),
        password: password(),
      });
      setToken(response.token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="login-container">
      <div class="login-card">
        <h1>Xray Manager</h1>
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              placeholder="admin"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="••••"
              required
            />
          </div>

          {error() && <div class="error">{error()}</div>}

          <button type="submit" class="btn btn-primary" disabled={loading()}>
            {loading() ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
