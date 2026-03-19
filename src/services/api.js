// src/services/api.js
// Instância Axios configurada com baseURL e interceptors
// - Injeta o token JWT automaticamente em todas as requisições
// - Trata 401 globalmente (redireciona para login)

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de Request: injeta JWT ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('germinapedia:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Interceptor de Response: trata erros globais ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — limpa e redireciona
      localStorage.removeItem('germinapedia:token');
      localStorage.removeItem('germinapedia:user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
};

// ─── Wikis ────────────────────────────────────────────────────
export const wikisApi = {
  list: (params) => api.get('/wikis', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/wikis/${slug}`).then((r) => r.data),
  create: (data) => api.post('/wikis', data).then((r) => r.data),
  update: (id, data) => api.put(`/wikis/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/wikis/${id}`),
  getVersions: (id) => api.get(`/wikis/${id}/versions`).then((r) => r.data),
  restoreVersion: (id, versionId) =>
    api.post(`/wikis/${id}/versions/${versionId}/restore`).then((r) => r.data),
};

// ─── Alunos ───────────────────────────────────────────────────
export const alunosApi = {
  list: (params) => api.get('/alunos', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/alunos/${id}`).then((r) => r.data),
  create: (data) => api.post('/alunos', data).then((r) => r.data),
  update: (id, data) => api.put(`/alunos/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/alunos/${id}`),
};

// ─── Salas ────────────────────────────────────────────────────
export const salasApi = {
  list: (params) => api.get('/salas', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/salas/${id}`).then((r) => r.data),
  getAnos: () => api.get('/salas/anos').then((r) => r.data),
  create: (data) => api.post('/salas', data).then((r) => r.data),
  update: (id, data) => api.put(`/salas/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/salas/${id}`),
};

// ─── Eventos ──────────────────────────────────────────────────
export const eventosApi = {
  list: (params) => api.get('/eventos', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/eventos/${id}`).then((r) => r.data),
  create: (data) => api.post('/eventos', data).then((r) => r.data),
  update: (id, data) => api.put(`/eventos/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/eventos/${id}`),
};

// ─── Histórias ────────────────────────────────────────────────
export const historiasApi = {
  list: (params) => api.get('/historias', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/historias/${id}`).then((r) => r.data),
  create: (data) => api.post('/historias', data).then((r) => r.data),
  update: (id, data) => api.put(`/historias/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/historias/${id}`),
};

// ─── Search ───────────────────────────────────────────────────
export const searchApi = {
  search: (q, limit = 10) => api.get('/search', { params: { q, limit } }).then((r) => r.data),
};

// ─── Users ────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get('/users/me').then((r) => r.data),
  updateProfile: (data) => api.put('/users/me/profile', data).then((r) => r.data),
};
