"use client"

import { useState, useRef } from "react"
import { createClient } from "../lib/supabase/client"
import { useAuth } from "./AuthProvider"

type Props = {
  onUpload: (url: string) => void
  currentImage?: string
}

export default function ImageUpload({ onUpload, currentImage }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || "")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      console.log("No file selected")
      return
    }

    if (!user) {
      setError("You must be signed in to upload images")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB")
      return
    }

    setError("")
    setUploading(true)

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    // Build file path
    const ext = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`

    console.log("Uploading to bucket: articles, path:", fileName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("articles")
      .upload(fileName, file, { upsert: true })

    console.log("Upload result:", { uploadData, uploadError })

    if (uploadError) {
      console.error("Upload failed:", uploadError.message)
      setError(uploadError.message)
      setPreview(currentImage || "")
      setUploading(false)
      return
    }

    // Get public URL
    const { data } = supabase.storage
      .from("articles")
      .getPublicUrl(fileName)

    console.log("Public URL:", data.publicUrl)

    onUpload(data.publicUrl)
    setUploading(false)
  }

  const handleRemove = () => {
    setPreview("")
    onUpload("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-stone-600 dark:text-stone-400">
        Cover image
      </label>

      {preview ? (
        <div className="relative w-full h-56 rounded-xl overflow-hidden group">
          <img
            src={preview}
            alt="Cover"
            className="w-full h-full object-cover"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>

          {/* Upload spinner */}
          {uploading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-stone-900/60 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer disabled:opacity-50 group"
        >
          {uploading ? (
            <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:bg-stone-200 dark:group-hover:bg-stone-700 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Click to upload cover image
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}