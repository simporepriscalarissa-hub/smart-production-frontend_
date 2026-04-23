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
          <p className="text-sm text-zinc-500">Surveillance automatique des défauts par YOLOv11</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${connected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {connected ? <Wifi size={15} /> : <WifiOff size={15} />}
            {connected ? 'Temps réel actif' : 'Hors ligne'}
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">YOLOv11</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colonne Analyse Principale (Prend 2/3 de l'espace) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card className={`shadow-sm border-2 ${!dernierResultat ? 'border-zinc-100' : dernierResultat.conforme ? 'border-emerald-200' : 'border-red-200'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-purple-600" />
                <CardTitle className="text-base">Analyse YOLOv11 en temps réel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {!dernierResultat ? (
                <div className="py-20 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-25" />
                    <div className="relative bg-purple-50 w-24 h-24 rounded-full flex items-center justify-center">
                      <Brain size={48} className="text-purple-200" />
                    </div>
                  </div>
                  <p className="text-zinc-500 font-medium">En attente d'une détection caméra...</p>
                  <p className="text-xs text-zinc-400 mt-1">Le système est prêt à analyser les pièces</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className={`text-center py-10 rounded-2xl ${dernierResultat.conforme ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm">
                      <span className="text-4xl">{dernierResultat.conforme ? '✅' : '❌'}</span>
                    </div>
                    <p className={`text-3xl font-black ${dernierResultat.conforme ? 'text-emerald-700' : 'text-red-700'}`}>
                      {dernierResultat.conforme ? 'PIÈCE CONFORME' : 'PIÈCE DÉFECTUEUSE'}
                    </p>
                    {!dernierResultat.conforme && (
                      <Badge className="bg-red-600 text-white mt-2 px-4 py-1 text-sm">
                        {dernierResultat.classe} détecté
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Ouvrier</p>
                      <p className="text-sm font-bold text-zinc-800 truncate">{dernierResultat.ouvrier}</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Département</p>
                      <p className="text-sm font-bold text-zinc-800">{dernierResultat.departement}</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Confiance IA</p>
                      <p className="text-sm font-bold text-blue-600">{dernierResultat.confiance}%</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Heure</p>
                      <p className="text-sm font-bold text-zinc-800">{dernierResultat.heure}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne Statistiques Secondaires (1/3) */}
        <div className="flex flex-col gap-4">
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <CardTitle className="text-base">Score de Qualité</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-500" 
                      strokeDasharray={364} strokeDashoffset={364 - (364 * Number(tauxQualite)) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-2xl font-black text-zinc-800">{tauxQualite}%</span>
                </div>
                <p className="text-xs text-zinc-400 mt-4 text-center">Taux de réussite global des analyses IA</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        <Card className="shadow-sm border border-zinc-100 mt-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-zinc-600" />
              <CardTitle className="text-base">Historique des analyses</CardTitle>
              {connected && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 ml-auto text-xs">
                  🔴 Live
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="py-16 text-center">
                <Brain size={48} className="text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">En attente des résultats IA...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {analyses.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between p-3 rounded-xl border ${a.conforme ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{a.conforme ? '✅' : '❌'}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-800">
                          {a.conforme ? 'Conforme' : `${a.nb_defauts} défaut(s)`}
                        </p>
                        <p className="text-xs text-zinc-400">{a.ouvrier} — {a.departement}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${a.conforme ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}`}>
                        {a.confiance}%
                      </Badge>
                      <p className="text-xs text-zinc-400 mt-1">{a.heure}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}