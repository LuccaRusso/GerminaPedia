// src/pages/WikisListPage.jsx — Lista todas as wikis com filtros por tipo
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wikisApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './pages.css';

const TIPO_META = {
  ALUNO:    { icon: '🎓', color: 'badge-blue',   label: 'Aluno' },
  SALA:     { icon: '🏫', color: 'badge-amber',  label: 'Sala' },
  EVENTO:   { icon: '📅', color: 'badge-purple', label: 'Evento' },
  HISTORIA: { icon: '📖', color: 'badge-gray',   label: 'História' },
  GERAL:    { icon: '📚', color: 'badge-green',  label: 'Geral' },
};

export default function WikisListPage() {
  const { isEditor } = useAuth();
  const [wikis, setWikis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    wikisApi.list({ search: search || undefined, tipo: tipo || undefined, page, limit: 24 })
      .then((r) => { setWikis(r.data); setMeta(r.meta); })
      .finally(() => setLoading(false));
  }, [search, tipo, page]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📚 Todas as Wikis</h1>
        <p className="page-subtitle">{meta.total} wikis publicadas</p>
      </div>

      <div className="page-actions">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Buscar wikis..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={tipo}
            onChange={(e) => { setTipo(e.target.value); setPage(1); }}>
            <option value="">Todos os tipos</option>
            {Object.entries(TIPO_META).map(([key, m]) => (
              <option key={key} value={key}>{m.icon} {m.label}</option>
            ))}
          </select>
        </div>
        {isEditor && (
          <Link to="/wikis/nova">
            <button className="btn-primary">+ Nova Wiki</button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner" /><span>Carregando...</span></div>
      ) : wikis.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📭</span>
          <div className="empty-state__title">Nenhuma wiki encontrada</div>
          {isEditor && <Link to="/wikis/nova"><button className="btn-primary" style={{ marginTop: '16px' }}>Criar wiki</button></Link>}
        </div>
      ) : (
        <div className="cards-grid">
          {wikis.map((wiki) => {
            const m = TIPO_META[wiki.tipo] ?? TIPO_META.GERAL;
            return (
              <Link key={wiki.id} to={`/wiki/${wiki.slug}`} className="entity-card">
                <div className="entity-card__header">
                  <span className="entity-card__icon">{m.icon}</span>
                  <span className={`badge ${m.color}`}>{m.label}</span>
                </div>
                <div className="entity-card__title">{wiki.titulo}</div>
                {wiki.resumo && <div className="entity-card__desc">{wiki.resumo}</div>}
                <div className="entity-card__meta">
                  <span>👁 {wiki.visualizacoes}</span>
                  <span>🕐 {format(new Date(wiki.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                  {wiki.editadoPor && <span>✏️ {wiki.editadoPor.name}</span>}
                </div>
                {wiki.tags?.length > 0 && (
                  <div className="entity-card__tags">
                    {wiki.tags.slice(0, 3).map((t) => (
                      <span key={t} className="badge badge-gray">#{t}</span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="pagination">
          <button className="btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <span className="pagination__info">Página {page} de {meta.totalPages} ({meta.total} wikis)</span>
          <button className="btn-secondary btn-sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
        </div>
      )}
    </div>
  );
}
