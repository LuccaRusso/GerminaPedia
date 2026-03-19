// src/pages/SalasPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './pages.css';

export default function SalasPage() {
  const { isEditor } = useAuth();
  const [salas, setSalas] = useState([]);
  const [anos, setAnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoFilter, setAnoFilter] = useState('');
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  useEffect(() => { salasApi.getAnos().then(setAnos); }, []);

  useEffect(() => {
    setLoading(true);
    salasApi.list({ ano: anoFilter ? Number(anoFilter) : undefined, search: search || undefined, page, limit: 24 })
      .then((r) => { setSalas(r.data); setMeta(r.meta); })
      .finally(() => setLoading(false));
  }, [anoFilter, search, page]);

  // Agrupa salas por ano para melhor visualização
  const salasPorAno = salas.reduce((acc, sala) => {
    if (!acc[sala.ano]) acc[sala.ano] = [];
    acc[sala.ano].push(sala);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏫 Salas / Turmas</h1>
        <p className="page-subtitle">Turmas organizadas por ano</p>
      </div>

      <div className="page-actions">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Buscar turma..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={anoFilter}
            onChange={(e) => { setAnoFilter(e.target.value); setPage(1); }}>
            <option value="">Todos os anos</option>
            {anos.map((ano) => <option key={ano} value={ano}>{ano}</option>)}
          </select>
        </div>
        {isEditor && (
          <Link to="/salas/nova">
            <button className="btn-primary">+ Nova Sala</button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner" /><span>Carregando...</span></div>
      ) : salas.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🏫</span>
          <div className="empty-state__title">Nenhuma sala encontrada</div>
        </div>
      ) : (
        Object.keys(salasPorAno).sort((a, b) => Number(b) - Number(a)).map((ano) => (
          <div key={ano} className="home-section">
            <h2 className="home-section__title">📅 {ano}</h2>
            <div className="cards-grid">
              {salasPorAno[ano].map((sala) => (
                <Link
                  key={sala.id}
                  to={sala.wiki ? `/wiki/${sala.wiki.slug}` : `/salas/${sala.id}`}
                  className="entity-card"
                >
                  <div className="entity-card__header">
                    <span className="entity-card__icon">🏫</span>
                    <span className="badge badge-amber">Turma {sala.ano}</span>
                  </div>
                  <div className="entity-card__title">{sala.nome}</div>
                  <div className="entity-card__meta">
                    {sala.turno && <span>⏰ {sala.turno}</span>}
                    {sala._count?.alunos !== undefined && <span>👥 {sala._count.alunos} alunos</span>}
                    {sala._count?.eventos !== undefined && <span>📅 {sala._count.eventos} eventos</span>}
                  </div>
                  {sala.descricao && <div className="entity-card__desc">{sala.descricao}</div>}
                  {sala.wiki ? (
                    <span className="badge badge-green" style={{ marginTop: 'auto' }}>📚 Tem wiki</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
