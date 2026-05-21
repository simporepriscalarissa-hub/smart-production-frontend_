'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag, Plus, Pencil, Trash2, Clock, X, Check } from 'lucide-react'

interface Reference {
  id: number
  code: string
  libelle: string
  tempsCycle: number
  createdAt: string
}

interface FormData {
  code: string
  libelle: string
  tempsCycle: number
}

const emptyForm: FormData = { code: '', libelle: '', tempsCycle: 60 }

export default function ReferencesPage() {
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reference | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchReferences = async () => {
    try {
      const res = await axios.get('/references')
      setReferences(res.data)
    } catch {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReferences() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (ref: Reference) => {
    setEditing(ref)
    setForm({ code: ref.code, libelle: ref.libelle, tempsCycle: ref.tempsCycle })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await axios.patch(`/references/${editing.id}`, form)
      } else {
        await axios.post('/references', form)
      }
      await fetchReferences()
      closeForm()
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined
      setError(errorMessage ?? 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ref: Reference) => {
    if (!confirm(`Supprimer la référence "${ref.code}" ?`)) return
    try {
      await axios.delete(`/references/${ref.id}`)
      setReferences(prev => prev.filter(r => r.id !== ref.id))
    } catch {
      alert('Impossible de supprimer cette référence')
    }
  }

  const formatCycle = (sec: number) => {
    if (sec < 60) return `${sec}s`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return s > 0 ? `${m}min ${s}s` : `${m}min`
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Références produit</h2>
          <p className="text-sm text-zinc-500">Gérez les références et leurs temps de cycle théoriques</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nouvelle référence
        </button>
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-zinc-800">
                {editing ? 'Modifier la référence' : 'Nouvelle référence'}
              </h3>
              <button onClick={closeForm} className="text-zinc-400 hover:text-zinc-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="ex: REF001"
                  required
                  className="border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Libellé</label>
                <input
                  type="text"
                  value={form.libelle}
                  onChange={e => setForm({ ...form, libelle: e.target.value })}
                  placeholder="ex: Pièce moteur X"
                  required
                  className="border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                  Temps de cycle théorique (secondes/pièce)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.tempsCycle}
                  onChange={e => setForm({ ...form, tempsCycle: Number(e.target.value) })}
                  required
                  className="border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-zinc-400">
                  = {formatCycle(form.tempsCycle)} par pièce
                  &nbsp;({Math.round(3600 / form.tempsCycle)} pièces/heure théoriques)
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-zinc-200 text-zinc-600 py-2.5 rounded-xl text-sm hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  {editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-blue-600" />
            <CardTitle className="text-base">Liste des références</CardTitle>
            <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 ml-auto">
              {references.length} référence{references.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={36} className="text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Aucune référence créée</p>
              <button
                onClick={openCreate}
                className="mt-3 text-blue-600 text-sm hover:underline"
              >
                Créer la première référence
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b text-zinc-400">
                    <th className="text-left py-2 font-medium">Code</th>
                    <th className="text-left py-2 font-medium">Libellé</th>
                    <th className="text-left py-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        Temps de cycle
                      </div>
                    </th>
                    <th className="text-left py-2 font-medium">Cadence théorique</th>
                    <th className="text-right py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {references.map((ref) => (
                    <tr key={ref.id} className="border-b hover:bg-zinc-50 transition-colors">
                      <td className="py-3">
                        <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 font-mono">
                          {ref.code}
                        </Badge>
                      </td>
                      <td className="py-3 font-medium text-zinc-700">{ref.libelle}</td>
                      <td className="py-3 text-zinc-600">{formatCycle(ref.tempsCycle)}</td>
                      <td className="py-3">
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          {Math.round(3600 / ref.tempsCycle)} pièces/h
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(ref)}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(ref)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
