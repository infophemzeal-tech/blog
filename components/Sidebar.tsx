"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeTopic: string
  onTopicChange: (slug: string) => void
}

type StaffPick = {
  id: number
  publication: string
  author: string
  title: string
  date: string
}

type TopicCategory = {
  id: number
  name: string
  topics: { id: number; name: string }[]
}

type Person = {
  id: number
  name: string
  initial: string
  bio: string
}

// ─── Helper Logic ─────────────────────────────────────────────────────────────

const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, "-")

// ─── Staff Picks ──────────────────────────────────────────────────────────────

function StaffPicks() {
  const [picks, setPicks] = useState<StaffPick[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPicks() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("staff_picks")
        .select("id, publication, author, title, date")
        .order("id", { ascending: true })
        .limit(3)
      if (error) console.error("StaffPicks error:", error)
      else setPicks(data || [])
      setLoading(false)
    }
    fetchPicks()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">Staff Picks</h3>
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        picks.map((pick) => (
          <div key={pick.id} className="flex flex-col gap-1 cursor-pointer group">
            <p className="text-xs text-stone-400 dark:text-stone-500">
              In <span className="text-stone-600 dark:text-stone-400">{pick.publication}</span>{" "}
              by {pick.author}
            </p>
            <p className="font-serif text-sm font-medium text-stone-900 dark:text-white leading-snug group-hover:underline">
              {pick.title}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{pick.date}</p>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Recommended Topics ───────────────────────────────────────────────────────

function RecommendedTopics({ activeTopic, onTopicChange }: SidebarProps) {
  const [categories, setCategories] = useState<TopicCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopics() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("topic_categories")
        .select("id, name, topics(id, name)")
        .order("id", { ascending: true })
      if (error) console.error("RecommendedTopics error:", error)
      else setCategories((data as TopicCategory[]) || [])
      setLoading(false)
    }
    fetchTopics()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">Recommended topics</h3>
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-16 bg-stone-100 dark:bg-stone-800 animate-pulse rounded-full" />
          ))}
        </div>
      ) : (
        categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              {category.name}:
            </p>
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              {(category.topics || []).map((topic, index) => {
                const topicSlug = slugify(topic.name)
                const isActive = activeTopic === topicSlug

                return (
                  <span key={topic.id} className="text-sm">
                    <button
                      onClick={() => onTopicChange(topicSlug)}
                      className={`transition-colors cursor-pointer text-left ${
                        isActive
                          ? "text-green-600 font-bold underline underline-offset-4"
                          : "text-stone-500 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400"
                      }`}
                    >
                      {topic.name}
                    </button>
                    {index < (category.topics || []).length - 1 && (
                      <span className="text-stone-300 dark:text-stone-600">, </span>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Who To Follow ────────────────────────────────────────────────────────────

function WhoToFollow() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPeople() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, bio, full_name") // Include full_name as fallback
        .limit(3)
      if (error) {
        console.error("WhoToFollow error:", error)
      } else {
        setPeople(
          (data || []).map((p) => ({
            ...p,
            id: p.id,
            name: p.name || p.full_name || "Writer",
            initial: (p.name || p.full_name || "?")[0].toUpperCase(),
            bio: p.bio || "Storyteller on GistPadi",
          }))
        )
      }
      setLoading(false)
    }
    fetchPeople()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">Who to follow</h3>
      {loading ? (
         <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded-full" />
          ))}
        </div>
      ) : (
        people.map((person) => (
          <div key={person.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-sm font-medium shrink-0 shadow-sm">
                {person.initial}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{person.name}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">{person.bio}</p>
              </div>
            </div>
            <button className="shrink-0 px-4 py-1.5 rounded-full border border-stone-900 dark:border-stone-400 text-[12px] font-bold text-stone-900 dark:text-stone-300 hover:bg-stone-900 dark:hover:bg-stone-700 hover:text-white transition-colors cursor-pointer">
              Follow
            </button>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Footer Links (Pro Static Version) ──────────────────────────────────────

function FooterLinks() {
  const links = [
    { label: "Help", href: "/about" },
    { label: "Status", href: "#" },
    { label: "About", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="text-xs text-stone-400 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-400 transition-colors font-sans"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-stone-300 dark:text-stone-700 font-sans uppercase tracking-widest font-medium">
        © {new Date().getFullYear()} GistPadi
      </p>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ activeTopic, onTopicChange }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-8 sticky top-4">
      <StaffPicks />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <RecommendedTopics activeTopic={activeTopic} onTopicChange={onTopicChange} />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <WhoToFollow />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <FooterLinks />
    </aside>
  )
}