# 🎨 Refonte Design - Inspiration Jacquemus

## 📋 Vue d'ensemble

Ce document détaille les modifications à apporter au site `.blancherenaudin` pour adopter l'esthétique minimaliste et épurée de Jacquemus, tout en conservant l'identité de marque unique.

---

## 🎯 Principes directeurs du design Jacquemus

### 1. **Minimalisme radical**

- Espaces blancs généreux
- Typographie bold et impactante
- Mise en page asymétrique
- Animations subtiles mais présentes
- Navigation discrète mais accessible

### 2. **Hiérarchie visuelle forte**

- Images en plein écran
- Texte minimal mais percutant
- Contrastes marqués (noir/blanc/couleur accent)
- Grilles décalées et modules irréguliers

### 3. **Expérience immersive**

- Défilement fluide
- Transitions douces
- Hover effects élégants
- Vidéos en autoplay (lookbooks)

---

## 🗂️ Structure de navigation à implémenter

### Navigation principale

```
HAUTS | BAS | ACCESSOIRES | LOOKBOOKS | SUSTAINABILITY | À PROPOS | CONTACT
```

### Hiérarchie des pages

```
/
├── /hauts (nouvelles catégories produits)
├── /bas
├── /accessoires
├── /lookbooks (existant - à améliorer)
├── /sustainability (nouvelle page)
├── /a-propos (existant - à refondre)
└── /contact (existant - à simplifier)
```

---

## 🎨 Modifications du Design System

### **1. Typographie**

typescript

```typescript
// src/app/layout.tsx - Polices à utiliser
import { Archivo_Black, Archivo_Narrow } from 'next/font/google'

// Titres : Archivo Black (déjà configuré)
// Corps : Archivo Narrow (déjà configuré)
```

**Hiérarchie typographique :**

css

```css
/* Hero titles - 80-120px */
.text-hero {
  font-family: var(--font-brand);
  font-size: clamp(4rem, 10vw, 7.5rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

/* Section titles - 40-60px */
.text-section {
  font-family: var(--font-brand);
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

/* Product titles - 16-20px */
.text-product {
  font-family: var(--font-body);
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* Body text - 14-16px */
.text-body {
  font-family: var(--font-body);
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.6;
  font-weight: 400;
}
```

### **2. Palette de couleurs**

css

```css
:root {
  /* Couleurs principales */
  --white: hsl(00%100%);
  --black: hsl(00%0%);
  --grey-light: hsl(00%95%);
  --grey-medium: hsl(00%60%);

  /* Accent brand - à garder ou adapter */
  --accent: hsl(27174%37%); /* Violet Blanche */
  --accent-alt: hsl(30100%50%); /* Orange Jacquemus-style (optionnel) */

  /* Backgrounds */
  --bg-primary: var(--white);
  --bg-secondary: var(--grey-light);
  --bg-dark: var(--black);
}
```

### **3. Espacement**

css

```css
/* Système d'espacement Jacquemus-style */
--spacing-xs: 0.5rem; /* 8px */
--spacing-sm: 1rem; /* 16px */
--spacing-md: 2rem; /* 32px */
--spacing-lg: 4rem; /* 64px */
--spacing-xl: 6rem; /* 96px */
--spacing-xxl: 10rem; /* 160px */

/* Sections */
.section-spacing {
  padding: var(--spacing-xl) var(--spacing-md);
}

@media (min-width: 768px) {
  .section-spacing {
    padding: var(--spacing-xxl) var(--spacing-lg);
  }
}
```

---

## 📱 Refonte de la page d'accueil

### **1. Hero Section - Plein écran avec image**

typescript

```typescript
// src/app/page.tsx - Nouveau Hero
<section className="relative h-screen w-full">
{/* Image de fond */}
<div className="absolute inset-0">
<img
      src="/hero-image.jpg"
      alt="Collection"
      className="h-full w-full object-cover"
/>
<div className="absolute inset-0 bg-black/10"/>
</div>

{/* Texte superposé */}
<div className="relative z-10 flex h-full items-end pb-16 px-8">
<div className="max-w-4xl">
<h1 className="text-hero text-white mb-4">
NOUVELLE
<br />
COLLECTION
</h1>
<p className="text-body text-white/90 max-w-md mb-8">
Découvrez les pièces essentielles de la saison
</p>
<button className="btn-primary">
DÉCOUVRIR
</button>
</div>
</div>

{/* Scroll indicator */}
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
<ChevronDown className="text-white w-6 h-6"/>
</div>
</section>
```

### **2. Grille de catégories - Asymétrique**

typescript

```typescript
// Layout inspiré Jacquemus avec modules de tailles variables
<section className="section-spacing">
<div className="grid grid-cols-12 gap-4">
{/* Grande image - HAUTS */}
<div className="col-span-12 md:col-span-8 md:row-span-2">
<CategoryCard
        image="/hauts.jpg"
        title="HAUTS"
        link="/hauts"
        size="large"
/>
</div>

{/* Petite image - BAS */}
<div className="col-span-6 md:col-span-4">
<CategoryCard
        image="/bas.jpg"
        title="BAS"
        link="/bas"
        size="small"
/>
</div>

{/* Petite image - ACCESSOIRES */}
<div className="col-span-6 md:col-span-4">
<CategoryCard
        image="/accessoires.jpg"
        title="ACCESSOIRES"
        link="/accessoires"
        size="small"
/>
</div>

{/* Moyenne image - LOOKBOOKS */}
<div className="col-span-12 md:col-span-6">
<CategoryCard
        image="/lookbooks.jpg"
        title="LOOKBOOKS"
        link="/lookbooks"
        size="medium"
/>
</div>

{/* Moyenne image - SUSTAINABILITY */}
<div className="col-span-12 md:col-span-6">
<CategoryCard
        image="/sustainability.jpg"
        title="SUSTAINABILITY"
        link="/sustainability"
        size="medium"
/>
</div>
</div>
</section>
```

### **3. Composant CategoryCard**

typescript

```typescript
// src/components/cards/CategoryCard.tsx
interfaceCategoryCardProps{
  image:string;
  title:string;
  link:string;
  size:'small'|'medium'|'large';
}

exportdefaultfunctionCategoryCard({ image, title, link, size }:CategoryCardProps){
const aspectRatios ={
    small:'aspect-[3/4]',
    medium:'aspect-[4/3]',
    large:'aspect-[3/2]'
};

return(
<Link href={link} className="group block relative overflow-hidden">
<div className={`relative ${aspectRatios[size]} w-full`}>
{/* Image */}
<img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
/>

{/* Overlay noir au hover */}
<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"/>

{/* Titre */}
<div className="absolute inset-0 flex items-center justify-center">
<h2 className="text-section text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
{title}
</h2>
</div>

{/* Titre permanent en bas (version mobile) */}
<div className="absolute bottom-0 left-0 right-0 p-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
<h3 className="text-product text-white">
{title}
</h3>
</div>
</div>
</Link>
);
}
```

