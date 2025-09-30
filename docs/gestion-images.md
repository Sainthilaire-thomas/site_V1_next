# README — Gestion des images produits (Next.js + Supabase)

## Objectifs

* Stocker des **originaux** privés.
* Éditer (recadrage, rotation) pour produire une  **master éditée** .
* Générer automatiquement des **tailles dérivées** (AVIF/WebP/JPEG) : `xl/lg/md/sm`.
* Servir des **URLs signées** côté front (sécurité + CDN).
* Fournir une **UI admin** simple : upload, tri, alt, image principale, édition visuelle.

---

## 1) Pré-requis

* **Next.js 14+** (App Router).
* **Supabase** (Postgres + Storage) avec  **RLS activé** .
* Node 18+.
* Libs côté serveur : `@supabase/auth-helpers-nextjs`, `sharp`.
* Libs UI (admin) : `@mui/material`, `react-easy-crop` (ou `tui-image-editor`), `@dnd-kit/core`.

### Variables d’environnement (Next)

<pre class="overflow-visible!" data-start="957" data-end="1292"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span># Supabase</span><span>
</span><span>NEXT_PUBLIC_SUPABASE_URL</span><span>=...
</span><span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span><span>=...
</span><span>SUPABASE_SERVICE_ROLE_KEY</span><span>=...     </span><span># uniquement côté serveur</span><span>
</span><span>SUPABASE_JWT_ADMIN_ROLE</span><span>=admin     </span><span># si on encode le rôle dans les JWT</span><span>

</span><span># Options images (modifiable)</span><span>
</span><span>IMAGE_SIGN_TTL</span><span>=</span><span>600</span><span></span><span># secondes</span><span>
</span><span>IMAGE_SIZES</span><span>=</span><span>2048</span><span>,</span><span>1280</span><span>,</span><span>768</span><span>,</span><span>384</span><span></span><span># xl,lg,md,sm</span><span>
</span></span></code></div></div></pre>

---

## 2) Architecture de stockage

**Bucket (privé)** : `product-images`

Arborescence :

<pre class="overflow-visible!" data-start="1385" data-end="1669"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span><span class="language-xml">product-images/
  products/</span></span><span><productId</span><span>>/
    original/</span><span><imageId</span><span>>.jpg        # source
    edited/</span><span><imageId</span><span>>.jpg          # master éditée (après crop/rotate)
    xl/</span><span><imageId</span><span>>.avif|webp|jpg
    lg/</span><span><imageId</span><span>>.avif|webp|jpg
    md/</span><span><imageId</span><span>>.avif|webp|jpg
    sm/</span><span><imageId</span><span>>.avif|webp|jpg
</span></span></code></div></div></pre>

> **Raison d’être :**
>
> * *original* = source immuable.
> * *edited* = référence unique pour générer les dérivées.
> * Dérivées *xl/lg/md/sm* = formats finaux optimisés.

---

## 3) Schéma base & sécurité

### Table `product_images`

<pre class="overflow-visible!" data-start="1904" data-end="2655"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>create</span><span></span><span>table</span><span> if </span><span>not</span><span></span><span>exists</span><span> public.product_images (
  id uuid </span><span>primary</span><span> key </span><span>default</span><span> gen_random_uuid(),
  product_id uuid </span><span>not</span><span></span><span>null</span><span></span><span>references</span><span> public.products(id) </span><span>on</span><span></span><span>delete</span><span> cascade,
  storage_original text </span><span>not</span><span></span><span>null</span><span>,    </span><span>-- products/<pid>/original/<id>.jpg</span><span>
  storage_master text,               </span><span>-- products/<pid>/edited/<id>.jpg (nullable avant édition)</span><span>
  alt text,
  is_primary </span><span>boolean</span><span></span><span>default</span><span></span><span>false</span><span>,
  sort_order </span><span>int</span><span></span><span>default</span><span></span><span>0</span><span>,
  width </span><span>int</span><span>,                         </span><span>-- dims de la master</span><span>
  height </span><span>int</span><span>,
  created_at timestamptz </span><span>default</span><span> now(),
  updated_at timestamptz </span><span>default</span><span> now()
);

