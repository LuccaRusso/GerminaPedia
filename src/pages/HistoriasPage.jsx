// src/pages/HistoriasPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historiasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './pages.css';

export default function HistoriasPage() {
  const { isEditor } = useAuth();
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [destaque, setDestaque] = useState('');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    historiasApi.list({
      search: search || undefined,
      destaque: destaque === 'true' ? 'true' : destaque === 'false' ? 'false' : undefined,
      page, limit: 24
    })
      .then((r) => { setHistorias(r.data); setMeta(r.meta); })
      .finally(() => setLoading(false));
  }, [search, destaque, page]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📖 Histórias</h1>
        <p className="page-subtitle">Memórias e relatos que marcaram a escola</p>
      </div>

      <div className="page-actions">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Buscar história..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={destaque}
            onChange={(e) => { setDestaque(e.target.value); setPage(1); }}>
            <option value="">Todas</option>
            <option value="true">⭐ Em destaque</option>
            <option value="false">Sem destaque</option>
          </select>
        </div>
        {isEditor && (
          <Link to="/historias/nova">
            <button className="btn-primary">+ Nova História</button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner" /><span>Carregando...</span></div>
      ) : historias.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📖</span>
          <div className="empty-state__title">Nenhuma história encontrada</div>
        </div>
      ) : (
        <div className="cards-grid">
          {historias.map((historia) => (
            <Link
              key={historia.id}
              to={historia.wiki ? `/wiki/${historia.wiki.slug}` : `/historias/${historia.id}`}
              className="entity-card"
            >
              <div className="entity-card__header">
                <span className="entity-card__icon">📖</span>
                {historia.destaque && <span className="badge badge-amber">⭐ Destaque</span>}
                {!historia.destaque && <span className="badge badge-gray">História</span>}
              </div>
              <div className="entity-card__title">{historia.titulo}</div>
              <div className="entity-card__meta">
                {historia.alunos?.length > 0 && <span>🎓 {historia.alunos.length} aluno(s)</span>}
                {historia.eventos?.length > 0 && <span>📅 {historia.eventos.length} evento(s)</span>}
              </div>
              {historia.descricao && <div className="entity-card__desc">{historia.descricao}</div>}
            </Link>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="pagination">
          <button className="btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <span className="pagination__info">Página {page} de {meta.totalPages}</span>
          <button className="btn-secondary btn-sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
        </div>
      )}
    </div>
  );
}
