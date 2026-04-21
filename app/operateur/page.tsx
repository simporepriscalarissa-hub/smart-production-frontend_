'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle, XCircle, TrendingUp, LogOut, Clock } from 'lucide-react'

interface Production {
  id: number
  reference: string
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  createdAt: string
}

interface User {
  id: number
  nom: string
  prenom: string
  role: string
  rfid: string
}

export default function Operateur() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [heure, setHeure] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!userData || !token || userData === 'undefined') {
      router.push('/rfid-login')
      return
    }
    try {
      const parsed: User = JSON.parse(userData)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsed)
      axios.get(`/production?ouvrierId=${parsed.id}`)
        .then((res) => setProductions(res.data))
        .catch((err) => console.log('Erreur:', err))
    } catch {
      router.push('/rfid-login')
    }

    const interval = setInterval(() => {
      setHeure(new Date().toLocaleTimeString('fr-FR'))
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/rfid-login')
  }

  const totalProduit = productions.reduce((acc, p) => acc + p.quantiteProduite, 0)
  const totalConforme = productions.reduce((acc, p) => acc + p.quantiteConforme, 0)
  const totalNonConforme = productions.reduce((acc, p) => acc + p.quantiteNonConforme, 0)
  const tauxQualite = totalProduit > 0 ? ((totalConforme / totalProduit) * 100).toFixed(1) : '0'

  if (!user) return (
    <div className="flex items-center justify-center h-screen bg-zinc-50">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">{user.prenom[0]}{user.nom[0]}</span>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Opérateur</p>
                <p className="font-bold text-zinc-800 text-lg">{user.prenom} {user.nom}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                 {(() => {
        const heure = new Date().getHours()
        const actif = heure >= 8 && heure < 17
        return (
        <Badge className={actif
            ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-500"
            }>
            {actif ? '🟢 Actif' : '⚫ Inactif'}
        </Badge>
  )
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-zinc-400 justify-end">
                  <Clock size={13} />
                  <p className="text-xs">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <p className="text-2xl font-mono font-bold text-blue-600">{heure}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 text-sm border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-zinc-800">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-400 uppercase tracking-wide font-semibold">Total produit</p>
                <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <Package size={15} className="text-zinc-300" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{totalProduit}</p>
              <p className="text-xs text-zinc-500 mt-1">unités fabriquées</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-emerald-600">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-emerald-200 uppercase tracking-wide font-semibold">Conformes</p>
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={15} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{totalConforme}</p>
              <p className="text-xs text-emerald-200 mt-1">unités validées</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-red-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-red-200 uppercase tracking-wide font-semibold">Non conformes</p>
                <div className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center">
                  <XCircle size={15} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{totalNonConforme}</p>
              <p className="text-xs text-red-200 mt-1">unités rejetées</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-blue-600">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-blue-200 uppercase tracking-wide font-semibold">Taux qualité</p>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp size={15} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{tauxQualite}%</p>
              <p className="text-xs text-blue-200 mt-1">taux de conformité</p>
            </CardContent>
          </Card>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <div className="p-5 border-b border-zinc-100 flex items-center gap-2">
            <Package size={18} className="text-zinc-600" />
            <h3 className="font-semibold text-zinc-800">Ma production du jour</h3>
            <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 ml-auto">
              {productions.length} entrées
            </Badge>
          </div>

          {productions.length === 0 ? (
            <div className="py-16 text-center">
              <Package size={40} className="text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Aucune production enregistrée aujourd&apos;hui</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-3 px-5 font-medium">Référence</th>
                  <th className="text-left py-3 font-medium">Total</th>
                  <th className="text-left py-3 font-medium">Conformes</th>
                  <th className="text-left py-3 font-medium">Non conformes</th>
                  <th className="text-left py-3 font-medium">État</th>
                  <th className="text-left py-3 font-medium">Heure</th>
                </tr>
              </thead>
              <tbody>
                {productions.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-5">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 font-normal">
                        {p.reference}
                      </Badge>
                    </td>
                    <td className="py-3 font-bold">{p.quantiteProduite}</td>
                    <td className="py-3 text-emerald-600 font-bold">{p.quantiteConforme}</td>
                    <td className="py-3">
                      <span className={p.quantiteNonConforme > 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}>
                        {p.quantiteNonConforme}
                      </span>
                    </td>
                    <td className="py-3">
                      {p.quantiteNonConforme === 0
                        ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">✅ OK</Badge>
                        : <Badge className="bg-red-100 text-red-700 hover:bg-red-100">❌ NOK</Badge>
                      }
                    </td>
                    <td className="py-3 text-zinc-400 text-xs">
                      {new Date(p.createdAt).toLocaleTimeString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}