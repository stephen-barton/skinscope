"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PricingTable } from "@/components/pricing-table"
import { Footer } from "@/components/footer"
import { Crosshair, Search, TrendingUp, Bell, Code, ArrowRight, ExternalLink } from "lucide-react"

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  return <span className="tabular-nums">{count.toLocaleString()}</span>
}

const features = [
  { icon: Search, title: "Price Comparison", desc: "Compare prices across Steam, CSFloat, and Skinport in one view" },
  { icon: TrendingUp, title: "Deal Scoring", desc: "AI-powered deal scores help you find underpriced skins instantly" },
  { icon: Bell, title: "Price Alerts", desc: "Get notified when your target skin drops below your price" },
  { icon: Code, title: "API Access", desc: "Build your own tools with our developer-friendly REST API" },
]

const demoSkin = {
  name: "AK-47 | Asiimov",
  wear: "Field-Tested",
  imageUrl: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UXnkJ5lZjP1qKXMxIi_ChOBel8-f0uldL6GOAk6V0ktDfbZ-JY_darPYDoE0joxPehCWJ_yAMeLXxft0ElRUKwpot7HxfP9e_tHKKT_9OoOO09oGIqPH2J6nUklRc7cF4n-T--YXygED6_UM6ZW2hIYCRIAU9aFzR_FG7w-jng5_u7p_Ln3Rk6HMi-z-DyIFOZ-bT/200x150",
  prices: [
    { platform: "Steam", price: 35.99 },
    { platform: "CSFloat", price: 31.50 },
    { platform: "Skinport", price: 32.20 },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-green-500" />
            <span className="font-bold text-lg">Skin<span className="text-green-500">Scope</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/search" className="text-sm text-zinc-400 hover:text-zinc-200 hidden sm:inline">Search</Link>
            <Link href="/deals" className="text-sm text-zinc-400 hover:text-zinc-200 hidden sm:inline">Deals</Link>
            <Button size="sm" asChild className="bg-green-500 hover:bg-green-600 text-black font-bold h-8">
              <Link href="/search">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.08),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4 py-24 md:py-36 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live price tracking
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
            Find the Best CS2 Skin
            <br />
            <span className="text-green-500">Deals Instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-4">
            Compare prices across Steam, CSFloat, and Skinport. Score deals. Set alerts. Save money.
          </p>
          <p className="text-2xl md:text-3xl font-bold text-zinc-300 mb-8 animate-counter-up">
            Tracking <span className="text-green-400"><AnimatedCounter target={147832} /></span> skins across <span className="text-green-400">3</span> platforms
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="bg-green-500 hover:bg-green-600 text-black font-bold text-base px-8 glow-green">
              <Link href="/search">Start Searching <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-base px-8">
              <Link href="/deals">View Deals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Everything you need to <span className="text-green-500">trade smarter</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title} className="p-5 bg-[#141414] border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-1">{f.title}</h3>
                <p className="text-sm text-zinc-500">{f.desc}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Demo */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          See prices <span className="text-green-500">side by side</span>
        </h2>
        <Card className="p-6 bg-[#141414] border-zinc-800/50">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-48 h-36 bg-zinc-900/50 rounded-lg flex items-center justify-center p-4">
              <img src={demoSkin.imageUrl} alt={demoSkin.name} className="h-full w-auto object-contain" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{demoSkin.name}</h3>
                <p className="text-sm text-zinc-500">{demoSkin.wear}</p>
              </div>
              <div className="space-y-2">
                {demoSkin.prices.map((p) => {
                  const isLowest = p.price === Math.min(...demoSkin.prices.map((x) => x.price))
                  return (
                    <div key={p.platform} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/50">
                      <span className="text-sm text-zinc-400">{p.platform}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${isLowest ? "text-green-400" : "text-zinc-300"}`}>
                          ${p.price.toFixed(2)}
                        </span>
                        {isLowest && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                            BEST
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-green-400 font-medium">
                Save ${(Math.max(...demoSkin.prices.map((x) => x.price)) - Math.min(...demoSkin.prices.map((x) => x.price))).toFixed(2)} buying on CSFloat
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Simple pricing</h2>
        <p className="text-center text-zinc-500 mb-12">Start free, upgrade when you need real-time data</p>
        <PricingTable />
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to find better deals?</h2>
        <p className="text-zinc-500 mb-8">Join thousands of CS2 traders saving money with SkinScope.</p>
        <Button size="lg" asChild className="bg-green-500 hover:bg-green-600 text-black font-bold text-base px-8 glow-green">
          <Link href="/search">Start Searching — It&apos;s Free <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </Button>
      </section>

      <Footer />
    </div>
  )
}
