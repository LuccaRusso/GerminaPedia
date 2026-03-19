// src/pages/HomePage.jsx
// Página inicial: hero, stats e cards das entidades em destaque

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wikisApi, alunosApi, salasApi, eventosApi, historiasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import './pages.css';

function StatCard({ icon, number, label }) {
  return (
    <div className="home-stat">
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
      <div className="home-stat__number">{number ?? '—'}</div>
      <div className="home-stat__label">{label}</div>
    </div>
  );
}

function EntityCard({ item, tipo }) {
  const icons = { ALUNO: '🎓', SALA: '🏫', EVENTO: '📅', HISTORIA: '📖', GERAL: '📚' };
  const badgeColors = { ALUNO: 'badge-blue', SALA: 'badge-amber', EVENTO: 'badge-purple', HISTORIA: 'badge-gray', GERAL: 'badge-green' };
  const tipoLabels = { ALUNO: 'Aluno', SALA: 'Sala', EVENTO: 'Evento', HISTORIA: 'História', GERAL: 'Wiki' };

  const href = item.slug ? `/wiki/${item.slug}` : `/${tipo}/${item.id}`;

  return (
    <Link to={href} className="entity-card">
      <div className="entity-card__header">
        <span className="entity-card__icon">{icons[item.tipo] ?? '📄'}</span>
        <span className={`badge ${badgeColors[item.tipo] ?? 'badge-green'}`}>
          {tipoLabels[item.tipo] ?? item.tipo}
        </span>
      </div>
      <div className="entity-card__title">{item.titulo}</div>
      {item.resumo && <div className="entity-card__desc">{item.resumo}</div>}
      <div className="entity-card__meta">
        <span>✏️ {item.editadoPor?.name ?? item.criadoPor?.name ?? 'Anônimo'}</span>
        <span>👁 {item.visualizacoes ?? 0}</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [recentWikis, setRecentWikis] = useState([]);
  const [stats, setStats] = useState({ wikis: 0, alunos: 0, salas: 0, eventos: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [wikisRes, alunosRes, salasRes, eventosRes] = await Promise.all([
        wikisApi.list({ limit: 6, page: 1 }),
        alunosApi.list({ limit: 1 }),
        salasApi.list({ limit: 1 }),
        eventosApi.list({ limit: 1 }),
      ]);
      setRecentWikis(wikisRes.data);
      setStats({
        wikis: wikisRes.meta.total,
        alunos: alunosRes.meta.total,
        salas: salasRes.meta.total,
        eventos: eventosRes.meta.total,
      });
    } catch (err) {
      console.error('Erro ao carregar dados da home:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Escuta eventos real-time: quando qualquer wiki for criada/alterada, recarrega
    const socket = getSocket();
    const handleChange = () => loadData();
    socket.on('wiki:created', handleChange);
    socket.on('wiki:changed', handleChange);

    return () => {
      socket.off('wiki:created', handleChange);
      socket.off('wiki:changed', handleChange);
    };
  }, []);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <div className="home-hero">
        <h1 className="home-hero__title">
          🌱 Bem-vindo à GerminaPedia
        </h1>
        <p className="home-hero__sub">
          A enciclopédia colaborativa da nossa escola. Preserve memórias, conte histórias
          e conecte pessoas através do conhecimento.
        </p>
        <div className="home-hero__actions">
          <Link to="/wikis">
            <button className="btn-primary btn-lg">📚 Explorar Wikis</button>
          </Link>
          {isEditor && (
            <Link to="/wikis/nova">
              <button className="btn-secondary btn-lg">✏️ Criar Wiki</button>
            </Link>
          )}
          {!isEditor && (
            <Link to="/login">
              <button className="btn-secondary btn-lg">🔑 Entrar para Contribuir</button>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <div className="home-stats">
        <StatCard icon="📚" number={stats.wikis} label="Wikis publicadas" />
        <StatCard icon="🎓" number={stats.alunos} label="Alunos" />
        <StatCard icon="🏫" number={stats.salas} label="Turmas" />
        <StatCard icon="📅" number={stats.eventos} label="Eventos" />
      </div>

      {/* ─── Wikis Recentes ───────────────────────────────────── */}
      <div className="home-section">
        <h2 className="home-section__title">
          🕐 Wikis Recentes
          <Link to="/wikis" className="home-section__see-all">Ver todas →</Link>
        </h2>
        {loading ? (
          <div className="loading-state">
            <span className="spinner" />
            <span>Carregando...</span>
          </div>
        ) : recentWikis.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">📭</span>
            <div className="empty-state__title">Nenhuma wiki ainda</div>
            <p>Seja o primeiro a criar uma wiki!</p>
            {isEditor && (
              <Link to="/wikis/nova">
                <button className="btn-primary" style={{ marginTop: '16px' }}>
                  Criar a primeira wiki
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="cards-grid">
            {recentWikis.map((wiki) => (
              <EntityCard key={wiki.id} item={wiki} tipo="wikis" />
            ))}
          </div>
        )}
      </div>

      {/* ─── Categorias ───────────────────────────────────────── */}
      <div className="home-section">
        <h2 className="home-section__title">🗂️ Explorar por Categoria</h2>
        <div className="cards-grid--3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { to: '/alunos', icon: '🎓', label: 'Alunos', desc: 'Perfis e trajetórias' },
            { to: '/salas', icon: '🏫', label: 'Salas', desc: 'Turmas por ano' },
            { to: '/eventos', icon: '📅', label: 'Eventos', desc: 'Acontecimentos marcantes' },
            { to: '/historias', icon: '📖', label: 'Histórias', desc: 'Memórias da escola' },
          ].map((cat) => (
            <Link key={cat.to} to={cat.to} className="entity-card" style={{ textAlign: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem' }}>{cat.icon}</div>
              <div className="entity-card__title">{cat.label}</div>
              <div className="entity-card__desc">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
