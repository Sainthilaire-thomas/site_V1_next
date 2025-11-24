// src/app/edition-room/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { sanityClient } from '@/lib/sanity.client'
import { urlFor } from '@/lib/sanity.image'
import {
  EDITION_ROOM_POSTS_QUERY,
  EDITION_ROOM_FEATURED_QUERY,
} from '@/lib/queries'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '.edition room | Blanche Renaudin',
  description: 'inspirations,behind the scenes, commitments.',
}

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  author?: string
  mainImage?: any
  category?: { title: string; slug: { current: string } }
  featured?: boolean
}

async function getPosts(): Promise<Post[]> {
  try {
    return await sanityClient.fetch(EDITION_ROOM_POSTS_QUERY)
  } catch {
    return []
  }
}

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    return await sanityClient.fetch(EDITION_ROOM_FEATURED_QUERY)
  } catch {
    return []
  }
}

function PostCard({
  post,
  featured = false,
}: {
  post: Post
  featured?: boolean
}) {
  const img = post.mainImage
    ? urlFor(post.mainImage).width(800).height(1000).url()
    : null
  return (
    <Link href={`/edition-room/${post.slug.current}`} className="group block">
      <div
        className={`relative overflow-hidden bg-[hsl(0,0%,95%)] mb-4 ${featured ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}
      >
        {img ? (
          <Image
            src={img}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {post.title}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {post.category && (
          <span className="text-[11px] uppercase tracking-[0.15em] text-[hsl(271,74%,37%)]">
            {post.category.title}
          </span>
        )}
        <h3
          className={`font-['Archivo_Black'] uppercase tracking-[0.02em] group-hover:text-[hsl(271,74%,37%)] ${featured ? 'text-2xl' : 'text-lg'}`}
        >
          {post.title}
        </h3>
        <p className="text-[13px] text-gray-500">
          {format(new Date(post.publishedAt), 'd MMM yyyy', { locale: fr })}
          {post.author && ` . ${post.author}`}
        </p>
        {post.excerpt && (
          <p className="text-[15px] text-gray-700 line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}

export default async function EditionRoomPage() {
  const [allPosts, featuredPosts] = await Promise.all([
    getPosts(),
    getFeaturedPosts(),
  ])
  const featuredIds = new Set(featuredPosts.map((p) => p._id))
  const regularPosts = allPosts.filter((p) => !featuredIds.has(p._id))

  return (
    <>
      <HeaderMinimal />
      <div className="min-h-screen">
      <section className="py-20 lg:py-28 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Archivo_Black'] text-5xl lg:text-7xl uppercase tracking-[0.02em] mb-6">
            .edition room
          </h1>
          <p className="text-lg text-gray-600">
            inspirations . behind the scenes . commitments
          </p>
        </div>
      </section>
      {allPosts.length === 0 ? (
        <section className="py-20 px-6 text-center">
          <p className="text-gray-500 mb-8">
            Les premiers articles arrivent bientot.
          </p>
          <Link
            href="/silhouettes"
            className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-[hsl(271,74%,37%)]"
          >
            Decouvrir les silhouettes
          </Link>
        </section>
      ) : (
        <>
          {featuredPosts.length > 0 && (
            <section className="py-12 px-6 lg:px-16">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-8">
                  A la une
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {featuredPosts.map((p) => (
                    <PostCard key={p._id} post={p} featured />
                  ))}
                </div>
              </div>
            </section>
          )}
          {regularPosts.length > 0 && (
            <section className="py-16 px-6 lg:px-16">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {regularPosts.map((p) => (
                    <PostCard key={p._id} post={p} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
      <FooterMinimal />
    </>
  )
}
