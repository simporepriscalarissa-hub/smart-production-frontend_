'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_CONFIG } from '@/lib/config'
import { Settings, Save, CheckCircle } from 'lucide-react'

export default function Parametres() {
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    entreprise: APP_CONFIG.entreprise,
    apiUrl: APP_CONFIG.apiUrl,
    unite: APP_CONFIG.unite,
  })

  const sauvegarder = () => {
    localStorage.setItem('parametres', JSON.stringify(form))
    setMessage('Paramètres sauvegardés !')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h2 className="text-2xl font-bold text-zinc-800">Paramètres</h2>
        <p className="text-sm text-zinc-500">Configuration du système</p>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-zinc-600" />
            <CardTitle className="text-base">Informations générales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Nom de l&apos;entreprise</label>
              <input
                type="text"
                value={form.entreprise}
                onChange={(e) => setForm({ ...form, entreprise: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-600 mb-1.5 block font-medium">Unité de mesure</label>
              <input
                type="text"
                value={form.unite}
                onChange={(e) => setForm({ ...form, unite: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-zinc-600 mb-1.5 block font-medium">URL de l&apos;API</label>
              <input
                type="text"
                value={form.apiUrl}
                onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={sauvegarder}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 w-fit font-medium transition-colors"
          >
            <Save size={15} />
            Enregistrer les modifications
          </button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-zinc-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comptes utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Pour gérer les comptes allez dans
            <a href="/dashboard/users" className="text-blue-600 hover:underline ml-1 font-medium">
              Gestion des utilisateurs
            </a>
          </p>
        </CardContent>
      </Card>

    </div>
  )
}