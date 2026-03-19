// src/components/layout/Layout.jsx
// Layout principal: Header + Sidebar + Content
// Usado em todas as páginas autenticadas e públicas

import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search/SearchBar';
import './Layout.css';

const navItems = [
  { to: '/',         label: 'Início',       icon: '🏠', end: true },
  { to: '/alunos',   label: 'Alunos',       icon: '🎓' },
  { to: '/salas',    label: 'Salas',        icon: '🏫' },
  { to: '/eventos',  label: 'Eventos',      icon: '📅' },
  { to: '/historias',label: 'Histórias',    icon: '📖' },
  { to: '/wikis',    label: 'Todas as Wikis', icon: '📚' },
];

export default function Layout({ children }) {
  const { user, logout, isEditor, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="header">
        <button
          className="btn-ghost mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menu"
        >
          ☰
        </button>

        <Link to="/" className="header__logo">
          <div className="header__logo-icon">🌱</div>
          <span className="header__logo-text">
            Germina<span>Pedia</span>
          </span>
        </Link>

        <div className="header__search-wrap">
          <SearchBar />
        </div>

        <nav className="header__nav">
          {isEditor && (
            <Link to="/wikis/nova">
              <button className="btn-primary btn-sm">
                + Nova Wiki
              </button>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="header__user">
              <Link to="/perfil" style={{ textDecoration: 'none' }}>
                <div className="header__avatar" title={user?.name}>
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              </Link>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="btn-secondary btn-sm">Entrar</button>
            </Link>
          )}
        </nav>
      </header>

      {/* ─── Overlay Mobile ─────────────────────────────────── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* ─── Sidebar ────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar__section">
          <div className="sidebar__label">Navegar</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {isEditor && (
          <div className="sidebar__section">
            <div className="sidebar__label">Criar</div>
            <NavLink
              to="/wikis/nova"
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar__link-icon">✏️</span>
              Nova Wiki
            </NavLink>
            <NavLink
              to="/alunos/novo"
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar__link-icon">👤</span>
              Novo Aluno
            </NavLink>
            <NavLink
              to="/eventos/novo"
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar__link-icon">🎉</span>
              Novo Evento
            </NavLink>
          </div>
        )}

        <div className="sidebar__section">
          <div className="sidebar__label">Conta</div>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <span className="sidebar__link-icon">👤</span>
                Meu Perfil
              </NavLink>
              <button className="sidebar__link" onClick={handleLogout}>
                <span className="sidebar__link-icon">🚪</span>
                Sair
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="sidebar__link-icon">🔑</span>
              Entrar
            </NavLink>
          )}
        </div>
      </aside>

      {/* ─── Content ─────────────────────────────────────────── */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
