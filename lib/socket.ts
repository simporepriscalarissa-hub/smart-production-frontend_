import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartproduction.duckdns.org';

// autoConnect: false → la connexion est gérée explicitement par le SocketProvider
// Évite les connexions dupliquées lors du SSR Next.js et des refreshs de page
export const socket: Socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'],
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});