"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Mail, Lock, ArrowLeft } from "lucide-react"

const ALLOWED_ADMINS = ["yuwil2010@gmail.com"]

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [msg, setMsg] = useState("")

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` }
        })
        if (error) throw error
        setMsg("Account imetengenezwa! Angalia email kuthibitisha.")
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user && ALLOWED_ADMINS.length > 0 &&!ALLOWED_ADMINS.includes(data.user.email || "")) {
          await supabase.auth.signOut()
          throw new Error("Email " + (data.user.email || "") + " hairuhusiwi Admin.")
        }
        router.push("/admin")
      }
    } catch (err: unknown) {
      const message = err instanceof Error? err.message : typeof err === "string"? err : "Imetokea kosa"
      setMsg(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` }
    })
    if (error) {
      setMsg(error.message)
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!email) { setMsg("Andika email yako kwanza"); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`
    })
    if (error) setMsg(error.message)
    else setMsg("Link ya kurejesha password imetumwa.")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w- border border-gray-200 rounded- p-8 bg-white shadow-sm">
        <form onSubmit={handleEmailAuth} className="space-y-5">
          <div>
            <label className="text- font-semibold text-gray-900">Email</label>
            <div className="relative mt-2">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 border border-[#4F5AAE] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F5AAE]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text- font-semibold text-gray-900">Password</label>
              <button type="button" onClick={handleForgot} className="text- text-gray-500 hover:text-[#4F5AAE] hover:underline">
                Forgot password?
              </button>
            </div>
            <div className="relative mt-2">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#4F5AAE]/20"
              />
            </div>
          </div>

          {msg && <div className="text-xs p-3 rounded-lg bg-gray-50 border text-gray-700">{msg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F5AAE] hover:bg-[#434a9a] text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
          >
            {loading? "..." : mode === "login"? "Log in" : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-200 bg-white hover:bg-gray-50 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        >
          <span className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text- font-black text-blue-600">G</span>
          Continue with Google
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {mode === "login"? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "login"? "signup" : "login")} className="text-[#4F5AAE] font-semibold hover:underline">
            {mode === "login"? "Create one" : "Log in"}
          </button>
        </p>
        <Link href="/" className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#4F5AAE] font-medium hover:underline">
          <ArrowLeft size={16} /> Back to website
        </Link>
      </div>
    </div>
  )
}