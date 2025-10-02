# Interface Admin “Blanche” — Produits, Stocks & Images (Next.js + Supabase)

## Objectifs

- CRUD **Produits** (+ catégories, collections).
- CRUD **Variantes** (taille, couleur, etc.) et **stock par variante** .
- **Images produit** (upload → édition → variantes d’images → image principale) via bucket privé + URLs signées.
- RLS stricte (admins uniquement en écriture), logs d’actions.
- UX simple pour non-tech (upload drag & drop, tri, champs requis guidés).

> La partie “images” s’appuie sur la doc existante (bucket privé `product-images`, routes `/api/admin/product-images/*`, UI `/admin/media`, dérivés AVIF/WebP/JPEG, etc.).

---

## 1) Schéma & règles (rappel utile)

Tables clés déjà en place (extraits) :

- **products** (nom, slug, description, prix, stock global optionnel, catégorie, flags)
- **product_variants** (product_id, name, value, stock_quantity, price_modifier, sku, is_active)
- **product_images** (FK product_id, chemins storage, alt, is_primary, sort_order, dims)
- **categories** , **collections** (+ table de jointure **collection_products** )
- **orders** , **order_items** (utilisés pour décrémenter le stock)

  → Tout est présent dans ton dump, avec contraintes FK pertinentes.

La table **product_images** et son pipeline (original → master → dérivées) sont détaillés dans ta doc images, avec RLS lecture ouverte / écriture admin-only et endpoints côté App Router.

---

## 2) RLS & rôles (à appliquer aussi côté produits/variantes)

**Principe** :

- _SELECT_ ouvert (site vitrine)
- _INSERT/UPDATE/DELETE_ réservé aux **admins** (claim `role=admin` dans le JWT)
- Buckets de **Storage privés** , accès via **URLs signées** (ou proxy) pour l’admin UI et le front.

**Exemple RLS** (à adapter aux tables `products` et `product_variants`) :

<pre class="overflow-visible!" data-start="2266" data-end="2887"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>alter</span><span></span><span>table</span><span> public.products enable </span><span>row</span><span> level security;
</span><span>create</span><span> policy "read products"
  </span><span>on</span><span> public.products </span><span>for</span><span></span><span>select</span><span></span><span>using</span><span> (</span><span>true</span><span>);

</span><span>create</span><span> policy "write products admin only"
  </span><span>on</span><span> public.products </span><span>for</span><span></span><span>all</span><span>
  </span><span>using</span><span> (auth.jwt() </span><span>-</span><span>>></span><span></span><span>'role'</span><span></span><span>=</span><span></span><span>'admin'</span><span>)
  </span><span>with</span><span></span><span>check</span><span> (auth.jwt() </span><span>-</span><span>>></span><span></span><span>'role'</span><span></span><span>=</span><span></span><span>'admin'</span><span>);

</span><span>alter</span><span></span><span>table</span><span> public.product_variants enable </span><span>row</span><span> level security;
</span><span>create</span><span> policy "read variants"
  </span><span>on</span><span> public.product_variants </span><span>for</span><span></span><span>select</span><span></span><span>using</span><span> (</span><span>true</span><span>);

</span><span>create</span><span> policy "write variants admin only"
  </span><span>on</span><span> public.product_variants </span><span>for</span><span></span><span>all</span><span>
  </span><span>using</span><span> (auth.jwt() </span><span>-</span><span>>></span><span></span><span>'role'</span><span></span><span>=</span><span></span><span>'admin'</span><span>)
  </span><span>with</span><span></span><span>check</span><span> (auth.jwt() </span><span>-</span><span>>></span><span></span><span>'role'</span><span></span><span>=</span><span></span><span>'admin'</span><span>);
</span></span></code></div></div></pre>

> Même philosophie que la section RLS des images.

---

## 3) Routage & arborescence (App Router)

S’appuyer sur l’arborescence existante (`src/app`, `src/lib`, `src/components`) et la doc images pour homogénéiser les points d’entrée.

