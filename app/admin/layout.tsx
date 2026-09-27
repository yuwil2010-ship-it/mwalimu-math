"use client"
import { useState, useEffect, useMemo, useCallback, createContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Users, GraduationCap, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, ChevronDown, Menu, X, Globe, type LucideIcon } from "lucide-react"

type SubItem = { label: string; href: string }
type MenuItem = { name: string; icon: LucideIcon; href: string; sub: SubItem[] }
type Router = { push: (href: string) => void; replace: (href: string) => void }

export const LangContext = createContext<'sw' | 'en'>('sw')

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
    { label: "Manage Periods", href: "/admin/academics/periods" },
    { label: "Manage Attendance", href: "/admin/academics/attendance" },
    { label: "Manage Assessments", href: "/admin/academics/assessments" },
  ]},
  { name: "Reports", icon: BarChart3, href: "/admin/reports", sub: [] },
  { name: "Events", icon: Calendar, href: "/admin/events", sub: [] },
  { name: "Settings", icon: Settings, href: "/admin/settings", sub: [] },
]

function SidebarContent({ pathname, openDropdown, setOpenDropdown, setMobileOpen, handleLogout, onClose, router }: { pathname: string; openDropdown: string | null; setOpenDropdown: (v: string | null) => void; setMobileOpen: (v: boolean) => void; handleLogout: () => void; onClose?: () => void; router: Router }) {
  const autoOpen = useMemo(() => menu.find(m => pathname.startsWith(m.href) && m.href!== "/admin")?.name?? null, [pathname])
  const isMainOpen = (name: string) => {
    if (openDropdown === "CLOSED") return false
    if (openDropdown!== null) return openDropdown === name
    return autoOpen === name
  }
  return (
    <>
      <div className="px-5 py-5 flex items-center justify-between font-black text-base bg-[#1d4ed8] text-white">
        <div className="flex items-center gap-2"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><Calculator size={18} className="text-[#1d4ed8]" /></div>Mwalimu Math</div>
        {onClose && <button onClick={onClose}><X size={18}/></button>}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const isMainActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const open = isMainOpen(item.name)
          return (
            <div key={item.name}>
              <button onClick={()=> { if(item.sub.length>0){ if(open){ setOpenDropdown("CLOSED") } else { setOpenDropdown(item.name) } }else{ setOpenDropdown(null); router.push(item.href); setMobileOpen(false) } }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm ${isMainActive? "bg-[#dbeafe] text-[#1d4ed8]" : "text-gray-600 hover:bg-gray-50"}`}>
                <span className="flex items-center gap-3"><item.icon size={18} /> {item.name}</span>
                {item.sub.length>0 && <ChevronDown size={14} className={`${open? "rotate-180" : ""} transition`} />}
              </button>
              {item.sub.length>0 && open && (
                <div className="mt-1 ml-3 pl-3 border-l space-y-1">
                  {item.sub.map((sub) => <button key={sub.href} onClick={()=> { router.push(sub.href); setMobileOpen(false) }} className={`w-full text-left text-xs px-3 py-2 rounded-lg ${pathname === sub.href? "bg-[#eef2ff] text-[#1d4ed8] font-bold" : "text-gray-500 hover:text-[#1d4ed8]"}`}>{sub.label}</button>)}
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState<'sw' | 'en'>('sw')

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenDropdown(null)
  },[pathname])

  const handleLogout = useCallback(async () => { localStorage.clear(); await supabase.auth.signOut(); router.replace("/admin/login") }, [router])

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <LangContext.Provider value={lang}>
      <div className="h-screen flex bg-[#f6f7fb] overflow-hidden">
        <aside className="w-60 bg-white border-r hidden md:flex flex-col"><SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} router={router} /></aside>
        {mobileOpen && <div className="fixed inset-0 z-50 md:hidden flex"><div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)}></div><aside className="relative w-72 bg-white h-full flex flex-col"><SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} onClose={()=>setMobileOpen(false)} router={router} /></aside></div>}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[#1d4ed8] text-white px-6 py-3 flex items-center justify-between">
            <button onClick={()=>setMobileOpen(true)} className="md:hidden w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Menu size={20}/></button>
            <div className="hidden md:block text-sm font-bold opacity-0">.</div>
            <button onClick={()=> setLang(p=> p==='sw'? 'en' : 'sw')} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold ml-auto">
              <Globe size={14}/> {lang==='sw'? 'SW' : 'EN'}
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </LangContext.Provider>
  )
}