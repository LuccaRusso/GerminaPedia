// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './pages.css';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro de autenticação. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <Link to="/" className="login-logo">
            <div className="login-logo__icon">🌱</div>
            <span className="login-logo__text">GerminaPedia</span>
          </Link>
          <p className="login-card__subtitle">
            {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        {error && (
          <div className="login-error">❌ {error}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="login-label">Seu nome</label>
              <input
                type="text"
                placeholder="João Silva"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="login-label">Email</label>
            <input
              type="email"
              placeholder="voce@escola.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="login-label">Senha</label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (
              <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Aguarde...</>
            ) : (
              mode === 'login' ? '🔑 Entrar' : '🚀 Criar conta'
            )}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <>Não tem conta?{' '}
              <button className="btn-ghost" onClick={() => { setMode('register'); setError(''); }}>
                Registrar-se
              </button>
            </>
          ) : (
            <>Já tem conta?{' '}
              <button className="btn-ghost" onClick={() => { setMode('login'); setError(''); }}>
                Fazer login
              </button>
            </>
          )}
        </div>

        {mode === 'login' && (
          <div className="login-demo">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '8px' }}>
              Credenciais de demonstração:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { role: 'Admin', email: 'admin@germinapedia.com', pwd: 'Admin@123' },
                { role: 'Editor', email: 'editor@germinapedia.com', pwd: 'Editor@123' },
                { role: 'Leitor', email: 'leitor@germinapedia.com', pwd: 'Reader@123' },
              ].map((d) => (
                <button key={d.email} className="btn-ghost btn-sm"
                  onClick={() => setForm({ email: d.email, password: d.pwd, name: '' })}
                  style={{ fontSize: 'var(--text-xs)', textAlign: 'left' }}
                >
                  [{d.role}] {d.email}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