### 3.1. Pages Admin (UI)

- `src/app/admin/products/page.tsx` — **Listing** produits (recherche, pagination, filtres).
- `src/app/admin/products/new/page.tsx` — **Création** produit.
- `src/app/admin/products/[id]/page.tsx` — **Édition** produit (onglets : Infos, Variantes, Images, SEO).
- `src/app/admin/media/page.tsx` — UI médias partagée (déjà prévue dans doc images).

### 3.2. API (server routes)

- `POST /api/admin/products` — créer produit
- `PATCH /api/admin/products/:id` — éditer produit
- `DELETE /api/admin/products/:id` — archiver/désactiver produit
- `GET /api/admin/products` — lister (admin : inclut inactifs)
- `GET /api/products` / `GET /api/products/[id]` — lecture publique (déjà partiellement présent dans ton repo)
- **Variantes** :
  - `POST /api/admin/products/:id/variants`
  - `PATCH /api/admin/variants/:variantId`
  - `DELETE /api/admin/variants/:variantId`
- **Stocks** :
  - `POST /api/admin/variants/:variantId/stock-adjust` (mouvement + justification)
  - `POST /api/admin/products/:id/stock-recompute` (recalcule total depuis variantes)
- **Images** : réutiliser les endpoints du README images :
  - `/api/admin/product-images/upload`, `/edit`, `/generate-variants`, `/[id]`, etc.

---

## 4) Modèle de données (côté TypeScript)

### 4.1. Types

<pre class="overflow-visible!" data-start="4605" data-end="5639"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>// src/lib/types.ts</span><span>
</span><span>export</span><span></span><span>type</span><span></span><span>AdminProduct</span><span> = {
  </span><span>id</span><span>: </span><span>string</span><span>;
  </span><span>name</span><span>: </span><span>string</span><span>;
  </span><span>slug</span><span>: </span><span>string</span><span>;
  short_description?: </span><span>string</span><span> | </span><span>null</span><span>;
  description?: </span><span>string</span><span> | </span><span>null</span><span>;
  </span><span>price</span><span>: </span><span>number</span><span>;          </span><span>// prix de base</span><span>
  sale_price?: </span><span>number</span><span> | </span><span>null</span><span>;
  sku?: </span><span>string</span><span> | </span><span>null</span><span>;
  </span><span>is_active</span><span>: </span><span>boolean</span><span>;
  </span><span>is_featured</span><span>: </span><span>boolean</span><span>;
  category_id?: </span><span>string</span><span> | </span><span>null</span><span>;
  </span><span>stock_quantity</span><span>: </span><span>number</span><span>; </span><span>// total (somme variantes ou champs produit)</span><span>
  </span><span>created_at</span><span>: </span><span>string</span><span>;
  </span><span>updated_at</span><span>: </span><span>string</span><span>;
};

</span><span>export</span><span></span><span>type</span><span></span><span>AdminVariant</span><span> = {
  </span><span>id</span><span>: </span><span>string</span><span>;
  </span><span>product_id</span><span>: </span><span>string</span><span>;
  </span><span>name</span><span>: </span><span>string</span><span>;           </span><span>// ex: "Taille"</span><span>
  </span><span>value</span><span>: </span><span>string</span><span>;          </span><span>// ex: "M"</span><span>
  </span><span>stock_quantity</span><span>: </span><span>number</span><span>;
  </span><span>price_modifier</span><span>: </span><span>number</span><span>; </span><span>// ex: +10</span><span>
  sku?: </span><span>string</span><span> | </span><span>null</span><span>;
  </span><span>is_active</span><span>: </span><span>boolean</span><span>;
  </span><span>created_at</span><span>: </span><span>string</span><span>;
};