---

## 🛍️ Pages Catégories (Hauts, Bas, Accessoires)

### **1. Structure de la page produits**

typescript

```typescript
// src/app/hauts/page.tsx (similaire pour /bas et /accessoires)
exportdefaultfunctionHautsPage(){
return(
<div className="min-h-screen bg-white">
<UnifiedHeader variant="minimal"/>

{/* Hero simple avec titre */}
<section className="pt-32 pb-16 px-8">
<div className="max-w-7xl mx-auto">
<h1 className="text-hero mb-4">HAUTS</h1>
<p className="text-body text-grey-medium max-w-md">
Collection complète de nos pièces essentielles
</p>
</div>
</section>

{/* Filtres minimalistes */}
<div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-grey-light py-4 px-8">
<div className="max-w-7xl mx-auto flex items-center justify-between">
<div className="flex gap-6">
<button className="text-product text-black hover:text-grey-medium transition-colors">
TOUT
</button>
<button className="text-product text-grey-medium hover:text-black transition-colors">
CHEMISES
</button>
<button className="text-product text-grey-medium hover:text-black transition-colors">
T-SHIRTS
</button>
<button className="text-product text-grey-medium hover:text-black transition-colors">
PULLS
</button>
</div>

<button className="text-product text-grey-medium hover:text-black transition-colors flex items-center gap-2">
TRIERPAR
<ChevronDown className="w-4 h-4"/>
</button>
</div>
</div>

{/* Grille produits - 3 colonnes sur desktop */}
<section className="py-16 px-8">
<div className="max-w-7xl mx-auto">
<ProductGridMinimal products={products}/>
</div>
</section>
</div>
);
}
```

### **2. Composant ProductCard Minimaliste**

typescript

```typescript
// src/components/products/ProductCardMinimal.tsx
exportdefaultfunctionProductCardMinimal({ product }:{ product:Product}){
const[isHovered, setIsHovered]=useState(false);
const mainImage = product.images?.[0];
const hoverImage = product.images?.[1]|| mainImage;

return(
<Link
      href={`/products/${product.id}`}
      className="group block"
      onMouseEnter={()=>setIsHovered(true)}
      onMouseLeave={()=>setIsHovered(false)}
>
{/* Image avec changement au hover */}
<div className="relative aspect-[3/4] mb-4 overflow-hidden bg-grey-light">
<img
          src={isHovered ? hoverImage.url: mainImage.url}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
/>

{/* Badge "NOUVEAU" si applicable */}
{product.is_new&&(
<div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs tracking-wider">
NOUVEAU
</div>
)}

{/* Badge "ÉPUISÉ" si applicable */}
{!product.stock_quantity&&(
<div className="absolute inset-0 bg-white/80 flex items-center justify-center">
<span className="text-product">ÉPUISÉ</span>
</div>
)}
</div>

{/* Infos produit */}
<div className="space-y-1">
<h3 className="text-product text-black group-hover:text-grey-medium transition-colors">
{product.name.toUpperCase()}
</h3>

<div className="flex items-center justify-between">
<p className="text-body text-black">
{product.price}€
</p>

{/* Couleurs disponibles */}
{product.variants&&(
<div className="flex gap-1">
{getUniqueColors(product.variants).slice(0,3).map((color, i)=>(
<div
                  key={i}
                  className="w-3 h-3 rounded-full border border-grey-medium"
                  style={{ backgroundColor:getColorHex(color)}}
/>
))}
</div>
)}
</div>
</div>
</Link>
);
}
```

### **3. Grille responsive**

typescript

```typescript
// src/components/products/ProductGridMinimal.tsx
exportdefaultfunctionProductGridMinimal({ products }:{ products:Product[]}){
return(
<div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
{products.map(product =>(
<ProductCardMinimal key={product.id} product={product}/>
))}
</div>
);
}
```

---

## 📸 Refonte page Lookbooks

### **1. Liste des lookbooks - Grille asymétrique**

typescript

```typescript
// src/app/lookbooks/page.tsx
exportdefaultfunctionLookbooksPage(){
return(
<div className="min-h-screen bg-white">
<UnifiedHeader variant="minimal"/>

{/* Hero */}
<section className="pt-32 pb-16 px-8">
<div className="max-w-7xl mx-auto">
<h1 className="text-hero">LOOKBOOKS</h1>
</div>
</section>

{/* Grille lookbooks */}
<section className="pb-24 px-8">
<div className="max-w-7xl mx-auto">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{lookbooks.map((lookbook, index)=>(
<LookbookCard
                key={lookbook.id}
                lookbook={lookbook}
                variant={index %3===0?'large':'normal'}
/>
))}
</div>
</div>
</section>
</div>
);
}
```

### **2. Card Lookbook avec vidéo preview**

typescript

```typescript
// src/components/lookbooks/LookbookCard.tsx
exportdefaultfunctionLookbookCard({ lookbook, variant }:Props){
const[isPlaying, setIsPlaying]=useState(false);
const videoRef =useRef<HTMLVideoElement>(null);

return(
<Link
      href={`/lookbooks/${lookbook.slug.current}`}
      className={`group block ${variant ==='large'?'md:col-span-2':''}`}
      onMouseEnter={()=>{
setIsPlaying(true);
        videoRef.current?.play();
}}
      onMouseLeave={()=>{
setIsPlaying(false);
        videoRef.current?.pause();
}}
>
<div className="relative aspect-[16/9] overflow-hidden bg-black">
{/* Vidéo preview (si disponible) */}
{lookbook.videoPreview&&(
<video
            ref={videoRef}
            src={lookbook.videoPreview}
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
/>
)}

{/* Image statique */}
<img
          src={urlFor(lookbook.coverImage).width(1600).height(900).url()}
          alt={lookbook.title}
          className="absolute inset-0 h-full w-full object-cover group-hover:opacity-0 transition-opacity duration-700"
/>

{/* Overlay */}
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>

{/* Titre */}
<div className="absolute bottom-8 left-8 right-8">
<p className="text-xs tracking-widest text-white/80 mb-2">
{lookbook.season}
</p>
<h2 className="text-section text-white">
{lookbook.title}
</h2>
</div>
</div>
</Link>
);
}
```

### **3. Page détail lookbook - Scrollytelling**

typescript

