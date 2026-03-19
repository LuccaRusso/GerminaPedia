// src/pages/WikiDetailPage.jsx
// Exibe o conteúdo completo de uma wiki (Markdown renderizado)
// Com real-time: quando alguém editar, atualiza automaticamente

import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { wikisApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { joinWiki, leaveWiki, getSocket } from '../services/socket';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './pages.css';

const TIPO_BADGES = {
  ALUNO:    { label: 'Aluno',    color: 'badge-blue',   icon: '🎓' },
  SALA:     { label: 'Sala',     color: 'badge-amber',  icon: '🏫' },
  EVENTO:   { label: 'Evento',   color: 'badge-purple', icon: '📅' },
  HISTORIA: { label: 'História', color: 'badge-gray',   icon: '📖' },
  GERAL:    { label: 'Wiki',     color: 'badge-green',  icon: '📚' },
};

export default function WikiDetailPage() {
  const { slug } = useParams();
  const { user, isEditor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [wiki, setWiki] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineEditors, setOnlineEditors] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    setLoading(true);
    wikisApi
      .getBySlug(slug)
      .then((data) => {
        setWiki(data);
        // Entra na sala real-time
        joinWiki(data.id, user);
      })
      .catch(() => setError('Wiki não encontrada'))
      .finally(() => setLoading(false));

    // ─── Listeners de real-time ────────────────────────────
    const socket = getSocket();

    // Quando a wiki for editada, atualiza o conteúdo automaticamente
    const handleUpdated = (updatedWiki) => {
      if (updatedWiki.id === wiki?.id || updatedWiki.slug === slug) {
        setWiki(updatedWiki);
      }
    };

    // Quando outro usuário entrar na mesma wiki
    const handleEditorJoined = (data) => {
      if (data.userName) {
        setOnlineEditors((prev) => [
          ...prev.filter((e) => e.socketId !== data.socketId),
          data,
        ]);
      }
    };

    const handleEditorLeft = (data) => {
      setOnlineEditors((prev) =>
        prev.filter((e) => e.socketId !== data.socketId),
      );
    };

    socket.on('wiki:updated', handleUpdated);
    socket.on('editor:joined', handleEditorJoined);
    socket.on('editor:left', handleEditorLeft);

    return () => {
      if (wiki?.id) leaveWiki(wiki.id);
      socket.off('wiki:updated', handleUpdated);
      socket.off('editor:joined', handleEditorJoined);
      socket.off('editor:left', handleEditorLeft);
    };
  }, [slug]);

  const loadVersions = async () => {
    if (!wiki) return;
    const data = await wikisApi.getVersions(wiki.id);
    setVersions(data);
    setShowVersions(true);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar esta wiki? Esta ação é irreversível.')) return;
    await wikisApi.delete(wiki.id);
    navigate('/wikis');
  };

  if (loading) return (
    <div className="loading-state">
      <span className="spinner" />
      <span>Carregando wiki...</span>
    </div>
  );

  if (error) return (
    <div className="empty-state">
      <span className="empty-state__icon">😕</span>
      <div className="empty-state__title">{error}</div>
      <Link to="/wikis"><button className="btn-secondary" style={{ marginTop: '16px' }}>← Voltar</button></Link>
    </div>
  );

  if (!wiki) return null;

  const badge = TIPO_BADGES[wiki.tipo] ?? TIPO_BADGES.GERAL;

  return (
    <div className="wiki-detail">
      {/* ─── Realtime: quem está online ─── */}
      {onlineEditors.length > 0 && (
        <div className="wiki-detail__realtime">
          <div className="wiki-detail__realtime-dot" />
          {onlineEditors.length} usuário(s) visualizando agora:{' '}
          {onlineEditors.map((e) => e.userName).join(', ')}
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="wiki-detail__header">
        <div className="wiki-detail__type">
          <span className={`badge ${badge.color}`}>
            {badge.icon} {badge.label}
          </span>
        </div>

        <h1 className="wiki-detail__title">{wiki.titulo}</h1>

        <div className="wiki-detail__meta">
          <span>📝 Criado por <strong>{wiki.criadoPor?.name}</strong></span>
          <span>🕐 {format(new Date(wiki.updatedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          <span>👁 {wiki.visualizacoes} visualizações</span>
          {wiki._count && (
            <span>🔀 {wiki._count.versoes} versões</span>
          )}
        </div>

        {/* Tags */}
        {wiki.tags?.length > 0 && (
          <div className="entity-card__tags" style={{ marginTop: '12px' }}>
            {wiki.tags.map((tag) => (
              <span key={tag} className="badge badge-gray">#{tag}</span>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="wiki-detail__actions">
          {(isEditor || wiki.criadoPor?.id === user?.id) && (
            <Link to={`/wikis/${wiki.id}/editar`}>
              <button className="btn-primary">✏️ Editar</button>
            </Link>
          )}
          <button className="btn-secondary" onClick={showVersions ? () => setShowVersions(false) : loadVersions}>
            🕑 {showVersions ? 'Ocultar Histórico' : 'Ver Histórico'}
          </button>
          {(isAdmin || wiki.criadoPor?.id === user?.id) && (
            <button className="btn-danger btn-sm" onClick={handleDelete}>
              🗑️ Deletar
            </button>
          )}
        </div>
      </div>

      {/* ─── Histórico de Versões ─── */}
      {showVersions && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>🕑 Histórico de Versões</h3>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {versions.map((v) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <span className="badge badge-gray">v{v.numero}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{v.titulo}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {v.autor?.name} · {format(new Date(v.createdAt), "dd/MM/yyyy HH:mm")}
                    {v.comentario && ` · "${v.comentario}"`}
                  </div>
                </div>
                {(isEditor || wiki.criadoPor?.id === user?.id) && (
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      wikisApi.restoreVersion(wiki.id, v.id).then((updated) => setWiki(updated));
                      setShowVersions(false);
                    }}
                  >
                    Restaurar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Conteúdo Markdown ─── */}
      <div className="wiki-content card">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {wiki.conteudo}
        </ReactMarkdown>
      </div>

      {/* ─── Entidade Relacionada ─── */}
      {wiki.sala && (
        <div className="card" style={{ marginTop: '16px' }}>
          <h4>🏫 Turma Relacionada</h4>
          <p style={{ marginTop: '8px' }}>
            <Link to={`/salas/${wiki.sala.id}`}>
              {wiki.sala.nome} — {wiki.sala.ano}
            </Link>
          </p>
        </div>
      )}
      {wiki.aluno && (
        <div className="card" style={{ marginTop: '16px' }}>
          <h4>🎓 Aluno</h4>
          <p style={{ marginTop: '8px' }}>
            <Link to={`/alunos/${wiki.aluno.id}`}>{wiki.aluno.nome}</Link>
            {wiki.aluno.sala && ` — ${wiki.aluno.sala.nome} (${wiki.aluno.sala.ano})`}
          </p>
        </div>
      )}

      {/* ─── Comentários ─── */}
      {wiki.comentarios?.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>💬 Comentários ({wiki._count?.comentarios ?? wiki.comentarios.length})</h3>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {wiki.comentarios.map((c) => (
              <div key={c.id} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                    {c.autor?.name?.[0]}
                  </div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{c.autor?.name}</strong>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>{c.conteudo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
