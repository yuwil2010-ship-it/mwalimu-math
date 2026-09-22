"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, Globe, ShieldCheck, HeartHandshake, School } from "lucide-react"

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
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const [now, setNow] = useState(new Date())

  const tr = {
    en: { adminPanel: "Admin Panel", admin: "Admin", teachers: "Teachers", students: "Students", parents: "Parents", registered: "Registered Classes", classes: "classes", studentsW: "Students" },
    sw: { adminPanel: "Paneli ya Admin", admin: "Msimamizi", teachers: "Walimu", students: "Wanafunzi", parents: "Wazazi", registered: "Madarasa Yaliyosajiliwa", classes: "madarasa", studentsW: "Wanafunzi" }
  }[lang]

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const check = async () => {
      const local = localStorage.getItem("mwalimu_admin_authed") === "true"
      const { data: { session } } = await supabase.auth.getSession()
      if (!local &&!session) { router.push("/admin/login"); return }
      setAuthed(true)
    }
    check()
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem("mwalimu_admin_authed")
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (!authed) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Inapakia...</div>

  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = now.toLocaleString(lang === 'sw'? 'sw-TZ' : 'en-US', { month: 'long', year: 'numeric' })

  const classList = [
    { form: "Form I", students: 15 },
    { form: "Form II", students: 12 },
    { form: "Form III", students: 18 },
    { form: "Form IV", students: 10 },
  ]

  return (
    <div className="h-screen bg-[#f6f7fb] flex overflow-hidden">
      <aside className="w-60 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
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
        <div className="border-t p-4 space-y-2">
          <p className="text- font-bold tracking-widest text-gray-400 uppercase">Username</p>
          <p className="text-sm font-bold text-gray-800">Admin</p>
          <button onClick={handleLogout} className="mt-2 w-full flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#1d4ed8] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h1 className="font-bold text-xl">{tr.adminPanel}</h1>
          <button onClick={()=>setLang(lang==='sw'?'en':'sw')} className="flex items-center gap-1.5 border border-white/30 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer">
            <Globe size={14}/> {lang.toUpperCase()}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#16a34a] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><ShieldCheck size={18}/></div>
              <p className="mt-4 text-3xl font-black">1</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80 uppercase">{tr.admin}</p>
            </div>
            <div className="bg-[#2563eb] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><GraduationCap size={18}/></div>
              <p className="mt-4 text-3xl font-black">12</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80 uppercase">{tr.teachers}</p>
            </div>
            <div className="bg-[#ca8a04] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Users size={18}/></div>
              <p className="mt-4 text-3xl font-black">60</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80 uppercase">{tr.students}</p>
            </div>
            <div className="bg-[#1e3a8a] rounded-2xl p-5 text-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><HeartHandshake size={18}/></div>
              <p className="mt-4 text-3xl font-black">120</p>
              <p className="text-xs font-bold tracking-wide mt-1 text-white/80 uppercase">{tr.parents}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#1d4ed8]"><School size={18}/></div>
              <div><h2 className="font-bold text-">{tr.registered}</h2><p className="text-sm text-gray-500">4 {tr.classes}</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classList.map((c) => (
                <div key={c.form} className="bg-[#f6f7fb] rounded-xl p-4">
                  <p className="font-bold text-[#1d4ed8]">{c.form}</p>
                  <p className="text-sm mt-2 text-gray-700"><span className="font-black text-[#1d4ed8]">{c.students}</span> {tr.studentsW}</p>
                </div>
              ))}
              <div className="sm:col-span-2 bg-[#1d4ed8] rounded-xl p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold capitalize">{monthName}</p>
                    <p className="text-2xl font-black mt-1">{now.toLocaleTimeString()}</p>
                    <p className="text-xs text-white/70 mt-1">{now.toLocaleDateString(lang==='sw'?'sw-TZ':'en-US', { weekday: 'long' })}</p>
                  </div>
                  <Calendar size={20} className="text-white/60"/>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-4 text-center">
                  {["S","M","T","W","T","F","S"].map((d,i)=><div key={`head-${d}-${i}`} className="text- text-white/50 font-bold py-1">{d}</div>)}
                  {Array.from({length:firstDay}).map((_,i)=><div key={`empty-${i}`}></div>)}
                  {Array.from({length:daysInMonth}).map((_,i)=>{
                    const day = i+1
                    const isToday = day===now.getDate()
                    return <div key={`day-${day}`} className={`text- py-1.5 rounded-full ${isToday?"bg-white text-[#1d4ed8] font-black":"text-white/80"}`}>{day}</div>
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}