'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { APP_CONFIG } from "@/lib/config"
import { useEffect, useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard, Factory, Users, UserCog,
  Building2, BarChart3, Tv, Settings, LogOut, Eye,
  Scan,
  Brain,
} from "lucide-react"
 
const menuAdmin = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Historique des productions", href: "/dashboard/production", icon: Factory },
  { label: "Gestion des ouvriers", href: "/dashboard/ouvriers", icon: Users },
  { label: "Gestion des utilisateurs", href: "/dashboard/users", icon: UserCog },
  { label: "Départements", href: "/dashboard/departements", icon: Building2 },
  { label: "Rapports", href: "/dashboard/rapports", icon: BarChart3 },
  { label: "Écran TV", href: "/dashboard/ecran-tv", icon: Tv },
  { label: "Paramètres", href: "/dashboard/parametres", icon: Settings },
  { label: "Détection IA", href: "/dashboard/detection-ia", icon: Scan },
]

const menuSuperviseur = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Entrée en production", href: "/dashboard/production", icon: Factory },
  { label: "Liste des ouvriers", href: "/dashboard/ouvriers", icon: Eye },
  { label: "Rapports", href: "/dashboard/rapports", icon: BarChart3 },
]

interface UserData {
  nom: string
  prenom: string
  role: string
  departement?: string
}

export default function SidebarContent() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(userData))
    }
    setMounted(true)
  }, [])

  if (!mounted) return null

  const menuItems = user?.role === 'admin' ? menuAdmin : menuSuperviseur

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    window.location.href = '/login'
  }

  const roleLabel = user?.role === 'admin' ? ' Administrateur' : ' Superviseur'
  const roleBg = user?.role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-3 border-b p-4 h-16">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="rounded-lg"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <span className="text-sm font-bold text-blue-800">{APP_CONFIG.entreprise}</span>
      </div>

      <ScrollArea className="flex-1 p-4">

        {/* Role badge */}
        <div className={`text-xs font-medium px-3 py-1.5 rounded-lg mb-4 ${roleBg}`}>
          {roleLabel}
          {user?.role === 'superviseur' && user.departement && (
            <span className="block text-xs opacity-70 mt-0.5">{user.departement}</span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider px-1">Menu</p>
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

      </ScrollArea>

      {/* Footer utilisateur */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            user?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-700">{user?.prenom} {user?.nom}</p>
            <p className="text-xs text-zinc-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>

    </div>
  )
}