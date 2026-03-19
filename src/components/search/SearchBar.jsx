// src/components/search/SearchBar.jsx
// Barra de busca global com debounce e dropdown de resultados

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../services/api';
import './SearchBar.css';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const TIPO_LABELS = {
  wikis: { label: 'Wiki', icon: '📚', color: 'badge-green' },
  alunos: { label: 'Aluno', icon: '🎓', color: 'badge-blue' },
  salas: { label: 'Sala', icon: '🏫', color: 'badge-amber' },
  eventos: { label: 'Evento', icon: '📅', color: 'badge-purple' },
  historias: { label: 'História', icon: '📖', color: 'badge-gray' },
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Executa busca quando query muda (debounced)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    setLoading(true);
    searchApi
      .search(debouncedQuery, 5)
      .then((data) => {
        setResults(data);
        setOpen(true);
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (item, tipo) => {
      setQuery('');
      setOpen(false);
      // Navega para a wiki ou para a entidade diretamente
      if (item.wiki?.slug || item.slug) {
        navigate(`/wiki/${item.wiki?.slug || item.slug}`);
      } else if (tipo === 'alunos') {
        navigate(`/alunos/${item.id}`);
      } else if (tipo === 'salas') {
        navigate(`/salas/${item.id}`);
      } else if (tipo === 'eventos') {
        navigate(`/eventos/${item.id}`);
      } else if (tipo === 'historias') {
        navigate(`/historias/${item.id}`);
      }
    },
    [navigate],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/busca?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const hasResults = results && results.total > 0;
  const isEmpty = results && results.total === 0;

  return (
    <div className="searchbar" ref={wrapRef}>
      <form className="searchbar__form" onSubmit={handleSubmit}>
        <span className="searchbar__icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar alunos, salas, eventos, histórias..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="searchbar__input"
          onFocus={() => results && setOpen(true)}
        />
        {loading && <span className="spinner searchbar__spinner" />}
      </form>

      {open && (
        <div className="searchbar__dropdown">
          {isEmpty && (
            <div className="searchbar__empty">
              Nenhum resultado para "{debouncedQuery}"
            </div>
          )}

          {hasResults &&
            Object.entries(TIPO_LABELS).map(([tipo, meta]) => {
              const items = results[tipo];
              if (!items?.length) return null;
              return (
                <div key={tipo} className="searchbar__group">
                  <div className="searchbar__group-label">
                    {meta.icon} {meta.label}s
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className="searchbar__item"
                      onClick={() => handleSelect(item, tipo)}
                    >
                      <span className={`badge ${meta.color}`}>{meta.label}</span>
                      <span className="searchbar__item-name">
                        {item.titulo || item.nome || `${item.nome} — ${item.ano}`}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}

          {hasResults && (
            <button
              className="searchbar__all"
              onClick={() => {
                navigate(`/busca?q=${encodeURIComponent(debouncedQuery)}`);
                setOpen(false);
              }}
            >
              Ver todos os {results.total} resultados para "{debouncedQuery}" →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