```typescript
// src/app/lookbooks/[slug]/page.tsx
exportdefaultasyncfunctionLookbookDetailPage({ params }:Props){
const lookbook =awaitgetLookbook(params.slug);

return(
<div className="min-h-screen bg-white">
{/* Header minimal sans navigation */}
<div className="fixed top-0 left-0 right-0 z-50 p-8">
<Link href="/lookbooks" className="inline-flex items-center gap-2 text-white hover:text-grey-light transition-colors">
<ArrowLeft className="w-4 h-4"/>
<span className="text-product">RETOUR</span>
</Link>
</div>

{/* Hero vidéo plein écran */}
{lookbook.heroVideo&&(
<section className="relative h-screen w-full">
<video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            src={lookbook.heroVideo}
/>

<div className="absolute inset-0 bg-black/20"/>

<div className="relative z-10 flex h-full items-end pb-16 px-8">
<div>
<p className="text-xs tracking-widest text-white/80 mb-2">
{lookbook.season}
</p>
<h1 className="text-hero text-white">
{lookbook.title}
</h1>
</div>
</div>
</section>
)}

{/* Galerie images - Alternance layouts */}
<section className="py-24">
{lookbook.images.map((image, index)=>{
const isFullWidth = index %3===0;
const isDouble = index %4===0;

return(
<div
              key={index}
              className={`
${isFullWidth ?'w-full':'max-w-7xl mx-auto px-8'}
${isDouble ?'grid md:grid-cols-2 gap-8':''}
                mb-16
`}
>
{isDouble ?(
<>
<img
                    src={urlFor(image).width(1200).height(1600).url()}
                    alt={`Look ${index +1}`}
                    className="w-full h-auto"
/>
<img
                    src={urlFor(lookbook.images[index +1]).width(1200).height(1600).url()}
                    alt={`Look ${index +2}`}
                    className="w-full h-auto"
/>
</>
):(
<img
                  src={urlFor(image).width(2400).height(1600).url()}
                  alt={`Look ${index +1}`}
                  className="w-full h-auto"
/>
)}
</div>
);
})}
</section>

{/* CTA Shop the look */}
<section className="py-24 px-8 bg-grey-light">
<div className="max-w-7xl mx-auto text-center">
<h2 className="text-section mb-8">SHOPTHELOOK</h2>
<Link href="/hauts" className="btn-primary">
DÉCOUVRIRLACOLLECTION
</Link>
</div>
</section>
</div>
);
}
```

---

## 🌱 Nouvelle page Sustainability

### **Structure de la page**

typescript

```typescript
// src/app/sustainability/page.tsx
exportdefaultfunctionSustainabilityPage(){
return(
<div className="min-h-screen bg-white">
<UnifiedHeader variant="minimal"/>

{/* Hero image avec manifeste */}
<section className="relative h-screen w-full">
<div className="absolute inset-0">
<img
            src="/sustainability-hero.jpg"
            alt="Sustainability"
            className="h-full w-full object-cover"
/>
<div className="absolute inset-0 bg-black/40"/>
</div>

<div className="relative z-10 flex h-full items-center justify-center px-8">
<div className="max-w-3xl text-center text-white">
<h1 className="text-hero mb-8">
MODE
<br />
RESPONSABLE
</h1>
<p className="text-body text-white/90 text-lg leading-relaxed">
Notre engagement pour une mode plus durable,
              respectueuse des artisans et de l'environnement.
</p>
</div>
</div>
</section>

{/* Section 1: Nos engagements */}
<section className="py-24 px-8">
<div className="max-w-7xl mx-auto">
<div className="grid md:grid-cols-2 gap-16 items-center">
<div>
<h2 className="text-section mb-6">NOSENGAGEMENTS</h2>
<div className="space-y-6">
<CommitmentItem
number="01"
                  title="Matières responsables"
                  description="100% de nos tissus sont certifiés bio ou recyclés"
/>
<CommitmentItem
number="02"
                  title="Production locale"
                  description="Fabrication française dans nos ateliers partenaires"
/>
<CommitmentItem
number="03"
                  title="Transparence totale"
                  description="Traçabilité complète de nos produits"
/>
<CommitmentItem
number="04"
                  title="Économie circulaire"
                  description="Programme de reprise et recyclage de vos pièces"
/>
</div>
</div>

<div className="aspect-[3/4] bg-grey-light">
<img
                src="/engagement.jpg"
                alt="Nos engagements"
                className="w-full h-full object-cover"
/>
</div>
</div>
</div>
</section>

{/* Section 2: Nos matières */}
<section className="py-24 px-8 bg-grey-light">
<div className="max-w-7xl mx-auto">
<h2 className="text-section mb-16 text-center">NOSMATIÈRES</h2>

<div className="grid md:grid-cols-3 gap-8">
<MaterialCard
              image="/coton-bio.jpg"
              title="COTON BIO"
              description="Cultivé sans pesticides, certifié GOTS"
/>
<MaterialCard
              image="/lin.jpg"
              title="LIN EUROPÉEN"
              description="Cultivé en France et Belgique"
/>
<MaterialCard
              image="/laine-responsable.jpg"
              title="LAINE RESPONSABLE"
              description="Certifiée RWS, traçabilité garantie"
/>
</div>
</div>
</section>

{/* Section 3: Notre impact */}
<section className="py-24 px-8">
<div className="max-w-7xl mx-auto">
<h2 className="text-section mb-16 text-center">NOTREIMPACTEN2024</h2>

<div className="grid md:grid-cols-4 gap-12">
<ImpactStatnumber="100%" label="Matières responsables"/>
<ImpactStatnumber="-40%" label="Émissions CO2"/>
<ImpactStatnumber="15" label="Artisans partenaires"/>
<ImpactStatnumber="1000+" label="Pièces recyclées"/>
</div>
</div>
</section>

{/* Section 4: Nos certifications */}
<section className="py-24 px-8 bg-black text-white">
<div className="max-w-7xl mx-auto">
<h2 className="text-section mb-16 text-center">CERTIFICATIONS</h2>

<div className="flex flex-wrap justify-center gap-16">
<CertificationBadge name="GOTS"/>
<CertificationBadge name="RWS"/>
<CertificationBadge name="OEKO-TEX"/>
<CertificationBadge name="B CORP"/>
</div>
</div>
</section>

{/* CTA */}
<section className="py-24 px-8">
<div className="max-w-3xl mx-auto text-center">
<h2 className="text-section mb-8">
DÉCOUVREZNOSCOLLECTIONSRESPONSABLES
</h2>
<Link href="/hauts" className="btn-primary">
VOIRLACOLLECTION
</Link>
</div>
</section>
</div>
);
}

// Composants helpers
functionCommitmentItem({number, title, description }:any){
return(
<div className="flex gap-6">
<span className="text-section text-grey-light">{number}</span>
<div>
<h3 className="text-product mb-2">{title}</h3>
<p className="text-body text-grey-medium">{description}</p>
</div>
</div>
);
}

functionMaterialCard({ image, title, description }:any){
return(
<div>
<div className="aspect-square mb-4 bg-white overflow-hidden">
<img src={image} alt={title} className="w-full h-full object-cover"/>
</div>
<h3 className="text-product mb-2">{title}</h3>
<p className="text-body text-grey-medium">{description}</p>
</div>
);
}

functionImpactStat({number, label }:any){
return(
<div className="text-center">
<div className="text-hero text-black mb-2">{number}</div>
<p className="text-product text-grey-medium">{label}</p>
</div>
);
}

functionCertificationBadge({ name }:any){
return(
<div className="w-32 h-32 border border-white/20 flex items-center justify-center">
<span className="text-product">{name}</span>
</div>
);
}
```

