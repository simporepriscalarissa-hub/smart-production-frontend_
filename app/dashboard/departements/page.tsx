'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Building2, Users, UserCheck } from 'lucide-react'

interface Departement {
  id: number
  nom: string
  responsable: string
  nombreOuvriers: number
}

const deptConfig: Record<string, { bg: string; icon: string; badge: string }> = {
  'Coupe':             { bg: 'bg-blue-50 border-blue-100',     icon: 'bg-blue-100 text-blue-600',    badge: 'bg-blue-100 text-blue-700' },
  'Couture':           { bg: 'bg-purple-50 border-purple-100', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  'Lavage':            { bg: 'bg-cyan-50 border-cyan-100',     icon: 'bg-cyan-100 text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700' },
  'Finition':          { bg: 'bg-orange-50 border-orange-100', icon: 'bg-orange-100 text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  'Contrôle Qualité':  { bg: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  'Emballage':         { bg: 'bg-pink-50 border-pink-100',     icon: 'bg-pink-100 text-pink-600',    badge: 'bg-pink-100 text-pink-700' },
}

const defaultConfig = { bg: 'bg-zinc-50 border-zinc-100', icon: 'bg-zinc-100 text-zinc-600', badge: 'bg-zinc-100 text-zinc-700' }

export default function Departements() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ nom: '', responsable: '', nombreOuvriers: '' })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchDepts()
  }, [])

  const fetchDepts = async () => {
    try {
      const res = await axios.get('/departements')
      setDepartements(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const ajouterDepartement = async () => {
    try {
      await axios.post('/departements', {
        nom: form.nom,
        responsable: form.responsable,
        nombreOuvriers: parseInt(form.nombreOuvriers),
      })
      setMessage('Département ajouté avec succès !')
      setForm({ nom: '', responsable: '', nombreOuvriers: '' })
      setShowForm(false)
      fetchDepts()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const supprimerDepartement = async (id: number) => {
    if (confirm('Supprimer ce département ?')) {
      try {
        await axios.delete(`/departements/${id}`)
        setDepartements(departements.filter(d => d.id !== id))
      } catch (err) {
        console.log('Erreur:', err)
      }
    }
  }

  const totalOuvriers = departements.reduce((acc, d) => acc + d.nombreOuvriers, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Départements</h2>
          <p className="text-sm text-zinc-500">Gestion des départements de production</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Ajouter un département
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total départements</p>
                <p className="text-3xl font-bold text-zinc-800 mt-1">{departements.length}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Building2 size={20} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Total ouvriers</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{totalOuvriers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Départements actifs</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{departements.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <UserCheck size={20} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-sm flex items-center gap-2">
          <span>✅</span> {message}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <CardTitle className="text-base">Nouveau département</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Nom du département</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="ex: Coupe"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Responsable</label>
                <input
                  type="text"
                  value={form.responsable}
                  onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  placeholder="Nom du responsable"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Nombre d&apos;ouvriers</label>
                <input
                  type="number"
                  value={form.nombreOuvriers}
                  onChange={(e) => setForm({ ...form, nombreOuvriers: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={ajouterDepartement} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 font-medium transition-colors">
                Enregistrer
              </button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium transition-colors">
                Annuler
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cartes départements */}
      {departements.length === 0 ? (
        <p className="text-zinc-400 text-sm text-center py-8">Aucun département enregistré</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {departements.map((d) => {
            const config = deptConfig[d.nom] ?? defaultConfig
            return (
              <Card key={d.id} className={`border shadow-sm ${config.bg} transition-all hover:shadow-md`}>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.icon}`}>
                        <Building2 size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-800 text-base">{d.nom}</p>
                        <Badge className={`${config.badge} hover:opacity-90 mt-1`}>
                          Actif
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => supprimerDepartement(d.id)}
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                      Supprimer
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <UserCheck size={14} className="text-zinc-400" />
                      <span>Responsable :</span>
                      <span className="font-medium text-zinc-800">{d.responsable}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Users size={14} className="text-zinc-400" />
                      <span>Ouvriers :</span>
                      <span className="font-medium text-zinc-800">{d.nombreOuvriers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

    </div>
  )
}