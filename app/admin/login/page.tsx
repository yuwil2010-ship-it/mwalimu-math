"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { User, Lock, ArrowLeft, Calculator } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    if ((email.toLowerCase() === "admin" && password === "admin123") || (email.toLowerCase() === "mwalimu" && password === "mwalimu2026")) {
      localStorage.setItem("mwalimu_admin_authed", "true")
      router.push("/admin")
      return
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/admin")
    } catch (err: unknown) {
      setMsg(err instanceof Error? err.message : "Kosa limetokea")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/admin` } })
    if (error) setMsg(error.message)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 font-black text-xl text-[#1d4ed8] mb-6">
        <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center"><Calculator size={20} className="text-white"/></div>Mwalimu Math
      </div>
      <div className="w-full max-w-sm mx-auto border border-gray-200 rounded-xl p-5 bg-white shadow-sm" style={{ maxWidth: '380px' }}>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div><label className="text-sm font-semibold">Username</label><div className="relative mt-1.5"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="username" className="w-full pl-10 pr-3 py-2.5 border border-[#4F5AAE] rounded-lg text-sm outline-none"/></div></div>
          <div><label className="text-sm font-semibold">Password</label><div className="relative mt-1.5"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="********" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"/></div></div>
          {msg && <div className="text-xs p-2.5 rounded-lg bg-gray-50 border">{msg}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#4F5AAE] text-white py-2.5 rounded-lg font-semibold text-sm">{loading?"...":"Log in"}</button>
        </form>
        <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-gray-200"></div><span className="text-xs text-gray-500">OR</span><div className="flex-1 h-px bg-gray-200"></div></div>
        <button onClick={handleGoogle} className="w-full border border-gray-200 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"><span className="w-5 h-5 rounded-full border flex items-center justify-center text- font-black text-blue-600">G</span>Continue with Google</button>
      </div>
      <p className="text-xs text-gray-500 mt-4">Test: <b>admin / admin123</b></p>
      <Link href="/" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#4F5AAE]"><ArrowLeft size={14}/> Back</Link>
    </div>
  )
}