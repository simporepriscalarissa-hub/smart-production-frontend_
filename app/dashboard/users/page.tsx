'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Trash2, Users, Shield, User, AlertTriangle, X } from 'lucide-react'

interface UserType {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  departement?: string
}

// Popup de confirmation
function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-zinc-800">Confirmation</h3>
        </div>
        <p className="text-sm text-zinc-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-100 text-zinc-600 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// Popup d'erreur
function ErrorModal({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <h3 className="font-bold text-zinc-800">Action impossible</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-zinc-600 mb-5">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-zinc-800 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-900 transition-colors"
        >
          Compris
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
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'superviseur', departement: '',
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
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
      setMessage('Utilisateur ajouté avec succès !')
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'superviseur', departement: '' })
      setShowForm(false)
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const demanderSuppression = (u: UserType) => {
    // Protection 1 — Ne pas supprimer son propre profil
    if (currentUser && u.id === currentUser.id) {
      setErrorMsg('Vous ne pouvez pas supprimer votre propre profil !')
      return
    }
    // Protection 2 — Ne pas supprimer un admin
    if (u.role === 'admin') {
      setErrorMsg('Vous ne pouvez pas supprimer un administrateur !')
      return
    }
    // Sinon ouvrir la popup de confirmation
    setConfirmId(u.id)
  }

  const confirmerSuppression = async () => {
    if (!confirmId) return
    try {
      await axios.delete(`/users/${confirmId}`)
      setUsers(users.filter(u => u.id !== confirmId))
      setConfirmId(null)
    } catch (err) {
      console.log('Erreur:', err)
      setConfirmId(null)
    }
  }

  const admins = users.filter(u => u.role === 'admin')
  const superviseurs = users.filter(u => u.role === 'superviseur')

  return (
    <div className="flex flex-col gap-6">

      {/* Popups */}
      {confirmId && (
        <ConfirmModal
          message={`Voulez vous vraiment supprimer cet utilisateur ? Cette action est irréversible.`}
          onConfirm={confirmerSuppression}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {errorMsg && (
        <ErrorModal
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Gestion des Utilisateurs</h2>
          <p className="text-sm text-zinc-500">Administrateurs et superviseurs</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total</p>
                <p className="text-3xl font-bold text-zinc-800 mt-1">{users.length}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Admins</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{admins.length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Superviseurs</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{superviseurs.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message succès */}
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
              <UserPlus size={18} className="text-blue-600" />
              <CardTitle className="text-base">Nouvel utilisateur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nom', key: 'nom', type: 'text', placeholder: 'Nom de famille' },
                { label: 'Prénom', key: 'prenom', type: 'text', placeholder: 'Prénom' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@exemple.com' },
                { label: 'Mot de passe', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-sm text-zinc-600 mb-1.5 block font-medium">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="superviseur">Superviseur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Département</label>
                <select
                  value={form.departement}
                  onChange={(e) => setForm({ ...form, departement: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {['Coupe', 'Couture', 'Lavage', 'Finition', 'Contrôle Qualité', 'Emballage'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={ajouterUser} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 font-medium transition-colors">
                Enregistrer
              </button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium transition-colors">
                Annuler
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Liste des utilisateurs ({users.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-zinc-400">
                <th className="text-left py-3 font-medium">Utilisateur</th>
                <th className="text-left py-3 font-medium">Email</th>
                <th className="text-left py-3 font-medium">Rôle</th>
                <th className="text-left py-3 font-medium">Département</th>
                <th className="text-left py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = currentUser?.id === u.id
                const isAdmin = u.role === 'admin'
                const canDelete = !isMe && !isAdmin
                return (
                  <tr key={u.id} className="border-b hover:bg-zinc-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isMe ? 'bg-emerald-100' : u.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <span className={`font-bold text-xs ${isMe ? 'text-emerald-600' : u.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                            {u.prenom[0]}{u.nom[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{u.prenom} {u.nom}</p>
                          {isMe && <p className="text-xs text-emerald-500">C&apos;est vous</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-500">{u.email}</td>
                    <td className="py-3">
                      <Badge className={u.role === 'admin'
                        ? 'bg-red-100 text-red-700 hover:bg-red-100'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }>
                        {u.role === 'admin' ? '🔴 Admin' : '🔵 Superviseur'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {u.departement
                        ? <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100">{u.departement}</Badge>
                        : <span className="text-zinc-400">—</span>
                      }
                    </td>
                    <td className="py-3">
                      {canDelete ? (
                        <button
                          onClick={() => demanderSuppression(u)}
                          className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} />
                          Supprimer
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-300 italic">
                          {isMe ? 'Votre compte' : 'Protégé'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  )
}