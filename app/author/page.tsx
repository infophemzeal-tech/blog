// app/author/[author_id]/page.tsx
import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'

export default async function AuthorPage({ params }: { params: { author_id: string } }) {
  const { author_id } = await params  // ✅ correct variable name
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', author_id)  // ✅ use author_id not authorId
    .single()

  if (!profile) notFound()

  // rest of your page
}