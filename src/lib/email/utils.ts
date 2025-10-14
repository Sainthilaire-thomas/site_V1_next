// src/lib/email/utils.ts
export const getEmailLogoUrl = () => {
  // En production sur Vercel, utilisez l'URL complète du site
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000'
  return `${baseUrl}/blancherenaudin-ajuste.svg`
}

export const EMAIL_CONFIG = {
  logoUrl: getEmailLogoUrl(),
  logoWidth: 180, // ✅ Augmenté de 120 à 180 (50% plus grand)
  logoHeight: 100, // ✅ Augmenté de 40 à 60 (proportionnel)
  brandName: '.blancherenaudin',
  contactEmail: 'contact@blancherenaudin.com',
  websiteUrl: 'https://blancherenaudin.com',
}
