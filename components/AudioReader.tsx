"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type Props = {
  title: string
  body: string
  authorName: string
  onParagraphChange?: (index: number) => void
  onStop?: () => void
  onJumpReady?: (fn: (index: number) => void) => void
}

const BACKGROUND_TRACKS =[
  {
    name: "Lo-fi Chill",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    name: "Ambient Focus",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    name: "Soft Piano",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    name: "Nature Sounds",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
]

const PREFERRED_VOICES =[
  "Google UK English Female",
  "Google UK English Male",
  "Google US English",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Libby Online (Natural) - English (United Kingdom)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Samantha",
  "Karen",
  "Daniel",
  "Moira",
]

function getBestVoice(isOffline: boolean): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const availableVoices = isOffline ? voices.filter(v => v.localService) : voices
  const voiceList = availableVoices.length > 0 ? availableVoices : voices

  for (const name of PREFERRED_VOICES) {
    const match = voiceList.find((v) => v.name === name)
    if (match) return match
  }

  const onlineEnglish = voiceList.find(
    (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("online")
  )
  if (onlineEnglish && !isOffline) return onlineEnglish

  const englishFemale = voiceList.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("woman") ||
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Moira") ||
        v.name.includes("Aria") ||
        v.name.includes("Jenny"))
  )
  if (englishFemale) return englishFemale

  const anyEnglish = voiceList.find((v) => v.lang.startsWith("en"))
  if (anyEnglish) return anyEnglish

  return voiceList[0] || voices[0]
}

