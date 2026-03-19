// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './pages.css';
import './LoginPage.css';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Erro de autenticação. Verifique seus dados.'));
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
                minLength={2}
                className="login-input"
              />
            </div>
          )}

          <div>
            <label className="login-label">Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="login-input"
            />
          </div>

          <div>
            <label className="login-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="login-input"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '18px',
                  color: 'var(--text-muted)', padding: '0',
                }}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? '⏳ Aguarde...' : mode === 'login' ? '🔑 Entrar' : '✅ Criar conta'}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button className="btn-link" onClick={() => { setMode('register'); setError(''); }}>
                Criar conta gratuita
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button className="btn-link" onClick={() => { setMode('login'); setError(''); }}>
                Fazer login
              </button>
            </>
          )}
        </div>

        {/* Acesso rápido para testes */}
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: 'var(--text-sm)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Acesso rápido:</div>
          {[
            { role: 'ADMIN', email: 'admin@germinapedia.com', pwd: 'GerminaPedia@2024' },
            { role: 'EDITOR', email: 'editor@germinapedia.com', pwd: 'Editor@123' },
          ].map((d) => (
            <button
              key={d.email}
              className="btn-ghost"
              onClick={() => setForm({ email: d.email, password: d.pwd, name: '' })}
              style={{ fontSize: 'var(--text-xs)', textAlign: 'left', display: 'block', width: '100%' }}
            >
              [{d.role}] {d.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
