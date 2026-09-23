"use client"
import { useState, useEffect, createContext, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, Globe, ChevronDown, Menu, X, LucideIcon } from "lucide-react"

export const LangContext = createContext<'sw' | 'en'>('sw')

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

interface SidebarProps {
  pathname: string
  openDropdown: string | null
  setOpenDropdown: (v: string | null) => void
  setMobileOpen: (v: boolean) => void
  handleLogout: () => void
  onClose?: () => void
  router: ReturnType<typeof useRouter>
}

function SidebarContent({ pathname, openDropdown, setOpenDropdown, setMobileOpen, handleLogout, onClose, router }: SidebarProps) {
  const autoOpen = useMemo(() => {
    const found = menu.find(m => pathname.startsWith(m.href) && m.href!== "/admin")
    return found?.name?? null
  }, [pathname])

  const isMainOpen = (name: string) => {
    if (openDropdown === "CLOSED") return false
    if (openDropdown!== null) return openDropdown === name
    return autoOpen === name
  }

  return (
    <>
      <div className="px-5 py-5 flex items-center justify-between font-black text- bg-[#1d4ed8] text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white border border-blue-200 rounded-lg flex items-center justify-center">
            <Calculator size={18} className="text-[#1d4ed8]" />
          </div>
          Mwalimu Math
        </div>
        {onClose && <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-white/20"><X size={18}/></button>}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isMainActive = pathname === item.href || pathname.startsWith(item.href + "/") || item.sub.some(s=> pathname === s.href)
          const open = isMainOpen(item.name)
          return (
            <div key={item.name}>
              <button
                onClick={()=> {
                  if(item.sub.length>0){
                    if(open) setOpenDropdown("CLOSED")
                    else setOpenDropdown(item.name)
                    // USIFANYE router.push hapa
                  }else{
                    router.push(item.href)
                    setMobileOpen(false)
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isMainActive? "bg-[#dbeafe] text-[#1d4ed8]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className="flex items-center gap-3"><item.icon size={18} /> {item.name}</span>
                {item.sub.length>0 && <ChevronDown size={14} className={`transition-transform ${open? "rotate-180" : ""}`} />}
              </button>
              {item.sub.length>0 && open && (
                <div className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1">
                  {item.sub.map((sub)=>{
                    const isSubActive = pathname === sub.href
                    return (
                      <button key={sub.href} onClick={()=> {router.push(sub.href); setMobileOpen(false)}}
                        className={`w-full text-left text- px-3 py-2 rounded-lg transition-colors ${isSubActive? "bg-[#eef2ff] text-[#1d4ed8] font-semibold" : "text-gray-500 hover:text-[#1d4ed8] hover:bg-[#f6f7fb]"}`}>
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text- font-bold tracking-widest text-gray-400 uppercase">Username</p>
        <button onClick={handleLogout} className="mt-3 w-full flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg cursor-pointer">
          <LogOut size={16}/> Sign Out
        </button>
      </div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const getPageInfo = () => {
    if (pathname === "/admin") return { title: "Dashboard", breadcrumb: ["Dashboard"] }
    for (const item of menu) {
      if (item.href === pathname) return { title: item.name, breadcrumb: ["Dashboard", item.name] }
      for (const sub of item.sub) {
        if (sub.href === pathname) return { title: item.name, breadcrumb: ["Dashboard", item.name, sub.label] }
      }
    }
    return { title: "Dashboard", breadcrumb: ["Dashboard"] }
  }
  const { title, breadcrumb } = getPageInfo()

  if (!authed) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Inapakia...</div>

  return (
    <LangContext.Provider value={lang}>
      <div className="h-screen bg-[#f6f7fb] flex overflow-hidden">
        <aside className="w-60 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
          <SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} router={router} />
        </aside>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)}></div>
            <aside className="relative w-72 bg-white h-full flex flex-col shadow-xl">
              <SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} onClose={()=>setMobileOpen(false)} router={router} />
            </aside>
          </div>
        )}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[#1d4ed8] text-white px-4 md:px-6 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={()=>setMobileOpen(true)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/10"><Menu size={20}/></button>
              <h1 className="font-bold text- md:text-xl">{title}</h1>
            </div>
            <button onClick={()=>setLang(lang==='sw'?'en':'sw')} className="flex items-center gap-1.5 border border-white/30 bg-white/10 rounded-full px-3 py-1.5 text-xs font-bold">
              <Globe size={14}/> {lang.toUpperCase()}
            </button>
          </header>
          <div className="bg-white border-b px-6 py-2.5 flex justify-end">
            <p className="text- text-gray-500 tracking-wide">{breadcrumb.join(" / ")}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </LangContext.Provider>
  )
}