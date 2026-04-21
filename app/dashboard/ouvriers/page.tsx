'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Trash2, Users, CreditCard, Building2, AlertTriangle, X } from 'lucide-react'

interface Ouvrier {
  id: number
  nom: string
  prenom: string
  telephone: string
  rfid: string
  departement: string
  dernierePresence?: string
}

interface User {
  id: number
  nom: string
  prenom: string
  role: string
  departement?: string
}

function ConfirmModal({ nom, onConfirm, onCancel }: { nom: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-zinc-800">Supprimer l&apos;ouvrier</h3>
          <button onClick={onCancel} className="ml-auto text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-zinc-600 mb-2">Voulez vous vraiment supprimer :</p>
        <p className="text-sm font-bold text-zinc-800 bg-zinc-50 px-4 py-2 rounded-xl mb-5">{nom}</p>
        <p className="text-xs text-red-500 mb-5">⚠️ Cette action est irréversible. Toutes les données de production liées seront perdues.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
            Supprimer
          </button>
          <button onClick={onCancel} className="flex-1 bg-zinc-100 text-zinc-600 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

const estActifAujourdhui = (o: Ouvrier): boolean => {
  if (!o.dernierePresence) return false
  const aujourdhui = new Date()
  const presence = new Date(o.dernierePresence)
  return (
    presence.getDate() === aujourdhui.getDate() &&
    presence.getMonth() === aujourdhui.getMonth() &&
    presence.getFullYear() === aujourdhui.getFullYear()
  )
}

export default function Ouvriers() {
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [confirmOuvrier, setConfirmOuvrier] = useState<Ouvrier | null>(null)
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', rfid: '', departement: '' })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      const parsed: User = JSON.parse(userData)
      setUser(parsed)
      // eslint-disable-next-line react-hooks/immutability
      fetchOuvriers(parsed)
    }
  }, [])

  const fetchOuvriers = async (currentUser: User) => {
    try {
      let url = '/ouvriers'
      if (currentUser.role === 'superviseur' && currentUser.departement) {
        url += `?departement=${currentUser.departement}`
      }
      const res = await axios.get(url)
      setOuvriers(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const ajouterOuvrier = async () => {
    try {
      await axios.post('/ouvriers', form)
      setMessage('Ouvrier ajouté avec succès !')
      setForm({ nom: '', prenom: '', telephone: '', rfid: '', departement: '' })
      setShowForm(false)
      if (user) fetchOuvriers(user)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const confirmerSuppression = async () => {
    if (!confirmOuvrier) return
    try {
      await axios.delete(`/ouvriers/${confirmOuvrier.id}`)
      setOuvriers(ouvriers.filter(o => o.id !== confirmOuvrier.id))
      setConfirmOuvrier(null)
    } catch (err) {
      console.log('Erreur:', err)
      setConfirmOuvrier(null)
    }
  }

  const deptColors: Record<string, string> = {
    'Coupe': 'bg-blue-100 text-blue-700',
    'Couture': 'bg-purple-100 text-purple-700',
    'Lavage': 'bg-cyan-100 text-cyan-700',
    'Finition': 'bg-orange-100 text-orange-700',
    'Contrôle Qualité': 'bg-emerald-100 text-emerald-700',
    'Emballage': 'bg-pink-100 text-pink-700',
  }

  const titreHeader = user?.role === 'superviseur' ? 'Liste des Ouvriers' : 'Gestion des Ouvriers'
  const nbActifs = ouvriers.filter(o => estActifAujourdhui(o)).length

  return (
    <div className="flex flex-col gap-6">

      {/* Popup confirmation */}
      {confirmOuvrier && (
        <ConfirmModal
          nom={`${confirmOuvrier.prenom} ${confirmOuvrier.nom}`}
          onConfirm={confirmerSuppression}
          onCancel={() => setConfirmOuvrier(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">{titreHeader}</h2>
          <p className="text-sm text-zinc-500 flex items-center gap-1.5">
            <Building2 size={14} />
            {user?.role === 'superviseur' ? `Département : ${user.departement}` : 'Tous les départements'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Ajouter un ouvrier
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total ouvriers</p>
                <p className="text-3xl font-bold text-zinc-800 mt-1">{ouvriers.length}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Actifs aujourd&apos;hui</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{nbActifs}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Badges RFID</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{ouvriers.filter(o => o.rfid).length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard size={20} className="text-blue-600" />
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

      {/* Formulaire — admin seulement */}
      {showForm && user?.role === 'admin' && (
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" />
              <CardTitle className="text-base">Nouvel ouvrier</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nom', key: 'nom', placeholder: 'Nom de famille' },
                { label: 'Prénom', key: 'prenom', placeholder: 'Prénom' },
                { label: 'Téléphone', key: 'telephone', placeholder: '2X XXX XXX' },
                { label: 'Badge RFID', key: 'rfid', placeholder: 'RF001' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm text-zinc-600 mb-1.5 block font-medium">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Département</label>
                <select
                  value={form.departement}
                  onChange={(e) => setForm({ ...form, departement: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un département</option>
                  {['Coupe', 'Couture', 'Lavage', 'Finition', 'Contrôle Qualité', 'Emballage'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={ajouterOuvrier} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 font-medium">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-zinc-600" />
            <CardTitle className="text-base">{titreHeader} ({ouvriers.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-400">
                <th className="text-left py-3 font-medium">Ouvrier</th>
                <th className="text-left py-3 font-medium">Département</th>
                <th className="text-left py-3 font-medium">Téléphone</th>
                <th className="text-left py-3 font-medium">Badge RFID</th>
                <th className="text-left py-3 font-medium">Statut</th>
                {user?.role === 'admin' && <th className="text-left py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {ouvriers.map((o) => (
                <tr key={o.id} className="border-b hover:bg-zinc-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center">
                        <span className="text-zinc-600 font-bold text-xs">{o.prenom[0]}{o.nom[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{o.prenom} {o.nom}</p>
                        {o.dernierePresence && (
                          <p className="text-xs text-zinc-400">
                            Dernière présence : {new Date(o.dernierePresence).toLocaleTimeString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge className={`${deptColors[o.departement] ?? 'bg-zinc-100 text-zinc-600'} hover:opacity-90`}>
                      {o.departement ?? '—'}
                    </Badge>
                  </td>
                  <td className="py-3 text-zinc-500">{o.telephone}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={13} className="text-zinc-400" />
                      <span className="bg-zinc-50 text-zinc-600 px-2 py-1 rounded-lg text-xs border border-zinc-200">{o.rfid}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge className={estActifAujourdhui(o) ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-100'}>
                      {estActifAujourdhui(o) ? '🟢 Actif' : '⚫ Inactif'}
                    </Badge>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="py-3">
                      <button
                        onClick={() => setConfirmOuvrier(o)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                        Supprimer
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}