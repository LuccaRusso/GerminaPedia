// src/pages/NovoAlunoPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alunosApi, salasApi } from '../services/api';
import './pages.css';

export default function NovoAlunoPage() {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nome: '', matricula: '', email: '', bio: '', salaId: '', ativo: true,
  });

  useEffect(() => {
    salasApi.list({ limit: 100 }).then((r) => setSalas(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await alunosApi.create({
        ...form,
        matricula: form.matricula || undefined,
        email: form.email || undefined,
        bio: form.bio || undefined,
      });
      navigate('/alunos');
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
        <h1 className="page-title">🎓 Novo Aluno</h1>
        <p className="page-subtitle">Adicione um aluno ao registro da escola</p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 16 }}>❌ {error}</div>}

      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="login-label">Nome *</label>
            <input className="login-input" value={form.nome}
              onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Nome completo" required minLength={2} />
          </div>
          <div>
            <label className="login-label">Sala *</label>
            <select className="login-input" value={form.salaId}
              onChange={(e) => setForm(f => ({ ...f, salaId: e.target.value }))} required>
              <option value="">Selecione uma sala</option>
              {salas.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} ({s.ano})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="login-label">Matrícula</label>
            <input className="login-input" value={form.matricula}
              onChange={(e) => setForm(f => ({ ...f, matricula: e.target.value }))}
              placeholder="Ex: 2024001" />
          </div>
          <div>
            <label className="login-label">Email</label>
            <input className="login-input" type="email" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="aluno@escola.com" />
          </div>
          <div>
            <label className="login-label">Bio</label>
            <textarea className="login-input" value={form.bio}
              onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Uma breve descrição..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✅ Salvar Aluno'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/alunos')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
