// src/pages/WikiEditorPage.jsx
// Editor de wiki com Markdown, preview e real-time typing indicator

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { wikisApi, salasApi, alunosApi, eventosApi, historiasApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { notifyTyping, getSocket } from '../services/socket';
import './pages.css';
import './WikiEditorPage.css';

const WIKI_TYPES = [
  { value: 'ALUNO',    label: '🎓 Aluno' },
  { value: 'SALA',     label: '🏫 Sala' },
  { value: 'EVENTO',   label: '📅 Evento' },
  { value: 'HISTORIA', label: '📖 História' },
  { value: 'GERAL',    label: '📚 Geral' },
];

export default function WikiEditorPage() {
  const { id } = useParams(); // se tiver id, é edição; senão, criação
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    slug: '',
    titulo: '',
    resumo: '',
    conteudo: '# Nova Wiki\n\nComece a escrever aqui...',
    tipo: 'GERAL',
    status: 'PUBLISHED',
    tags: '',
    salaId: '',
    alunoId: '',
    eventoId: '',
    historiaId: '',
    comentarioVersao: '',
  });

  const [salas, setSalas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [othersTyping, setOthersTyping] = useState([]);
  const typingTimeout = useRef(null);

  // Carrega dados se for edição
  useEffect(() => {
    const loadRelated = async () => {
      const [salasRes, alunosRes, eventosRes, historiasRes] = await Promise.all([
        salasApi.list({ limit: 100 }),
        alunosApi.list({ limit: 100 }),
        eventosApi.list({ limit: 100 }),
        historiasApi.list({ limit: 100 }),
      ]);
      setSalas(salasRes.data);
      setAlunos(alunosRes.data);
      setEventos(eventosRes.data);
      setHistorias(historiasRes.data);
    };

    loadRelated();

    if (isEditing) {
      setLoading(true);
      wikisApi
        .getById(id)
        .then((wiki) => {
          setForm({
            slug: wiki.slug,
            titulo: wiki.titulo,
            resumo: wiki.resumo ?? '',
            conteudo: wiki.conteudo,
            tipo: wiki.tipo,
            status: wiki.status,
            tags: wiki.tags?.join(', ') ?? '',
            salaId: wiki.sala?.id ?? '',
            alunoId: wiki.aluno?.id ?? '',
            eventoId: wiki.evento?.id ?? '',
            historiaId: wiki.historia?.id ?? '',
            comentarioVersao: '',
          });
        })
        .catch(() => setError('Wiki não encontrada'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Slug automático a partir do título
  const generateSlug = (titulo) =>
    titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'titulo' && !isEditing ? { slug: generateSlug(value) } : {}),
    }));

    // Notifica outros usuários que está digitando (apenas em edições)
    if (isEditing && id) {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      notifyTyping(id, user?.name);
      typingTimeout.current = setTimeout(() => {}, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
        salaId: form.salaId || undefined,
        alunoId: form.alunoId || undefined,
        eventoId: form.eventoId || undefined,
        historiaId: form.historiaId || undefined,
      };

      let result;
      if (isEditing) {
        result = await wikisApi.update(id, payload);
      } else {
        result = await wikisApi.create(payload);
      }

      navigate(`/wiki/${result.slug}`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erro ao salvar wiki');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <span className="spinner" />
      <span>Carregando editor...</span>
    </div>
  );

  return (
    <div className="wiki-editor">
      <div className="wiki-editor__header">
        <h1 className="page-title">
          {isEditing ? '✏️ Editar Wiki' : '📝 Nova Wiki'}
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn-secondary btn-sm ${preview ? 'active' : ''}`}
            onClick={() => setPreview(!preview)}
          >
            {preview ? '✏️ Editar' : '👁 Preview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="wiki-editor__error">
          ❌ {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}

      <form className="wiki-editor__form" onSubmit={handleSubmit}>
        <div className="wiki-editor__main">
          {/* ─── Campos principais ─── */}
          <div className="wiki-editor__field">
            <label className="wiki-editor__label">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Turma A — 2022"
              required
              minLength={3}
            />
          </div>

          <div className="wiki-editor__field">
            <label className="wiki-editor__label">Slug (URL) *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                /wiki/
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                style={{ paddingLeft: '52px' }}
                placeholder="turma-a-2022"
                required
                disabled={isEditing}
                title={isEditing ? 'O slug não pode ser alterado após a criação' : ''}
              />
            </div>
          </div>

          <div className="wiki-editor__field">
            <label className="wiki-editor__label">Resumo</label>
            <input
              type="text"
              value={form.resumo}
              onChange={(e) => handleChange('resumo', e.target.value)}
              placeholder="Breve descrição (aparece nos resultados de busca)"
            />
          </div>

          {/* ─── Editor Markdown ─── */}
          <div className="wiki-editor__field">
            <label className="wiki-editor__label">
              Conteúdo (Markdown) *
              <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                Suporte a **negrito**, *itálico*, # Títulos, listas, tabelas e código
              </span>
            </label>

            {preview ? (
              <div className="wiki-editor__preview wiki-content">
                <ReactMarkdownPreview content={form.conteudo} />
              </div>
            ) : (
              <textarea
                value={form.conteudo}
                onChange={(e) => handleChange('conteudo', e.target.value)}
                className="wiki-editor__textarea"
                placeholder="# Título\n\nConteúdo em Markdown..."
                required
                rows={20}
              />
            )}
          </div>

          {isEditing && (
            <div className="wiki-editor__field">
              <label className="wiki-editor__label">Comentário da edição</label>
              <input
                type="text"
                value={form.comentarioVersao}
                onChange={(e) => handleChange('comentarioVersao', e.target.value)}
                placeholder="Ex: Corrigido informação sobre a data do evento"
              />
            </div>
          )}
        </div>

        {/* ─── Sidebar de opções ─── */}
        <div className="wiki-editor__sidebar">
          <div className="card">
            <h4 style={{ marginBottom: '16px' }}>⚙️ Configurações</h4>

            <div className="wiki-editor__field">
              <label className="wiki-editor__label">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
              >
                {WIKI_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="wiki-editor__field">
              <label className="wiki-editor__label">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="DRAFT">📝 Rascunho</option>
                <option value="PUBLISHED">✅ Publicado</option>
                <option value="ARCHIVED">📦 Arquivado</option>
              </select>
            </div>

            <div className="wiki-editor__field">
              <label className="wiki-editor__label">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="turma, 2022, formatura"
              />
            </div>
          </div>

          {/* Vincular entidades */}
          <div className="card" style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '16px' }}>🔗 Vincular</h4>

            {(form.tipo === 'SALA' || form.tipo === 'GERAL') && (
              <div className="wiki-editor__field">
                <label className="wiki-editor__label">Sala</label>
                <select value={form.salaId} onChange={(e) => handleChange('salaId', e.target.value)}>
                  <option value="">— Nenhuma —</option>
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome} ({s.ano})</option>
                  ))}
                </select>
              </div>
            )}

            {(form.tipo === 'ALUNO' || form.tipo === 'GERAL') && (
              <div className="wiki-editor__field">
                <label className="wiki-editor__label">Aluno</label>
                <select value={form.alunoId} onChange={(e) => handleChange('alunoId', e.target.value)}>
                  <option value="">— Nenhum —</option>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {(form.tipo === 'EVENTO' || form.tipo === 'GERAL') && (
              <div className="wiki-editor__field">
                <label className="wiki-editor__label">Evento</label>
                <select value={form.eventoId} onChange={(e) => handleChange('eventoId', e.target.value)}>
                  <option value="">— Nenhum —</option>
                  {eventos.map((e) => (
                    <option key={e.id} value={e.id}>{e.titulo}</option>
                  ))}
                </select>
              </div>
            )}

            {(form.tipo === 'HISTORIA' || form.tipo === 'GERAL') && (
              <div className="wiki-editor__field">
                <label className="wiki-editor__label">História</label>
                <select value={form.historiaId} onChange={(e) => handleChange('historiaId', e.target.value)}>
                  <option value="">— Nenhuma —</option>
                  {historias.map((h) => (
                    <option key={h.id} value={h.id}>{h.titulo}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botões */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Salvando...</>
              ) : (
                isEditing ? '💾 Salvar Alterações' : '🚀 Publicar Wiki'
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Componente de preview lazy
function ReactMarkdownPreview({ content }) {
  const [ReactMarkdown, setReactMarkdown] = useState(null);
  const [remarkGfm, setRemarkGfm] = useState(null);

  useEffect(() => {
    Promise.all([
      import('react-markdown'),
      import('remark-gfm'),
    ]).then(([rm, rgfm]) => {
      setReactMarkdown(() => rm.default);
      setRemarkGfm(() => rgfm.default);
    });
  }, []);

  if (!ReactMarkdown || !remarkGfm) return <div className="loading-state"><span className="spinner" /></div>;

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
}
