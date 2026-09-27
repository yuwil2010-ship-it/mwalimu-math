"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calculator, Monitor, Trophy, FileText, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Count = { cs: number; math: number; total: number }
type CountMap = Record<string, Count>

type TopicRow = {
  form_name: string
  category: string | null
  subject: string | null
}

type Kitabu = {
  id: string
  title: string
  subtitle: string
  form: string
  href: string
  icon: LucideIcon
  color: string
  gradient: string
}

const baseKitabu: Kitabu[] = [
  { id: "1", title: "Kidato cha Kwanza", subtitle: "Form I", form: "Form I", href: "/notes?form=Form I", icon: BookOpen, color: "text-blue-600", gradient: "from-blue-500 to-cyan-500" },
  { id: "2", title: "Kidato cha Pili", subtitle: "Form II", form: "Form II", href: "/notes?form=Form II", icon: BookOpen, color: "text-indigo-600", gradient: "from-indigo-500 to-blue-500" },
  { id: "3", title: "Kidato cha Tatu", subtitle: "Form III", form: "Form III", href: "/notes?form=Form III", icon: BookOpen, color: "text-violet-600", gradient: "from-violet-500 to-purple-500" },
  { id: "4", title: "Kidato cha Nne", subtitle: "Form IV", form: "Form IV", href: "/notes?form=Form IV", icon: BookOpen, color: "text-emerald-600", gradient: "from-emerald-500 to-teal-500" },
  { id: "5", title: "Kidato cha Tano", subtitle: "Form V", form: "Form V", href: "/notes?form=Form V", icon: BookOpen, color: "text-orange-600", gradient: "from-orange-500 to-red-500" },
  { id: "6", title: "Kidato cha Sita", subtitle: "Form VI", form: "Form VI", href: "/notes?form=Form VI", icon: BookOpen, color: "text-rose-600", gradient: "from-rose-500 to-pink-500" },
  { id: "7", title: "Mazoezi Mchanganyiko", subtitle: "Mazoezi - Masomo Yote", form: "Mazoezi", href: "/notes?category=MAZOEZI", icon: Calculator, color: "text-amber-600", gradient: "from-amber-500 to-orange-500" },
  { id: "8", title: "Bonus & NECTA", subtitle: "Past Papers & Bonus", form: "Bonus", href: "/notes?category=BONUS", icon: Trophy, color: "text-purple-600", gradient: "from-purple-500 to-pink-500" },
]

export default function HomePage() {
  const [counts, setCounts] = useState<CountMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const { data, error } = await supabase
          .from("topics_catalog")
          .select("form_name, category, subject")
          .returns<TopicRow[]>()

        if (error) throw error

        const map: CountMap = {}

        baseKitabu.forEach((b) => {
          map[b.form] = { cs: 0, math: 0, total: 0 }
        })

        data?.forEach((row) => {
          let card = row.form_name

          if (row.category === "MAZOEZI") card = "Mazoezi"
          if (row.category === "BONUS" || row.category === "NECTA" || card.includes("NECTA")) {
            card = "Bonus"
          }

          if (!map[card]) {
            map[card] = { cs: 0, math: 0, total: 0 }
          }

          if (row.subject === "Computer") {
            map[card].cs += 1
          } else {
            map[card].math += 1
          }

          map[card].total = map[card].cs + map[card].math
        })

        setCounts(map)
      } catch (e) {
        console.error("Error loading counts", e)
      } finally {
        setLoading(false)
      }
    }

    loadCounts()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Mwalimu <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Math</span>
            </h1>
            <p className="text-slate-500 mt-2">Jifunze Hisabati na Computer kwa urahisi</p>
          </div>
          <Link href="/notes" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-black transition">
            Tazama Notes Zote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          <div className="col-span-3 md:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Monitor className="w-5 h-5 text-indigo-600" /></div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{Object.values(counts).reduce((a, b) => a + b.cs, 0)}</div>
                <div className="text-xs text-slate-500">Computer Topics</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Calculator className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{Object.values(counts).reduce((a, b) => a + b.math, 0)}</div>
                <div className="text-xs text-slate-500">Math Topics</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm col-span-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{counts["Mazoezi"]?.cs ?? 0}/{counts["Mazoezi"]?.math ?? 0}</div>
                  <div className="text-xs text-slate-500">Mazoezi - Computer / Math</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">Fixed 29/56</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {baseKitabu.map((kitabu) => {
            const c = counts[kitabu.form]
            const Icon = kitabu.icon
            const isMazoezi = kitabu.form === "Mazoezi"

            return (
              <Link
                key={kitabu.id}
                href={kitabu.href}
                className="group relative bg-white rounded-[24px] border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kitabu.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${kitabu.gradient} flex items-center justify-center shadow-lg mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-[15px] leading-tight">{kitabu.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{kitabu.subtitle}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-xs font-semibold text-slate-700">
                          {loading ? "..." : c?.cs ?? 0} CS
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-slate-700">
                          {loading ? "..." : c?.math ?? 0} Math
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[11px]">
                    <span className="text-slate-500">Jumla</span>
                    <span className="font-bold text-slate-900">
                      {loading ? "..." : `${c?.total ?? 0} Topics`}
                      {isMazoezi && c ? ` • ${c.cs} Computer` : ""}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
