// src/lib/queries.ts - Version étendue
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

// Nouvelles queries pour les collections éditoriales
export const COLLECTIONS_EDITORIALES_QUERY = `*[_type == "collectionEditoriale"] | order(_createdAt desc) {
  _id,
  name,
  slug,
  coverImage,
  intro,
  gallery,
  seo
}`

export const COLLECTION_EDITORIALE_QUERY = groq`*[_type=="collectionEditoriale" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  intro,
  gallery,
  seo
}`

// Nouvelles queries pour les lookbooks

export const LOOKBOOKS_QUERY = `*[_type == "lookbook"] | order(_createdAt desc) {
  _id,
  title,
  season,
  slug,
  coverImage,
  images,
  seo
}`

export const LOOKBOOK_QUERY = groq`*[_type=="lookbook" && slug.current == $slug][0]{
  _id,
  title,
  season,
  slug,
  images,
  seo
}`

// Query pour les pages statiques
export const PAGE_QUERY = groq`*[_type=="page" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  content,
  seo
}`

// Query pour toutes les pages
export const PAGES_QUERY = groq`*[_type=="page"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  content,
  seo
}`