function VoiceSelector({
  currentVoice,
  onSelect,
  isOffline,
}: {
  currentVoice: SpeechSynthesisVoice | null
  onSelect: (voice: SpeechSynthesisVoice) => void
  isOffline: boolean
}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      const english = all.filter((v) => v.lang.startsWith("en"))
      setVoices(english)
    }
    load()
    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", load)
      return () => window.speechSynthesis.removeEventListener("voiceschanged", load)
    } else {
      window.speechSynthesis.onvoiceschanged = load
      return () => { window.speechSynthesis.onvoiceschanged = null }
    }
  },[])

  if (!voices.length) return null

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
      >
        <span>
          Voice:{" "}
          {currentVoice?.name
            .replace(" Online (Natural)", "")
            .replace(" - English (United States)", "")
            .replace(" - English (United Kingdom)", "") || "Default"}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto rounded-lg border border-stone-100 dark:border-stone-800">
          {voices.map((voice) => {
            const isCloudOnly = !voice.localService;
            const isDisabled = isOffline && isCloudOnly;

            return (
              <button
                key={voice.name}
                disabled={isDisabled}
                onClick={() => {
                  onSelect(voice)
                  setOpen(false)
                }}
                className={`px-3 py-2 flex items-center justify-between text-xs text-left transition-colors ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : currentVoice?.name === voice.name
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-medium cursor-pointer"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 cursor-pointer"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {voice.name
                      .replace(" Online (Natural)", "")
                      .replace(" - English (United States)", "")
                      .replace(" - English (United Kingdom)", "")}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                    {voice.lang}
                    {voice.name.includes("Online") ? " · Natural" : ""}
                    {voice.localService ? " · Local" : " · Cloud"}
                  </span>
                </div>

                {isDisabled && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-400">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AudioReader({
  title,
  body,
  authorName,
  onParagraphChange,
  onStop,
  onJumpReady,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const[currentParagraph, setCurrentParagraph] = useState(0)
  const [progress, setProgress] = useState(0)
  const[speed, setSpeed] = useState(1)
  const [supported, setSupported] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const[voiceName, setVoiceName] = useState("")
  const [musicEnabled, setMusicEnabled] = useState(false)
  const[musicVolume, setMusicVolume] = useState(0.15)
  const[selectedTrack, setSelectedTrack] = useState(0)
  const [isOffline, setIsOffline] = useState(false)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const paragraphsRef = useRef<string[]>([])
  const currentIndexRef = useRef(0)
  const isPlayingRef = useRef(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const speedRef = useRef(speed)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const musicEnabledRef = useRef(musicEnabled)
  const wakeLockRef = useRef<any>(null)
  const isOfflineRef = useRef(isOffline)
  
  // Animation/Fade Refs
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const targetVolumeRef = useRef(musicVolume)
  const trackBlobsRef = useRef<Record<string, string>>({})

  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { musicEnabledRef.current = musicEnabled }, [musicEnabled])
  useEffect(() => { isOfflineRef.current = isOffline }, [isOffline])

  // Sync volume smoothly to slider
  useEffect(() => {
    targetVolumeRef.current = musicVolume
    // Apply instantly if it's currently fully playing
    if (audioRef.current && isPlayingRef.current && audioRef.current.volume > 0) {
      audioRef.current.volume = musicVolume
    }
  }, [musicVolume])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine)
      const handleOffline = () => setIsOffline(true)
      const handleOnline = () => setIsOffline(false)
      window.addEventListener("offline", handleOffline)
      window.addEventListener("online", handleOnline)
      return () => {
        window.removeEventListener("offline", handleOffline)
        window.removeEventListener("online", handleOnline)
      }
    }
  },[])

  useEffect(() => {
    if (typeof window !== "undefined" && "caches" in window && navigator.onLine) {
      caches.open("audio-reader-music").then((cache) => {
        BACKGROUND_TRACKS.forEach((track) => {
          cache.match(track.url).then((res) => {
            if (!res) fetch(track.url).then((fRes) => cache.put(track.url, fRes)).catch(() => {})
          })
        })
      })
    }
  },[])

  // 1. FIX HTML PARSING & STRIPPING
  useEffect(() => {
    let cleanText = body

    // Convert structural tags to natural paragraph breaks (newlines)
    cleanText = cleanText.replace(/<\/(p|li|h[1-6]|div)>/gi, "\n\n")
    cleanText = cleanText.replace(/<br\s*\/?>/gi, "\n")

    // Strip out all remaining HTML tags
    cleanText = cleanText.replace(/<[^>]+>/g, "")

    // Decode HTML entities (like &nbsp;, &amp;)
    if (typeof window !== "undefined") {
      const doc = new DOMParser().parseFromString(cleanText, "text/html")
      cleanText = doc.documentElement.textContent || cleanText
    }

    // Split into clean paragraphs
    const bodyParagraphs = cleanText
      .split(/\n\n+/)
      .map((p) => p.trim().replace(/\s{2,}/g, " "))
      .filter(Boolean)

    paragraphsRef.current = [`${title}. By ${authorName}.`, ...bodyParagraphs]
  },[title, body, authorName])

  useEffect(() => {
    if (typeof window === "undefined") return
    const audio = new Audio()
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.src = ""
    }
  },[])

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen")
      }
    } catch {}
  }

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
      } catch {}
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlayingRef.current) {
        isPlayingRef.current = false
        window.speechSynthesis.cancel()
        setIsPlaying(false)
        setIsPaused(true)
        stopMusic() // Fade out gracefully
        releaseWakeLock()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  },[])

  const getTrackUrl = async (url: string) => {
    if (trackBlobsRef.current[url]) return trackBlobsRef.current[url]
    if (!("caches" in window)) return url

    try {
      const cache = await caches.open("audio-reader-music")
      let res = await cache.match(url)
      
      if (!res) {
        if (!navigator.onLine) return null
        res = await fetch(url)
        await cache.put(url, res.clone())
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      trackBlobsRef.current[url] = blobUrl
      return blobUrl
    } catch {
      return url
    }
  }

  // 2. AUDIO FADE IN
  const startMusic = useCallback(async (overrideIndex?: number) => {
    if (!musicEnabledRef.current || !audioRef.current) return
    
    const index = overrideIndex !== undefined ? overrideIndex : selectedTrack
    const originalUrl = BACKGROUND_TRACKS[index].url
    const playableUrl = await getTrackUrl(originalUrl)

    if (!playableUrl || !isPlayingRef.current) return

    const audio = audioRef.current

    if (audio.src !== playableUrl && audio.src !== originalUrl) {
      audio.src = playableUrl
      audio.load()
    }

    // Clear existing fade intervals
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    
    // Start playback silently
    if (audio.paused) {
      audio.volume = 0
      audio.play().catch((err) => {
        if (err.name !== "AbortError") console.error("Music error:", err.message)
      })
    }

    // Gradually Fade In
    fadeIntervalRef.current = setInterval(() => {
      if (!audio) return
      let nextVol = audio.volume + 0.02
      if (nextVol >= targetVolumeRef.current) {
        audio.volume = targetVolumeRef.current
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
      } else {
        audio.volume = nextVol
      }
    }, 50)
  }, [selectedTrack])

  // 3. AUDIO FADE OUT
  const stopMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)

    // Gradually Fade Out
    fadeIntervalRef.current = setInterval(() => {
      let nextVol = audio.volume - 0.02
      if (nextVol <= 0) {
        audio.volume = 0
        audio.pause()
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
      } else {
        audio.volume = nextVol
      }
    }, 50)
  },[])

  const speakParagraph = useCallback(
    (index: number) => {
      if (index >= paragraphsRef.current.length) {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentParagraph(0)
        currentIndexRef.current = 0
        setProgress(100)
        isPlayingRef.current = false
        stopMusic() // Fade out when finished
        releaseWakeLock()
        onStop?.()
        return
      }

      const utterance = new SpeechSynthesisUtterance(paragraphsRef.current[index])
      utterance.rate = speedRef.current
      utterance.pitch = 1
      utterance.volume = 1

      let activeVoice = voiceRef.current
      if (isOfflineRef.current && activeVoice && !activeVoice.localService) {
        activeVoice = getBestVoice(true)
        voiceRef.current = activeVoice
        if (activeVoice) setVoiceName(activeVoice.name)
      }

      if (activeVoice) utterance.voice = activeVoice

      utterance.onstart = () => {
        currentIndexRef.current = index
        setCurrentParagraph(index)
        setProgress(Math.round((index / paragraphsRef.current.length) * 100))
        onParagraphChange?.(index)
      }

      utterance.onend = () => {
        if (isPlayingRef.current) speakParagraph(index + 1)
      }

      utterance.onerror = (e) => {
        if (e.error !== "interrupted") console.error("Speech error:", e.error)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },[onParagraphChange, onStop, stopMusic]
  )

  // PODCAST ENTRANCE EFFECT: Music Fades In -> Delay -> Voice Starts
  const playFromIndex = useCallback(
    (index: number) => {
      isPlayingRef.current = false
      window.speechSynthesis.cancel()

      // Set playing to true immediately to allow the music fade-in to begin
      isPlayingRef.current = true
      startMusic()

      // Wait 800ms before starting the voice to ease the user in
      setTimeout(() => {
        if (!isPlayingRef.current) return // Abort if user cancelled during delay
        setIsPlaying(true)
        setIsPaused(false)
        setExpanded(true)
        speakParagraph(index)
        requestWakeLock()
      }, 800)
    },[speakParagraph, startMusic]
  )

  const jumpToRef = useRef<(index: number) => void>()
  useEffect(() => {
    jumpToRef.current = (index: number) => playFromIndex(index)
  }, [playFromIndex])

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false)
      return
    }

    const loadVoice = () => {
      const best = getBestVoice(isOfflineRef.current)
      if (best) {
        voiceRef.current = best
        setVoiceName(best.name)
      }
    }
    loadVoice()

    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoice)
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoice
    }

    if (onJumpReady) {
      onJumpReady((index: number) => jumpToRef.current?.(index))
    }

    return () => {
      window.speechSynthesis.cancel()
      releaseWakeLock()
      if (window.speechSynthesis.removeEventListener) {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoice)
      } else {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const handlePlay = () => {
    if (!supported) return
    const startIndex = isPaused ? currentIndexRef.current : 0
    if (startIndex === 0) {
      setProgress(0)
      setCurrentParagraph(0)
    }
    playFromIndex(startIndex)
  }

  const handlePause = () => {
    isPlayingRef.current = false
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(true)
    stopMusic() // Fade Out Gracefully
    releaseWakeLock()
  }

  const handleStop = () => {
    isPlayingRef.current = false
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentParagraph(0)
    currentIndexRef.current = 0
    setProgress(0)
    stopMusic() // Fade Out Gracefully
    releaseWakeLock()
    onStop?.()
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
    speedRef.current = newSpeed
    if (isPlaying) playFromIndex(currentIndexRef.current)
  }

  if (!supported) return null
  const totalParagraphs = paragraphsRef.current.length

  return (
    <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden mb-10">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-900 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-end gap-0.5 h-4 ${isPlaying ? "opacity-100" : "opacity-40"}`}>
            {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-green-500 dark:bg-green-400 rounded-full"
                style={{
                  height: `${h * 2}px`,
                  animation: isPlaying
                    ? `audioBar 0.${6 + i}s ease-in-out infinite alternate`
                    : "none",
                }}
              />
            ))}
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              Listen to this article
              {isOffline && (
                <span title="Running in Offline Mode" className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded-sm">
                  Offline
                </span>
              )}
            </span>
            {voiceName && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-clamp-1">
                {voiceName
                  .replace(" Online (Natural)", "")
                  .replace(" - English (United States)", "")
                  .replace(" - English (United Kingdom)", "")}
              </span>
            )}
          </div>
          {isPlaying && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium ml-auto">
              Playing
            </span>
          )}
          {isPaused && (
            <span className="text-xs text-stone-400 dark:text-stone-500 font-medium ml-auto">
              Paused
            </span>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`text-stone-400 transition-transform duration-200 ml-3 ${expanded ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="px-4 py-4 flex flex-col gap-4 bg-white dark:bg-stone-950">
          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div
              className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden cursor-pointer group relative"
              onClick={(e) => {
                const bar = e.currentTarget
                const rect = bar.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const ratio = clickX / rect.width
                const targetIndex = Math.floor(ratio * totalParagraphs)
                const clampedIndex = Math.max(0, Math.min(targetIndex, totalParagraphs - 1))
                playFromIndex(clampedIndex)
              }}
              title="Click to jump to position"
            >
              <div
                className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-300 pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity bg-stone-900 dark:bg-white pointer-events-none" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-stone-900 dark:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-stone-400 dark:text-stone-500">
              <span>
                {isPlaying || isPaused
                  ? `Paragraph ${Math.max(currentParagraph + 1, 1)} of ${totalParagraphs}`
                  : "Double-click any paragraph · Click bar to jump"}
              </span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Stop"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
              </button>

              <button
                onClick={() => {
                  const prev = currentIndexRef.current - 1
                  if (prev >= 0) playFromIndex(prev)
                }}
                disabled={(!isPlaying && !isPaused) || currentParagraph === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous paragraph"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>
              </button>

              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : isPaused ? "Resume" : "Play"}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>
                )}
              </button>

              <button
                onClick={() => {
                  const next = currentIndexRef.current + 1
                  if (next < totalParagraphs) playFromIndex(next)
                }}
                disabled={(!isPlaying && !isPaused) || currentParagraph >= totalParagraphs - 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next paragraph"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-400 dark:text-stone-500">Speed</span>
              <div className="flex items-center gap-1">
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      speed === s ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium" : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(isPlaying || isPaused) && paragraphsRef.current[currentParagraph] && (
            <div className="px-3 py-2.5 bg-stone-50 dark:bg-stone-900 rounded-lg border-l-2 border-green-500 dark:border-green-400">
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                {paragraphsRef.current[currentParagraph]}
              </p>
            </div>
          )}

          <VoiceSelector
            isOffline={isOffline}
            currentVoice={voiceRef.current}
            onSelect={(voice) => {
              voiceRef.current = voice
              setVoiceName(voice.name)
            }}
          />

          <div className="flex flex-col gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-500"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Background music</span>
              </div>

              <button
                onClick={() => {
                  const next = !musicEnabled
                  setMusicEnabled(next)
                  musicEnabledRef.current = next
                  if (next && isPlaying) {
                    startMusic()
                  } else {
                    stopMusic()
                  }
                }}
                className={`relative flex items-center w-12 h-6 rounded-full transition-all duration-300 cursor-pointer shrink-0 focus:outline-none ${musicEnabled ? "bg-green-500 dark:bg-green-400" : "bg-stone-200 dark:bg-stone-700"}`}
              >
                <span className={`absolute left-1.5 text-white text-[10px] font-semibold transition-opacity duration-200 select-none ${musicEnabled ? "opacity-100" : "opacity-0"}`}>ON</span>
                <span className={`absolute flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${musicEnabled ? "translate-x-6" : "translate-x-0.5"}`}>
                  {musicEnabled ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v9" /><path d="M9 9l12-2v7" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                  )}
                </span>
                <span className={`absolute right-1.5 text-stone-400 text-[10px] font-semibold transition-opacity duration-200 select-none ${musicEnabled ? "opacity-0" : "opacity-100"}`}>OFF</span>
              </button>
            </div>

            {musicEnabled && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {BACKGROUND_TRACKS.map((track, i) => (
                    <button
                      key={track.name}
                      onClick={() => {
                        setSelectedTrack(i)
                        if (isPlaying) startMusic(i)
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                        selectedTrack === i ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                      }`}
                    >
                      {track.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-stone-400 shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /></svg>
                  <input type="range" min="0" max="0.5" step="0.01" value={musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="flex-1 h-1 accent-green-500 cursor-pointer" />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-stone-400 shrink-0"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07" /><path d="M19.07 4.93a10 10 0 010 14.14" /></svg>
                  <span className="text-xs text-stone-400 dark:text-stone-500 w-6 text-right">{Math.round(musicVolume * 200)}%</span>
                </div>

                {isPlaying && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-900 rounded-lg">
                    <div className="flex items-end gap-0.5 h-3">
                      {[2, 4, 3, 4, 2].map((h, i) => (
                        <div key={i} className="w-0.5 bg-green-500 dark:bg-green-400 rounded-full" style={{ height: `${h * 2}px`, animation: `audioBar 0.${7 + i}s ease-in-out infinite alternate` }} />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400">Now playing: {BACKGROUND_TRACKS[selectedTrack].name}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes audioBar { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}