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
  nombreOuvriers: number // Ce champ viendra maintenant du calcul backend
}

interface Superviseur {
  id: number
  nom: string
  prenom: string
  email: string
}

// ... (garde tes deptConfig et defaultConfig identiques)

export default function Departements() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [superviseurs, setSuperviseurs] = useState<Superviseur[]>([]) // État pour les responsables
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ nom: '', responsable: '' }) // Retiré nombreOuvriers ici

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
      // Assure-toi que cet endpoint existe dans ton backend NestJS
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
        // On n'envoie plus nombreOuvriers car il est initialisé à 0 par défaut en base
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

  // ... (supprimerDepartement reste identique)

  const totalOuvriers = departements.reduce((acc, d) => acc + (d.nombreOuvriers || 0), 0)

  return (
    <div className="flex flex-col gap-6">
      {/* ... (Header et Stats restent identiques) */}

      {/* Formulaire Mis à jour */}
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
                <select
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Sélectionner un type</option>
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
                  <option value="">Choisir un superviseur</option>
                  {superviseurs.map((s) => (
                    <option key={s.id} value={`${s.prenom} ${s.nom}`}>
                      {s.prenom} {s.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mt-4">
               <p className="text-xs text-blue-600 italic">
                💡 Le nombre d'ouvriers sera automatiquement calculé selon les affectations effectuées dans la "Gestion des ouvriers".
               </p>
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

      {/* ... (Cartes départements restent identiques) */}
    </div>
  )
}