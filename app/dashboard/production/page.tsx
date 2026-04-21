'use client'

import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Package, CheckCircle, XCircle, ClipboardList, AlertTriangle, X } from 'lucide-react'

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string }
  reference: string
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  createdAt: string
}

interface Ouvrier {
  id: number
  nom: string
  prenom: string
  departement: string
}

interface User {
  id: number
  nom: string
  prenom: string
  role: string
  departement?: string
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="font-bold text-zinc-800">Supprimer la production</h3>
          <button onClick={onCancel} className="ml-auto text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>
        <p className="text-sm text-zinc-600 mb-2">Voulez vous vraiment supprimer cette entrée de production ?</p>
        <p className="text-xs text-red-500 mb-5">⚠️ Cette action est irréversible.</p>
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

export default function Production() {
  const [productions, setProductions] = useState<Production[]>([])
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showFormNonConforme, setShowFormNonConforme] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [form, setForm] = useState({
    ouvrierId: '',
    reference: '',
    quantiteProduite: '',
    quantiteConforme: '',
    quantiteNonConforme: '',
  })
  const [formNonConforme, setFormNonConforme] = useState({
    ouvrierId: '',
    reference: '',
    quantiteNonConforme: '',
    motif: '',
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined') {
      setUser(JSON.parse(userData))
    }
    // eslint-disable-next-line react-hooks/immutability
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prodRes, ouvrierRes] = await Promise.all([
        axios.get('/production'),
        axios.get('/ouvriers'),
      ])
      setProductions(prodRes.data)
      setOuvriers(ouvrierRes.data)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const ajouterProduction = async () => {
    try {
      await axios.post('/production', {
        ouvrierId: parseInt(form.ouvrierId),
        reference: form.reference,
        quantiteProduite: parseInt(form.quantiteProduite),
        quantiteConforme: parseInt(form.quantiteConforme),
        quantiteNonConforme: parseInt(form.quantiteNonConforme),
      })
      setMessage('Production ajoutée avec succès !')
      setShowForm(false)
      setForm({ ouvrierId: '', reference: '', quantiteProduite: '', quantiteConforme: '', quantiteNonConforme: '' })
      fetchData()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const ajouterNonConforme = async () => {
    try {
      const qte = parseInt(formNonConforme.quantiteNonConforme)
      await axios.post('/production', {
        ouvrierId: parseInt(formNonConforme.ouvrierId),
        reference: formNonConforme.reference,
        quantiteProduite: qte,
        quantiteConforme: 0,
        quantiteNonConforme: qte,
      })
      setMessage(`${qte} pièce(s) non conforme(s) signalée(s) !`)
      setShowFormNonConforme(false)
      setFormNonConforme({ ouvrierId: '', reference: '', quantiteNonConforme: '', motif: '' })
      fetchData()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.log('Erreur:', err)
    }
  }

  const confirmerSuppression = async () => {
    if (!confirmId) return
    try {
      await axios.delete(`/production/${confirmId}`)
      setProductions(productions.filter(p => p.id !== confirmId))
      setConfirmId(null)
    } catch (err) {
      console.log('Erreur:', err)
      setConfirmId(null)
    }
  }

  const totalProduit = productions.reduce((acc, p) => acc + p.quantiteProduite, 0)
  const totalConforme = productions.reduce((acc, p) => acc + p.quantiteConforme, 0)
  const totalNonConforme = productions.reduce((acc, p) => acc + p.quantiteNonConforme, 0)

  const isAdmin = user?.role === 'admin'
  const isSuperviseur = user?.role === 'superviseur'

  // Filtrer ouvriers par département pour superviseur
  const ouvriersFiltres = isSuperviseur && user?.departement
    ? ouvriers.filter(o => o.departement === user.departement)
    : ouvriers

  return (
    <div className="flex flex-col gap-6">

      {/* Popup confirmation suppression */}
      {confirmId && (
        <ConfirmModal
          onConfirm={confirmerSuppression}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Entrée en Production</h2>
          <p className="text-sm text-zinc-500">Gestion des productions par ouvrier</p>
        </div>
        <div className="flex gap-3">
          {/* Superviseur — signaler non conformes */}
          {isSuperviseur && (
            <button
              onClick={() => { setShowFormNonConforme(!showFormNonConforme); setShowForm(false) }}
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 text-sm font-medium transition-colors"
            >
              <XCircle size={16} />
              Signaler non conformes
            </button>
          )}
          {/* Admin — ajouter production complète */}
          {isAdmin && (
            <button
              onClick={() => { setShowForm(!showForm); setShowFormNonConforme(false) }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Ajouter une production
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-zinc-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total produit</p>
                <p className="text-3xl font-bold text-zinc-800 mt-1">{totalProduit}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center">
                <Package size={20} className="text-zinc-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Conformes</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{totalConforme}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Non conformes</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{totalNonConforme}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
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

      {/* Formulaire Admin — production complète */}
      {showForm && isAdmin && (
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              <CardTitle className="text-base">Nouvelle production</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Ouvrier</label>
                <select
                  value={form.ouvrierId}
                  onChange={(e) => setForm({ ...form, ouvrierId: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un ouvrier</option>
                  {ouvriers.map((o) => (
                    <option key={o.id} value={o.id}>{o.prenom} {o.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Référence produit</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="ex: JEAN-001"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {[
                { label: 'Quantité produite', key: 'quantiteProduite' },
                { label: 'Quantité conforme', key: 'quantiteConforme' },
                { label: 'Quantité non conforme', key: 'quantiteNonConforme' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm text-zinc-600 mb-1.5 block font-medium">{label}</label>
                  <input
                    type="number"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={ajouterProduction} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 font-medium transition-colors">Enregistrer</button>
              <button onClick={() => setShowForm(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium transition-colors">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire Superviseur — pièces non conformes */}
      {showFormNonConforme && isSuperviseur && (
        <Card className="border border-red-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />
              <CardTitle className="text-base text-red-700">Signaler des pièces non conformes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <p className="text-xs text-red-600">⚠️ Cette action enregistre des pièces rejetées pour un ouvrier de votre département.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Ouvrier</label>
                <select
                  value={formNonConforme.ouvrierId}
                  onChange={(e) => setFormNonConforme({ ...formNonConforme, ouvrierId: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">Sélectionner un ouvrier</option>
                  {ouvriersFiltres.map((o) => (
                    <option key={o.id} value={o.id}>{o.prenom} {o.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Référence produit</label>
                <input
                  type="text"
                  value={formNonConforme.reference}
                  onChange={(e) => setFormNonConforme({ ...formNonConforme, reference: e.target.value })}
                  placeholder="ex: JEAN-001"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Nombre de pièces non conformes</label>
                <input
                  type="number"
                  value={formNonConforme.quantiteNonConforme}
                  onChange={(e) => setFormNonConforme({ ...formNonConforme, quantiteNonConforme: e.target.value })}
                  placeholder="0"
                  min="1"
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Motif du rejet <span className="text-zinc-400 font-normal">(optionnel)</span></label>
                <input
                  type="text"
                  value={formNonConforme.motif}
                  onChange={(e) => setFormNonConforme({ ...formNonConforme, motif: e.target.value })}
                  placeholder="ex: Couture défectueuse, mauvaise taille..."
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={ajouterNonConforme} className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-red-700 font-medium transition-colors flex items-center gap-2">
                <XCircle size={15} />
                Signaler
              </button>
              <button onClick={() => setShowFormNonConforme(false)} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-xl text-sm hover:bg-zinc-200 font-medium transition-colors">Annuler</button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Liste des productions ({productions.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {productions.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune production enregistrée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-zinc-400">
                  <th className="text-left py-3 font-medium">Ouvrier</th>
                  <th className="text-left py-3 font-medium">Référence</th>
                  <th className="text-left py-3 font-medium">Total</th>
                  <th className="text-left py-3 font-medium">Conformes</th>
                  <th className="text-left py-3 font-medium">Non Conformes</th>
                  <th className="text-left py-3 font-medium">État</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  {isAdmin && <th className="text-left py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {productions.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-zinc-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                          <span className="text-zinc-600 text-xs font-bold">
                            {p.ouvrier?.prenom?.[0]}{p.ouvrier?.nom?.[0]}
                          </span>
                        </div>
                        <span className="font-medium">{p.ouvrier?.prenom} {p.ouvrier?.nom}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 font-normal">{p.reference}</Badge>
                    </td>
                    <td className="py-3 font-bold">{p.quantiteProduite}</td>
                    <td className="py-3 text-emerald-600 font-bold">{p.quantiteConforme}</td>
                    <td className="py-3">
                      <span className={p.quantiteNonConforme > 0 ? 'text-red-500 font-bold' : 'text-zinc-400'}>
                        {p.quantiteNonConforme}
                      </span>
                    </td>
                    <td className="py-3">
                      {p.quantiteNonConforme === 0
                        ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">✅ OK</Badge>
                        : <Badge className="bg-red-100 text-red-700 hover:bg-red-100">❌ NOK</Badge>
                      }
                    </td>
                    <td className="py-3 text-zinc-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    {isAdmin && (
                      <td className="py-3">
                        <button
                          onClick={() => setConfirmId(p.id)}
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
          )}
        </CardContent>
      </Card>

    </div>
  )
}