---

## 🎯 Refonte Header/Navigation

### **Navigation style Jacquemus**

typescript

```typescript
// src/components/layout/HeaderMinimal.tsx
exportdefaultfunctionHeaderMinimal(){
const[isScrolled, setIsScrolled]=useState(false);
const[isMenuOpen, setIsMenuOpen]=useState(false);

useEffect(()=>{
consthandleScroll=()=>setIsScrolled(window.scrollY>50);
window.addEventListener('scroll', handleScroll);
return()=>window.removeEventListener('scroll', handleScroll);
},[]);

return(
<>
{/* Header fixe */}
<header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500
${isScrolled ?'bg-white/95 backdrop-blur-md shadow-sm':'bg-transparent'}
`}
>
<div className="max-w-[1920px] mx-auto px-8 py-6 flex items-center justify-between">
{/* Logo */}
<Link href="/" className="text-product">
.BLANCHERENAUDIN
</Link>

{/* Navigation desktop */}
<nav className="hidden lg:flex items-center gap-8">
<NavLink href="/hauts">HAUTS</NavLink>
<NavLink href="/bas">BAS</NavLink>
<NavLink href="/accessoires">ACCESSOIRES</NavLink>
<NavLink href="/lookbooks">LOOKBOOKS</NavLink>
<NavLink href="/sustainability">SUSTAINABILITY</NavLink>
```

Réessayer

TR

Continuer

Modifier

typescript

```typescript
<NavLink href="/a-propos">À PROPOS</NavLink>
<NavLink href="/contact">CONTACT</NavLink>
</nav>

{/* Actions */}
<div className="flex items-center gap-6">
<button
              className="text-product hover:text-grey-medium transition-colors"
              aria-label="Recherche"
>
<Search className="w-5 h-5"/>
</button>

<Link
              href="/cart"
              className="relative text-product hover:text-grey-medium transition-colors"
>
<ShoppingBag className="w-5 h-5"/>
{totalItems >0&&(
<span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
{totalItems}
</span>
)}
</Link>

{/* Menu burger mobile */}
<button
              onClick={()=>setIsMenuOpen(true)}
              className="lg:hidden text-product"
              aria-label="Menu"
>
<Menu className="w-6 h-6"/>
</button>
</div>
</div>
</header>

{/* Menu mobile fullscreen */}
<MobileMenu isOpen={isMenuOpen} onClose={()=>setIsMenuOpen(false)}/>
</>
);
}

functionNavLink({ href, children }:{ href:string; children:React.ReactNode}){
const pathname =usePathname();
const isActive = pathname === href || pathname.startsWith(href +'/');

return(
<Link
      href={href}
      className={`
        text-product transition-colors relative
${isActive ?'text-black':'text-grey-medium hover:text-black'}
`}
>
{children}
{isActive &&(
<span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black"/>
)}
</Link>
);
}
```

### **Menu mobile fullscreen**

typescript

```typescript
// src/components/layout/MobileMenu.tsx
interfaceMobileMenuProps{
  isOpen:boolean;
onClose:()=>void;
}

