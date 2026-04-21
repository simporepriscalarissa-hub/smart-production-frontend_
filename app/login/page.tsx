'use client'

import { useState } from 'react'
import axios from 'axios'
import { APP_CONFIG } from '@/lib/config'
import { Mail, Lock, LogIn, AlertCircle, BarChart2, Users, Wifi, Tv } from 'lucide-react'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  const seConnecter = async () => {
    setLoading(true)
    setErreur('')
    try {
      const response = await axios.post(`${APP_CONFIG.apiUrl}/auth/login`, { email, password })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      document.cookie = `token=${response.data.access_token}; path=/`
      const role = response.data.user.role
      if (role === 'admin' || role === 'superviseur') {
        window.location.href = '/dashboard'
      } else {
        setErreur('Accès non autorisé')
      }
    } catch {
      setErreur('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Côté gauche */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
          <span className="text-white font-bold text-lg">Readdlytech</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Smart Production<br />Counter & OEE
          </h2>
          <p className="text-blue-200 text-lg">
            Suivi en temps réel de votre production industrielle
          </p>
          <div className="mt-10 flex flex-col gap-5">
            {[
              { icon: BarChart2, text: 'Dashboard OEE en temps réel' },
              { icon: Users, text: 'Gestion des ouvriers par département' },
              { icon: Wifi, text: 'Connexion RFID pour les opérateurs' },
              { icon: Tv, text: 'Écran TV pour affichage en usine' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">© 2026 Readdlytech — Tous droits réservés</p>
      </div>

      {/* Côté droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-zinc-50 p-8">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-xl mx-auto mb-3" />
            <h1 className="text-xl font-bold text-zinc-800">Readdlytech</h1>
          </div>

          {/* Logo desktop */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Logo" width={44} height={44} className="rounded-xl" />
            <div>
              <h2 className="text-2xl font-bold text-zinc-800">Bienvenue 👋</h2>
              <p className="text-sm text-zinc-500">Connectez vous à votre espace</p>
            </div>
          </div>

          {/* Erreur */}
          {erreur && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3.5 rounded-xl mb-5 border border-red-100">
              <AlertCircle size={16} />
              {erreur}
            </div>
          )}

          <div className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="text-sm text-zinc-700 mb-1.5 block font-medium">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="email@production.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-zinc-700 mb-1.5 block font-medium">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && seConnecter()}
                  className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Bouton */}
            <button
              onClick={seConnecter}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Se connecter
                </>
              )}
            </button>

          </div>

        </div>
      </div>

    </div>
  )
}