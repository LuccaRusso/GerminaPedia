import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WikiDetailPage from './pages/WikiDetailPage';
import WikiEditorPage from './pages/WikiEditorPage';
import WikisListPage from './pages/WikisListPage';
import AlunosPage from './pages/AlunosPage';
import SalasPage from './pages/SalasPage';
import EventosPage from './pages/EventosPage';
import HistoriasPage from './pages/HistoriasPage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';

// Guard: redireciona para login se não autenticado
function RequireAuth({ children, requiredRole }) {
  const { isAuthenticated, isEditor, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole === 'editor' && !isEditor) return <Navigate to="/" replace />;
  if (requiredRole === 'admin' && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/wikis" element={<Layout><WikisListPage /></Layout>} />
      <Route path="/wiki/:slug" element={<Layout><WikiDetailPage /></Layout>} />
      <Route path="/alunos" element={<Layout><AlunosPage /></Layout>} />
      <Route path="/salas" element={<Layout><SalasPage /></Layout>} />
      <Route path="/eventos" element={<Layout><EventosPage /></Layout>} />
      <Route path="/historias" element={<Layout><HistoriasPage /></Layout>} />
      <Route path="/busca" element={<Layout><SearchPage /></Layout>} />

      {/* Perfil — qualquer logado */}
      <Route path="/perfil" element={
        <RequireAuth>
          <Layout><ProfilePage /></Layout>
        </RequireAuth>
      } />

      {/* Editor de wiki — qualquer logado */}
      <Route path="/wikis/nova" element={
        <RequireAuth>
          <Layout><WikiEditorPage /></Layout>
        </RequireAuth>
      } />
      <Route path="/wikis/:id/editar" element={
        <RequireAuth>
          <Layout><WikiEditorPage /></Layout>
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
