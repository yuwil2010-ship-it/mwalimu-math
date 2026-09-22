"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, BookOpen, Wallet, School, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, Globe } from "lucide-react"

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, active: true },
  { name: "Users", icon: Users },
  { name: "Academics", icon: GraduationCap },
  { name: "Reports", icon: BarChart3 },
  { name: "Events", icon: Calendar },
  { name: "Settings", icon: Settings },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const check = async () => {
      const local = localStorage.getItem("mwalimu_admin_authed") === "true"
      const { data: { session } } = await supabase.auth.getSession()
      if (!local &&!session) {
        router.push("/admin/login")
        return
      }
      setAuthed(true)
    }
    check()
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem("mwalimu_admin_authed")
    localStorage.removeItem("mwalimu_admin_user")
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (!authed) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Inapakia...</div>

  return (
    <div className="h-screen bg-[#f6f7fb] flex overflow-hidden">
      {/* LEFT SIDEBAR - haitascroll na right */}
      <aside className="w-60 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
        {/* Top bar ya sidebar - BLUE maandishi meupe, logo nyeupe border blue */}
        <div className="px-5 py-5 flex items-center gap-2 font-black text- bg-[#1d4ed8] text-white">
          <div className="w-8 h-8 bg-white border border-blue-200 rounded-lg flex items-center justify-center">
            <Calculator size={18} className="text-[#1d4ed8]" />
          </div>
          Mwalimu Math
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${item.active? "bg-[#1d4ed8] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              <item.icon size={18} /> {item.name}
            </button>
          ))}
        </nav>
        <div className="border-t p-4">
          <p className="text-xs text-gray-600 truncate">yuwil2010@gmail.com</p>
          <button onClick={handleLogout} className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"><LogOut size={16}/> Sign Out</button>
        </div>
      </aside>

      {/* RIGHT SIDE - scroll yake inajitegemea */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar ya right - BLUE pia */}
        <header className="bg-[#1d4ed8] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h1 className="font-bold text-xl">Admin Panel</h1>
          <button className="flex items-center gap-1.5 border border-white/30 bg-white/10 rounded-full px-3 py-1.5 text-xs font-bold"><Globe size={14}/> SW</button>
        </header>

        {/* Content inayoscroll pekee */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CARDS - rangi tofauti, hakuna border */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#16a34a] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Users size={18}/></div>
              <p className="mt-4 text-3xl font-black">60</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80">STUDENTS</p>
            </div>
            <div className="bg-[#2563eb] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><GraduationCap size={18}/></div>
              <p className="mt-4 text-3xl font-black">25</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80">TEACHERS</p>
            </div>
            <div className="bg-[#ca8a04] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><BookOpen size={18}/></div>
              <p className="mt-4 text-3xl font-black">12</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80">SUBJECTS</p>
            </div>
            <div className="bg-[#1e3a8a] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Wallet size={18}/></div>
              <p className="mt-4 text-3xl font-black">0</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80">FEES COLLECTED (TSH)</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#1d4ed8]"><School size={18}/></div>
              <div><h2 className="font-bold text-">Registered Classes</h2><p className="text-sm text-gray-500">6 classes</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { form: "Form II", students: 10 },
                { form: "Form I", students: 10 },
                { form: "Form VI", students: 10 },
                { form: "Form III", students: 10 },
                { form: "Form IV", students: 10 },
                { form: "Form V", students: 10 },
              ].map((c) => (
                <div key={c.form} className="bg-[#f6f7fb] rounded-xl p-4">
                  <p className="font-bold text-[#1d4ed8]">{c.form}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-2">STUDENTS</p>
                  <p className="text-sm mt-1">{c.students}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}