exportdefaultfunctionMobileMenu({ isOpen, onClose }:MobileMenuProps){
const menuItems =[
{ label:'HAUTS', href:'/hauts'},
{ label:'BAS', href:'/bas'},
{ label:'ACCESSOIRES', href:'/accessoires'},
{ label:'LOOKBOOKS', href:'/lookbooks'},
{ label:'SUSTAINABILITY', href:'/sustainability'},
{ label:'À PROPOS', href:'/a-propos'},
{ label:'CONTACT', href:'/contact'},
];

return(
<AnimatePresence>
{isOpen &&(
<motion.div
          initial={{ opacity:0}}
          animate={{ opacity:1}}
          exit={{ opacity:0}}
          transition={{ duration:0.3}}
          className="fixed inset-0 z-[100] bg-white"
>
{/* Header menu */}
<div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between">
<span className="text-product">.BLANCHERENAUDIN</span>
<button
              onClick={onClose}
              className="text-product"
              aria-label="Fermer"
>
<X className="w-6 h-6"/>
</button>
</div>

{/* Navigation */}
<div className="h-full flex items-center justify-center">
<nav className="space-y-8">
{menuItems.map((item, index)=>(
<motion.div
                  key={item.href}
                  initial={{ opacity:0, y:20}}
                  animate={{ opacity:1, y:0}}
                  transition={{ delay: index *0.05}}
>
<Link
                    href={item.href}
                    onClick={onClose}
                    className="block text-section text-center hover:text-grey-medium transition-colors"
>
{item.label}
</Link>
</motion.div>
))}
</nav>
</div>

{/* Footer menu */}
<div className="absolute bottom-8 left-8 right-8 flex justify-between text-product text-grey-medium">
<Link href="/account" onClick={onClose}>COMPTE</Link>
<Link href="/help" onClick={onClose}>AIDE</Link>
</div>
</motion.div>
)}
</AnimatePresence>
);
}
```

---

## 📄 Refonte page À Propos

typescript

```typescript
// src/app/a-propos/page.tsx
exportdefaultasyncfunctionAboutPage(){
const pageData =awaitgetAboutPage();

return(
<div className="min-h-screen bg-white">
<HeaderMinimal/>

{/* Hero avec image et manifeste */}
<section className="relative h-screen w-full">
<div className="absolute inset-0">
<img
            src="/about-hero.jpg"
            alt="À propos"
            className="h-full w-full object-cover"
/>
<div className="absolute inset-0 bg-black/30"/>
</div>

<div className="relative z-10 flex h-full items-center px-8">
<div className="max-w-4xl">
<h1 className="text-hero text-white mb-8">
LAMAISON
<br />
BLANCHERENAUDIN
</h1>
<p className="text-body text-white/90 text-xl leading-relaxed max-w-2xl">
Fondée en 2020,.blancherenaudin célèbre l'artisanat français
              et la modernité intemporelle.Chaque pièce raconte une histoire
              d'excellence et de passion.
</p>
</div>
</div>
</section>

{/* Section 1: Notre histoire (texte + image) */}
<section className="py-24 px-8">
<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
<div className="order-2 md:order-1">
<div className="aspect-[3/4] bg-grey-light">
<img
                src="/about-histoire.jpg"
                alt="Notre histoire"
                className="w-full h-full object-cover"
/>
</div>
</div>

<div className="order-1 md:order-2">
<h2 className="text-section mb-8">NOTREHISTOIRE</h2>
<div className="space-y-6 text-body text-grey-medium leading-relaxed">
<p>
Fondée à Paris en 2020 par BlancheRenaudin, la maison incarne
                une vision moderne de l'élégance française.Formée aux Beaux-Arts
                et passionnée par les savoir-faire traditionnels,Blanche crée
                des pièces qui transcendent les saisons.
</p>
<p>
Chaque collection est le fruit d'un dialogue entre patrimoine
                et innovation, entre matières nobles et coupes contemporaines.
L'atelier parisien perpétue l'excellence de la haute couture
                tout en embrassant les enjeux de notre époque.
</p>
<p>
Aujourd'hui,.blancherenaudin est reconnue pour son approche
                responsable et son engagement envers l'artisanat français.
</p>
</div>
</div>
</div>
</section>

{/* Section 2: Notre philosophie (full width image + texte centré) */}
<section className="py-24">
<div className="w-full aspect-[21/9] bg-grey-light mb-16">
<img
            src="/about-atelier.jpg"
            alt="Notre atelier"
            className="w-full h-full object-cover"
/>
</div>

<div className="max-w-3xl mx-auto px-8 text-center">
<h2 className="text-section mb-8">NOTREPHILOSOPHIE</h2>
<p className="text-body text-grey-medium leading-relaxed text-lg">
Créer moins, créer mieux.C'est le principe fondateur de la maison.
Chaque pièce est pensée pour durer, pour se transmettre, pour
            s'affranchir des tendances éphémères.Notre engagement : une mode
            intemporelle, respectueuse des artisans et de l'environnement.
</p>
</div>
</section>

{/* Section 3: Nos valeurs (3 colonnes) */}
<section className="py-24 px-8 bg-grey-light">
<div className="max-w-7xl mx-auto">
<h2 className="text-section mb-16 text-center">NOSVALEURS</h2>

<div className="grid md:grid-cols-3 gap-12">
<ValueCard
number="01"
              title="EXCELLENCE"
              description="Savoir-faire artisanal et attention portée aux moindres détails"
/>
<ValueCard
number="02"
              title="AUTHENTICITÉ"
              description="Des créations sincères qui reflètent notre vision unique"
/>
<ValueCard
number="03"
              title="RESPONSABILITÉ"
              description="Engagement pour une mode durable et éthique"
/>
</div>
</div>
</section>

{/* Section 4: L'équipe (grid photos) */}
<section className="py-24 px-8">
<div className="max-w-7xl mx-auto">
<h2 className="text-section mb-16 text-center">L'ÉQUIPE</h2>

<div className="grid md:grid-cols-4 gap-8">
<TeamMember
              image="/team-blanche.jpg"
              name="Blanche Renaudin"
              role="Fondatrice & Directrice Artistique"
/>
<TeamMember
              image="/team-marie.jpg"
              name="Marie Dubois"
              role="Responsable Atelier"
/>
<TeamMember
              image="/team-lucas.jpg"
              name="Lucas Martin"
              role="Styliste"
/>
<TeamMember
              image="/team-julie.jpg"
              name="Julie Petit"
              role="Responsable Production"
/>
</div>
</div>
</section>

{/* Section 5: Notre atelier (video ou image + texte) */}
<section className="py-24">
<div className="w-full">
<div className="aspect-video bg-black">
<video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              src="/atelier-video.mp4"
/>
</div>
</div>

<div className="max-w-3xl mx-auto px-8 mt-16 text-center">
<h2 className="text-section mb-8">NOTREATELIERPARISIEN</h2>
<p className="text-body text-grey-medium leading-relaxed text-lg">
Situé dans le Marais, notre atelier est le cœur battant de la maison.
C'est ici que naissent toutes nos collections, dans le respect des
            techniques traditionnelles de la haute couture française.
</p>
</div>
</section>

{/* CTA */}
<section className="py-24 px-8 bg-black text-white">
<div className="max-w-3xl mx-auto text-center">
<h2 className="text-section mb-8">DÉCOUVREZNOSCRÉATIONS</h2>
<Link href="/hauts" className="btn-primary-inverse">
VOIRLACOLLECTION
</Link>
</div>
</section>
</div>
);
}

// Composants helpers
functionValueCard({number, title, description }:any){
return(
<div className="text-center">
<span className="text-section text-grey-light block mb-4">{number}</span>
<h3 className="text-product mb-4">{title}</h3>
<p className="text-body text-grey-medium">{description}</p>
</div>
);
}

functionTeamMember({ image, name, role }:any){
return(
<div className="group cursor-pointer">
<div className="aspect-[3/4] bg-grey-light mb-4 overflow-hidden">
<img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
/>
</div>
<h3 className="text-product mb-1">{name}</h3>
<p className="text-body text-grey-medium text-sm">{role}</p>
</div>
);
}
```

---

## 📧 Refonte page Contact

typescript

```typescript
// src/app/contact/page.tsx
'use client'

exportdefaultfunctionContactPage(){
const[formData, setFormData]=useState({
    name:'',
    email:'',
    subject:'',
    message:'',
});
const[isSubmitting, setIsSubmitting]=useState(false);

return(
<div className="min-h-screen bg-white">
<HeaderMinimal/>

{/* Hero simple */}
<section className="pt-32 pb-24 px-8">
<div className="max-w-7xl mx-auto">
<h1 className="text-hero mb-8">CONTACT</h1>
<p className="text-body text-grey-medium max-w-2xl text-lg">
Une question ?Un projet sur-mesure ?Notre équipe vous répond
            sous 48h.
</p>
</div>
</section>

{/* Grid 2 colonnes: Formulaire + Infos */}
<section className="pb-24 px-8">
<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
{/* Formulaire minimaliste */}
<div>
<h2 className="text-section mb-12">ÉCRIVEZ-NOUS</h2>

<form onSubmit={handleSubmit} className="space-y-8">
<div>
<label className="block text-product mb-3">NOM*</label>
<input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e)=>setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-grey-medium focus:border-black outline-none py-3 text-body transition-colors"
/>
</div>

<div>
<label className="block text-product mb-3">EMAIL*</label>
<input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e)=>setFormData({...formData, email: e.target.value})}
                  className="w-full border-b border-grey-medium focus:border-black outline-none py-3 text-body transition-colors"
/>
</div>

