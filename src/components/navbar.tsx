"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, TrendingUp, Bell, Settings, Menu, X, Crosshair, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/deals", label: "Deals", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, isLoading } = useUser()
  const isPro = profile?.tier === "pro"

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Crosshair className="w-5 h-5 text-green-500 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold text-lg text-zinc-100">
            Skin<span className="text-green-500">Scope</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-800 text-green-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-mono hidden sm:inline-flex",
              isPro
                ? "border-green-500/30 text-green-400 bg-green-500/10"
                : "border-zinc-700 text-zinc-500"
            )}
          >
            {isPro ? "PRO" : "FREE — 60s delay"}
          </Badge>
          {!isLoading && (
            user ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 border-zinc-700 text-zinc-400 hover:text-zinc-100"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="text-xs h-8 border-zinc-700 text-zinc-400 hover:text-zinc-100" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )
          )}
          <button
            className="md:hidden text-zinc-400 hover:text-zinc-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800/50 bg-[#0a0a0a] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                  active ? "bg-zinc-800 text-green-400" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
          {user && (
            <button
              onClick={() => { setMobileOpen(false); handleSignOut() }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
