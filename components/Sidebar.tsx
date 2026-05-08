"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeTopic: string
}

type StaffPick = {
  id: number
  publication: string
  author: string
  title: string
  slug: string
  date: string
}

type TopicCategory = {
  id: number
  name: string
  topics: { id: number; name: string }[]
}

type Person = {
  id: string
  name: string
  initial: string
  bio: string
}

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-")

// ─── Staff Picks ──────────────────────────────────────────────────────────────

function StaffPicks() {
  const [picks, setPicks] = useState<StaffPick[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function fetchPicks() {
      const { data, error } = await supabase
        .from("staff_picks")
        .select("id, publication, author, title, slug, date")
        .order("id", { ascending: true })
        .limit(3)

      if (error) console.error("[StaffPicks]", error.message)
      else setPicks(data || [])
      setLoading(false)
    }
    fetchPicks()
  }, [supabase])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">
        Staff Picks
      </h3>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : picks.length === 0 ? (
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Nothing here yet.
        </p>
      ) : (
        picks.map((pick) => (
          <Link
            key={pick.id}
            href={pick.slug ? `/article/${pick.slug}` : "#"}
            className="flex flex-col gap-1 group"
          >
            <p className="text-xs text-stone-400 dark:text-stone-500">
              In{" "}
              <span className="text-stone-600 dark:text-stone-400">
                {pick.publication}
              </span>{" "}
              by {pick.author}
            </p>
            <p className="font-serif text-sm font-medium text-stone-900 dark:text-white leading-snug group-hover:underline">
              {pick.title}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              {pick.date}
            </p>
          </Link>
        ))
      )}
    </div>
  )
}

// ─── Recommended Topics ───────────────────────────────────────────────────────

function RecommendedTopics({ activeTopic }: SidebarProps) {
  const [categories, setCategories] = useState<TopicCategory[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function fetchTopics() {
      const { data, error } = await supabase
        .from("topic_categories")
        .select("id, name, topics(id, name)")
        .order("id", { ascending: true })

      if (error) console.error("[RecommendedTopics]", error.message)
      else setCategories((data as TopicCategory[]) || [])
      setLoading(false)
    }
    fetchTopics()
  }, [supabase])

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">
        Recommended topics
      </h3>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 w-16 bg-stone-100 dark:bg-stone-800 animate-pulse rounded-full"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-stone-400 dark:text-stone-500">
          No topics yet.
        </p>
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
                    {/* ✅ SEO FIX: Changed from <button> to <Link> so Google crawls and indexes these hubs */}
                    <Link
                      href={`/topic/${topicSlug}`}
                      className={`transition-colors ${
                        isActive
                          ? "text-green-600 font-bold underline underline-offset-4 decoration-green-600"
                          : "text-stone-500 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 hover:underline underline-offset-4 decoration-stone-300 dark:decoration-stone-600"
                      }`}
                    >
                      {topic.name}
                    </Link>
                    {index < (category.topics || []).length - 1 && (
                      <span className="text-stone-300 dark:text-stone-600">
                        ,{" "}
                      </span>
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
  const [followed, setFollowed] = useState<Set<string>>(new Set())

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function fetchPeople() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, bio")
        .eq("is_banned", false)
        .limit(3)

      if (error) {
        console.error("[WhoToFollow]", error.message)
      } else {
        setPeople(
          (data || []).map((p) => {
            const displayName = p.full_name || "Nairaly Writer"
            return {
              id: String(p.id),
              name: displayName,
              initial: displayName[0]?.toUpperCase() ?? "N",
              bio: p.bio || "Storyteller on Nairaly",
            }
          })
        )
      }
      setLoading(false)
    }
    fetchPeople()
  }, [supabase])

  function handleFollow(person: Person) {
    setFollowed((prev) => {
      const next = new Set(prev)
      if (next.has(person.id)) {
        next.delete(person.id)
      } else {
        next.add(person.id)
        // TODO: await supabase.from("follows").insert({ followee_id: person.id })
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">
        Who to follow
      </h3>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-stone-100 dark:bg-stone-800 animate-pulse rounded-full"
            />
          ))}
        </div>
      ) : people.length === 0 ? (
        <p className="text-sm text-stone-400 dark:text-stone-500">
          No writers to suggest yet.
        </p>
      ) : (
        people.map((person) => {
          const isFollowing = followed.has(person.id)
          return (
            <div
              key={person.id}
              className="flex items-center justify-between gap-3"
            >
              <Link
                href={`/author/${person.id}`}
                className="flex items-center gap-3 overflow-hidden group"
              >
                <div className="w-9 h-9 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {person.initial}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold text-stone-900 dark:text-white truncate group-hover:underline">
                    {person.name}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">
                    {person.bio}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => handleFollow(person)}
                className={`shrink-0 px-4 py-1.5 rounded-full border text-[12px] font-bold transition-colors cursor-pointer ${
                  isFollowing
                    ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white"
                    : "border-stone-900 dark:border-stone-400 text-stone-900 dark:text-stone-300 hover:bg-stone-900 dark:hover:bg-stone-700 hover:text-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Footer Links ─────────────────────────────────────────────────────────────

function FooterLinks() {
  const links = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Help", href: "/help" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-xs text-stone-400 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-400 transition-colors font-sans"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-stone-300 dark:text-stone-700 font-sans uppercase tracking-widest font-medium">
        © {new Date().getFullYear()} Nairaly
      </p>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ activeTopic }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-8 sticky top-4">
      <StaffPicks />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <RecommendedTopics activeTopic={activeTopic} />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <WhoToFollow />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <FooterLinks />
    </aside>
  )
}