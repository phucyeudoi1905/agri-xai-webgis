import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { errorMessage } from '../lib/format';
import { Icon } from '../components/ui/Icon';

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname;
  const [username, setUsername] = useState('admin_gis');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && user) {
    return <Navigate to={from || (user.role === 'HTX_FARMER' ? '/map' : '/')} replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const mapped = await login(username, password);
      navigate(from || (mapped.role === 'HTX_FARMER' ? '/map' : '/'), {
        replace: true,
      });
    } catch (err) {
      setError(errorMessage(err, 'Sai tên đăng nhập hoặc mật khẩu.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={(e) => void submit(e)}>
        <div className="login-brand">
          <div className="brand-icon-box htx-box">
            <Icon name="sprout" size={22} />
          </div>
          <div>
            <h1>AgriGIS</h1>
            <p>Đăng nhập JWT · Web GIS Lâm Đồng</p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-user">Tên đăng nhập</label>
          <input
            id="login-user"
            className="input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-pass">Mật khẩu</label>
          <input
            id="login-pass"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !password}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <div className="login-hints">
          <p>
            <strong>ADMIN</strong> — <code>admin_gis</code> / <code>AgriAdmin@2026</code>
          </p>
          <p>
            <strong>HTX</strong> — <code>htx_caudat</code> / <code>AgriHtx@2026</code>
          </p>
        </div>
      </form>
    </div>
  );
}