<div>
<label className="block text-product mb-3">SUJET*</label>
<input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e)=>setFormData({...formData, subject: e.target.value})}
                  className="w-full border-b border-grey-medium focus:border-black outline-none py-3 text-body transition-colors"
/>
</div>

<div>
<label className="block text-product mb-3">MESSAGE*</label>
<textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e)=>setFormData({...formData, message: e.target.value})}
                  className="w-full border-b border-grey-medium focus:border-black outline-none py-3 text-body resize-none transition-colors"
/>
</div>

<button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full md:w-auto"
>
{isSubmitting ?'ENVOI...':'ENVOYER'}
</button>
</form>
</div>

{/* Informations */}
<div className="space-y-12">
<div>
<h3 className="text-section mb-8">SHOWROOM</h3>
<div className="space-y-4 text-body text-grey-medium">
<p>
15 rue de la Mode<br />
75003Paris,France
</p>
<p>
Du mardi au samedi<br />
                  11h00 - 19h00
</p>
<p className="text-product text-black">
Sur rendez-vous uniquement
</p>
</div>
</div>

<div>
<h3 className="text-section mb-8">CONTACT</h3>
<div className="space-y-3 text-body text-grey-medium">
<p>
<a href="mailto:hello@blancherenaudin.com" className="hover:text-black transition-colors">
                    hello@blancherenaudin.com
</a>
</p>
<p>
<a href="tel:+33123456789" className="hover:text-black transition-colors">
+33123456789
</a>
</p>
</div>
</div>

<div>
<h3 className="text-section mb-8">SERVICECLIENT</h3>
<div className="space-y-3 text-body text-grey-medium">
<p>
<a href="mailto:service@blancherenaudin.com" className="hover:text-black transition-colors">
                    service@blancherenaudin.com
</a>
</p>
<p>Réponse sous 48h</p>
</div>
</div>

<div>
<h3 className="text-section mb-8">SUIVEZ-NOUS</h3>
<div className="flex gap-6">
<a
                  href="https://instagram.com/blancherenaudin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-product text-grey-medium hover:text-black transition-colors"
>
INSTAGRAM
</a>
<a
                  href="https://pinterest.com/blancherenaudin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-product text-grey-medium hover:text-black transition-colors"
>
PINTEREST
</a>
</div>
</div>
</div>
</div>
</section>

{/* Map (optionnel) */}
<section className="pb-24 px-8">
<div className="max-w-7xl mx-auto">
<div className="aspect-[21/9] bg-grey-light">
{/* Intégrer Google Maps ou Mapbox ici */}
<div className="w-full h-full flex items-center justify-center text-grey-medium">
<p>Carte interactive</p>
</div>
</div>
</div>
</section>
</div>
);
}
```

---

## 🎨 Composants UI communs style Jacquemus

### **1. Boutons**

css

```css
/* src/app/globals.css - Ajouter */

/* Bouton primaire */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem2.5rem;
  background: var(--black);
  color: var(--white);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: var(--grey-medium);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Bouton primaire inversé */
.btn-primary-inverse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem2.5rem;
  background: var(--white);
  color: var(--black);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-inverse:hover {
  background: var(--grey-light);
}

/* Bouton secondaire (outline) */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem2.5rem;
  background: transparent;
  color: var(--black);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--black);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--black);
  color: var(--white);
}

/* Bouton texte */
.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  background: transparent;
  color: var(--black);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-bottom: 1px solid var(--black);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-text:hover {
  color: var(--grey-medium);
  border-color: var(--grey-medium);
}
```

### **2. Animations scroll reveal**

typescript

```typescript
// src/hooks/useScrollReveal.ts
import{ useEffect, useRef, useState }from'react';

exportfunctionuseScrollReveal(options ={}){
const ref =useRef<HTMLElement>(null);
const[isVisible, setIsVisible]=useState(false);

useEffect(()=>{
const observer =newIntersectionObserver(
([entry])=>{
if(entry.isIntersecting){
setIsVisible(true);
}
},
{
        threshold:0.1,
...options,
}
);

if(ref.current){
      observer.observe(ref.current);
}

return()=>{
if(ref.current){
        observer.unobserve(ref.current);
}
};
},[]);

return{ ref, isVisible };
}
```

typescript

```typescript
// Utilisation dans un composant
import{ useScrollReveal }from'@/hooks/useScrollReveal';

exportdefaultfunctionAnimatedSection(){
const{ ref, isVisible }=useScrollReveal();

return(
<section
      ref={ref}
      className={`
        transition-all duration-1000
${isVisible ?'opacity-100 translate-y-0':'opacity-0 translate-y-12'}
`}
>
{/* Contenu */}
</section>
);
}
```

### **3. Hover image change**

typescript

```typescript
// src/components/common/ImageHover.tsx
import{ useState }from'react';

interfaceImageHoverProps{
  defaultImage:string;
  hoverImage:string;
  alt:string;
  className?:string;
}

exportdefaultfunctionImageHover({
  defaultImage,
  hoverImage,
  alt,
  className =''
}:ImageHoverProps){
const[currentImage, setCurrentImage]=useState(defaultImage);

return(
<div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={()=>setCurrentImage(hoverImage)}
      onMouseLeave={()=>setCurrentImage(defaultImage)}
>
<img
        src={currentImage}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
/>
</div>
);
}
```

---

## 🎬 Animations et transitions

### **Smooth scroll**

typescript

```typescript
// src/app/layout.tsx - Ajouter
import{ useEffect }from'react';
importLenisfrom'@studio-freight/lenis';

