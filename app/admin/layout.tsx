"use client"
import { useState, useEffect, createContext, useMemo, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, Globe, ChevronDown, Menu, X, LucideIcon } from "lucide-react"

export const LangContext = createContext<'sw' | 'en'>('sw')
const INACTIVITY_LIMIT = 5 * 60 * 1000

type SubItem = { label: string; href: string }
type MenuItem = { name: string; icon: LucideIcon; href: string; sub: SubItem[] }

const menu: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin", sub: [] },
  { name: "Users", icon: Users, href: "/admin/users", sub: [
    { label: "Manage Admin", href: "/admin/users/admin" },
    { label: "Manage Teachers", href: "/admin/users/teachers" },
    { label: "Manage Students", href: "/admin/users/students" },
    { label: "Manage Parents", href: "/admin/users/parents" },
  ]},
  { name: "Academics", icon: GraduationCap, href: "/admin/academics", sub: [
    { label: "Manage Classes", href: "/admin/academics/classes" },
    { label: "Manage Materials", href: "/admin/academics/materials" },
    { label: "Manage Timetable", href: "/admin/academics/timetable" },
    { label: "Manage Attendance", href: "/admin/academics/attendance" },
    { label: "Manage Assessment", href: "/admin/academics/assessment" },
  ]},
  { name: "Reports", icon: BarChart3, href: "/admin/reports", sub: [
    { label: "Manage reports", href: "/admin/reports/reports" },
    { label: "Chartroom", href: "/admin/reports/chartroom" },
  ]},
  { name: "Events", icon: Calendar, href: "/admin/events", sub: [
    { label: "Manage Announcement", href: "/admin/events/announcement" },
    { label: "School Calendar", href: "/admin/events/calendar" },
  ]},
  { name: "Settings", icon: Settings, href: "/admin/settings", sub: [
    { label: "Change Password", href: "/admin/settings/change-password" },
    { label: "Reset Password", href: "/admin/settings/reset-password" },
  ]},
]

interface SidebarContentProps {
  pathname: string
  openDropdown: string | null
  setOpenDropdown: (v: string | null) => void
  setMobileOpen: (v: boolean) => void
  handleLogout: () => void
  onClose?: () => void
  router: ReturnType<typeof useRouter>
}

function SidebarContent({ pathname, openDropdown, setOpenDropdown, setMobileOpen, handleLogout, onClose, router }: SidebarContentProps) {
  const autoOpen = useMemo(() => menu.find(m => pathname.startsWith(m.href) && m.href!== "/admin")?.name?? null, [pathname])
  const isMainOpen = (name: string) => {
    if (openDropdown === "CLOSED") return false
    if (openDropdown!== null) return openDropdown === name
    return autoOpen === name
  }
  return (
    <>
      <div className="px-5 py-5 flex items-center justify-between font-black text- bg-[#1d4ed8] text-white">
        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><Calculator size={18} className="text-[#1d4ed8]" /></div>Mwalimu Math</div>
        {onClose && <button onClick={onClose}><X size={18}/></button>}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isMainActive = pathname === item.href || pathname.startsWith(item.href + "/") || item.sub.some(s => pathname === s.href)
          const open = isMainOpen(item.name)
          return (
            <div key={item.name}>
              <button onClick={()=> { if(item.sub.length>0){ setOpenDropdown(open? "CLOSED" : item.name) }else{ router.push(item.href); setMobileOpen(false) } }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${isMainActive? "bg-[#dbeafe] text-[#1d4ed8]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="flex items-center gap-3"><item.icon size={18} /> {item.name}</span>{item.sub.length>0 && <ChevronDown size={14} className={`${open? "rotate-180" : ""}`} />}
              </button>
              {item.sub.length>0 && open && (
                <div className="mt-1 ml-3 pl-3 border-l space-y-1">
                  {item.sub.map((sub) => <button key={sub.href} onClick={()=> {router.push(sub.href); setMobileOpen(false)}} className={`w-full text-left text- px-3 py-2 rounded-lg ${pathname === sub.href? "bg-[#eef2ff] text-[#1d4ed8]" : "text-gray-500"}`}>{sub.label}</button>)}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="border-t p-4"><button onClick={handleLogout} className="w-full flex gap-2 text-sm text-red-600"><LogOut size={16}/> Sign Out</button></div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("mwalimu_admin_authed")
    localStorage.removeItem("mwalimu_admin_role")
    localStorage.removeItem("mwalimu_admin_id")
    localStorage.removeItem("mwalimu_admin_last_activity")
    await supabase.auth.signOut()
    router.replace("/admin/login")
  }, [router])

  useEffect(() => {
    if (isLoginPage) return
    const authed = localStorage.getItem("mwalimu_admin_authed") === "true"
    if (!authed) router.replace("/admin/login")
  }, [isLoginPage, router])

  useEffect(() => {
    if (isLoginPage) return
    const update = () => localStorage.setItem("mwalimu_admin_last_activity", String(Date.now()))
    const evts = ["mousemove","keydown","click","scroll"] as const
    evts.forEach(e => window.addEventListener(e, update))
    update()
    const id = setInterval(() => {
      const last = Number(localStorage.getItem("mwalimu_admin_last_activity") || "0")
      if (Date.now() - last > INACTIVITY_LIMIT) handleLogout()
    }, 30000)
    return () => { evts.forEach(e => window.removeEventListener(e, update)); clearInterval(id) }
  }, [isLoginPage, handleLogout])

  if (isLoginPage) return <>{children}</>

  return (
    <LangContext.Provider value={lang}>
      <div className="h-screen flex bg-[#f6f7fb] overflow-hidden">
        <aside className="w-60 bg-white border-r hidden md:flex flex-col"><SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} router={router} /></aside>
        {mobileOpen && <div className="fixed inset-0 z-50 md:hidden flex"><div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)}></div><aside className="relative w-72 bg-white h-full flex flex-col"><SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} onClose={()=>setMobileOpen(false)} router={router} /></aside></div>}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[#1d4ed8] text-white px-6 py-4 flex justify-between"><div className="flex items-center gap-3"><button onClick={()=>setMobileOpen(true)} className="md:hidden w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Menu size={20}/></button><h1 className="font-bold capitalize">{pathname.split("/").pop() || "Dashboard"}</h1></div><button onClick={()=>setLang(lang==='sw'?'en':'sw')} className="border border-white/30 bg-white/10 rounded-full px-3 py-1.5 text-xs font-bold flex gap-1 items-center"><Globe size={14}/> {lang.toUpperCase()}</button></header>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </LangContext.Provider>
  )
}