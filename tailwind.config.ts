// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Active le dark mode avec la classe 'dark' sur <html> (uniquement pour /admin)
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Noir/Blanc/Gris Jacquemus
        black: 'hsl(0 0% 0%)',
        white: 'hsl(0 0% 100%)',
        'grey-light': 'hsl(0 0% 95%)',
        'grey-medium': 'hsl(0 0% 60%)',
        'grey-dark': 'hsl(0 0% 30%)',

        // Accent brand (violet .blancherenaudin)
        violet: {
          DEFAULT: 'hsl(271 74% 37%)',
          soft: 'hsl(271 74% 45%)',
          subtle: 'hsl(271 30% 92%)',
        },

        // Variables système
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
      },
      fontFamily: {
        brand: ['var(--font-archivo-black)', 'sans-serif'],
        body: ['var(--font-archivo-narrow)', 'sans-serif'],
      },
      fontSize: {
        // Hiérarchie Jacquemus
        hero: 'clamp(4rem, 10vw, 7.5rem)',
        section: 'clamp(2.5rem, 5vw, 3.75rem)',
        product: 'clamp(1rem, 2vw, 1.25rem)',
      },
      spacing: {
        // Système d'espacement généreux
        section: 'clamp(4rem, 10vw, 10rem)',
      },
      screens: {
        xs: '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