</span><span>create</span><span> index </span><span>on</span><span> public.product_images(product_id);
</span><span>create</span><span> index </span><span>on</span><span> public.product_images(sort_order);

</span><span>alter</span><span></span><span>table</span><span> public.product_images enable </span><span>row</span><span> level security;
</span></span></code></div></div></pre>

### Politiques RLS (exemple)

<pre class="overflow-visible!" data-start="2686" data-end="3077"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>-- Lecture: ouverte (les données seules ne révèlent pas le fichier)</span><span>
</span><span>create</span><span> policy "read images"
</span><span>on</span><span> public.product_images
</span><span>for</span><span></span><span>select</span><span>
</span><span>using</span><span> (</span><span>true</span><span>);

</span><span>-- Écriture: admins uniquement (JWT claim 'role'='admin', à adapter si profil)</span><span>
</span><span>create</span><span> policy "write images admin only"
</span><span>on</span><span> public.product_images
</span><span>for</span><span></span><span>all</span><span>
</span><span>using</span><span> (auth.jwt()</span><span>-</span><span>>></span><span>'role'</span><span></span><span>=</span><span></span><span>'admin'</span><span>)
</span><span>with</span><span></span><span>check</span><span> (auth.jwt()</span><span>-</span><span>>></span><span>'role'</span><span></span><span>=</span><span></span><span>'admin'</span><span>);
</span></span></code></div></div></pre>

> **Bucket privé** : aucune politique publique ; accès via **URLs signées** (côté serveur) ou via  **route proxy** .

---

## 4) Points d’entrée (App Router)

### 4.1 Upload

* `POST /api/admin/product-images/upload`
* **Body** (form-data) : `productId`, `files[]` (images)
* **Process** : pour chaque fichier → upload `original`, insert ligne `product_images`.

### 4.2 Édition (crop/rotate)

* `POST /api/admin/product-images/edit`
* **JSON** : `{ imageId, crop?: {x,y,width,height}, rotate?: number }`
* **Process** :
  1. Télécharger l’original,
  2. Appliquer transformations via  **Sharp** ,
  3. Sauver **master** (`edited/<id>.jpg`),
  4. Mettre à jour `width/height`,
  5. Déclencher la génération des dérivées.

### 4.3 Génération des variantes

* `POST /api/admin/product-images/generate-variants`
* **JSON** : `{ imageId }`
* Génère `xl/lg/md/sm` en  **AVIF/WebP/JPEG** , `fit: inside`.

### 4.4 URLs signées

* `POST /api/admin/product-images/signed-url`
* **JSON** : `{ path, expiresIn? }`
* Retourne `signedUrl` depuis le bucket privé.

### 4.5 Liste/lecture

* `GET /api/products/[id]/images`
* Retourne lignes `product_images` ordonnées (et, côté serveur, **peut** joindre des URLs signées éphémères).

### 4.6 Définir l’image principale (transaction)

* `POST /api/products/[id]/images/set-primary`
* **JSON** : `{ imageId }`
* Transaction : `is_primary=false` pour toutes, puis `true` pour `imageId`.

### 4.7 Suppression

* `DELETE /api/admin/product-images/:id`
* Supprime ligne DB puis **fichiers** (`original`, `edited`, dérivées).

---

## 5) UI Admin (non-tech)

Route **`/admin/media`** :

* **Filters** : par produit.
* **Grid** d’images :
  * Vignette → **URL signée** (durée courte).
  * Pièce jointe : alt, tag “image principale”.
* **Actions** :
  * **Upload** (multi).
  * **Drag & drop** pour `sort_order`.
  * **Éditer** (ouvre un **éditeur visuel** : `react-easy-crop` → ratios 1:1, 4:5, 3:4, 16:9 ; rotation).
  * **Définir principale** (cocher → appelle route set-primary).
  * **Supprimer** .

