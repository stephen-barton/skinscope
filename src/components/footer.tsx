import Link from "next/link"
import { Crosshair } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Crosshair className="w-5 h-5 text-green-500" />
              <span className="font-bold text-lg text-zinc-100">
                Skin<span className="text-green-500">Scope</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500">
              Find the best CS2 skin deals across Steam, CSFloat, and Skinport.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Product</h4>
            <div className="space-y-2">
              {["Search", "Deals", "Alerts", "Pricing"].map((l) => (
                <Link key={l} href={`/${l.toLowerCase()}`} className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Resources</h4>
            <div className="space-y-2">
              {["API Docs", "Blog", "Changelog", "Status"].map((l) => (
                <Link key={l} href="#" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Legal</h4>
            <div className="space-y-2">
              {["Privacy", "Terms", "Contact"].map((l) => (
                <Link key={l} href="#" className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">© 2025 SkinScope. Not affiliated with Valve Corporation.</p>
          <p className="text-xs text-zinc-600">Prices updated in real-time for Pro users.</p>
        </div>
      </div>
    </footer>
  )
}
