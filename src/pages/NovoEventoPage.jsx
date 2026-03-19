// src/pages/NovoEventoPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventosApi } from '../services/api';
import './pages.css';

const TIPOS = ['Formatura', 'Excursão', 'Festa', 'Reunião', 'Esporte', 'Cultura', 'Outro'];

export default function NovoEventoPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '', descricao: '', dataInicio: '', dataFim: '', local: '', tipo: '', imagemUrl: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await eventosApi.create({
        ...form,
        descricao: form.descricao || undefined,
        dataFim: form.dataFim || undefined,
        local: form.local || undefined,
        tipo: form.tipo || undefined,
        imagemUrl: form.imagemUrl || undefined,
      });
      navigate('/eventos');
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
        <h1 className="page-title">📅 Novo Evento</h1>
        <p className="page-subtitle">Registre um evento ou acontecimento da escola</p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>❌ {error}</div>}

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="login-label">Título *</label>
            <input className="login-input" value={form.titulo}
              onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Formatura Turma A 2024" required minLength={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="login-label">Data de início *</label>
              <input className="login-input" type="date" value={form.dataInicio}
                onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))} required />
            </div>
            <div>
              <label className="login-label">Data de fim</label>
              <input className="login-input" type="date" value={form.dataFim}
                onChange={(e) => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="login-label">Tipo</label>
            <select className="login-input" value={form.tipo}
              onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="">Selecione um tipo</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="login-label">Local</label>
            <input className="login-input" value={form.local}
              onChange={(e) => setForm(f => ({ ...f, local: e.target.value }))}
              placeholder="Ex: Ginásio da escola" />
          </div>
          <div>
            <label className="login-label">Descrição</label>
            <textarea className="login-input" value={form.descricao}
              onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o evento..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✅ Salvar Evento'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/eventos')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
