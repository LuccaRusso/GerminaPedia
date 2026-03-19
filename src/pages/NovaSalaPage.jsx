// src/pages/NovaSalaPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salasApi } from '../services/api';
import './pages.css';

export default function NovaSalaPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nome: '', ano: new Date().getFullYear(), turno: '', capacidade: '', descricao: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await salasApi.create({
        ...form,
        ano: Number(form.ano),
        capacidade: form.capacidade ? Number(form.capacidade) : undefined,
        turno: form.turno || undefined,
        descricao: form.descricao || undefined,
      });
      navigate('/salas');
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
        <h1 className="page-title">🏫 Nova Sala</h1>
        <p className="page-subtitle">Cadastre uma turma da escola</p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>❌ {error}</div>}

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="login-label">Nome da Turma *</label>
            <input className="login-input" value={form.nome}
              onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Turma A, 6º Ano B" required minLength={2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="login-label">Ano *</label>
              <input className="login-input" type="number" value={form.ano}
                onChange={(e) => setForm(f => ({ ...f, ano: e.target.value }))}
                min={2000} max={2100} required />
            </div>
            <div>
              <label className="login-label">Turno</label>
              <select className="login-input" value={form.turno}
                onChange={(e) => setForm(f => ({ ...f, turno: e.target.value }))}>
                <option value="">Selecione</option>
                <option>Manhã</option>
                <option>Tarde</option>
                <option>Noite</option>
                <option>Integral</option>
              </select>
            </div>
          </div>
          <div>
            <label className="login-label">Capacidade</label>
            <input className="login-input" type="number" value={form.capacidade}
              onChange={(e) => setForm(f => ({ ...f, capacidade: e.target.value }))}
              placeholder="Ex: 35" min={1} />
          </div>
          <div>
            <label className="login-label">Descrição</label>
            <textarea className="login-input" value={form.descricao}
              onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Informações sobre a turma..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✅ Salvar Sala'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/salas')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
