"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, Globe, ShieldCheck, HeartHandshake, School, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, active: true, sub: [] as string[] },
  { name: "Users", icon: Users, sub: ["Manage Admin", "Manage Teachers", "Manage Students", "Manage Parents"] },
  { name: "Academics", icon: GraduationCap, sub: ["Manage Classes", "Manage Materials", "Manage Timetable", "Manage Attendance", "Manage Assessment"] },
  { name: "Reports", icon: BarChart3, sub: ["Manage reports", "Chartroom"] },
  { name: "Events", icon: Calendar, sub: ["Manage Announcement", "School Calendar"] },
  { name: "Settings", icon: Settings, sub: ["Change Password", "Reset Password"] },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const [now, setNow] = useState(new Date())
  const [viewDate, setViewDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const tr = {
    en: { adminPanel: "Admin Panel", admin: "Admin", teachers: "Teachers", students: "Students", parents: "Parents", registered: "Registered Classes", classes: "classes", studentsW: "Students" },
    sw: { adminPanel: "Paneli ya Admin", admin: "Msimamizi", teachers: "Walimu", students: "Wanafunzi", parents: "Wazazi", registered: "Madarasa Yaliyosajiliwa", classes: "madarasa", studentsW: "Wanafunzi" }
  }[lang]

  const monthNames = lang === 'sw'
  ? ["Januari","Februari","Machi","Aprili","Mei","Juni","Julai","Agosti","Septemba","Oktoba","Novemba","Desemba"]
    : ["January","February","March","April","May","June","July","August","September","October","November","December"]

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

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const classList = [
    { form: "Form I", students: 15 },
    { form: "Form II", students: 12 },
    { form: "Form III", students: 18 },
    { form: "Form IV", students: 10 },
    { form: "Form V", students: 14 },
    { form: "Form VI", students: 16 },
  ]

  return (
    <div className="h-screen bg-[#f6f7fb] flex overflow-hidden">
      {/* LEFT SIDEBAR NA DROPDOWN */}
      <aside className="w-60 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
        <div className="px-5 py-5 flex items-center gap-2 font-black text- bg-[#1d4ed8] text-white">
          <div className="w-8 h-8 bg-white border border-blue-200 rounded-lg flex items-center justify-center">
            <Calculator size={18} className="text-[#1d4ed8]" />
          </div>
          Mwalimu Math
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <div key={item.name}>
              <button
                onClick={()=> item.sub.length>0? setOpenDropdown(openDropdown===item.name? null : item.name) : null}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active? "bg-[#1d4ed8] text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className="flex items-center gap-3"><item.icon size={18} /> {item.name}</span>
                {item.sub.length>0 && <ChevronDown size={14} className={`transition-transform ${openDropdown===item.name? "rotate-180" : ""}`} />}
              </button>
              {/* Dropdown Links */}
              {item.sub.length>0 && openDropdown===item.name && (
                <div className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1">
                  {item.sub.map((sub)=>(
                    <button key={sub} className="w-full text-left text- text-gray-500 hover:text-[#1d4ed8] hover:bg-[#f6f7fb] px-3 py-2 rounded-lg transition-colors">
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="border-t p-4">
          <p className="text- font-bold tracking-widest text-gray-400 uppercase">Username</p>
          <button onClick={handleLogout} className="mt-3 w-full flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer">
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

          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="w-full lg:w-[70%] bg-white rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#1d4ed8]"><School size={18}/></div>
                <div><h2 className="font-bold text-">{tr.registered}</h2><p className="text-sm text-gray-500">6 {tr.classes}</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classList.map((c) => (
                  <div key={c.form} className="bg-[#f6f7fb] rounded-xl p-4">
                    <p className="font-bold text-[#1d4ed8]">{c.form}</p>
                    <p className="text-sm mt-2 text-gray-700"><span className="font-black text-[#1d4ed8]">{c.students}</span> {tr.studentsW}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-[30%] bg-white rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="relative">
                  <button onClick={()=>setShowPicker(!showPicker)} className="text-sm font-bold capitalize text-[#1d4ed8] flex items-center gap-1 hover:bg-[#f6f7fb] px-2 py-1 rounded-lg transition-colors cursor-pointer">
                    {viewDate.toLocaleString(lang==='sw'?'sw-TZ':'en-US',{month:'long',year:'numeric'})} <ChevronDown size={14}/>
                  </button>
                  {showPicker && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50">
                      <div className="flex justify-between items-center mb-3">
                        <button onClick={()=>setViewDate(new Date(year-1, month))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16}/></button>
                        <span className="text-sm font-black">{year}</span>
                        <button onClick={()=>setViewDate(new Date(year+1, month))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {monthNames.map((m,i)=>(
                          <button key={m} onClick={()=>{setViewDate(new Date(year, i)); setShowPicker(false)}} className={`text- py-2 rounded-lg font-medium ${i===month?"bg-[#1d4ed8] text-white":"hover:bg-gray-100 text-gray-700"}`}>
                            {m.slice(0,3)}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={()=>{setViewDate(new Date()); setShowPicker(false)}} className="flex-1 text-xs bg-[#1d4ed8] text-white py-1.5 rounded-lg font-bold">Today</button>
                        <button onClick={()=>setShowPicker(false)} className="flex-1 text-xs bg-gray-100 py-1.5 rounded-lg">Close</button>
                      </div>
                    </div>
                  )}
                  <p className="text- text-gray-500 mt-1 px-2">{now.toLocaleDateString(lang==='sw'?'sw-TZ':'en-US', { weekday: 'long' })} • {now.toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>setViewDate(new Date(year, month-1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"><ChevronLeft size={14}/></button>
                  <button onClick={()=>setViewDate(new Date(year, month+1))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"><ChevronRight size={14}/></button>
                </div>
              </div>
              <div className="bg-[#f6f7fb] rounded-xl p-3 flex-1">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["S","M","T","W","T","F","S"].map((d,i)=><div key={`h-${i}`} className="text- text-gray-400 font-bold py-1">{d}</div>)}
                  {Array.from({length:firstDay}).map((_,i)=><div key={`e-${i}`}></div>)}
                  {Array.from({length:daysInMonth}).map((_,i)=>{
                    const day = i+1
                    const isToday = day===now.getDate() && month===now.getMonth() && year===now.getFullYear()
                    return (
                      <div key={`d-${day}`} className="flex justify-center py-0.5">
                        <div className={`w-7 h-7 flex items-center justify-center text- rounded-full ${isToday?"bg-gray-300 text-gray-900 font-black":"text-gray-700 hover:bg-white"}`}>
                          {day}
                        </div>
                      </div>
                    )
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