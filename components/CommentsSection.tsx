"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"

type Comment = {
  id: string
  body: string
  created_at: string
  user_id: string
  parent_id: string | null
  profiles: {
    full_name: string | null
  }
  replies?: Comment[]
}

type Props = {
  articleId: string
  initialCount: number
}

const normalize = (c: any): Comment => ({
  ...c,
  profiles: Array.isArray(c.profiles)
    ? c.profiles[0] ?? { full_name: null }
    : c.profiles ?? { full_name: null },
})

function CommentItem({
  comment,
  articleId,
  user,
  onDelete,
  onReplyAdded,
  depth = 0,
}: {
  comment: Comment
  articleId: string
  user: any
  onDelete: (id: string, parentId: string | null) => void
  onReplyAdded: (reply: Comment, parentId: string) => void
  depth?: number
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState("")
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyBody, setReplyBody] = useState("")
  const [replyLoading, setReplyLoading] = useState(false)
  const [localBody, setLocalBody] = useState(comment.body)
  const router = useRouter()
  const supabase = createClient()

  const handleEditSave = async () => {
    if (!editBody.trim()) return
    const sanitized = editBody.trim().replace(/<[^>]*>/g, "")
    const { error } = await supabase
      .from("comments")
      .update({ body: sanitized })
      .eq("id", comment.id)

    if (!error) {
      setLocalBody(sanitized)
      setEditingId(null)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push(`/auth/signin?next=/article/${articleId}`)
      return
    }
    if (!replyBody.trim()) return

    setReplyLoading(true)
    const sanitized = replyBody.trim().replace(/<[^>]*>/g, "")

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: articleId,
        user_id: user.id,
        body: sanitized,
        parent_id: comment.id,
      })
      .select("id, body, created_at, user_id, parent_id, profiles(full_name)")
      .single()

    if (!error && data) {
      onReplyAdded(normalize(data), comment.id)
      setReplyBody("")
      setReplyOpen(false)
    }
    setReplyLoading(false)
  }

  return (
    <div className={`flex items-start gap-3 ${depth > 0 ? "ml-8 mt-3" : ""}`}>

      {/* Avatar */}
      <div className={`rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white font-medium shrink-0 ${depth > 0 ? "w-6 h-6 text-xs" : "w-8 h-8 text-xs"}`}>
        {comment.profiles?.full_name?.[0]?.toUpperCase() || "A"}
      </div>

      <div className="flex-1 flex flex-col gap-1">

        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-900 dark:text-white">
              {comment.profiles?.full_name || "Anonymous"}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {user && user.id === comment.user_id && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingId(comment.id)
                  setEditBody(localBody)
                }}
                className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(comment.id, comment.parent_id)}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Body or edit form */}
        {editingId === comment.id ? (
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400 transition-colors resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditSave}
                className="px-3 py-1 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-medium hover:bg-stone-700 transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1 rounded-full text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            {localBody}
          </p>
        )}

        {/* Reply button — only on top level comments */}
        {depth === 0 && (
          <button
            onClick={() => {
              if (!user) {
                router.push(`/auth/signin?next=/article/${articleId}`)
                return
              }
              setReplyOpen((v) => !v)
            }}
            className="self-start text-xs text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer mt-1"
          >
            {replyOpen ? "Cancel" : "Reply"}
          </button>
        )}

        {/* Reply form */}
        {replyOpen && (
          <form onSubmit={handleReply} className="flex flex-col gap-2 mt-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-1">
                {user?.email?.[0].toUpperCase() || "?"}
              </div>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                maxLength={1000}
                className="flex-1 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400 transition-colors resize-none placeholder:text-stone-400"
              />
            </div>
            {replyBody.trim() && (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyBody("")
                    setReplyOpen(false)
                  }}
                  className="px-3 py-1 rounded-full text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-3 py-1 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-medium hover:bg-stone-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {replyLoading ? "Posting..." : "Reply"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="flex flex-col gap-3 mt-3 border-l-2 border-stone-100 dark:border-stone-800 pl-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                articleId={articleId}
                user={user}
                onDelete={onDelete}
                onReplyAdded={onReplyAdded}
                depth={1}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function CommentsSection({ articleId, initialCount }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(initialCount)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    fetchComments()
  }, [open, articleId])

  const fetchComments = async () => {
    setFetching(true)

    const { data } = await supabase
      .from("comments")
      .select("id, body, created_at, user_id, parent_id, profiles(full_name)")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true })

    if (data) {
      const topLevel = (data as any[]).filter((c) => !c.parent_id).map(normalize)
      const replies = (data as any[]).filter((c) => c.parent_id).map(normalize)

      const nested = topLevel.map((comment) => ({
        ...comment,
        replies: replies.filter((r) => r.parent_id === comment.id),
      }))

      setComments(nested)
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push(`/auth/signin?next=/article/${articleId}`)
      return
    }
    if (!body.trim()) return

    const sanitized = body.trim().replace(/<[^>]*>/g, "")
    if (!sanitized) return

    setLoading(true)

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: articleId,
        user_id: user.id,
        body: sanitized,
        parent_id: null,
      })
      .select("id, body, created_at, user_id, parent_id, profiles(full_name)")
      .single()

    if (!error && data) {
      const newComment: Comment = { ...normalize(data), replies: [] }
      setComments((prev) => [...prev, newComment])
      setCount((c) => c + 1)
      setBody("")
    }

    setLoading(false)
  }

  const handleDelete = async (commentId: string, parentId: string | null) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (!error) {
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies?.filter((r) => r.id !== commentId) }
              : c
          )
        )
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
      setCount((c) => Math.max(c - 1, 0))
    }
  }

  const handleReplyAdded = (reply: Comment, parentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    )
    setCount((c) => c + 1)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <span className="text-sm">
          {count} {count === 1 ? "response" : "responses"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-6 mt-2">

          {/* Write top level comment */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-1">
                {user ? user.email?.[0].toUpperCase() : "?"}
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={user ? "What are your thoughts?" : "Sign in to respond"}
                rows={3}
                disabled={!user}
                maxLength={1000}
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400 transition-colors resize-none placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {body.length > 0 && (
              <p className="text-xs text-stone-400 dark:text-stone-500 text-right">
                {body.length}/1000
              </p>
            )}

            {user && body.trim() && (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBody("")}
                  className="px-4 py-1.5 rounded-full text-sm text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !body.trim()}
                  className="px-4 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Respond"}
                </button>
              </div>
            )}

            {!user && (
              <button
                type="button"
                onClick={() => router.push(`/auth/signin?next=/article/${articleId}`)}
                className="self-start text-sm text-green-600 dark:text-green-500 hover:underline cursor-pointer"
              >
                Sign in to respond →
              </button>
            )}
          </form>

          {/* Comments list */}
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-6">
              No responses yet — be the first!
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  articleId={articleId}
                  user={user}
                  onDelete={handleDelete}
                  onReplyAdded={handleReplyAdded}
                  depth={0}
                />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}