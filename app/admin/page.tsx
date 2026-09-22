"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, BookOpen, Wallet, School, LayoutDashboard, Building2, UsersRound, Book, Briefcase, Calendar, ClipboardList, CreditCard, Trophy, HeartHandshake, LogOut, Calculator, Globe } from "lucide-react"

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, active: true },
  { name: "Departments", icon: Building2 },
  { name: "Classes", icon: School },
  { name: "Subjects", icon: Book },
  { name: "Staffs", icon: Briefcase },
  { name: "Students", icon: UsersRound },
  { name: "Timetable", icon: Calendar },
  { name: "Examinations", icon: ClipboardList },
  { name: "Fees", icon: CreditCard },
  { name: "Extracurricular", icon: Trophy },
  { name: "Parents", icon: HeartHandshake },
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
    <div className="min-h-screen bg-[#f6f7fb] flex">
      <aside className="w- bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 flex items-center gap-2 font-black text- text-[#1d4ed8] border-b">
          <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
            <Calculator size={18} className="text-white" />
          </div>
          Mwalimu Math
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-auto">
          {menu.map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${item.active? "bg-[#4F5AAE] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              <item.icon size={18} /> {item.name}
            </button>
          ))}
        </nav>
        <div className="border-t p-4">
          <p className="text-xs text-gray-600 truncate">yuwil2010@gmail.com</p>
          <button onClick={handleLogout} className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"><LogOut size={16}/> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="font-bold text-xl">Dashboard</h1>
          <button className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs font-bold"><Globe size={14}/> SW</button>
        </header>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border p-5"><div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#4F5AAE]"><Users size={18}/></div><p className="mt-4 text-3xl font-black">60</p><p className="text-xs text-gray-500 font-bold mt-1">STUDENTS</p></div>
            <div className="bg-white rounded-2xl border p-5"><div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#4F5AAE]"><GraduationCap size={18}/></div><p className="mt-4 text-3xl font-black">25</p><p className="text-xs text-gray-500 font-bold mt-1">TEACHERS</p></div>
            <div className="bg-white rounded-2xl border p-5"><div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#4F5AAE]"><BookOpen size={18}/></div><p className="mt-4 text-3xl font-black">12</p><p className="text-xs text-gray-500 font-bold mt-1">SUBJECTS</p></div>
            <div className="bg-white rounded-2xl border p-5"><div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#4F5AAE]"><Wallet size={18}/></div><p className="mt-4 text-3xl font-black">0</p><p className="text-xs text-gray-500 font-bold mt-1">FEES COLLECTED (TSH)</p></div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#eef0ff] flex items-center justify-center text-[#4F5AAE]"><School size={18}/></div>
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
                <div key={c.form} className="border rounded-xl p-4">
                  <p className="font-bold text-[#4F5AAE]">{c.form}</p>
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