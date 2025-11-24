// src/lib/queries.ts
import { groq } from 'next-sanity'

// === Homepage ===
export const HOMEPAGE_QUERY = groq`*[_type=="homepage" && _id == "homepage-singleton"][0]{
  hero {
    title,
    subtitle,
    image,
    ctaLabel,
    ctaLink
  },
  zoneHauts {
    image,
    title,
    subtitle,
    link
  },
  zoneBas {
    image,
    title,
    subtitle,
    link
  },
  zoneAccessoires {
    image,
    title,
    subtitle,
    link
  },
  zoneSilhouettes {
    image,
    title,
    subtitle,
    link
  },
   zoneImpact {
    image,
    title,
    subtitle,
    link
  },
  seo
}`

// === Collections éditoriales ===

// Liste (uniquement publiées)
export const COLLECTIONS_EDITORIALES_QUERY = groq`*[
  _type == "collectionEditoriale" && coalesce(published, true) == true
] | order(_createdAt desc) {
  _id,
  name,
  slug,
  coverImage,
  intro,
  gallery,
  seo
}`

// Détail par slug (uniquement publiée)
export const COLLECTION_EDITORIALE_QUERY = groq`*[
  _type=="collectionEditoriale" &&
  slug.current == $slug &&
  coalesce(published, true) == true
][0]{
  _id,
  name,
  slug,
  intro,
  gallery,
  seo
}`

// === Lookbooks (affichés comme "Silhouettes" sur le site) ===

// Liste (uniquement publiés)
export const LOOKBOOKS_QUERY = groq`*[
  _type == "lookbook" && coalesce(published, true) == true
] | order(_createdAt desc) {
  _id,
  title,
  season,
  slug,
  coverImage,
  images,
  seo
}`

// Détail par slug (uniquement publié)
export const LOOKBOOK_QUERY = groq`*[
  _type=="lookbook" &&
  slug.current == $slug &&
  coalesce(published, true) == true
][0]{
  _id,
  title,
  subtitle,
  season,
  slug,
  images,
  seo
}`

// === Pages statiques ===

export const PAGE_QUERY = groq`*[_type=="page" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  content,
  seo
}`

export const PAGES_QUERY = groq`*[_type=="page"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  content,
  seo
}`

// === .edition room (Blog) ===

// Liste des articles publiés
export const EDITION_ROOM_POSTS_QUERY = groq`*[
  _type == "editionRoomPost" && status == "published"
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  "author": author.name,
  mainImage,
  "category": category->{title, slug},
  tags,
  featured
}`

// Article par slug
export const EDITION_ROOM_POST_QUERY = groq`*[
  _type == "editionRoomPost" && 
  slug.current == $slug && 
  status == "published"
][0] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  author,
  mainImage,
  "category": category->{title, slug},
  tags,
  content,
  gallery,
  seo
}`

// Articles featured
export const EDITION_ROOM_FEATURED_QUERY = groq`*[
  _type == "editionRoomPost" && 
  status == "published" && 
  featured == true
] | order(publishedAt desc)[0...2] {
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  "author": author.name,
  mainImage,
  "category": category->{title, slug}
}`

// Tous les slugs (pour generateStaticParams)
export const EDITION_ROOM_SLUGS_QUERY = groq`*[
  _type == "editionRoomPost" && status == "published"
] { "slug": slug.current }`
