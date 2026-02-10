"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Plus, Trash2, Zap } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"

interface PriceAlert {
  id: string
  itemName: string
  targetPrice: number
  platform: string
  active: boolean
  currentPrice: number
  triggered: boolean
}

const mockAlerts: PriceAlert[] = [
  { id: "1", itemName: "AK-47 | Asiimov (FT)", targetPrice: 30.00, platform: "Any", active: true, currentPrice: 31.50, triggered: false },
  { id: "2", itemName: "AWP | Dragon Lore (FN)", targetPrice: 7500.00, platform: "CSFloat", active: true, currentPrice: 7850.00, triggered: false },
  { id: "3", itemName: "M4A4 | Howl (MW)", targetPrice: 3800.00, platform: "Any", active: false, currentPrice: 3950.00, triggered: false },
]

const platforms = ["Any", "Steam", "CSFloat", "Skinport"]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockAlerts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({ itemName: "", targetPrice: "", platform: "Any" })
  const isPro = false
  const maxFreeAlerts = 3

  const toggleAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a))
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const createAlert = () => {
    if (!newAlert.itemName || !newAlert.targetPrice) return
    const alert: PriceAlert = {
      id: Date.now().toString(),
      itemName: newAlert.itemName,
      targetPrice: parseFloat(newAlert.targetPrice),
      platform: newAlert.platform,
      active: true,
      currentPrice: parseFloat(newAlert.targetPrice) * 1.1,
      triggered: false,
    }
    setAlerts((prev) => [...prev, alert])
    setNewAlert({ itemName: "", targetPrice: "", platform: "Any" })
    setDialogOpen(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Price Alerts</h1>
            <p className="text-sm text-zinc-500">
              {alerts.length}{!isPro && `/${maxFreeAlerts}`} alerts
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-500 hover:bg-green-600 text-black font-bold"
              disabled={!isPro && alerts.length >= maxFreeAlerts}
            >
              <Plus className="w-4 h-4 mr-1" /> New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Create Price Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-zinc-400">Item Name</Label>
                <Input
                  value={newAlert.itemName}
                  onChange={(e) => setNewAlert((p) => ({ ...p, itemName: e.target.value }))}
                  placeholder="AK-47 | Asiimov (Field-Tested)"
                  className="bg-zinc-900/50 border-zinc-800 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Target Price ($)</Label>
                <Input
                  type="number"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert((p) => ({ ...p, targetPrice: e.target.value }))}
                  placeholder="30.00"
                  className="bg-zinc-900/50 border-zinc-800 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Platform</Label>
                <div className="flex gap-2 mt-1">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewAlert((prev) => ({ ...prev, platform: p }))}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-md border",
                        newAlert.platform === p
                          ? "border-green-500/30 text-green-400 bg-green-500/10"
                          : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={createAlert} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pro upsell */}
      {!isPro && (
        <Alert className="bg-green-500/5 border-green-500/20">
          <Zap className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-400/80 text-sm">
            Free plan: {maxFreeAlerts} alerts max with 60s delay.{" "}
            <a href="/settings" className="underline text-green-400 hover:text-green-300 font-medium">
              Upgrade to Pro
            </a>{" "}
            for unlimited real-time alerts.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerts list */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className={cn("p-4 bg-[#141414] border-zinc-800/50", !alert.active && "opacity-50")}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-100 truncate">{alert.itemName}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-zinc-500">
                    Target: <span className="text-green-400 font-mono">{formatPrice(alert.targetPrice)}</span>
                  </span>
                  <span className="text-sm text-zinc-500">
                    Current: <span className="text-zinc-300 font-mono">{formatPrice(alert.currentPrice)}</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">{alert.platform}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={alert.active} onCheckedChange={() => toggleAlert(alert.id)} />
                <button onClick={() => deleteAlert(alert.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No alerts yet. Create one to get notified when prices drop.</p>
          </div>
        )}
      </div>
    </div>
  )
}
