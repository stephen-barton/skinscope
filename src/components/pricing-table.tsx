"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic price comparison",
    features: [
      { text: "Price comparison across 3 platforms", included: true },
      { text: "Deal score on all items", included: true },
      { text: "60-second data delay", included: true },
      { text: "3 price alerts", included: true },
      { text: "Real-time data", included: false },
      { text: "Unlimited alerts", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$8",
    period: "/mo",
    description: "Real-time data and unlimited alerts for serious traders",
    features: [
      { text: "Price comparison across 3 platforms", included: true },
      { text: "Deal score on all items", included: true },
      { text: "Real-time data (no delay)", included: true },
      { text: "Unlimited price alerts", included: true },
      { text: "Real-time WebSocket feed", included: true },
      { text: "API access (1000 req/day)", included: true },
      { text: "Priority support", included: true },
      { text: "Early access to new features", included: true },
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
]

export function PricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={cn(
            "relative p-6 bg-[#141414] border-zinc-800/50",
            plan.popular && "border-green-500/30 glow-green"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-black text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
          )}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-100">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mt-0.5">{plan.description}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-100">{plan.price}</span>
              <span className="text-zinc-500">{plan.period}</span>
            </div>
            <Button
              className={cn(
                "w-full",
                plan.popular
                  ? "bg-green-500 hover:bg-green-600 text-black font-bold"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              )}
            >
              {plan.cta}
            </Button>
            <div className="space-y-2 pt-2">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-zinc-600 shrink-0" />
                  )}
                  <span className={f.included ? "text-zinc-300" : "text-zinc-600"}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
