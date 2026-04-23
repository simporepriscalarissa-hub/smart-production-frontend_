'use client'

import { useEffect, useState } from 'react'
import { socket } from '@/lib/socket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Activity, AlertTriangle, Wifi, WifiOff, Brain, TrendingUp } from 'lucide-react'
import { APP_CONFIG } from '@/lib/config'

interface AnalyseIA {
  id: number
  conforme: boolean
  nb_defauts: number
  confiance: number
  classe: string
  ouvrier: string
  departement: string
  heure: string
}

export default function DetectionIA() {
  const [analyses, setAnalyses] = useState<AnalyseIA[]>([])
  const [connected, setConnected] = useState(false)
  const [dernierResultat, setDernierResultat] = useState<AnalyseIA | null>(null)
  const [alertes, setAlertes] = useState<{ message: string; heure: string }[]>([])

  const IA_URL = APP_CONFIG.iaUrl
  const totalAnalyses = analyses.length
  const totalConformes = analyses.filter(a => a.conforme).length
  const totalDefauts = analyses.filter(a => !a.conforme).length
  const tauxQualite = totalAnalyses > 0 ? ((totalConformes / totalAnalyses) * 100).toFixed(1) : '0'

 useEffect(() => {
    // Initialiser l'état connecté si le socket est déjà actif au montage
    if (socket.connected) setConnected(true)

    // Références nommées pour un nettoyage précis
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    const onAlerteDefaut = (data: {
      id?: number
      scoreConfiance?: number
      typeDefaut?: string
      ouvrier?: { prenom: string; nom: string; departement?: string }
    }) => {
      console.log("Alerte reçue du backend:", data);
      
      const analyse = {
        id: data.id || Date.now(),
        conforme: false,
        nb_defauts: 1, 
        confiance: data.scoreConfiance ? Math.round(data.scoreConfiance * 100) : 0,
        classe: data.typeDefaut || 'Défaut',
        ouvrier: data.ouvrier ? `${data.ouvrier.prenom} ${data.ouvrier.nom}` : 'Système IA',
        departement: data.ouvrier?.departement || 'Production',
        heure: new Date().toLocaleTimeString('fr-FR'),
      }
      
      setAnalyses(prev => [analyse, ...prev].slice(0, 50))
      setDernierResultat(analyse)
      setAlertes(prev => [{
        message: `Défaut détecté : ${analyse.classe}`,
        heure: analyse.heure
      }, ...prev].slice(0, 5))
    }

    const onNouvelleProduction = (data: {
      id?: number
      statutIA?: string
      scoreConfiance?: number
      ouvrier?: { prenom: string; nom: string; departement?: string }
    }) => {
      if (data.statutIA === 'conforme') {
        const analyse = {
          id: data.id || Date.now(),
          conforme: true,
          nb_defauts: 0,
          confiance: data.scoreConfiance ? Math.round(data.scoreConfiance * 100) : 100,
          classe: 'Conforme',
          ouvrier: data.ouvrier ? `${data.ouvrier.prenom} ${data.ouvrier.nom}` : 'Système IA',
          departement: data.ouvrier?.departement || 'Production',
          heure: new Date().toLocaleTimeString('fr-FR'),
        }
        setAnalyses(prev => [analyse, ...prev].slice(0, 50))
        setDernierResultat(analyse)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('alerte_defaut', onAlerteDefaut)
    socket.on('nouvelle_production', onNouvelleProduction)

    return () => {
      // Supprimer uniquement nos propres listeners
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('alerte_defaut', onAlerteDefaut)
      socket.off('nouvelle_production', onNouvelleProduction)
    }
  }, [])
  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Monitoring IA</h2>
          <p className="text-sm text-zinc-500">Surveillance automatique des défauts de production</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${connected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {connected ? <Wifi size={15} /> : <WifiOff size={15} />}
            {connected ? 'Temps réel actif' : 'Hors ligne'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Analyses</p>
              <div className="w-9 h-9 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Activity size={18} className="text-zinc-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-800">{totalAnalyses}</p>
            <p className="text-xs text-zinc-400 mt-1">Total analysées</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Conformes</p>
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{totalConformes}</p>
            <p className="text-xs text-emerald-400 mt-1">Pièces validées</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Défauts</p>
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle size={18} className="text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600">{totalDefauts}</p>
            <p className="text-xs text-red-400 mt-1">Pièces rejetées</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Taux qualité</p>
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700">{tauxQualite}%</p>
            <p className="text-xs text-blue-400 mt-1">Taux de conformité</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Liste des détections IA (Pleine largeur) */}
        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-4 border-b border-zinc-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <CardTitle className="text-base">Flux des détections en temps réel</CardTitle>
              </div>
              {connected && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Direct</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {analyses.length === 0 ? (
              <div className="py-24 text-center">
                <Activity size={48} className="text-zinc-100 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm italic">Système de surveillance actif — En attente de données</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 border-b border-zinc-100">
                      <th className="text-left py-3 px-6 font-semibold uppercase tracking-wider text-[10px]">Ouvrier</th>
                      <th className="text-left py-3 px-6 font-semibold uppercase tracking-wider text-[10px]">Statut</th>
                      <th className="text-left py-3 px-6 font-semibold uppercase tracking-wider text-[10px]">Type de Défaut</th>
                      <th className="text-left py-3 px-6 font-semibold uppercase tracking-wider text-[10px]">Confiance</th>
                      <th className="text-right py-3 px-6 font-semibold uppercase tracking-wider text-[10px]">Heure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {analyses.map((a) => (
                      <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                              {a.ouvrier.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-zinc-700">{a.ouvrier}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.conforme ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {a.conforme ? 'Conforme' : 'Défaut'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          {a.conforme ? (
                            <span className="text-zinc-300 text-xs italic">Aucun défaut</span>
                          ) : (
                            <span className="text-red-600 font-bold">{a.classe}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${a.confiance}%` }} />
                            </div>
                            <span className="text-zinc-500 text-[10px] font-mono">{a.confiance}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-zinc-400 font-mono text-[10px]">
                          {a.heure}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}