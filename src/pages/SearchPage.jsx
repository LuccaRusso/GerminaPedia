// src/pages/SearchPage.jsx — Página de busca global completa
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchApi } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './pages.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q);

  useEffect(() => {
    if (!q || q.length < 2) return;
    setLoading(true);
    searchApi.search(q, 20)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 Busca</h1>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <input style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Buscar alunos, salas, eventos, histórias, wikis..." autoFocus />
        <button type="submit" className="btn-primary">Buscar</button>
      </form>

      {loading && <div className="loading-state"><span className="spinner" /><span>Buscando...</span></div>}

      {results && !loading && (
        <>
          <p className="page-subtitle" style={{ marginBottom: '24px' }}>
            {results.total} resultado(s) para "{results.query}"
          </p>

          {results.total === 0 && (
            <div className="empty-state">
              <span className="empty-state__icon">😕</span>
              <div className="empty-state__title">Nenhum resultado</div>
              <p>Tente outros termos ou verifique a ortografia.</p>
            </div>
          )}

          {[
            { key: 'wikis',    icon: '📚', label: 'Wikis',    link: (r) => `/wiki/${r.slug}` },
            { key: 'alunos',   icon: '🎓', label: 'Alunos',   link: (r) => r.wiki?.slug ? `/wiki/${r.wiki.slug}` : `/alunos/${r.id}` },
            { key: 'salas',    icon: '🏫', label: 'Salas',    link: (r) => r.wiki?.slug ? `/wiki/${r.wiki.slug}` : `/salas/${r.id}` },
            { key: 'eventos',  icon: '📅', label: 'Eventos',  link: (r) => r.wiki?.slug ? `/wiki/${r.wiki.slug}` : `/eventos/${r.id}` },
            { key: 'historias',icon: '📖', label: 'Histórias', link: (r) => r.wiki?.slug ? `/wiki/${r.wiki.slug}` : `/historias/${r.id}` },
          ].map(({ key, icon, label, link }) => {
            const items = results[key];
            if (!items?.length) return null;
            return (
              <div key={key} className="home-section">
                <h2 className="home-section__title">{icon} {label} ({items.length})</h2>
                <div className="cards-grid">
                  {items.map((item) => (
                    <Link key={item.id} to={link(item)} className="entity-card">
                      <div className="entity-card__title">
                        {item.titulo ?? item.nome ?? `${item.nome} — ${item.ano}`}
                      </div>
                      {item.resumo && <div className="entity-card__desc">{item.resumo}</div>}
                      {item.descricao && <div className="entity-card__desc">{item.descricao}</div>}
                      <div className="entity-card__meta">
                        {item.tipo && <span className="badge badge-green">{item.tipo}</span>}
                        {item.sala && <span>🏫 {item.sala.nome} ({item.sala.ano})</span>}
                        {item.ano && <span>📅 {item.ano}</span>}
                        {item.dataInicio && <span>📆 {format(new Date(item.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}</span>}
                        {item.updatedAt && <span>🕐 {format(new Date(item.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
