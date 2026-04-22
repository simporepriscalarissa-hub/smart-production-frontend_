import { io, Socket } from 'socket.io-client'
import { APP_CONFIG } from './config'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || APP_CONFIG.apiUrl;

export const socket: Socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('🚀 Connecté au serveur WebSocket :', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur de connexion WebSocket :', error.message);
});