"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Suggestion {
  name: string
  slug: string
  imageUrl?: string
}

interface SearchBarProps {
  onSearch: (query: string) => void
  onSelect?: (item: Suggestion) => void
  placeholder?: string
  className?: string
}

const mockSuggestions: Suggestion[] = [
  { name: "AK-47 | Asiimov (Field-Tested)", slug: "ak-47-asiimov-ft" },
  { name: "AK-47 | Redline (Field-Tested)", slug: "ak-47-redline-ft" },
  { name: "AWP | Dragon Lore (Factory New)", slug: "awp-dragon-lore-fn" },
  { name: "AWP | Asiimov (Field-Tested)", slug: "awp-asiimov-ft" },
  { name: "M4A4 | Howl (Factory New)", slug: "m4a4-howl-fn" },
]

export function SearchBar({ onSearch, onSelect, placeholder = "Search skins...", className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(undefined)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        setSuggestions(await res.json())
      } else {
        setSuggestions(mockSuggestions.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())))
      }
    } catch {
      setSuggestions(mockSuggestions.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, fetchSuggestions])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-10 pr-10 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-green-500/50 focus:ring-green-500/20"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />}
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.slug}
              onClick={() => {
                onSelect?.(s)
                setQuery(s.name)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors flex items-center gap-3"
            >
              {s.imageUrl && <img src={s.imageUrl} className="w-8 h-6 object-contain" alt="" />}
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
