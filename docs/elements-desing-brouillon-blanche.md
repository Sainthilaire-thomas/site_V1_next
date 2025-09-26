# 📐 Document de Design – Brouillon Blanche

## 1. Identité visuelle

### Couleurs principales (définies en HSL dans `index.css`)

- **Fond clair** : `--background: hsl(0 0% 100%)` → blanc pur
- **Texte principal** : `--foreground: hsl(18 16% 17%)` → brun très sombre
- **Violet marque** : `--violet: hsl(271 74% 37%)`
  - Déclinaisons (`--violet-soft`, `--violet-glow`, etc.) pour hover, ombres et effets
- **Accent (interactions)** : `--accent: hsl(276 86% 36%)`
- **Muted (fonds secondaires / cartes)** : `--muted: hsl(0 0% 96%)` → gris très clair
- **Bordures** : `--border: hsl(0 0% 90%)` → gris moyen

👉 Mode **dark** prévu (palette inversée, fond sombre et texte clair).

### Polices

- **Brand / Titres** : `"Archivo Black", sans-serif` (`--font-brand`)
- **Corps de texte** : `"Archivo Narrow", sans-serif` (`--font-body`)

Police à la fois géométrique et moderne → style sobre et impact visuel.

---

## 2. Landing Page (`LandingPage.tsx`)

- **Disposition** :
  - Fond **blanc pur**
  - Lettres du nom `.blancherenaudin` disposées aléatoirement, flottantes avec effet de répulsion au passage de la souris.
  - **Point central** : carré noir (`bg-foreground`) servant de déclencheur → navigation vers catalogue.
  - **Curseur personnalisé** : petit cercle violet (`bg-accent`).
- **Effets** :
  - Lettres flottantes (`animate-float`)
  - Hover : agrandissement et glow violet (`hover:text-accent`, `drop-shadow`).
  - Révélation du mot complet `.blancherenaudin` quand on survole le carré central.

---

## 3. Catalogue / Home Page (`HomePage.tsx`)

- **Disposition** :
  - **Logo** : image (`/logo.png`), position flottante (se déplace en fonction du scroll).
  - **Menu hamburger** (icônes `Menu`/`X` via Lucide) ouvrant un panneau latéral droit (`w-64`, fond semi-transparent avec blur).
  - **Sections produits** :
    - **Section pleine page** avec un produit unique (centré).
    - **Section grille** (2 colonnes, 4 produits).
    - **Section pleine page** avec un produit unique à nouveau.
  - Chaque produit = **rectangle gris clair** (`bg-muted`), avec effet hover `scale-[1.02]` et ombre.
- **Navigation menu** (slide panel) :
  - Liens texte sobres : _Collection, Femme, Homme, Accessoires, Maroquinerie, Atelier, Contact_ .
  - Couleur hover : violet (`hover:text-violet`).

---

## 4. Page Produit (`ProductDetailPage.tsx`)

- **Disposition** :
  - Bouton retour (`ArrowLeft`) en haut.
  - Contenu centré sur 2 colonnes (desktop) :
    - **Visuel produit** : bloc gris (`bg-muted`, `h-96`).
    - **Détails** :
      - Titre produit (gros titre noir).
      - Description (texte gris clair).
      - Prix (texte grand et épais).
      - Liste de caractéristiques avec puces (`list-disc`).
      - Bouton “Ajouter au panier” : noir (`bg-primary`) → hover plus clair.

---

## 5. Page 404 (`NotFound.tsx`)

- **Disposition simple et centrée** :
  - Gros titre rouge **404**
  - Message explicatif gris clair
  - Bouton noir “Retour à la Home”

---

## 6. Principes de mise en page

- **Sections pleine hauteur (`h-screen`)** → design immersif.
- **Animations légères** sur hover (scale, drop-shadow).
- **Disposition fluide** :
  - Utilisation de `flex` et `grid` pour centrer ou créer des colonnes.
  - Marges larges (ex. `mt-32`) pour respirer.
- **Minimalisme** : beaucoup d’espace blanc, focus sur contenu visuel (produits).
