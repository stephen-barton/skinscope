"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Crown, Key, Trash2, Copy, Check, Zap, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile } = useUser()
  const isPro = profile?.tier === "pro"
  const [copied, setCopied] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const apiKey = "ss_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-500">Manage your account and subscription</p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="p-6 bg-[#141414] border-zinc-800/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Current Plan</h2>
          <Badge
            variant="outline"
            className={isPro
              ? "border-green-500/30 text-green-400 bg-green-500/10"
              : "border-zinc-700 text-zinc-500"
            }
          >
            {isPro ? "PRO" : "FREE"}
          </Badge>
        </div>

        {isPro ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Crown className="w-4 h-4 text-green-500" />
              <span>Pro Plan — $8/month</span>
            </div>
            <p className="text-sm text-zinc-500">Real-time data, unlimited alerts, API access</p>
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-100">
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">
              Free plan — 60s data delay, 3 alerts max, no API access
            </p>
            <Button className="bg-green-500 hover:bg-green-600 text-black font-bold">
              <Zap className="w-4 h-4 mr-1" /> Upgrade to Pro — $8/mo
            </Button>
          </div>
        )}
      </Card>

      {/* API Key */}
      <Card className="p-6 bg-[#141414] border-zinc-800/50">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-100">API Key</h2>
        </div>

        {isPro ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">Use this key to access the SkinScope API (1000 req/day)</p>
            <div className="flex gap-2">
              <Input
                value={apiKey}
                readOnly
                className="bg-zinc-900/50 border-zinc-800 font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyKey} className="border-zinc-700 shrink-0">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">API access is available on the Pro plan.</p>
            <div className="flex gap-2 items-center">
              <Input
                value="••••••••••••••••••••••••"
                readOnly
                disabled
                className="bg-zinc-900/30 border-zinc-800 font-mono text-sm opacity-50"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Sign Out */}
      {user && (
        <Card className="p-6 bg-[#141414] border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Account</h2>
              <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
            </div>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </Card>
      )}

      <Separator className="bg-zinc-800/50" />

      {/* Danger Zone */}
      <Card className="p-6 bg-[#141414] border-red-500/20">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-1" /> Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-zinc-400">
                Are you sure? This will permanently delete your account, all alerts, and subscription. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="flex-1 border-zinc-700 text-zinc-400">
                  Cancel
                </Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold">
                  Delete Forever
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
