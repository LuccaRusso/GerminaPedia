// src/pages/AlunosPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alunosApi, salasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './pages.css';

export default function AlunosPage() {
  const { isAuthenticated } = useAuth();
  const [alunos, setAlunos] = useState([]);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [salaFilter, setSalaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await alunosApi.list({ search: search || undefined, salaId: salaFilter || undefined, page, limit: 24 });
      setAlunos(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { salasApi.list({ limit: 100 }).then((r) => setSalas(r.data)); }, []);
  useEffect(() => { load(); }, [search, salaFilter, page]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎓 Alunos</h1>
        <p className="page-subtitle">Perfis e trajetórias dos alunos da escola</p>
      </div>

      <div className="page-actions">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Buscar aluno..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={salaFilter}
            onChange={(e) => { setSalaFilter(e.target.value); setPage(1); }}>
            <option value="">Todas as salas</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>{s.nome} ({s.ano})</option>
            ))}
          </select>
        </div>
        {isAuthenticated && (
          <Link to="/alunos/novo">
            <button className="btn-primary">+ Novo Aluno</button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner" /><span>Carregando...</span></div>
      ) : alunos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🎓</span>
          <div className="empty-state__title">Nenhum aluno encontrado</div>
        </div>
      ) : (
        <div className="cards-grid">
          {alunos.map((aluno) => (
            <Link
              key={aluno.id}
              to={aluno.wiki ? `/wiki/${aluno.wiki.slug}` : `/alunos/${aluno.id}`}
              className="entity-card"
            >
              <div className="entity-card__header">
                <span className="entity-card__icon">🎓</span>
                <span className="badge badge-blue">Aluno</span>
              </div>
              <div className="entity-card__title">{aluno.nome}</div>
              <div className="entity-card__meta">
                <span>🏫 {aluno.sala?.nome} ({aluno.sala?.ano})</span>
                {aluno.matricula && <span>📋 {aluno.matricula}</span>}
              </div>
              {aluno.bio && <div className="entity-card__desc">{aluno.bio}</div>}
              {aluno.wiki ? (
                <span className="badge badge-green" style={{ marginTop: 'auto' }}>📚 Tem wiki</span>
              ) : null}
            </Link>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="pagination">
          <button className="btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <span className="pagination__info">Página {page} de {meta.totalPages} ({meta.total} alunos)</span>
          <button className="btn-secondary btn-sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
        </div>
      )}
    </div>
  );
}