exportdefaultfunctionRootLayout({ children }:Props){
useEffect(()=>{
const lenis =newLenis({
      duration:1.2,
easing:(t)=>Math.min(1,1.001-Math.pow(2,-10* t)),
      smoothWheel:true,
});

functionraf(time:number){
      lenis.raf(time);
requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

return()=>{
      lenis.destroy();
};
},[]);

return(
<html lang="fr">
<body className={`${archivoBlack.variable}${archivoNarrow.variable} antialiased`}>
{children}
</body>
</html>
);
}
```

### **Page transitions**

typescript

```typescript
// src/components/transitions/PageTransition.tsx
import{ motion,AnimatePresence}from'framer-motion';
import{ usePathname }from'next/navigation';

exportdefaultfunctionPageTransition({ children }:{ children:React.ReactNode}){
const pathname =usePathname();

return(
<AnimatePresence mode="wait">
<motion.div
        key={pathname}
        initial={{ opacity:0}}
        animate={{ opacity:1}}
        exit={{ opacity:0}}
        transition={{
          duration:0.5,
          ease:[0.43,0.13,0.23,0.96]
}}
>
{children}
</motion.div>
</AnimatePresence>
);
}
```

---

## 📦 Footer minimaliste

typescript

```typescript
// src/components/layout/FooterMinimal.tsx
exportdefaultfunctionFooterMinimal(){
return(
<footer className="border-t border-grey-light py-16 px-8">
<div className="max-w-7xl mx-auto">
<div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
{/* Colonne 1: Shop */}
<div>
<h3 className="text-product mb-6">SHOP</h3>
<ul className="space-y-3">
<li>
<Link href="/hauts" className="text-body text-grey-medium hover:text-black transition-colors">
Hauts
</Link>
</li>
<li>
<Link href="/bas" className="text-body text-grey-medium hover:text-black transition-colors">
Bas
</Link>
</li>
<li>
<Link href="/accessoires" className="text-body text-grey-medium hover:text-black transition-colors">
Accessoires
</Link>
</li>
<li>
<Link href="/lookbooks" className="text-body text-grey-medium hover:text-black transition-colors">
Lookbooks
</Link>
</li>
</ul>
</div>

{/* Colonne 2: Maison */}
<div>
<h3 className="text-product mb-6">MAISON</h3>
<ul className="space-y-3">
<li>
<Link href="/a-propos" className="text-body text-grey-medium hover:text-black transition-colors">
                  À propos
</Link>
</li>
<li>
<Link href="/sustainability" className="text-body text-grey-medium hover:text-black transition-colors">
Sustainability
</Link>
</li>
<li>
<Link href="/contact" className="text-body text-grey-medium hover:text-black transition-colors">
Contact
</Link>
</li>
</ul>
</div>

{/* Colonne 3: Aide */}
<div>
<h3 className="text-product mb-6">AIDE</h3>
<ul className="space-y-3">
<li>
<Link href="/livraison" className="text-body text-grey-medium hover:text-black transition-colors">
Livraison
</Link>
</li>
<li>
<Link href="/retours" className="text-body text-grey-medium hover:text-black transition-colors">
Retours
</Link>
</li>
<li>
<Link href="/faq" className="text-body text-grey-medium hover:text-black transition-colors">
FAQ
</Link>
</li>
<li>
<Link href="/contact" className="text-body text-grey-medium hover:text-black transition-colors">
Service client
</Link>
</li>
</ul>
</div>

{/* Colonne 4: Newsletter */}
<div>
<h3 className="text-product mb-6">NEWSLETTER</h3>
<p className="text-body text-grey-medium mb-4">
Recevez nos actualités et offres exclusives
</p>
<form className="space-y-
```

Réessayer

TR

Continuer

Modifier

typescript

```typescript
<form className="space-y-3">
<input
                type="email"
                placeholder="Votre email"
                className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-body transition-colors bg-transparent"
/>
<button type="submit" className="btn-text">
S'INSCRIRE
</button>
</form>
</div>
</div>

{/* Ligne séparation */}
<div className="border-t border-grey-light pt-8">
<div className="flex flex-col md:flex-row justify-between items-center gap-6">
{/* Logo + Copyright */}
<div className="flex items-center gap-8">
<span className="text-product">.BLANCHERENAUDIN</span>
<span className="text-body text-grey-medium text-sm">
                © 2024Tous droits réservés
</span>
</div>

{/* Social */}
<div className="flex items-center gap-6">

                href="https://instagram.com/blancherenaudin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-grey-medium hover:text-black transition-colors"
>
INSTAGRAM
</a>

                href="https://pinterest.com/blancherenaudin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-grey-medium hover:text-black transition-colors"
>
PINTEREST
</a>
</div>

{/* Légal */}
<div className="flex items-center gap-6">
<Link
                href="/mentions-legales"
                className="text-body text-grey-medium hover:text-black transition-colors text-sm"
>
Mentions légales
</Link>
<Link
                href="/confidentialite"
                className="text-body text-grey-medium hover:text-black transition-colors text-sm"
>
Confidentialité
</Link>
</div>
</div>
</div>
</div>
</footer>
);
}
```

---

## 🛒 Refonte page Panier

typescript

```typescript
// src/app/cart/page.tsx
'use client'

exportdefaultfunctionCartPage(){
const{ items, totalItems, totalPrice, removeItem, updateQuantity }=useCartStore();

if(items.length===0){
return(
<div className="min-h-screen bg-white">
<HeaderMinimal/>

<section className="pt-32 pb-24 px-8">
<div className="max-w-3xl mx-auto text-center">
<h1 className="text-hero mb-8">PANIER</h1>
<p className="text-body text-grey-medium mb-12">
Votre panier est vide
</p>
<Link href="/hauts" className="btn-primary">
DÉCOUVRIRLACOLLECTION
</Link>
</div>
</section>
</div>
);
}

return(
<div className="min-h-screen bg-white">
<HeaderMinimal/>

<section className="pt-32 pb-24 px-8">
<div className="max-w-7xl mx-auto">
<h1 className="text-hero mb-16">PANIER({totalItems})</h1>

<div className="grid md:grid-cols-3 gap-16">
{/* Liste articles - 2 colonnes */}
<div className="md:col-span-2 space-y-8">
{items.map((item)=>(
<CartItemRow
                  key={`${item.id}-${item.size}-${item.color}`}
                  item={item}
                  onRemove={()=>removeItem(item.id)}
                  onUpdateQuantity={(qty)=>updateQuantity(item.id, qty)}
/>
))}
</div>

{/* Récapitulatif - 1 colonne sticky */}
<div className="md:col-span-1">
<div className="sticky top-32 bg-grey-light p-8 space-y-6">
<h2 className="text-section mb-6">RÉCAPITULATIF</h2>

<div className="space-y-4 text-body">
<div className="flex justify-between">
<span className="text-grey-medium">Sous-total</span>
<span className="font-semibold">{totalPrice.toFixed(2)}€</span>
</div>

<div className="flex justify-between">
<span className="text-grey-medium">Livraison</span>
<span className="font-semibold">Gratuite</span>
</div>

<div className="border-t border-grey-medium pt-4 flex justify-between text-product">
<span>TOTAL</span>
<span>{totalPrice.toFixed(2)}€</span>
</div>
</div>

<button className="btn-primary w-full">
PASSERLACOMMANDE
</button>

<Link
                  href="/hauts"
                  className="btn-text w-full justify-center"
>
CONTINUERMESACHATS
</Link>

{/* Réassurance */}
<div className="pt-6 border-t border-grey-medium space-y-3 text-sm text-grey-medium">
<div className="flex items-start gap-3">
<Truck className="w-5 h-5 flex-shrink-0"/>
<span>Livraison gratuite dès 75€</span>
</div>
<div className="flex items-start gap-3">
<RotateCcw className="w-5 h-5 flex-shrink-0"/>
<span>Retours gratuits sous 30 jours</span>
</div>
<div className="flex items-start gap-3">
<Shield className="w-5 h-5 flex-shrink-0"/>
<span>Paiement sécurisé</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
</div>
);
}

// Composant ligne panier
functionCartItemRow({ item, onRemove, onUpdateQuantity }:any){
return(
<div className="flex gap-6 pb-8 border-b border-grey-light">
{/* Image */}
<div className="w-32 h-40 flex-shrink-0 bg-grey-light">
<img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
/>
</div>

{/* Infos */}
<div className="flex-1 flex flex-col justify-between">
<div>
<h3 className="text-product mb-2">{item.name}</h3>
<div className="text-body text-grey-medium space-y-1">
{item.color&&<p>Couleur:{item.color}</p>}
{item.size&&<p>Taille:{item.size}</p>}
</div>
</div>

<div className="flex items-end justify-between">
{/* Quantité */}
<div className="flex items-center gap-3">
<button
              onClick={()=>onUpdateQuantity(item.quantity-1)}
              disabled={item.quantity<=1}
              className="w-8 h-8 border border-grey-medium hover:border-black disabled:opacity-30 transition-colors flex items-center justify-center"
>
<Minus className="w-4 h-4"/>
</button>
<span className="text-product w-8 text-center">{item.quantity}</span>
<button
              onClick={()=>onUpdateQuantity(item.quantity+1)}
              className="w-8 h-8 border border-grey-medium hover:border-black transition-colors flex items-center justify-center"
>
<Plus className="w-4 h-4"/>
</button>
</div>

{/* Prix */}
<div className="text-right">
<p className="text-product">{(item.price* item.quantity).toFixed(2)}€</p>
{item.quantity>1&&(
<p className="text-sm text-grey-medium">{item.price}€ / unité</p>
)}
</div>
</div>
</div>

{/* Bouton supprimer */}
<button
        onClick={onRemove}
        className="text-grey-medium hover:text-black transition-colors"
        aria-label="Supprimer"
>
<X className="w-5 h-5"/>
</button>
</div>
);
}
```

---

## 📱 Responsive & Performance

### **Breakpoints Tailwind personnalisés**

javascript

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      // ...
    },
  },
}
```

### **Images optimisées**

typescript

```typescript
// Utiliser next/image partout
importImagefrom'next/image';

<Image
  src={product.image}
  alt={product.name}
  width={800}
  height={1066}
  quality={85}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  className="w-full h-full object-cover"
/>
```

### **Lazy loading des sections**

typescript

```typescript
// src/components/common/LazySection.tsx
import{ useScrollReveal }from'@/hooks/useScrollReveal';

exportdefaultfunctionLazySection({ children }:{ children:React.ReactNode}){
const{ ref, isVisible }=useScrollReveal({ threshold:0.1});

return(
<div ref={ref}>
{isVisible ? children :<div className="h-96"/>}
</div>
);
}
```

---

## 🎯 Checklist de migration

### **Phase 1: Fondations (Semaine 1-2)**

- [ ] Installer Archivo Black + Archivo Narrow
- [ ] Mettre à jour `globals.css` avec nouvelles classes
- [ ] Créer `HeaderMinimal` et `FooterMinimal`
- [ ] Créer composants de base (boutons, cards)
- [ ] Implémenter smooth scroll

### **Phase 2: Pages principales (Semaine 3-4)**

- [ ] Refondre page d'accueil avec grille asymétrique
- [ ] Créer routes `/hauts`, `/bas`, `/accessoires`
- [ ] Refondre page produit individuelle
- [ ] Créer `ProductCardMinimal`
- [ ] Implémenter filtres minimalistes

### **Phase 3: Lookbooks & Sustainability (Semaine 5-6)**

- [ ] Refondre liste lookbooks avec vidéos
- [ ] Créer page détail lookbook (scrollytelling)
- [ ] Créer page `/sustainability` complète
- [ ] Ajouter animations scroll reveal
- [ ] Optimiser images et vidéos

### **Phase 4: Pages secondaires (Semaine 7)**

- [ ] Refondre page À propos
- [ ] Simplifier page Contact
- [ ] Refondre page Panier
- [ ] Créer pages mentions légales, FAQ, etc.

### **Phase 5: Optimisation (Semaine 8)**

- [ ] Optimiser performances (Lighthouse score >90)
- [ ] Tester responsive sur tous devices
- [ ] Ajouter animations finales
- [ ] Tests utilisateurs
- [ ] Corrections finales

---

## 📊 Métriques de succès

### **Performance**

- Lighthouse Score: >90
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

### **UX**

- Taux de rebond: <40%
- Temps moyen sur site: >3min
- Pages par session: >4
- Taux de conversion: +20%

### **Esthétique**

- Cohérence visuelle: 100%
- Animations fluides: 60fps
- Hiérarchie lisible
- Espaces blancs généreux

---

## 🔧 Dépendances à installer

bash

```bash
# Animations
npminstall framer-motion

# Smooth scroll
npminstall @studio-freight/lenis

# Utilitaires
npminstall clsx tailwind-merge

# Icons (si pas déjà installé)
npminstall lucide-react

# Swiper (pour carousels si nécessaire)
npminstall swiper
```

---

## 💡 Conseils finaux

### **Design**

- **Less is more** : Privilégier la sobriété
- **Espaces blancs** : Ne pas avoir peur du vide
- **Typographie** : Laisser respirer les titres
- **Images** : Qualité maximale, format WebP
- **Animations** : Subtiles mais présentes

### **Développement**

- **Mobile-first** : Toujours commencer par mobile
- **Performance** : Lazy-load tout ce qui peut l'être
- **Accessibilité** : Respecter les standards WCAG
- **SEO** : Balises meta, alt text, structure H1-H6
- **Tests** : Tester sur vrais devices, pas seulement devtools

### **Contenu**

- **Photos** : Shooter professionnel obligatoire
- **Vidéos** : Format 16:9, autoplay muted
- **Textes** : Courts, impactants, en capitales
- **Traductions** : FR/EN minimum
- **Produits** : Photos multiples, descriptions soignées

---

## 📚 Ressources

### **Inspiration**

- Jacquemus: [https://www.jacquemus.com](https://www.jacquemus.com)
- The Row: [https://www.therow.com](https://www.therow.com)
- Totême: [https://toteme-studio.com](https://toteme-studio.com)
- COS: [https://www.cosstores.com](https://www.cosstores.com)

### **Outils**

- Figma: Maquettes et prototypes
- Lottie: Animations légères
- Spline: 3D si nécessaire
- Unsplash: Photos temporaires

### **Documentation**

- Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
- Tailwind: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- Framer Motion: [https://www.framer.com/motion](https://www.framer.com/motion)

---

🎨 **Bon courage pour la refonte !** Le résultat sera à la hauteur de l'élégance Jacquemus tout en conservant l'identité unique de `.blancherenaudin`.
