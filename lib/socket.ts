import { io, Socket } from 'socket.io-client'
import { APP_CONFIG } from './config'

// On s'assure que l'URL est correcte (ex: http://localhost:3001)
const SOCKET_URL = APP_CONFIG.apiUrl;

export const socket: Socket = io(SOCKET_URL, {
  // 'websocket' est plus stable pour le temps réel que 'polling'
  transports: ['websocket'], 
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Debugging pour voir l'état dans la console du navigateur (F12)
socket.on('connect', () => {
  console.log('🚀 Connecté au serveur WebSocket :', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur de connexion WebSocket :', error.message);
});