</span><span>export</span><span></span><span>type</span><span></span><span>ProductImage</span><span> = {
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

> Le type `ProductImage` correspond à la doc images.

---

## 5) UX & écrans (admin)

### 5.1. Produits — onglet “Infos”

- Champs requis : **name, slug, price, category, is_active** .
- **Short description** (listing, SEO), **description** riche.
- **Collections** (checkbox multi via `collection_products`).
- **SEO** (title/description/og:image) — l’**image principale** vient des médias (onglet Images).

### 5.2. Variantes — onglet “Variantes”

- Tableau inline éditable : **name** (ex: Taille), **value** (S/M/L), **sku** , **price_modifier** , **stock_quantity** , **is_active** .
- Bouton **Ajouter variante** / **Dupliquer** / **Supprimer** .
- **Règle stock** : si variantes existent → le **stock produit** = somme des stocks variantes (champ produit devient en _read-only_ et mis à jour automatiquement).

### 5.3. Stocks — mouvements

- Action **“Ajuster stock”** sur chaque variante : `+/- quantité`, **motif** (réception, correction, casse, retour…), _commentaire_ .
- Historiser dans table `stock_movements` (nouvelle) :
  <pre class="overflow-visible!" data-start="6713" data-end="7046"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>create</span><span></span><span>table</span><span> public.stock_movements (
    id uuid </span><span>primary</span><span> key </span><span>default</span><span> gen_random_uuid(),
    variant_id uuid </span><span>not</span><span></span><span>null</span><span></span><span>references</span><span> public.product_variants(id) </span><span>on</span><span></span><span>delete</span><span> cascade,
    delta </span><span>int</span><span></span><span>not</span><span></span><span>null</span><span>,
    reason text </span><span>not</span><span></span><span>null</span><span>,
    created_at timestamptz </span><span>default</span><span> now(),
    created_by uuid </span><span>references</span><span> auth.users(id)
  );
  </span></span></code></div></div></pre>
- **Trigger** mise à jour :
  <pre class="overflow-visible!" data-start="7077" data-end="7499"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-sql"><span><span>create</span><span></span><span>or</span><span> replace </span><span>function</span><span> public.apply_stock_movement()
  </span><span>returns</span><span></span><span>trigger</span><span></span><span>language</span><span> plpgsql </span><span>as</span><span> $$
  </span><span>begin</span><span>
    </span><span>update</span><span> public.product_variants
      </span><span>set</span><span> stock_quantity </span><span>=</span><span></span><span>coalesce</span><span>(stock_quantity,</span><span>0</span><span>) </span><span>+</span><span> new.delta
      </span><span>where</span><span> id </span><span>=</span><span> new.variant_id;
    </span><span>return</span><span></span><span>new</span><span>;
  </span><span>end</span><span> $$;
  
  </span><span>create</span><span></span><span>trigger</span><span> trg_apply_stock
    after </span><span>insert</span><span></span><span>on</span><span> public.stock_movements
    </span><span>for</span><span></span><span>each</span><span></span><span>row</span><span></span><span>execute</span><span></span><span>function</span><span> public.apply_stock_movement();
  </span></span></code></div></div></pre>

- Bouton **“Recalculer stock produit”** : calcule `products.stock_quantity = sum(variants.stock_quantity)`.

> Les décréments automatiques au checkout peuvent être gérés via `order_items` (exécuté au paiement réussi). Ton schéma order/order_items est déjà là.

### 5.4. Images — onglet “Images”

- **Réutilise** l’UI `/admin/media` (upload multiple, tri, alt, **Définir principale** , éditeur visuel crop/rotate).
- **Aperçu live** des tailles (sm/md/lg) + alt requis sur l’image principale.
- La **même grille** peut être “scopée” au `product_id`.

---

## 6) Intégration front (fiche produit)

- Listing et fiche utilisent soit `<picture>` + `srcset` (AVIF/WebP/JPEG), soit `next/image` avec **loader** qui signe les URLs via route proxy.
- Les **URLs signées** viennent des endpoints `/api/admin/product-images/signed-url` ou d’un proxy `/api/image?path=...`.
- `og:image` = **image principale** en taille lg/xl.

---

## 7) Sécurité

- Middleware d’admin qui vérifie `role=admin` sur **toutes** les routes sous `/admin/*` et `/api/admin/*`.
- RLS “lecture ouverte / écriture admin” appliquée à **products** , **product_variants** , **product_images** , **stock_movements** .
- Buckets **privés** , pas d’URL publique permanente.

---

## 8) Observabilité & robustesse

- **Logs** par action : création produit, modif prix, mouvement stock, suppression image, set-primary.
- **Validations** : slug unique, SKU unique (produit/variante), prix ≥ 0, pas d’upscale images.
- **Transactions** :
  - Set image principale (tout à false → l’image choisie à true).
  - Création produit + variantes initiales.
- **Rate limiting** sur upload d’images.
- **Tests** : upload lourds, formats, expirations URLs signées, performances grid.

---

## 9) Plan d’implémentation (checklist)

1. **DB**

- [ ] RLS produits / variantes / mouvements.
- [ ] Table `stock_movements` + trigger `apply_stock_movement`.

2. **API**

- [ ] `/api/admin/products` (POST, PATCH, DELETE, GET admin).
- [ ] `/api/products` publics (GET, GET by id) — compléter si besoin (il y a déjà des routes produits/collections).
- [ ] `/api/admin/products/:id/variants` (CRUD).
- [ ] `/api/admin/variants/:variantId/stock-adjust`.
- [ ] `/api/admin/products/:id/stock-recompute`.
- [ ] Rebrancher `/api/admin/product-images/*` (existant dans doc images).

3. **UI Admin**

- [ ] Pages `/admin/products`, `/admin/products/new`, `/admin/products/[id]`.
- [ ] Onglet Variantes (table inline).
- [ ] Onglet Images (réutilise composants de la doc images).

4. **Libs**

- [ ] `src/lib/supabase-admin.ts` (service role côté serveur), `src/lib/supabase-server.ts` (déjà présent).
- [ ] `src/lib/images.ts` (helpers signing & tailles — déjà décrit).

5. **Front**

- [ ] Composant `<ProductImageResponsive>` (fourni dans la doc images).
- [ ] Loader `next/image` (option B) si choisi.

6. **QA/Perf**

- [ ] Vérifier CDN Storage + cache-control sur dérivées.
- [ ] Re-tests expiration des URLs signées.

---

## 10) Points d’extension

- **Import CSV** produits/variantes/stocks (mapping colonnes, pré-validation).
- **Historique d’audit** (qui modifie quoi, quand) — cf. doc images “Audit” en extension possible.
- **Bordereau de réception** (création de mouvements stock à partir d’un formulaire de livraison).
- **Rôles avancés** (éditeur vs viewer).
- **Edge Functions** pour traitements asynchrones (génération de dérivées en file).

---

## 11) Emplacements concrets dans ton repo

- **Pages Admin** : `src/app/admin/...` à côté de `src/app/api/...` existants.
- **Libs** : `src/lib/` (tu as déjà `supabase-*.ts`, `types.ts`).
- **Composants** : `src/components/admin/*` (grille images/produits), `src/components/ui/*` déjà riche (table, form, drag).

---

## 12) Contrats d’API (résumé minimal)

- **Produits**
  - `POST /api/admin/products` → `{ name, slug, price, category_id?, ... }` → `{ product }`
  - `PATCH /api/admin/products/:id` → champs partiels → `{ product }`
  - `DELETE /api/admin/products/:id` → `{ ok: true }`
  - `GET /api/admin/products?query=&page=&category=` → `{ items, total }`
  - `GET /api/products/:id` (public) → `{ product, variants, images }`
- **Variantes**
  - `POST /api/admin/products/:id/variants` → `{ variant }`
  - `PATCH /api/admin/variants/:variantId` → `{ variant }`
  - `DELETE /api/admin/variants/:variantId` → `{ ok: true }`
- **Stock**
  - `POST /api/admin/variants/:variantId/stock-adjust` → `{ ok: true, newStock }`
  - `POST /api/admin/products/:id/stock-recompute` → `{ stock }`
- **Images** : réutiliser ceux de la doc images.
