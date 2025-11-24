// src/app/edition-room/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { sanityClient } from '@/lib/sanity.client'
import { urlFor } from '@/lib/sanity.image'
import {
  EDITION_ROOM_POST_QUERY,
  EDITION_ROOM_SLUGS_QUERY,
} from '@/lib/queries'
import { PortableText } from '@portabletext/react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 3600

interface PostDetail {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  author?: { name: string; role?: string }
  mainImage?: any
  category?: { title: string }
  tags?: string[]
  content?: any[]
  gallery?: any[]
}

async function getPost(slug: string): Promise<PostDetail | null> {
  try {
    return await sanityClient.fetch(EDITION_ROOM_POST_QUERY, { slug })
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  const posts = await sanityClient.fetch(EDITION_ROOM_SLUGS_QUERY)
  return posts.map((p: { slug: string }) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Article non trouvé' }
  return {
    title: `${post.title} | .edition room`,
    description: post.excerpt || '',
  }
}

const ptComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-['Archivo_Black'] text-2xl uppercase mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-['Archivo_Black'] text-xl uppercase mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-[17px] leading-[1.8] text-gray-800 mb-6">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[hsl(271,74%,37%)] pl-6 my-8 text-xl italic text-gray-600">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold">{children}</strong>
    ),
    link: ({ children, value }: any) => (
      <a href={value?.href} className="text-[hsl(271,74%,37%)] underline">
        {children}
      </a>
    ),
  },
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const mainImg = post.mainImage
    ? urlFor(post.mainImage).width(1400).height(788).url()
    : null

  return (
    <article className="min-h-screen">
      {/* Back link */}
      <div className="px-6 lg:px-16 py-6">
        <Link
          href="/edition-room"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          .edition room
        </Link>
      </div>

      {/* Header */}
      <header className="px-6 lg:px-16 pb-12">
        <div className="max-w-3xl mx-auto">
          {post.category && (
            <span className="text-[11px] uppercase tracking-[0.15em] text-[hsl(271,74%,37%)] block mb-4">
              {post.category.title}
            </span>
          )}
          <h1 className="font-['Archivo_Black'] text-4xl lg:text-5xl uppercase tracking-[0.02em] mb-6">
            {post.title}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {format(new Date(post.publishedAt), 'd MMMM yyyy', { locale: fr })}
            {post.author?.name && ` · par ${post.author.name}`}
          </p>
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </header>

      {/* Main Image */}
      {mainImg && (
        <div className="px-6 lg:px-16 mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/9]">
              <Image
                src={mainImg}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 lg:px-16 pb-16">
        <div className="max-w-3xl mx-auto">
          {post.content && (
            <PortableText value={post.content} components={ptComponents} />
          )}
        </div>
      </div>

      {/* Gallery */}
      {post.gallery && post.gallery.length > 0 && (
        <section className="px-6 lg:px-16 py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {post.gallery.map((img: any, i: number) => (
              <div key={i} className="relative aspect-[4/5]">
                <Image
                  src={urlFor(img).width(800).height(1000).url()}
                  alt={img.alt || `Image ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Back to list */}
      <section className="px-6 lg:px-16 py-16 border-t text-center">
        <Link
          href="/edition-room"
          className="text-sm uppercase tracking-widest border-b border-black pb-1 hover:text-[hsl(271,74%,37%)] hover:border-[hsl(271,74%,37%)] transition-colors"
        >
          Voir tous les articles
        </Link>
      </section>
    </article>
  )
}
