// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import './pages.css';

const ROLE_LABEL = { ADMIN: '👑 Admin', EDITOR: '✏️ Editor', READER: '📖 Leitor' };
const ROLE_COLOR = { ADMIN: '#ef4444', EDITOR: '#8b5cf6', READER: '#3b82f6' };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    usersApi.me()
      .then((data) => {
        setProfile(data);
        setForm({ name: data.name, bio: data.bio || '' });
      })
      .catch(() => setError('Erro ao carregar perfil'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await usersApi.updateProfile(form);
      setProfile((p) => ({ ...p, ...updated }));
      setEditing(false);
      setSuccessMsg('Perfil atualizado!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="loading-state">
        <span className="spinner" />
        <span>Carregando perfil...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      {/* ─── Header do perfil ─── */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 24,
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, flexShrink: 0,
        }}>
          {profile?.name?.[0]?.toUpperCase() ?? '?'}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{profile?.name}</h1>
          <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            {profile?.email}
          </div>
          <div style={{
            display: 'inline-block', marginTop: 8,
            padding: '2px 10px', borderRadius: 99,
            background: ROLE_COLOR[profile?.role] + '22',
            color: ROLE_COLOR[profile?.role],
            fontWeight: 600, fontSize: 13,
          }}>
            {ROLE_LABEL[profile?.role] ?? profile?.role}
          </div>
          {profile?.bio && (
            <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              {profile.bio}
            </p>
          )}
        </div>

        <button className="btn-secondary btn-sm" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancelar' : '✏️ Editar'}
        </button>
      </div>

      {/* ─── Form de edição ─── */}
      {editing && (
        <div style={{
          background: 'var(--surface)', borderRadius: 16, padding: 24,
          marginBottom: 24, border: '1px solid var(--border)',
        }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Editar Perfil</h2>
          {error && <div className="login-error">❌ {error}</div>}
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label className="login-label">Nome</label>
              <input
                className="login-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Seu nome"
                required
                minLength={2}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="login-label">Bio <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(opcional)</span></label>
              <textarea
                className="login-input"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Uma frase sobre você..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </div>
      )}

      {successMsg && (
        <div style={{
          background: '#dcfce7', color: '#16a34a', borderRadius: 8,
          padding: '10px 16px', marginBottom: 16, fontWeight: 500,
        }}>
          ✅ {successMsg}
        </div>
      )}

      {/* ─── Wikis criadas ─── */}
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 24,
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            📚 Minhas Wikis
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: 14, marginLeft: 8 }}>
              ({profile?.wikisCreated?.length ?? 0})
            </span>
          </h2>
          <Link to="/wikis/nova">
            <button className="btn-primary btn-sm">+ Nova Wiki</button>
          </Link>
        </div>

        {!profile?.wikisCreated?.length ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <span className="empty-state__icon">📭</span>
            <div className="empty-state__title">Nenhuma wiki ainda</div>
            <p>Crie sua primeira wiki e contribua com a GerminaPedia!</p>
            <Link to="/wikis/nova">
              <button className="btn-primary" style={{ marginTop: 12 }}>Criar Wiki</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.wikisCreated.map((wiki) => (
              <Link
                key={wiki.id}
                to={`/wiki/${wiki.slug}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 8,
                  border: '1px solid var(--border)', textDecoration: 'none',
                  color: 'var(--text)', background: 'var(--bg)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontWeight: 500 }}>📄 {wiki.titulo}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ver →</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── Logout ─── */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          className="btn-ghost btn-sm"
          style={{ color: '#ef4444' }}
          onClick={() => { logout(); navigate('/login'); }}
        >
          🚪 Sair da conta
        </button>
      </div>
    </div>
  );
}