> **UX** :
>
> * Affiche un **aperçu live** des tailles cibles (sm/md/lg) pendant l’édition.
> * Forcer `alt` pour l’image principale (accessibilité).

---

## 6) Affichage côté front (fiche produit)

### 6.1 Option A — `<picture>`

* Serveur crée **3 niveaux** d’URLs signées (sm/md/lg) pour  **AVIF/WebP/JPEG** .
* Composant client `<picture>` avec `srcSet` responsive.

### 6.2 Option B — `next/image` + loader

* Implémenter un **loader** qui transforme un `path` Storage en **URL signée** côté serveur (ou proxy interne).
* Avantage : intégration et optimisations Next.

> **Important** : Les URLs signées expirent → soit régénérer côté server-component à chaque render, soit proxy interne `/api/image?path=...` qui signe à la volée.

---

## 7) Détails techniques (recommandations)

### 7.1 Génération dérivées

* **Tailles** (par défaut) : `xl=2048`, `lg=1280`, `md=768`, `sm=384`.
* **Formats** :
  * **AVIF** (qualité ~50),
  * **WebP** (qualité ~78),
  * **JPEG** (fallback, qualité ~80–90).
* `fit: "inside"`, pas d’upscale si original plus petit.

### 7.2 Sécurité & rôles

* Admin UI protégée (middleware Next) : vérifier `role=admin` dans le JWT.
* Toutes les routes `/api/admin/*` **refusent** si non admin.
* Bucket **privé** + URLs **signées** à courte durée.

### 7.3 Performances & cache

* Activer **CDN** du bucket.
* `Cache-Control` agressif sur dérivées (elles sont immuables pour un `imageId` donné).
* Invalider/régénérer dérivées quand la **master** change.

### 7.4 Accessibilité & SEO

* `alt` **obligatoire** pour image principale.
* Injecter la principale comme `og:image`.
* Légendes/credits si besoin (champs additionnels).

### 7.5 Observabilité

* Logs sur chaque route (`upload`, `edit`, `variants`, `set-primary`, `delete`).
* Feature flag pour **re-générer en masse** (maintenance).

---

## 8) Arborescence proposée

<pre class="overflow-visible!" data-start="6946" data-end="7983"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>src/
  app/
    admin/
      media/page.tsx                  </span><span># UI admin</span><span>
    api/
      admin/
        product-images/
          upload/route.ts             </span><span># POST upload originals</span><span>
          edit/route.ts               </span><span># POST apply crop/rotate -> write master</span><span>
          generate-variants/route.ts  </span><span># POST generate sizes</span><span>
          signed-url/route.ts         </span><span># POST path -> signedUrl</span><span>
          [</span><span>id</span><span>]/route.ts               </span><span># PATCH meta / DELETE image</span><span>
      products/
        [</span><span>id</span><span>]/
          images/route.ts             </span><span># GET list product images</span><span>
          images/
            set-primary/route.ts      </span><span># POST set primary (tx)</span><span>
    products/[</span><span>id</span><span>]/page.tsx            </span><span># Fiche produit (server)</span><span>
  lib/
    supabase.ts                       </span><span># client helpers</span><span>
    images.ts                         </span><span># helpers sizes, signing, mime</span><span>
  components/
    admin/
      ImageEditor.tsx                 </span><span># react-easy-crop wrapper</span><span>
      ImageGrid.tsx                   </span><span># grid + drag reorder</span><span>
      ProductImageResponsive.tsx      </span><span># <picture> helper (front)</span><span>
</span></span></code></div></div></pre>

---

## 9) Contrats d’API (résumé)

### Upload

**POST** `/api/admin/product-images/upload`

`multipart/form-data`: `productId`, `files[]`

**200** `{ images: ProductImage[] }`

### Edit

**POST** `/api/admin/product-images/edit`

`{ imageId, crop?, rotate? }`

**200** `{ ok: true, imageId }`

### Variants

**POST** `/api/admin/product-images/generate-variants`

