'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Trash2, Users, Shield, User, AlertTriangle, X, Edit3, Save, Mail, Key } from 'lucide-react'

interface UserType {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  departement?: string
}

// Popup de confirmation
function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg">Confirmation</h3>
        </div>
        <p className="text-sm text-zinc-600 mb-8 leading-relaxed">{message}</p>
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

// Popup d'édition
function EditUserModal({ user, onSave, onCancel }: { user: UserType; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({ ...user, password: '' })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit3 size={20} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-zinc-800 text-lg">Modifier l'utilisateur</h3>
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
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Email professionnel</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
            >
              <option value="superviseur">Superviseur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Département</label>
            <select
              value={formData.departement}
              onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Aucun</option>
              {['Fonderie', 'Usinage', 'Peinture', 'Assemblage', 'Logistique', 'Qualité'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={() => onSave(formData)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <Save size={18} />
            Enregistrer
          </button>
          <button onClick={onCancel} className="flex-1 bg-zinc-100 text-zinc-600 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// Popup d'erreur
function ErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-orange-600" />
          </div>
          <h3 className="font-bold text-zinc-800 text-lg">Action impossible</h3>
        </div>
        <p className="text-sm text-zinc-600 mb-8 leading-relaxed">{message}</p>
        <button onClick={onClose} className="w-full bg-zinc-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-zinc-900 transition-all active:scale-95">
          J'ai compris
        </button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editUser, setEditUser] = useState<UserType | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', role: 'superviseur', departement: '' })

  useEffect(() => {
    fetchUsers()
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users')
      setUsers(res.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const ajouterUser = async () => {
    try {
      await axios.post('/auth/register', form)
      setMessage('Utilisateur créé avec succès !')
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'superviseur', departement: '' })
      setShowForm(false)
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const modifierUser = async (data: any) => {
    if (!editUser) return
    try {
      const payload = { ...data }
      if (!payload.password) delete payload.password
      await axios.patch(`/users/${editUser.id}`, payload)
      setMessage('Profil mis à jour !')
      setEditUser(null)
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const demanderSuppression = (u: UserType) => {
    if (currentUser && u.id === currentUser.id) {
      setErrorMsg('Vous ne pouvez pas supprimer votre propre profil !')
      return
    }
    if (u.role === 'admin' && users.filter(usr => usr.role === 'admin').length <= 1) {
      setErrorMsg('Impossible de supprimer le dernier administrateur !')
      return
    }
    setConfirmId(u.id)
  }

  const confirmerSuppression = async () => {
    if (!confirmId) return
    try {
      await axios.delete(`/users/${confirmId}`)
      setUsers(users.filter(u => u.id !== confirmId))
      setConfirmId(null)
      setMessage('Utilisateur supprimé !')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
      setConfirmId(null)
    }
  }

  const admins = users.filter(u => u.role === 'admin')
  const superviseurs = users.filter(u => u.role === 'superviseur')

  return (
    <div className="flex flex-col gap-6">

      {/* Modales */}
      {confirmId && (
        <ConfirmModal
          message={`Voulez vous vraiment révoquer l'accès de cet utilisateur ? Cette opération est définitive.`}
          onConfirm={confirmerSuppression}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {editUser && (
        <EditUserModal 
          user={editUser}
          onSave={modifierUser}
          onCancel={() => setEditUser(null)}
        />
      )}
      {errorMsg && (
        <ErrorModal message={errorMsg} onClose={() => setErrorMsg('')} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">Accès & Utilisateurs</h2>
          <p className="text-sm text-zinc-500 mt-1">Gérez les habilitations des administrateurs et superviseurs</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl hover:bg-black text-sm font-bold transition-all active:scale-95 shadow-lg shadow-zinc-200"
        >
          <UserPlus size={18} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50 border-b-4 border-zinc-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-black">Total comptes</p>
                <p className="text-4xl font-black text-zinc-800 mt-2">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Users size={24} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50 border-b-4 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-500 uppercase tracking-widest font-black">Administrateurs</p>
                <p className="text-4xl font-black text-red-700 mt-2">{admins.length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Shield size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50 border-b-4 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-widest font-black">Superviseurs</p>
                <p className="text-4xl font-black text-blue-700 mt-2">{superviseurs.length}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <User size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification */}
      {message && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 shadow-lg shadow-emerald-100">
          <Badge className="bg-emerald-400 text-white border-0">OK</Badge>
          {message}
        </div>
      )}

      {/* Formulaire d'ajout rapide */}
      {showForm && (
        <Card className="border-2 border-zinc-900 shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-zinc-900 text-white pb-4">
            <div className="flex items-center gap-2">
              <UserPlus size={18} />
              <CardTitle className="text-base font-bold">Inscrire un nouvel utilisateur</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Nom', key: 'nom', type: 'text', placeholder: 'Nom' },
                { label: 'Prénom', key: 'prenom', type: 'text', placeholder: 'Prénom' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'Email pro' },
                { label: 'Mot de passe', key: 'password', type: 'password', placeholder: 'Mot de passe' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 block tracking-widest">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 block tracking-widest">Habilitation</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-white"
                >
                  <option value="superviseur">Superviseur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-1.5 block tracking-widest">Département affecté</label>
                <select
                  value={form.departement}
                  onChange={(e) => setForm({ ...form, departement: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-white"
                >
                  <option value="">Tous / Aucun</option>
                  {['Fonderie', 'Usinage', 'Peinture', 'Assemblage', 'Logistique', 'Qualité'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-zinc-100">
              <button onClick={ajouterUser} className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-zinc-200">
                Créer l'accès
              </button>
              <button onClick={() => setShowForm(false)} className="px-8 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all">
                Annuler
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau des utilisateurs */}
      <Card className="shadow-sm border border-zinc-100 overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-zinc-400 border-b border-zinc-100">
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Identité</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Email & Contact</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Rôle</th>
                  <th className="text-left py-4 px-6 font-black uppercase text-[10px] tracking-widest">Département</th>
                  <th className="text-right py-4 px-6 font-black uppercase text-[10px] tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => {
                  const isMe = currentUser?.id === u.id
                  const isAdmin = u.role === 'admin'
                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border shadow-sm ${isMe ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isAdmin ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {u.prenom[0]}{u.nom[0]}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-800">{u.prenom} {u.nom}</p>
                            {isMe && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Moi</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Mail size={14} className="text-zinc-300" />
                          <span className="font-medium">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={isAdmin
                          ? 'bg-red-50 text-red-700 border-red-100 font-black text-[10px]'
                          : 'bg-blue-50 text-blue-700 border-blue-100 font-black text-[10px]'
                        }>
                          {isAdmin ? 'ADMINISTRATEUR' : 'SUPERVISEUR'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {u.departement
                          ? <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200 font-bold text-[10px]">{u.departement}</Badge>
                          : <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Tous</span>
                        }
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditUser(u)}
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Modifier"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => demanderSuppression(u)}
                            className={`p-2 rounded-xl transition-all ${isMe || (isAdmin && u.id !== currentUser?.id) ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'}`}
                            disabled={isMe || (isAdmin && u.id !== currentUser?.id)}
                            title="Révoquer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}