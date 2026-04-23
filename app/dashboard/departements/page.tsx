'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Building2, Users, UserCheck, LayoutGrid } from 'lucide-react'

interface Departement {
  id: number
  nom: string
  responsable: string
  nombreOuvriers: number
}

interface Superviseur {
  id: number
  nom: string
  prenom: string
  email: string
}

const deptConfig: Record<string, { color: string; bg: string }> = {
  'Fonderie': { color: 'text-orange-600', bg: 'bg-orange-50' },
  'Usinage': { color: 'text-blue-600', bg: 'bg-blue-50' },
  'Peinture': { color: 'text-purple-600', bg: 'bg-purple-50' },
  'Assemblage': { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Logistique': { color: 'text-zinc-600', bg: 'bg-zinc-50' },
  'Qualité': { color: 'text-red-600', bg: 'bg-red-50' },
}

export default function Departements() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [superviseurs, setSuperviseurs] = useState<Superviseur[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ nom: '', responsable: '' })

  useEffect(() => {
    fetchDepts()
    fetchSuperviseurs()
  }, [])

  const fetchDepts = async () => {
    try {
      const res = await axios.get('/departements')
      setDepartements(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const fetchSuperviseurs = async () => {
    try {
      const res = await axios.get('/utilisateurs/role/superviseur')
      setSuperviseurs(res.data)
    } catch (err) {
      console.log('Erreur superviseurs:', err)
    }
  }

  const ajouterDepartement = async () => {
    if (!form.nom || !form.responsable) {
        alert("Veuillez remplir tous les champs");
        return;
    }
    try {
      await axios.post('/departements', {
        nom: form.nom,
        responsable: form.responsable,
      })
      setMessage('Département ajouté avec succès !')
      setForm({ nom: '', responsable: '' })
      setShowForm(false)
      fetchDepts()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const supprimerDepartement = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce département ?')) return
    try {
      await axios.delete(`/departements/${id}`)
      fetchDepts()
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const totalOuvriers = departements.reduce((acc, d) => acc + (d.nombreOuvriers || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Gestion des Départements</h2>
          <p className="text-sm text-zinc-500">Organisez vos unités de production et responsables</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus size={18} />
          Nouveau département
        </button>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 text-sm animate-in fade-in">
          {message}
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Départements</p>
              <Building2 size={18} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-700">{departements.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Effectif</p>
              <Users size={18} className="text-zinc-400" />
            </div>
            <p className="text-3xl font-bold text-zinc-700">{totalOuvriers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <Card className="border border-blue-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-50">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <CardTitle className="text-base">Ajouter une unité de production</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Type de département</label>
                <select
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Sélectionner un type...</option>
                  {Object.keys(deptConfig).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Responsable (Superviseur)</label>
                <select
                  value={form.responsable}
                  onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Choisir un superviseur...</option>
                  {superviseurs.map((s) => (
                    <option key={s.id} value={`${s.prenom} ${s.nom}`}>
                      {s.prenom} {s.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={ajouterDepartement} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 font-bold transition-all">
                Enregistrer le département
              </button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium transition-all">
                Annuler
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des départements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departements.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
            <LayoutGrid size={48} className="text-zinc-100 mx-auto mb-4" />
            <p className="text-zinc-400 font-medium italic">Aucun département configuré pour le moment</p>
          </div>
        ) : (
          departements.map((dept) => {
            const config = deptConfig[dept.nom] || { color: 'text-zinc-600', bg: 'bg-zinc-50' }
            return (
              <Card key={dept.id} className="shadow-sm border-zinc-100 hover:border-blue-200 transition-all group overflow-hidden">
                <CardHeader className={`${config.bg} pb-4 border-b border-zinc-100/50`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Building2 size={20} className={config.color} />
                      <CardTitle className="text-lg font-bold text-zinc-800">{dept.nom}</CardTitle>
                    </div>
                    <button 
                      onClick={() => supprimerDepartement(dept.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <UserCheck size={16} />
                        <span className="text-xs">Responsable</span>
                      </div>
                      <span className="text-sm font-semibold text-zinc-700">{dept.responsable}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Users size={16} />
                        <span className="text-xs">Effectif</span>
                      </div>
                      <Badge className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 font-bold px-3">
                        {dept.nombreOuvriers || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

    </div>
  )
}