`{ imageId }`

**200** `{ ok: true }`

### Signed URL

**POST** `/api/admin/product-images/signed-url`

`{ path, expiresIn? }`

**200** `{ url }`

### List

**GET** `/api/products/:id/images`

**200** `{ images: ProductImage[] }`

### Set primary

**POST** `/api/products/:id/images/set-primary`

`{ imageId }`

**200** `{ ok: true }`

### Delete

**DELETE** `/api/admin/product-images/:id`

**200** `{ ok: true }`

> **Type `ProductImage` (TS)** :

<pre class="overflow-visible!" data-start="8804" data-end="9099"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>type</span><span></span><span>ProductImage</span><span> = {
  </span><span>id</span><span>: </span><span>string</span><span>;
  </span><span>product_id</span><span>: </span><span>string</span><span>;
  </span><span>storage_original</span><span>: </span><span>string</span><span>;
  storage_master?: </span><span>string</span><span> | </span><span>null</span><span>;
  alt?: </span><span>string</span><span> | </span><span>null</span><span>;
  </span><span>is_primary</span><span>: </span><span>boolean</span><span>;
  </span><span>sort_order</span><span>: </span><span>number</span><span>;
  width?: </span><span>number</span><span> | </span><span>null</span><span>;
  height?: </span><span>number</span><span> | </span><span>null</span><span>;
  </span><span>created_at</span><span>: </span><span>string</span><span>;
  </span><span>updated_at</span><span>: </span><span>string</span><span>;
};
</span></span></code></div></div></pre>

---

## 10) Plan d’implémentation (checklist)

1. **DB & Storage**
   * [ ] Créer bucket `product-images` (privé).
   * [ ] Exécuter SQL `product_images` + RLS.
2. **Libs & config**
   * [ ] Installer `sharp`, `@supabase/auth-helpers-nextjs`, MUI, `react-easy-crop`, `@dnd-kit/core`.
   * [ ] Config `.env` (clés Supabase).
3. **Routes API**
   * [ ] `upload` (originals)
   * [ ] `edit` (crop/rotate → master)
   * [ ] `generate-variants`
   * [ ] `signed-url`
   * [ ] `GET /products/[id]/images`
   * [ ] `POST /products/[id]/images/set-primary`
   * [ ] `DELETE /admin/product-images/:id`
4. **Admin UI**
   * [ ] Page `/admin/media` (listing + upload + signed URLs).
   * [ ] Éditeur (crop/rotate) + bouton “Enregistrer”.
   * [ ] Drag & drop pour `sort_order`.
   * [ ] Toggle “image principale”.
   * [ ] Édition `alt` (exiger si `is_primary=true`).
5. **Front produit**
   * [ ] Composant `<picture>` ou `next/image` loader (URLs signées).
   * [ ] SEO: `og:image` = image principale (lg/xl).
6. **QA & Perf**
   * [ ] Tests uploads lourds / petits / formats variés.
   * [ ] Vérif AVIF/WebP fallback.
   * [ ] Cache CDN sur dérivées.
   * [ ] Expiration des URLs signées.
7. **Rollout**
   * [ ] Script de migration (si images existantes).
   * [ ] Formation courte des non-tech (admin UI).

---

## 11) Extensions possibles (faciles à ajouter)

* **Point focal** plutôt que crop manuel (plus simple pour non-tech).
* **Watermark** (sur certaines tailles).
* **Tagging** / couleurs / variantes par produit.
* **Audit** (`updated_by`, historique d’édition).
* **Traitement asynchrone** via **Edge Functions** (file d’attente).

---

## 12) Décisions par défaut (opinionated)

* Bucket **privé** + **URLs signées** (pas d’accès public direct).
* **Master éditée** unique par image (source de vérité des dérivées).
* **Tailles** `xl=2048`, `lg=1280`, `md=768`, `sm=384`.
* **Formats** préférés : **AVIF** > **WebP** >  **JPEG** .
* **RLS** stricte : insert/update/delete **admins** only.
