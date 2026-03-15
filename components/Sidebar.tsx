const STAFF_PICKS = [
  {
    id: 1,
    publication: "Fossils et...",
    author: "Alejandro Izquierdo López",
    title: "Stop it! Animals don't evolve into crabs",
    date: "Feb 22",
  },
  {
    id: 2,
    publication: "The Medium Blog",
    author: "Medium Staff",
    title: "How Medium moderates its open platform in the AI era",
    date: "4d ago",
  },
  {
    id: 3,
    publication: "Fourth Wave",
    author: "Vilma G. Reynoso",
    title: "Why Women's History Month Matters for All Women",
    date: "2d ago",
  },
]

const TOPICS = [
  "Data Science",
  "Self Improvement",
  "Technology",
  "Writing",
  "Relationships",
  "Politics",
  "Productivity",
]

const WHO_TO_FOLLOW = [
  {
    id: 1,
    name: "Adham Khaled",
    initial: "A",
    bio: "9x Boosted Writer | Embedded Systems...",
  },
  {
    id: 2,
    name: "Entrepreneurship Handbook",
    initial: "E",
    bio: "How to succeed in entrepreneurship feat...",
  },
  {
    id: 3,
    name: "Will Lockett",
    initial: "W",
    bio: "Independent journalist covering global politics...",
  },
]

const FOOTER_LINKS = [
  "Help", "Status", "About", "Careers",
  "Press", "Blog", "Privacy", "Rules", "Terms",
]

function StaffPicks() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">Staff Picks</h3>
      {STAFF_PICKS.map((pick) => (
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
      ))}
      <button className="text-sm text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400 transition-colors cursor-pointer text-left">
        See the full list
      </button>
    </div>
  )
}

function RecommendedTopics() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">Recommended topics</h3>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            className="px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-800 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            {topic}
          </button>
        ))}
      </div>
      <button className="text-sm text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400 transition-colors cursor-pointer text-left">
        See more topics
      </button>
    </div>
  )
}

function WhoToFollow() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-stone-900 dark:text-white">Who to follow</h3>
      {WHO_TO_FOLLOW.map((person) => (
        <div key={person.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {person.initial}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-stone-900 dark:text-white">{person.name}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">{person.bio}</p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-1.5 rounded-full border border-stone-900 dark:border-stone-400 text-sm text-stone-900 dark:text-stone-300 hover:bg-stone-900 dark:hover:bg-stone-700 hover:text-white transition-colors cursor-pointer">
            Follow
          </button>
        </div>
      ))}
      <button className="text-sm text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400 transition-colors cursor-pointer text-left">
        See more suggestions
      </button>
    </div>
  )
}

function FooterLinks() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {FOOTER_LINKS.map((link) => (
        <a key={link} href="#" className="text-xs text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-400 transition-colors">
          {link}
        </a>
      ))}
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="flex flex-col gap-8 sticky top-4">
      <StaffPicks />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <RecommendedTopics />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <WhoToFollow />
      <div className="border-t border-stone-100 dark:border-stone-800" />
      <FooterLinks />
    </aside>
  )
}