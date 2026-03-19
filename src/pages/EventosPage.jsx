// src/pages/EventosPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventosApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './pages.css';

export default function EventosPage() {
  const { isEditor } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    eventosApi.list({ search: search || undefined, tipo: tipo || undefined, page, limit: 24 })
      .then((r) => { setEventos(r.data); setMeta(r.meta); })
      .finally(() => setLoading(false));
  }, [search, tipo, page]);

  const tiposDisponiveis = ['Formatura', 'Excursão', 'Festa', 'Reunião', 'Esporte', 'Cultura', 'Outro'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📅 Eventos e Acontecimentos</h1>
        <p className="page-subtitle">Registros dos momentos marcantes da escola</p>
      </div>

      <div className="page-actions">
        <div className="filters">
          <input className="filter-input" placeholder="🔍 Buscar evento..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={tipo}
            onChange={(e) => { setTipo(e.target.value); setPage(1); }}>
            <option value="">Todos os tipos</option>
            {tiposDisponiveis.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {isEditor && (
          <Link to="/eventos/novo">
            <button className="btn-primary">+ Novo Evento</button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-state"><span className="spinner" /><span>Carregando...</span></div>
      ) : eventos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📅</span>
          <div className="empty-state__title">Nenhum evento encontrado</div>
        </div>
      ) : (
        <div className="cards-grid">
          {eventos.map((evento) => (
            <Link
              key={evento.id}
              to={evento.wiki ? `/wiki/${evento.wiki.slug}` : `/eventos/${evento.id}`}
              className="entity-card"
            >
              <div className="entity-card__header">
                <span className="entity-card__icon">📅</span>
                <span className="badge badge-purple">{evento.tipo ?? 'Evento'}</span>
              </div>
              <div className="entity-card__title">{evento.titulo}</div>
              <div className="entity-card__meta">
                <span>📆 {format(new Date(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}</span>
                {evento.local && <span>📍 {evento.local}</span>}
                {evento.salas?.length > 0 && <span>🏫 {evento.salas.length} turma(s)</span>}
                {evento.alunos?.length > 0 && <span>🎓 {evento.alunos.length} aluno(s)</span>}
              </div>
              {evento.descricao && <div className="entity-card__desc">{evento.descricao}</div>}
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
