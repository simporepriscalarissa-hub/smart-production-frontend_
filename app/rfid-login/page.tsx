'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { APP_CONFIG } from '@/lib/config'

export default function RfidLogin() {
  const router = useRouter()
  const [rfid, setRfid] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const seConnecter = async () => {
    if (!rfid) return
    setLoading(true)
    setErreur('')
    try {
      const response = await axios.post(`${APP_CONFIG.apiUrl}/auth/rfid-login`, { rfid })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      document.cookie = `token=${response.data.access_token}; path=/`
      router.push('/operateur')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setErreur(`Erreur ${error.response.status} : Badge non reconnu`)
        } else {
          setErreur('Serveur inaccessible. Vérifiez que le backend est lancé.')
        }
      } else {
        setErreur('Erreur technique')
      }
      setRfid('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">Connexion Opérateur</h1>
          <p className="text-sm text-zinc-400 mt-1">Scannez votre badge RFID ou entrez votre code</p>
        </div>

        {erreur && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
            {erreur}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-600 mb-1 block font-medium">Code RFID</label>
            <input
              ref={inputRef}
              type="text"
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && seConnecter()}
              className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 text-center text-lg tracking-widest"
              placeholder="Scannez votre badge..."
            />
          </div>
          <button
            onClick={seConnecter}
            disabled={loading}
            className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-zinc-400 hover:underline">
            ← Retour connexion admin
          </a>
        </div>

      </div>
    </div>
  )
}