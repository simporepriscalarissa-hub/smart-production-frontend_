'use client'

import { useState, useEffect } from 'react'
import SidebarContent from '@/components/sidebare-content'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Clock, Bell, Menu, X } from 'lucide-react'
import { SocketProvider } from '@/lib/socket-provider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [heure, setHeure] = useState('')
  const [date, setDate] = useState('')
  const [user, setUser] = useState<{ nom: string; prenom: string; role: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const majHeure = () => {
      const maintenant = new Date()
      setHeure(format(maintenant, 'HH:mm:ss'))
      setDate(format(maintenant, 'd MMMM yyyy', { locale: fr }))
    }
    majHeure()
    const interval = setInterval(majHeure, 1000)

    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      const parsedUser = JSON.parse(userData)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsedUser)
      if (parsedUser.role === 'operateur') {
        window.location.href = '/operateur'
        return
      }
    }

    return () => clearInterval(interval)
  }, [])

  return (
    <SocketProvider>
      <div className="flex h-screen bg-zinc-50">

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixe sur desktop, drawer sur mobile */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 border-r bg-white shadow-sm flex-shrink-0
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className="bg-white border-b px-4 md:px-6 py-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              {/* Bouton hamburger mobile */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-zinc-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} className="text-zinc-600" />
              </button>
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2 text-zinc-600 text-sm">
                  <Calendar size={15} className="text-blue-500" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 text-sm">
                  <Clock size={15} className="text-blue-500" />
                  <span className="font-mono">{heure}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="relative p-2 rounded-full hover:bg-zinc-100">
                <Bell size={18} className="text-zinc-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <div className="flex items-center gap-2 border border-zinc-100 rounded-lg px-2 md:px-3 py-1.5">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user ? user.prenom[0] + user.nom[0] : 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-zinc-700">
                    {user ? `${user.prenom} ${user.nom}` : 'Admin'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {user?.role ?? 'Administrateur'}
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SocketProvider>
  )
}