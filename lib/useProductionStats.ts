import { useEffect, useState, useCallback } from 'react'
import axios from '@/lib/axios'
import { socket } from '@/lib/socket'

export interface Production {
  id: number
  ouvrier: { prenom: string; nom: string; departement?: string }
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  reference: { id: number; code: string; libelle: string } | null
  createdAt: string
}

export interface ProductionStats {
  oee: number | null
  qualite: number | null
  performance: number | null
  disponibilite: number | null
  totalProduit: number
  totalConforme: number
  totalNonConforme: number
  productions: Production[]
  loading: boolean
}

export function useProductionStats(pollInterval = 10000): ProductionStats {
  const [oeeData, setOeeData] = useState<{
    oee: number; qualite: number; performance: number; disponibilite: number
  } | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [oeeRes, prodRes] = await Promise.all([
        axios.get('/oee'),
        axios.get('/production'),
      ])
      setOeeData(oeeRes.data)
      setProductions(prodRes.data)
    } catch (err) {
      console.log('Erreur fetchAll:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const interval = setInterval(fetchAll, pollInterval)

    const onOeeUpdate = (data: { oee: number; qualite: number; performance: number; disponibilite: number }) => {
      setOeeData(data)
    }

    const onNouvelleProduction = (prod: Production) => {
      setProductions(prev => [prod, ...prev])
      // Refresh OEE so it reflects the new production
      axios.get('/oee').then(r => setOeeData(r.data)).catch(() => {})
    }

    socket.on('oee_update', onOeeUpdate)
    socket.on('nouvelle_production', onNouvelleProduction)

    return () => {
      clearInterval(interval)
      socket.off('oee_update', onOeeUpdate)
      socket.off('nouvelle_production', onNouvelleProduction)
    }
  }, [fetchAll, pollInterval])

  const totalProduit = productions.reduce((s, p) => s + p.quantiteProduite, 0)
  const totalConforme = productions.reduce((s, p) => s + p.quantiteConforme, 0)
  const totalNonConforme = productions.reduce((s, p) => s + p.quantiteNonConforme, 0)

  return {
    oee: oeeData?.oee ?? null,
    qualite: oeeData?.qualite ?? null,
    performance: oeeData?.performance ?? null,
    disponibilite: oeeData?.disponibilite ?? null,
    totalProduit,
    totalConforme,
    totalNonConforme,
    productions,
    loading,
  }
}
