'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { socket } from '@/lib/socket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, CheckCircle, XCircle, Trophy, AlertTriangle, Activity, Wifi, WifiOff } from 'lucide-react'

interface OEE {
  oee: string
  qualite: string
  disponibilite: string
  performance: string
  totalProduit: number
  totalNonConforme: number
}

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string }
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  reference: string
  createdAt: string
}

interface OuvrierStat {
  nom: string
  produit: number
  nonConforme: number
  taux: number
}

interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  time: string
}

export default function Dashboard() {
  const [oee, setOee] = useState<OEE | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [top5, setTop5] = useState<OuvrierStat[]>([])
  const [moins5, setMoins5] = useState<OuvrierStat[]>([])
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now() + Math.random()
    const time = new Date().toLocaleTimeString('fr-FR')
    setNotifications(prev => [{ id, message, type, time }, ...prev].slice(0, 5))
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const calculerStats = (prods: Production[]) => {
    const stats: Record<string, OuvrierStat> = {}
    prods.forEach((p) => {
      if (!p.ouvrier) return
      const nom = `${p.ouvrier.prenom} ${p.ouvrier.nom}`
      if (!stats[nom]) stats[nom] = { nom, produit: 0, nonConforme: 0, taux: 0 }
      stats[nom].produit += p.quantiteProduite
      stats[nom].nonConforme += p.quantiteNonConforme
    })
    Object.values(stats).forEach((s) => {
      s.taux = s.produit > 0 ? ((s.produit - s.nonConforme) / s.produit) * 100 : 0
    })
    const sorted = Object.values(stats).sort((a, b) => b.taux - a.taux)
    setTop5(sorted.slice(0, 5))
    setMoins5([...sorted].sort((a, b) => a.taux - b.taux).slice(0, 5))
  }

  const fetchData = async () => {
    try {
      const [oeeRes, prodRes] = await Promise.all([
        axios.get('/oee'),
        axios.get('/production'),
      ])
      setOee(oeeRes.data)
      setProductions(prodRes.data)
      calculerStats(prodRes.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  useEffect(() => {
    fetchData()

    // Initialiser l'état connecté si le socket est déjà actif au montage
    if (socket.connected) setConnected(true)

    const pollingInterval = setInterval(() => {
      fetchData()
    }, 5000)

    // Références nommées pour un nettoyage précis sans affecter les autres composants
    const onConnect = () => {
      setConnected(true)
      addNotification('Connexion temps réel établie', 'success')
    }

    const onDisconnect = () => {
      setConnected(false)
      addNotification('Connexion temps réel perdue — polling actif', 'info')
    }

    const onNouvelleProduction = (production: Production) => {
      setProductions(prev => {
        const updated = [production, ...prev]
        calculerStats(updated)
        return updated
      })
      const nom = production.ouvrier
        ? `${production.ouvrier.prenom} ${production.ouvrier.nom}`
        : 'Ouvrier'
      addNotification(
        production.quantiteNonConforme > 0
          ? `${nom} — ${production.quantiteNonConforme} pièce(s) NOK`
          : `${nom} — ${production.quantiteProduite} pièce(s) conformes`,
        production.quantiteNonConforme > 0 ? 'error' : 'success'
      )
    }

    const onOeeUpdate = (data: OEE) => {
      setOee(data)
    }

    const onPresenceOuvrier = (ouvrier: { prenom: string; nom: string }) => {
      addNotification(`${ouvrier.prenom} ${ouvrier.nom} a scanné son badge`, 'info')
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('nouvelle_production', onNouvelleProduction)
    socket.on('oee_update', onOeeUpdate)
    socket.on('presence_ouvrier', onPresenceOuvrier)

    return () => {
      clearInterval(pollingInterval)
      // Supprimer uniquement nos propres listeners
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('nouvelle_production', onNouvelleProduction)
      socket.off('oee_update', onOeeUpdate)
      socket.off('presence_ouvrier', onPresenceOuvrier)
    }
  }, [])

  const dataProduction = productions.slice(0, 7).map((p) => ({
    nom: p.ouvrier ? `${p.ouvrier.prenom[0]}.${p.ouvrier.nom}` : '?',
    produit: p.quantiteProduite,
    conforme: p.quantiteConforme,
  }))

  return (
    <div className="flex flex-col gap-6">

      {/* Notifications temps réel */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm animate-in slide-in-from-right-5 ${
              n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
              n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium">{n.message}</p>
              <p className="text-xs opacity-60 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Tableau de bord</h2>
          <p className="text-sm text-zinc-500">Vue d&apos;ensemble de la production</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            connected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {connected ? <Wifi size={15} /> : <WifiOff size={15} />}
            {connected ? 'Temps réel actif' : 'Hors ligne'}
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 text-zinc-600 px-4 py-2 rounded-full text-sm font-medium">
            <Activity size={15} />
            Système actif
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">OEE Global</p>
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700">{oee?.oee ?? '—'}</p>
            <p className="text-xs text-blue-400 mt-1">Efficacité globale</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total produit</p>
              <div className="w-9 h-9 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-zinc-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-800">{oee?.totalProduit ?? '—'}</p>
            <p className="text-xs text-zinc-400 mt-1">Unités fabriquées</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Qualité</p>
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{oee?.qualite ?? '—'}</p>
            <p className="text-xs text-emerald-400 mt-1">Taux de conformité</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Non conformes</p>
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle size={18} className="text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{oee?.totalNonConforme ?? '—'}</p>
            <p className="text-xs text-red-400 mt-1">Unités rejetées</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <CardTitle className="text-base">Productions récentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {dataProduction.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="produit" fill="#3b82f6" name="Total produit" radius={4} />
                <Bar dataKey="conforme" fill="#22c55e" name="Conformes" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* TOP 5 et moins performants */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              <CardTitle className="text-base">Top 5 — Les plus performants</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {top5.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-4">Aucune donnée</p>
            ) : (
              <div className="flex flex-col gap-3">
                {top5.map((o, i) => (
                  <div key={`top-${o.nom}`} className="flex justify-between items-center p-2 rounded-xl hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-400' : 'text-zinc-300'}`}>
                        #{i + 1}
                      </span>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">
                          {o.nom.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{o.nom}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {o.taux.toFixed(1)}%
                      </Badge>
                      <p className="text-xs text-zinc-400 mt-1">{o.produit} prod.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              <CardTitle className="text-base">Les moins performants</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {moins5.length === 0 ? (
              <p className="text-zinc-400 text-sm text-center py-4">Aucune donnée</p>
            ) : (
              <div className="flex flex-col gap-3">
                {moins5.map((o) => (
                  <div key={`moins-${o.nom}`} className="flex justify-between items-center p-2 rounded-xl hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">
                          {o.nom.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{o.nom}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
                        {o.taux.toFixed(1)}%
                      </Badge>
                      <p className="text-xs text-zinc-400 mt-1">{o.nonConforme} NOK</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dernières productions */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Dernières productions</CardTitle>
            {connected && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 ml-auto">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Direct</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {productions.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-2 font-medium">Ouvrier</th>
                  <th className="text-left py-2 font-medium">Référence</th>
                  <th className="text-left py-2 font-medium">Total</th>
                  <th className="text-left py-2 font-medium">Conformes</th>
                  <th className="text-left py-2 font-medium">Non conformes</th>
                  <th className="text-left py-2 font-medium">Heure</th>
                </tr>
              </thead>
              <tbody>
                {productions.slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-b hover:bg-zinc-50 transition-colors">
                    <td className="py-3 font-medium">{p.ouvrier?.prenom} {p.ouvrier?.nom}</td>
                    <td className="py-3">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 font-normal">
                        {p.reference}
                      </Badge>
                    </td>
                    <td className="py-3 font-bold">{p.quantiteProduite}</td>
                    <td className="py-3">
                      <span className="text-emerald-600 font-bold">{p.quantiteConforme}</span>
                    </td>
                    <td className="py-3">
                      <span className={p.quantiteNonConforme > 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}>
                        {p.quantiteNonConforme}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400 text-xs">
                      {new Date(p.createdAt).toLocaleTimeString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

    </div>
  )
}