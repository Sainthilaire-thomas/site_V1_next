// src/lib/email/utils.ts
export const getEmailLogoUrl = () => {
  // ✅ Utilisez directement le logo depuis le domaine principal
  return 'https://blancherenaudin.com/logo-blancherenaudin3.png'
}

export const EMAIL_CONFIG = {
  logoUrl: getEmailLogoUrl(),
  logoWidth: 180,
  logoHeight: 100,
  brandName: '.blancherenaudin',
  contactEmail: 'contact@blancherenaudin.com',
  websiteUrl: 'https://blancherenaudin.com',
}
