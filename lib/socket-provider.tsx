'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from '@/lib/socket'

interface SocketContextType {
  connected: boolean
}

const SocketContext = createContext<SocketContextType>({ connected: false })

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket connecté')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket déconnecté')
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.log('❌ Erreur socket:', err.message)
      setConnected(false)
    })

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
    }
  }, [])

  return (
    <SocketContext.Provider value={{ connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)