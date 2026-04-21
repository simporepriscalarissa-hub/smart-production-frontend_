'use client'

import { useEffect, useState, useRef } from 'react'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Download, TrendingUp, Package, CheckCircle, XCircle, FileText } from 'lucide-react'

interface OEE {
  oee: string
  qualite: string
  disponibilite: string
  performance: string
  totalProduit: number
  totalNonConforme: number
}

interface Production {
  id: number
  ouvrier: { prenom: string; nom: string }
  quantiteProduite: number
  quantiteConforme: number
  quantiteNonConforme: number
  reference: string
  createdAt: string
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']

export default function Rapports() {
  const [oee, setOee] = useState<OEE | null>(null)
  const [productions, setProductions] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)
  const [exportDate, setExportDate] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [csvSuccess, setCsvSuccess] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oeeRes, prodRes] = await Promise.all([
          axios.get('/oee'),
          axios.get('/production'),
        ])
        setOee(oeeRes.data)
        setProductions(prodRes.data)
      } catch (err) {
        console.log('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ─── Export PDF ────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    if (typeof window === 'undefined') return
    const element = reportRef.current
    if (!element) return

    setExporting(true)

    const dateStr = `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
    setExportDate(dateStr)

    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      const { default: html2canvas } = await import('html2canvas')
      const jsPDF = (await import('jspdf')).jsPDF

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      } as Parameters<typeof html2canvas>[1])

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageWidth  = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgHeight  = (canvas.height * pageWidth) / canvas.width

      let heightLeft = imgHeight
      let position   = 0

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`rapport-production-${new Date().toLocaleDateString('fr-FR')}.pdf`)
    } catch (err) {
      console.error('Erreur export PDF:', err)
    } finally {
      setTimeout(() => {
        setExportDate(null)
        setExporting(false)
      }, 500)
    }
  }

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    // Colonnes
    const headers = [
      'Prénom',
      'Nom',
      'Référence',
      'Quantité produite',
      'Conformes',
      'Non conformes',
      'Taux qualité (%)',
      'Date',
    ]

    // Lignes de données
    const rows = productions.map(p => [
      p.ouvrier?.prenom ?? '',
      p.ouvrier?.nom    ?? '',
      p.reference,
      p.quantiteProduite,
      p.quantiteConforme,
      p.quantiteNonConforme,
      p.quantiteProduite > 0
        ? ((p.quantiteConforme / p.quantiteProduite) * 100).toFixed(1)
        : '0',
      new Date(p.createdAt).toLocaleDateString('fr-FR'),
    ])

    // Bloc récapitulatif OEE en bas du fichier
    const summary = [
      [''],
      ['=== Indicateurs OEE ==='],
      ['OEE Global',          oee?.oee              ?? ''],
      ['Disponibilité',       oee?.disponibilite    ?? ''],
      ['Performance',         oee?.performance      ?? ''],
      ['Qualité',             oee?.qualite          ?? ''],
      ['Total produit',       oee?.totalProduit     ?? ''],
      ['Total non conformes', oee?.totalNonConforme ?? ''],
    ]

    // Guillemets RFC 4180 — protège les virgules et les guillemets internes
    const escape = (val: string | number) =>
      `"${String(val).replace(/"/g, '""')}"`

    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map(r => r.map(escape).join(',')),
      ...summary.map(r => r.map(escape).join(',')),
    ].join('\n')

    // BOM UTF-8 (\uFEFF) — indispensable pour que Excel affiche les accents
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `rapport-production-${new Date()
      .toLocaleDateString('fr-FR')
      .replace(/\//g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)

    // Toast de confirmation
    setCsvSuccess(true)
    setTimeout(() => setCsvSuccess(false), 3000)
  }

  // ─── Données graphiques ────────────────────────────────────────────────────
  const dataProduction = productions.slice(0, 10).map(p => ({
    nom:        p.ouvrier ? `${p.ouvrier.prenom[0]}.${p.ouvrier.nom}` : '?',
    produit:    p.quantiteProduite,
    conforme:   p.quantiteConforme,
    nonConforme: p.quantiteNonConforme,
  }))

  const dataQualite = [
    { name: 'Conformes',     value: productions.reduce((s, p) => s + p.quantiteConforme,    0) },
    { name: 'Non conformes', value: productions.reduce((s, p) => s + p.quantiteNonConforme, 0) },
  ]

  const dataOEE = [
    { name: 'Disponibilité', value: parseFloat(oee?.disponibilite ?? '0') },
    { name: 'Performance',   value: parseFloat(oee?.performance   ?? '0') },
    { name: 'Qualité',       value: parseFloat(oee?.qualite       ?? '0') },
    { name: 'OEE Global',    value: parseFloat(oee?.oee           ?? '0') },
  ]

  // ─── Loader ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Rapports de production</h2>
          <p className="text-sm text-zinc-500">
            Analyse complète — {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bouton CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Download size={16} />
            Exporter CSV
          </button>

          {/* Bouton PDF */}
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download size={16} />
                Exporter en PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Toast confirmation CSV ──────────────────────────────────────────── */}
      {csvSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl animate-in fade-in duration-200">
          <CheckCircle size={16} className="shrink-0" />
          Fichier CSV téléchargé avec succès !
        </div>
      )}

      {/* ── Contenu exportable (PDF capture zone) ──────────────────────────── */}
      <div ref={reportRef} className="flex flex-col gap-6">

        {/* En-tête du rapport */}
        <div className="bg-blue-600 text-white p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={24} />
            <h3 className="text-xl font-bold">
              Rapport de Production — Smart Production Counter
            </h3>
          </div>
          {exportDate && (
            <p className="text-blue-100 text-sm">Généré le {exportDate}</p>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">OEE Global</p>
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{oee?.oee ?? '—'}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-zinc-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Total produit</p>
                <Package size={18} className="text-zinc-600" />
              </div>
              <p className="text-3xl font-bold text-zinc-800">{oee?.totalProduit ?? '—'}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-emerald-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-emerald-500 uppercase tracking-wide font-semibold">Qualité</p>
                <CheckCircle size={18} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-700">{oee?.qualite ?? '—'}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-red-50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-red-500 uppercase tracking-wide font-semibold">Non conformes</p>
                <XCircle size={18} className="text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{oee?.totalNonConforme ?? '—'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Graphique OEE barres */}
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Indicateurs OEE</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dataOEE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={4} name="Valeur %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique qualité camembert */}
          <Card className="shadow-sm border border-zinc-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Répartition qualité</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dataQualite}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ percent }: { percent?: number }) =>
                      `${((percent ?? 0) * 100).toFixed(1)}%`
                    }
                    labelLine={false}
                  >
                    {dataQualite.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value).toLocaleString('fr-FR'),
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique productions par ouvrier — pleine largeur */}
          <Card className="shadow-sm border border-zinc-100 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Productions par ouvrier</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dataProduction}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="produit"     fill="#3b82f6" name="Total"         radius={4} />
                  <Bar dataKey="conforme"    fill="#22c55e" name="Conformes"     radius={4} />
                  <Bar dataKey="nonConforme" fill="#ef4444" name="Non conformes" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tableau détaillé */}
        <Card className="shadow-sm border border-zinc-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Détail des productions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-zinc-400">
                    <th className="text-left py-2 font-medium">Ouvrier</th>
                    <th className="text-left py-2 font-medium">Référence</th>
                    <th className="text-left py-2 font-medium">Total</th>
                    <th className="text-left py-2 font-medium">Conformes</th>
                    <th className="text-left py-2 font-medium">Non conformes</th>
                    <th className="text-left py-2 font-medium">Taux qualité</th>
                    <th className="text-left py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.slice(0, 15).map(p => {
                    const taux =
                      p.quantiteProduite > 0
                        ? ((p.quantiteConforme / p.quantiteProduite) * 100).toFixed(1)
                        : '0'
                    return (
                      <tr key={p.id} className="border-b hover:bg-zinc-50 transition-colors">
                        <td className="py-2 font-medium">
                          {p.ouvrier?.prenom} {p.ouvrier?.nom}
                        </td>
                        <td className="py-2">
                          <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                            {p.reference}
                          </Badge>
                        </td>
                        <td className="py-2 font-bold">{p.quantiteProduite}</td>
                        <td className="py-2 text-emerald-600 font-bold">{p.quantiteConforme}</td>
                        <td className="py-2">
                          <span
                            className={
                              p.quantiteNonConforme > 0
                                ? 'text-red-500 font-bold'
                                : 'text-zinc-400'
                            }
                          >
                            {p.quantiteNonConforme}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              Number(taux) >= 90
                                ? 'bg-emerald-50 text-emerald-700'
                                : Number(taux) >= 75
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {taux}%
                          </span>
                        </td>
                        <td className="py-2 text-zinc-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString('fr-FR')}
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
      {/* fin zone exportable PDF */}

    </div>
  )
}