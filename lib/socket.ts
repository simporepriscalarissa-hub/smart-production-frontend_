import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartproduction.duckdns.org';

// Guard SSR : socket.io-client ne peut pas s'exécuter côté serveur (Vercel SSR)
export const socket: Socket = typeof window !== 'undefined'
  ? io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  : ({} as Socket);