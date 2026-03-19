// src/pages/NovaHistoriaPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { historiasApi } from '../services/api';
import './pages.css';

export default function NovaHistoriaPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '', descricao: '', data: '', destaque: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await historiasApi.create({
        ...form,
        descricao: form.descricao || undefined,
        data: form.data || undefined,
      });
      navigate('/historias');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header">
        <h1 className="page-title">📖 Nova História</h1>
        <p className="page-subtitle">Preserve uma memória da escola</p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>❌ {error}</div>}

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="login-label">Título *</label>
            <input className="login-input" value={form.titulo}
              onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: A primeira turma da escola" required minLength={3} />
          </div>
          <div>
            <label className="login-label">Data</label>
            <input className="login-input" type="date" value={form.data}
              onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
          </div>
          <div>
            <label className="login-label">Descrição</label>
            <textarea className="login-input" value={form.descricao}
              onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Conte a história..." rows={4} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="destaque" checked={form.destaque}
              onChange={(e) => setForm(f => ({ ...f, destaque: e.target.checked }))}
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="destaque" style={{ cursor: 'pointer', fontWeight: 500 }}>
              ⭐ Marcar como destaque
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✅ Salvar História'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/historias')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
