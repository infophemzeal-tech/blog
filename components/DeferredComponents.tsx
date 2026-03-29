"use client"

import dynamic from "next/dynamic"

export const AudioReader = dynamic(() => import("@/components/AudioReader"), { ssr: false })
export const CommentsSection = dynamic(() => import("@/components/CommentsSection"), { ssr: false })
export const ViewTracker = dynamic(() => import("@/components/ViewTracker"), { ssr: false })