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
