// src/lib/queries.ts
import { groq } from 'next-sanity'

export const HOMEPAGE_QUERY = groq`*[_type=="homepage"][0]{
  heroTitle, heroSubtitle, heroImage,
  sections[]{
    _type == "banner" => { _type, title, text, image, ctaLabel, ctaHref },
    _type == "carousel" => { _type, title, images },
    _type == "editorialPicks" => { _type, title, productIds }
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

// === Lookbooks ===

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
