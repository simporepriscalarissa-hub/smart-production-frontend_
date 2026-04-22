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
    // Utiliser des références nommées pour pouvoir les supprimer précisément
    // sans affecter d'autres listeners enregistrés ailleurs
    const onConnect = () => {
      console.log('✅ Socket connecté:', socket.id)
      setConnected(true)
    }

    const onDisconnect = () => {
      console.log('❌ Socket déconnecté')
      setConnected(false)
    }

    const onConnectError = (err: Error) => {
      console.error('❌ Erreur socket:', err.message)
      setConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    // Connecter uniquement si ce n'est pas déjà fait
    if (!socket.connected) {
      socket.connect()
    } else {
      // Si déjà connecté (ex: après un soft navigation), mettre à jour l'état
      setConnected(true)
    }

    return () => {
      // Nettoyer uniquement nos propres listeners, pas ceux des autres composants
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)