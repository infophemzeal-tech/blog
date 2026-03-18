export type Article = {
  id: string
  author: string
  authorInitial: string
  publication: string
  slug: string
  title: string
  subtitle: string
  date: string
  claps: string
  comments: number
  readTime: string
  body: string
  coverImage?: string
  views_count?: number  
   is_pinned?: boolean;
  is_deactivated?: boolean;
  author_id?: string;
}