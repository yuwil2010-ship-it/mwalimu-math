"use client"
import { useState, useEffect, useMemo, useCallback, createContext, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Users, GraduationCap, LayoutDashboard, Calendar, Settings, BarChart3, LogOut, Calculator, ChevronDown, Menu, X, Globe, User, type LucideIcon } from "lucide-react"

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
  { name: "Reports", icon: BarChart3, href: "/admin/reports", sub: [
    { label: "Manage Reports", href: "/admin/reports/manage" },
    { label: "Chartroom", href: "/admin/reports/chartroom" },
  ]},
  { name: "Events", icon: Calendar, href: "/admin/events", sub: [
    { label: "Manage Calendar", href: "/admin/events/calendar" },
    { label: "Announcements", href: "/admin/events/announcements" },
  ]},
  { name: "Settings", icon: Settings, href: "/admin/settings", sub: [
    { label: "Change Password", href: "/admin/settings/change-password" },
    { label: "Reset Password", href: "/admin/settings/reset-password" },
  ]},
]

function SidebarContent({ pathname, openDropdown, setOpenDropdown, setMobileOpen, handleLogout, onClose, router, userRole }: { pathname: string; openDropdown: string | null; setOpenDropdown: (v: string | null) => void; setMobileOpen: (v: boolean) => void; handleLogout: () => void; onClose?: () => void; router: Router; userRole: string }) {
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
      <div className="border-t p-4 space-y-3">
        <div className="px-2 py-2 bg-[#f6f7fb] rounded-lg">
          <p className="text- text-gray-500 uppercase tracking-wide">Role</p>
          <p className="text-sm font-bold text-[#1d4ed8] capitalize">{userRole || "super admin"}</p>
        </div>
        <button onClick={handleLogout} className="w-full flex gap-2 text-sm text-red-600 hover:bg-red-50 px-2 py-2 rounded-lg"><LogOut size={16}/> Sign Out</button>
      </div>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState<'sw' | 'en'>('sw')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userInfo, setUserInfo] = useState({ name: "Admin", role: "super admin", email: "" })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenDropdown(null)
    setUserMenuOpen(false)
  },[pathname])

   useEffect(()=>{
    const name = localStorage.getItem("mwalimu_admin_name") || localStorage.getItem("mwalimu_admin_email") || "Admin"
    const role = localStorage.getItem("mwalimu_admin_role") || "super admin"
    const email = localStorage.getItem("mwalimu_admin_email") || ""
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserInfo({ name, role, email })
  },[pathname])

  useEffect(()=>{
    const checkAuth = () => {
      const authed = localStorage.getItem("mwalimu_admin_authed") === "true"
      if (pathname === "/admin/login") {
        if (authed) router.replace("/admin")
        else setCheckingAuth(false)
        return
      }
      if (!authed) router.replace("/admin/login")
      else setCheckingAuth(false)
    }
    checkAuth()
    const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) checkAuth() }
    window.addEventListener('pageshow', handlePageShow)
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current &&!userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  },[pathname, router])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("mwalimu_admin_authed")
    localStorage.removeItem("mwalimu_admin_role")
    localStorage.removeItem("mwalimu_admin_id")
    localStorage.removeItem("mwalimu_admin_name")
    localStorage.removeItem("mwalimu_admin_email")
    localStorage.removeItem("mwalimu_admin_last_activity")
    window.location.replace("/admin/login")
  }, [])

  if (pathname === "/admin/login") {
    if (checkingAuth) {
      return (
        <div className="h-screen flex items-center justify-center bg-[#f6f7fb]">
          <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }
    return <>{children}</>
  }

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f7fb]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Inathibitisha...</p>
        </div>
      </div>
    )
  }

  return (
    <LangContext.Provider value={lang}>
      <div className="h-screen flex bg-[#f6f7fb] overflow-hidden">
        <aside className="w-60 bg-white border-r hidden md:flex flex-col"><SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} router={router} userRole={userInfo.role} /></aside>
        {mobileOpen && <div className="fixed inset-0 z-50 md:hidden flex"><div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)}></div><aside className="relative w-72 bg-white h-full flex flex-col"><SidebarContent pathname={pathname} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} setMobileOpen={setMobileOpen} handleLogout={handleLogout} onClose={()=>setMobileOpen(false)} router={router} userRole={userInfo.role} /></aside></div>}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[#1d4ed8] text-white px-4 md:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={()=>setMobileOpen(true)} className="md:hidden w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center"><Menu size={20}/></button>
              <h1 className="font-black text-base md:text-lg tracking-wide">Admin</h1>
            </div>

            <button onClick={()=> setLang(p=> p==='sw'? 'en' : 'sw')} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold">
              <Globe size={14}/> {lang==='sw'? 'SW' : 'EN'}
            </button>

            <div className="relative" ref={userMenuRef}>
              <button onClick={()=>setUserMenuOpen(v=>!v)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 pl-2 pr-3 py-1.5 rounded-full transition">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#1d4ed8]"><User size={14}/></div>
                <span className="text-sm font-semibold hidden sm:block max-w- truncate">{userInfo.name}</span>
                <ChevronDown size={14} className={`${userMenuOpen? "rotate-180" : ""} transition`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center text-[#1d4ed8]"><User size={20}/></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{userInfo.name}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{userInfo.role}</p>
                    </div>
                  </div>
                  <div className="border-t p-2">
                    <button onClick={()=>{setUserMenuOpen(false); router.push("/admin/settings")}} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Settings size={16}/> Profile
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      <LogOut size={16}/> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </LangContext.Provider>
  )
}