'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Trash2, Users, CreditCard, Building2, AlertTriangle, X, Edit3, Save, UserCheck } from 'lucide-react'

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

// Composant Modale de Confirmation
function ConfirmModal({ nom, onConfirm, onCancel }: { nom: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg">Supprimer l'ouvrier</h3>
        </div>
        <p className="text-sm text-zinc-600 mb-2">Voulez vous vraiment supprimer :</p>
        <p className="text-sm font-bold text-zinc-800 bg-zinc-50 px-4 py-2 rounded-xl mb-5 border border-zinc-100">{nom}</p>
        <p className="text-xs text-red-500 mb-6 flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
          <span>⚠️</span> 
          <span>Cette action est irréversible. Toutes les données de production liées seront perdues.</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200">
            Supprimer
          </button>
          <button onClick={onCancel} className="flex-1 bg-zinc-100 text-zinc-600 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant Modale d'Édition
function EditModal({ ouvrier, onSave, onCancel }: { ouvrier: Ouvrier; onSave: (data: Partial<Ouvrier>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({ ...ouvrier })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit3 size={20} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-zinc-800 text-lg">Modifier l'ouvrier</h3>
          </div>
          <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-100 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Département</label>
            <select
              value={formData.departement}
              onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
            >
              {['Fonderie', 'Usinage', 'Peinture', 'Assemblage', 'Logistique', 'Qualité'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">RFID</label>
            <input
              type="text"
              value={formData.rfid}
              onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Téléphone</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={() => onSave(formData)} 
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Enregistrer
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-zinc-100 text-zinc-600 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
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
  const [editOuvrier, setEditOuvrier] = useState<Ouvrier | null>(null)
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', rfid: '', departement: '' })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      const parsed: User = JSON.parse(userData)
      setUser(parsed)
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

  const modifierOuvrier = async (data: Partial<Ouvrier>) => {
    if (!editOuvrier) return
    try {
      await axios.patch(`/ouvriers/${editOuvrier.id}`, data)
      setMessage('Ouvrier mis à jour avec succès !')
      setEditOuvrier(null)
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
      setMessage('Ouvrier supprimé !')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
      setConfirmOuvrier(null)
    }
  }

  const deptColors: Record<string, string> = {
    'Fonderie': 'bg-orange-100 text-orange-700 border-orange-200',
    'Usinage': 'bg-blue-100 text-blue-700 border-blue-200',
    'Peinture': 'bg-purple-100 text-purple-700 border-purple-200',
    'Assemblage': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Logistique': 'bg-zinc-100 text-zinc-700 border-zinc-200',
    'Qualité': 'bg-red-100 text-red-700 border-red-200',
  }

  const titreHeader = user?.role === 'superviseur' ? 'Liste des Ouvriers' : 'Gestion des Ouvriers'
  const nbActifs = ouvriers.filter(o => estActifAujourdhui(o)).length

  return (
    <div className="flex flex-col gap-6">

      {/* Popups */}
      {confirmOuvrier && (
        <ConfirmModal
          nom={`${confirmOuvrier.prenom} ${confirmOuvrier.nom}`}
          onConfirm={confirmerSuppression}
          onCancel={() => setConfirmOuvrier(null)}
        />
      )}

      {editOuvrier && (
        <EditModal 
          ouvrier={editOuvrier}
          onSave={modifierOuvrier}
          onCancel={() => setEditOuvrier(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">{titreHeader}</h2>
          <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
            <Building2 size={14} className="text-blue-500" />
            {user?.role === 'superviseur' ? `Département : ${user.departement}` : 'Tous les départements de l\'usine'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            <UserPlus size={18} />
            Ajouter un ouvrier
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50 border-b-4 border-zinc-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-black">Total effectif</p>
                <p className="text-4xl font-black text-zinc-800 mt-2">{ouvriers.length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Users size={24} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50 border-b-4 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-widest font-black">Présents aujourd'hui</p>
                <p className="text-4xl font-black text-emerald-700 mt-2">{nbActifs}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <UserCheck size={24} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50 border-b-4 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-widest font-black">Badges rfid actifs</p>
                <p className="text-4xl font-black text-blue-700 mt-2">{ouvriers.filter(o => o.rfid).length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <CreditCard size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message de succès */}
      {message && (
        <div className="bg-emerald-500 text-white p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 shadow-lg shadow-emerald-100">
          <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
            <Save size={14} />
          </div>
          {message}
        </div>
      )}

      {/* Formulaire d'ajout rapide */}
      {showForm && user?.role === 'admin' && (
        <Card className="border-2 border-blue-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-50">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-blue-600" />
              <CardTitle className="text-base font-bold">Nouveau collaborateur</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Nom', key: 'nom', placeholder: 'Nom' },
                { label: 'Prénom', key: 'prenom', placeholder: 'Prénom' },
                { label: 'Téléphone', key: 'telephone', placeholder: 'Numéro' },
                { label: 'Badge RFID', key: 'rfid', placeholder: 'Code RFID' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 block tracking-widest">{label}</label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              ))}
              <div className="col-span-1 md:col-span-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 block tracking-widest">Département</label>
                <select
                  value={form.departement}
                  onChange={(e) => setForm({ ...form, departement: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">Affectation département...</option>
                  {['Fonderie', 'Usinage', 'Peinture', 'Assemblage', 'Logistique', 'Qualité'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 md:col-span-2 flex items-end gap-3">
                <button onClick={ajouterOuvrier} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">
                  Valider la création
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all">
                  Annuler
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau des ouvriers */}
      <Card className="shadow-sm border border-zinc-100 overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-zinc-400 border-b border-zinc-100">
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Ouvrier</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Département</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Contact</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Badge RFID</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Présence</th>
                  {user?.role === 'admin' && <th className="text-right py-4 px-6 font-black uppercase text-[10px] tracking-widest">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {ouvriers.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-xs border border-blue-100 shadow-sm">
                          {o.prenom[0]}{o.nom[0]}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-800">{o.prenom} {o.nom}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">ID: #{o.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={`${deptColors[o.departement] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'} border px-3 py-0.5 rounded-md font-bold text-[10px]`}>
                        {o.departement ?? 'AUCUN'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-zinc-500 font-medium">{o.telephone}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-zinc-400" />
                        <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{o.rfid}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${estActifAujourdhui(o) ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${estActifAujourdhui(o) ? 'text-emerald-700' : 'text-zinc-400'}`}>
                            {estActifAujourdhui(o) ? 'Présent' : 'Absent'}
                          </span>
                        </div>
                        {o.dernierePresence && (
                          <p className="text-[10px] text-zinc-400">Scan: {new Date(o.dernierePresence).toLocaleTimeString('fr-FR')}</p>
                        )}
                      </div>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditOuvrier(o)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmOuvrier(o)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {ouvriers.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200 shadow-inner">
          <Users size={64} className="text-zinc-100 mx-auto mb-4" />
          <p className="text-zinc-400 font-bold italic">Aucun collaborateur enregistré pour le moment</p>
          <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm font-bold mt-4 hover:underline">
            Ajouter le premier ouvrier
          </button>
        </div>
      )}

    </div>
  )
}