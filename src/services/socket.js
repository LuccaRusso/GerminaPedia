// src/services/socket.js
// Gerencia a conexão Socket.IO com o backend para atualizações em tempo real

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(`${SOCKET_URL}/wiki`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado ao servidor real-time');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Erro de conexão:', err.message);
    });
  }
  return socket;
}

// Entrar na "sala" de uma wiki específica para receber updates dela
export function joinWiki(wikiId, user) {
  getSocket().emit('wiki:join', {
    wikiId,
    userId: user?.id,
    userName: user?.name,
  });
}

// Sair da sala de uma wiki
export function leaveWiki(wikiId) {
  getSocket().emit('wiki:leave', { wikiId });
}

// Sinalizar que está digitando
export function notifyTyping(wikiId, userName) {
  getSocket().emit('wiki:typing', { wikiId, userName });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
