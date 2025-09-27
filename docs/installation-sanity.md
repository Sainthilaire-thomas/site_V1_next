# Étape 1 — Installer Sanity (libs côté Next + Studio)

Dans la racine du projet :

<pre class="overflow-visible!" data-start="273" data-end="371"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm i next-sanity @sanity/client groq @sanity/image-url
npm i -D sanity @sanity/vision
</span></span></code></div></div></pre>

> Ces paquets te permettent d’interroger Sanity (côté Next) et d’embarquer le **Studio** (l’interface d’édition pour Blanche) directement dans ton site.

---

# Étape 2 — Variables d’environnement

Ajoute dans `.env.local` (valeurs temporaires, on mettra les vraies après création du projet) :

<pre class="overflow-visible!" data-start="668" data-end="846"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>NEXT_PUBLIC_SANITY_PROJECT_ID</span><span>=__A_REMPLIR__
</span><span>NEXT_PUBLIC_SANITY_DATASET</span><span>=production
</span><span># Optionnel si tu veux un mode "aperçu brouillons"</span><span>
</span><span># SANITY_API_READ_TOKEN=__A_REMPLIR__</span><span>
</span></span></code></div></div></pre>

> On va obtenir `PROJECT_ID` à l’étape Studio, puis tu mettras les mêmes variables dans Vercel (Project Settings → Environment Variables).

---

# Étape 3 — Arborescence Sanity

Crée un dossier `sanity/` à la racine, avec ces fichiers :

<pre class="overflow-visible!" data-start="1086" data-end="1285"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>sanity/
  sanity.config.ts
  structure.ts
  </span><span>schemas</span><span>/
    </span><span>index</span><span>.ts
    </span><span>types</span><span>/
      blockContent.ts
      seo.ts
      homepage.ts
      page.ts
      lookbook.ts
      collectionEditoriale.ts
</span></span></code></div></div></pre>

### `sanity/sanity.config.ts`

<pre class="overflow-visible!" data-start="1317" data-end="1879"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineConfig } </span><span>from</span><span></span><span>'sanity'</span><span>
</span><span>import</span><span> { deskTool } </span><span>from</span><span></span><span>'sanity/desk'</span><span>
</span><span>import</span><span> { visionTool } </span><span>from</span><span></span><span>'@sanity/vision'</span><span>
</span><span>import</span><span> { schemaTypes } </span><span>from</span><span></span><span>'./schemas'</span><span>
</span><span>import</span><span> { structure } </span><span>from</span><span></span><span>'./structure'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineConfig</span><span>({
  </span><span>name</span><span>: </span><span>'blancherenaudin-studio'</span><span>,
  </span><span>title</span><span>: </span><span>'.blancherenaudin – Studio'</span><span>,
  </span><span>projectId</span><span>: process.</span><span>env</span><span>.</span><span>NEXT_PUBLIC_SANITY_PROJECT_ID</span><span>!,
  </span><span>dataset</span><span>: process.</span><span>env</span><span>.</span><span>NEXT_PUBLIC_SANITY_DATASET</span><span> || </span><span>'production'</span><span>,
  </span><span>basePath</span><span>: </span><span>'/studio'</span><span>,
  </span><span>plugins</span><span>: [
    </span><span>deskTool</span><span>({ structure }),
    </span><span>visionTool</span><span>(),
  ],
  </span><span>schema</span><span>: { </span><span>types</span><span>: schemaTypes },
})
</span></span></code></div></div></pre>

### `sanity/structure.ts`

<pre class="overflow-visible!" data-start="1907" data-end="2504"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>export</span><span></span><span>const</span><span></span><span>structure</span><span> = (</span><span>S: any</span><span>) =>
  S.</span><span>list</span><span>()
    .</span><span>title</span><span>(</span><span>'Contenu'</span><span>)
    .</span><span>items</span><span>([
      S.</span><span>listItem</span><span>().</span><span>title</span><span>(</span><span>'Homepage'</span><span>).</span><span>child</span><span>(
        S.</span><span>document</span><span>().</span><span>schemaType</span><span>(</span><span>'homepage'</span><span>).</span><span>documentId</span><span>(</span><span>'homepage-singleton'</span><span>)
      ),
      S.</span><span>divider</span><span>(),
      S.</span><span>listItem</span><span>().</span><span>title</span><span>(</span><span>'Pages'</span><span>).</span><span>child</span><span>(S.</span><span>documentTypeList</span><span>(</span><span>'page'</span><span>)),
      S.</span><span>listItem</span><span>().</span><span>title</span><span>(</span><span>'Lookbooks'</span><span>).</span><span>child</span><span>(S.</span><span>documentTypeList</span><span>(</span><span>'lookbook'</span><span>)),
      S.</span><span>listItem</span><span>().</span><span>title</span><span>(</span><span>'Collections éditoriales'</span><span>).</span><span>child</span><span>(S.</span><span>documentTypeList</span><span>(</span><span>'collectionEditoriale'</span><span>)),
      S.</span><span>divider</span><span>(),
      S.</span><span>listItem</span><span>().</span><span>title</span><span>(</span><span>'SEO (réutilisable)'</span><span>).</span><span>child</span><span>(S.</span><span>documentTypeList</span><span>(</span><span>'seo'</span><span>)),
    ])
</span></span></code></div></div></pre>

### `sanity/schemas/index.ts`

<pre class="overflow-visible!" data-start="2536" data-end="2899"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> homepage </span><span>from</span><span></span><span>'./types/homepage'</span><span>
</span><span>import</span><span> page </span><span>from</span><span></span><span>'./types/page'</span><span>
</span><span>import</span><span> lookbook </span><span>from</span><span></span><span>'./types/lookbook'</span><span>
</span><span>import</span><span> collectionEditoriale </span><span>from</span><span></span><span>'./types/collectionEditoriale'</span><span>
</span><span>import</span><span> blockContent </span><span>from</span><span></span><span>'./types/blockContent'</span><span>
</span><span>import</span><span> seo </span><span>from</span><span></span><span>'./types/seo'</span><span>

</span><span>export</span><span></span><span>const</span><span> schemaTypes = [
  homepage, page, lookbook, collectionEditoriale, blockContent, seo
]
</span></span></code></div></div></pre>

### `sanity/schemas/types/blockContent.ts`

<pre class="overflow-visible!" data-start="2944" data-end="3173"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineType } </span><span>from</span><span></span><span>'sanity'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineType</span><span>({
  </span><span>name</span><span>: </span><span>'blockContent'</span><span>,
  </span><span>title</span><span>: </span><span>'Texte riche'</span><span>,
  </span><span>type</span><span>: </span><span>'array'</span><span>,
  </span><span>of</span><span>: [
    { </span><span>type</span><span>: </span><span>'block'</span><span> },
    { </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } },
  ],
})
</span></span></code></div></div></pre>

### `sanity/schemas/types/seo.ts`

<pre class="overflow-visible!" data-start="3209" data-end="3568"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineType } </span><span>from</span><span></span><span>'sanity'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineType</span><span>({
  </span><span>name</span><span>: </span><span>'seo'</span><span>,
  </span><span>title</span><span>: </span><span>'SEO'</span><span>,
  </span><span>type</span><span>: </span><span>'object'</span><span>,
  </span><span>fields</span><span>: [
    { </span><span>name</span><span>: </span><span>'title'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre SEO'</span><span> },
    { </span><span>name</span><span>: </span><span>'description'</span><span>, </span><span>type</span><span>: </span><span>'text'</span><span>, </span><span>title</span><span>: </span><span>'Description'</span><span> },
    { </span><span>name</span><span>: </span><span>'image'</span><span>, </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>title</span><span>: </span><span>'Image de partage'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } },
  ]
})
</span></span></code></div></div></pre>

### `sanity/schemas/types/homepage.ts`

<pre class="overflow-visible!" data-start="3609" data-end="5289"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineType } </span><span>from</span><span></span><span>'sanity'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineType</span><span>({
  </span><span>name</span><span>: </span><span>'homepage'</span><span>,
  </span><span>title</span><span>: </span><span>'Homepage'</span><span>,
  </span><span>type</span><span>: </span><span>'document'</span><span>,
  </span><span>fields</span><span>: [
    { </span><span>name</span><span>: </span><span>'heroTitle'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre hero'</span><span> },
    { </span><span>name</span><span>: </span><span>'heroSubtitle'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Sous-titre'</span><span> },
    { </span><span>name</span><span>: </span><span>'heroImage'</span><span>, </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>title</span><span>: </span><span>'Image hero'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } },
    {
      </span><span>name</span><span>: </span><span>'sections'</span><span>,
      </span><span>title</span><span>: </span><span>'Sections (bannières, carrousels, édito)'</span><span>,
      </span><span>type</span><span>: </span><span>'array'</span><span>,
      </span><span>of</span><span>: [
        {
          </span><span>type</span><span>: </span><span>'object'</span><span>,
          </span><span>name</span><span>: </span><span>'banner'</span><span>,
          </span><span>title</span><span>: </span><span>'Bannière'</span><span>,
          </span><span>fields</span><span>: [
            { </span><span>name</span><span>: </span><span>'title'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre'</span><span> },
            { </span><span>name</span><span>: </span><span>'text'</span><span>, </span><span>type</span><span>: </span><span>'text'</span><span>, </span><span>title</span><span>: </span><span>'Texte'</span><span> },
            { </span><span>name</span><span>: </span><span>'image'</span><span>, </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>title</span><span>: </span><span>'Image'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } },
            { </span><span>name</span><span>: </span><span>'ctaLabel'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Texte du bouton'</span><span> },
            { </span><span>name</span><span>: </span><span>'ctaHref'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Lien'</span><span> },
          ]
        },
        {
          </span><span>type</span><span>: </span><span>'object'</span><span>,
          </span><span>name</span><span>: </span><span>'carousel'</span><span>,
          </span><span>title</span><span>: </span><span>'Carrousel'</span><span>,
          </span><span>fields</span><span>: [
            { </span><span>name</span><span>: </span><span>'title'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre'</span><span> },
            { </span><span>name</span><span>: </span><span>'images'</span><span>, </span><span>type</span><span>: </span><span>'array'</span><span>, </span><span>of</span><span>: [{ </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } }] },
          ]
        },
        {
          </span><span>type</span><span>: </span><span>'object'</span><span>,
          </span><span>name</span><span>: </span><span>'editorialPicks'</span><span>,
          </span><span>title</span><span>: </span><span>'Sélection édito (IDs produits Supabase)'</span><span>,
          </span><span>fields</span><span>: [
            { </span><span>name</span><span>: </span><span>'title'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre'</span><span> },
            { </span><span>name</span><span>: </span><span>'productIds'</span><span>, </span><span>type</span><span>: </span><span>'array'</span><span>, </span><span>of</span><span>: [{ </span><span>type</span><span>: </span><span>'string'</span><span> }], </span><span>title</span><span>: </span><span>'IDs produits'</span><span> },
          ]
        }
      ]
    },
    { </span><span>name</span><span>: </span><span>'seo'</span><span>, </span><span>type</span><span>: </span><span>'seo'</span><span>, </span><span>title</span><span>: </span><span>'SEO'</span><span> },
  ]
})
</span></span></code></div></div></pre>

### `sanity/schemas/types/page.ts`

<pre class="overflow-visible!" data-start="5326" data-end="5736"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineType } </span><span>from</span><span></span><span>'sanity'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineType</span><span>({
  </span><span>name</span><span>: </span><span>'page'</span><span>,
  </span><span>title</span><span>: </span><span>'Page'</span><span>,
  </span><span>type</span><span>: </span><span>'document'</span><span>,
  </span><span>fields</span><span>: [
    { </span><span>name</span><span>: </span><span>'title'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre'</span><span> },
    { </span><span>name</span><span>: </span><span>'slug'</span><span>, </span><span>type</span><span>: </span><span>'slug'</span><span>, </span><span>title</span><span>: </span><span>'Slug'</span><span>, </span><span>options</span><span>: { </span><span>source</span><span>: </span><span>'title'</span><span>, </span><span>maxLength</span><span>: </span><span>96</span><span> } },
    { </span><span>name</span><span>: </span><span>'content'</span><span>, </span><span>type</span><span>: </span><span>'blockContent'</span><span>, </span><span>title</span><span>: </span><span>'Contenu'</span><span> },
    { </span><span>name</span><span>: </span><span>'seo'</span><span>, </span><span>type</span><span>: </span><span>'seo'</span><span>, </span><span>title</span><span>: </span><span>'SEO'</span><span> },
  ]
})
</span></span></code></div></div></pre>

### `sanity/schemas/types/lookbook.ts`

<pre class="overflow-visible!" data-start="5777" data-end="6208"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineType } </span><span>from</span><span></span><span>'sanity'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineType</span><span>({
  </span><span>name</span><span>: </span><span>'lookbook'</span><span>,
  </span><span>title</span><span>: </span><span>'Lookbook'</span><span>,
  </span><span>type</span><span>: </span><span>'document'</span><span>,
  </span><span>fields</span><span>: [
    { </span><span>name</span><span>: </span><span>'title'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Titre'</span><span> },
    { </span><span>name</span><span>: </span><span>'season'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Saison / Année'</span><span> },
    { </span><span>name</span><span>: </span><span>'images'</span><span>, </span><span>type</span><span>: </span><span>'array'</span><span>, </span><span>title</span><span>: </span><span>'Images'</span><span>, </span><span>of</span><span>: [{ </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } }] },
    { </span><span>name</span><span>: </span><span>'seo'</span><span>, </span><span>type</span><span>: </span><span>'seo'</span><span>, </span><span>title</span><span>: </span><span>'SEO'</span><span> },
  ]
})
</span></span></code></div></div></pre>

### `sanity/schemas/types/collectionEditoriale.ts`

<pre class="overflow-visible!" data-start="6261" data-end="6799"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { defineType } </span><span>from</span><span></span><span>'sanity'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>defineType</span><span>({
  </span><span>name</span><span>: </span><span>'collectionEditoriale'</span><span>,
  </span><span>title</span><span>: </span><span>'Collection éditoriale'</span><span>,
  </span><span>type</span><span>: </span><span>'document'</span><span>,
  </span><span>fields</span><span>: [
    { </span><span>name</span><span>: </span><span>'name'</span><span>, </span><span>type</span><span>: </span><span>'string'</span><span>, </span><span>title</span><span>: </span><span>'Nom'</span><span> },
    { </span><span>name</span><span>: </span><span>'slug'</span><span>, </span><span>type</span><span>: </span><span>'slug'</span><span>, </span><span>title</span><span>: </span><span>'Slug'</span><span>, </span><span>options</span><span>: { </span><span>source</span><span>: </span><span>'name'</span><span> } },
    { </span><span>name</span><span>: </span><span>'intro'</span><span>, </span><span>type</span><span>: </span><span>'blockContent'</span><span>, </span><span>title</span><span>: </span><span>'Introduction'</span><span> },
    { </span><span>name</span><span>: </span><span>'gallery'</span><span>, </span><span>type</span><span>: </span><span>'array'</span><span>, </span><span>title</span><span>: </span><span>'Galerie'</span><span>, </span><span>of</span><span>: [{ </span><span>type</span><span>: </span><span>'image'</span><span>, </span><span>options</span><span>: { </span><span>hotspot</span><span>: </span><span>true</span><span> } }] },
    { </span><span>name</span><span>: </span><span>'seo'</span><span>, </span><span>type</span><span>: </span><span>'seo'</span><span>, </span><span>title</span><span>: </span><span>'SEO'</span><span> },
  ]
})
</span></span></code></div></div></pre>

---

# Étape 4 — Route Studio dans Next (App Router)

Crée la page **embarquant** le Studio (accessible sur `/studio`) :

`src/app/studio/[[...index]]/page.tsx`

<pre class="overflow-visible!" data-start="6962" data-end="7162"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>'use client'</span><span>
</span><span>import</span><span> { </span><span>NextStudio</span><span> } </span><span>from</span><span></span><span>'next-sanity/studio'</span><span>
</span><span>import</span><span> config </span><span>from</span><span></span><span>'@/../sanity/sanity.config'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>function</span><span></span><span>StudioPage</span><span>(</span><span></span><span>) {
  </span><span>return</span><span></span><span><span class="language-xml"><NextStudio</span></span><span></span><span>config</span><span>=</span><span>{config}</span><span> />
}
</span></span></code></div></div></pre>

> Avantage : Blanche modifiera le contenu **sur ton site** (ex : `blancherenaudin.com/studio`).

---

# Étape 5 — Client Sanity & utilitaires côté Next

`src/lib/sanity.client.ts`

<pre class="overflow-visible!" data-start="7344" data-end="7703"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { createClient } </span><span>from</span><span></span><span>'@sanity/client'</span><span>

</span><span>export</span><span></span><span>const</span><span> sanityClient = </span><span>createClient</span><span>({
  </span><span>projectId</span><span>: process.</span><span>env</span><span>.</span><span>NEXT_PUBLIC_SANITY_PROJECT_ID</span><span>!,
  </span><span>dataset</span><span>: process.</span><span>env</span><span>.</span><span>NEXT_PUBLIC_SANITY_DATASET</span><span> || </span><span>'production'</span><span>,
  </span><span>apiVersion</span><span>: </span><span>'2025-09-01'</span><span>, </span><span>// fige la version de l'API</span><span>
  </span><span>useCdn</span><span>: process.</span><span>env</span><span>.</span><span>NODE_ENV</span><span> === </span><span>'production'</span><span>,
  </span><span>perspective</span><span>: </span><span>'published'</span><span>,
})
</span></span></code></div></div></pre>

`src/lib/sanity.image.ts`

<pre class="overflow-visible!" data-start="7731" data-end="7937"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> imageUrlBuilder </span><span>from</span><span></span><span>'@sanity/image-url'</span><span>
</span><span>import</span><span> { sanityClient } </span><span>from</span><span></span><span>'./sanity.client'</span><span>

</span><span>const</span><span> builder = </span><span>imageUrlBuilder</span><span>(sanityClient)
</span><span>export</span><span></span><span>const</span><span></span><span>urlFor</span><span> = (</span><span>src: any</span><span>) => builder.</span><span>image</span><span>(src)
</span></span></code></div></div></pre>

`src/lib/queries.ts`

<pre class="overflow-visible!" data-start="7960" data-end="8321"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { groq } </span><span>from</span><span></span><span>'next-sanity'</span><span>

</span><span>export</span><span></span><span>const</span><span></span><span>HOMEPAGE_QUERY</span><span> = groq`*[_type=="homepage"][0]{
  heroTitle, heroSubtitle, heroImage,
  sections[]{
    _type == "banner" => { _type, title, text, image, ctaLabel, ctaHref },
    _type == "carousel" => { _type, title, images },
    _type == "editorialPicks" => { _type, title, productIds }
  },
  seo
}`
</span></span></code></div></div></pre>

---

# Étape 6 — Exemple d’usage (Homepage côté Server Component)

`src/app/(public)/page.tsx` (adapte le chemin si besoin)

<pre class="overflow-visible!" data-start="8447" data-end="12894"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>import</span><span></span><span>Image</span><span></span><span>from</span><span></span><span>'next/image'</span><span>
</span><span>import</span><span> { sanityClient } </span><span>from</span><span></span><span>'@/lib/sanity.client'</span><span>
</span><span>import</span><span> { </span><span>HOMEPAGE_QUERY</span><span> } </span><span>from</span><span></span><span>'@/lib/queries'</span><span>
</span><span>import</span><span> { urlFor } </span><span>from</span><span></span><span>'@/lib/sanity.image'</span><span>
</span><span>// Si tu veux afficher des produits Supabase à partir des IDs:</span><span>
</span><span>import</span><span> { fetchProductsByIds } </span><span>from</span><span></span><span>'@/lib/products'</span><span>

</span><span>export</span><span></span><span>default</span><span></span><span>async</span><span></span><span>function</span><span></span><span>HomePage</span><span>(</span><span></span><span>) {
  </span><span>const</span><span> data = </span><span>await</span><span> sanityClient.</span><span>fetch</span><span>(</span><span>HOMEPAGE_QUERY</span><span>)

  </span><span>let</span><span></span><span>editorialProducts</span><span>: </span><span>any</span><span>[] = []
  </span><span>const</span><span> pick = data?.</span><span>sections</span><span>?.</span><span>find</span><span>(</span><span>(s: any</span><span>) => s?.</span><span>_type</span><span> === </span><span>'editorialPicks'</span><span>)
  </span><span>if</span><span> (pick?.</span><span>productIds</span><span>?.</span><span>length</span><span>) {
    editorialProducts = </span><span>await</span><span></span><span>fetchProductsByIds</span><span>(pick.</span><span>productIds</span><span>)
  }

  </span><span>return</span><span> (
    </span><span><span class="language-xml"><main</span></span><span></span><span>className</span><span>=</span><span>"min-h-screen bg-white"</span><span>>
      {/* Hero */}
      {data?.heroImage && (
        </span><span><div</span><span></span><span>className</span><span>=</span><span>"relative w-full aspect-[16/9]"</span><span>>
          </span><span><Image</span><span>
            </span><span>src</span><span>=</span><span>{urlFor(data.heroImage).width(1600).height(900).url()}</span><span>
            </span><span>alt</span><span>=</span><span>{data?.heroTitle</span><span> || '</span><span>Hero</span><span>'}
            </span><span>fill</span><span>
            </span><span>sizes</span><span>=</span><span>"100vw"</span><span>
            </span><span>priority</span><span>
            </span><span>className</span><span>=</span><span>"object-cover"</span><span>
          />
        </span><span></div</span><span>>
      )}
      </span><span><section</span><span></span><span>className</span><span>=</span><span>"max-w-6xl mx-auto p-6"</span><span>>
        </span><span><h1</span><span></span><span>className</span><span>=</span><span>"text-3xl md:text-5xl font-light"</span><span>>{data?.heroTitle}</span><span></h1</span><span>>
        </span><span><p</span><span></span><span>className</span><span>=</span><span>"text-gray-600 mt-2"</span><span>>{data?.heroSubtitle}</span><span></p</span><span>>
      </span><span></section</span><span>>

      {/* Sections */}
      {Array.isArray(data?.sections) && data.sections.map((s: any, i: number) => {
        if (s._type === 'banner') {
          return (
            </span><span><section</span><span></span><span>key</span><span>=</span><span>{i}</span><span></span><span>className</span><span>=</span><span>"max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6"</span><span>>
              {s.image && (
                </span><span><div</span><span></span><span>className</span><span>=</span><span>"relative w-full aspect-square"</span><span>>
                  </span><span><Image</span><span>
                    </span><span>src</span><span>=</span><span>{urlFor(s.image).width(1200).height(1200).url()}</span><span>
                    </span><span>alt</span><span>=</span><span>{s.title</span><span> || '</span><span>Bannière</span><span>'}
                    </span><span>fill</span><span>
                    </span><span>sizes</span><span>=</span><span>"(max-width: 768px) 100vw, 50vw"</span><span>
                    </span><span>className</span><span>=</span><span>"object-cover"</span><span>
                  />
                </span><span></div</span><span>>
              )}
              </span><span><div</span><span></span><span>className</span><span>=</span><span>"flex flex-col justify-center"</span><span>>
                </span><span><h2</span><span></span><span>className</span><span>=</span><span>"text-2xl font-light"</span><span>>{s.title}</span><span></h2</span><span>>
                </span><span><p</span><span></span><span>className</span><span>=</span><span>"text-gray-600 mt-2 whitespace-pre-line"</span><span>>{s.text}</span><span></p</span><span>>
                {s.ctaHref && (
                  </span><span><a</span><span></span><span>href</span><span>=</span><span>{s.ctaHref}</span><span></span><span>className</span><span>=</span><span>"mt-4 inline-block border px-4 py-2"</span><span>>
                    {s.ctaLabel || 'Découvrir'}
                  </span><span></a</span><span>>
                )}
              </span><span></div</span><span>>
            </span><span></section</span><span>>
          )
        }
        if (s._type === 'carousel' && Array.isArray(s.images)) {
          return (
            </span><span><section</span><span></span><span>key</span><span>=</span><span>{i}</span><span></span><span>className</span><span>=</span><span>"max-w-6xl mx-auto p-6"</span><span>>
              </span><span><h3</span><span></span><span>className</span><span>=</span><span>"text-xl mb-4"</span><span>>{s.title}</span><span></h3</span><span>>
              </span><span><div</span><span></span><span>className</span><span>=</span><span>"grid grid-cols-2 md:grid-cols-4 gap-3"</span><span>>
                {s.images.map((img: any, idx: number) => (
                  </span><span><div</span><span></span><span>key</span><span>=</span><span>{idx}</span><span></span><span>className</span><span>=</span><span>"relative aspect-[3/4]"</span><span>>
                    </span><span><Image</span><span>
                      </span><span>src</span><span>=</span><span>{urlFor(img).width(800).height(1066).url()}</span><span>
                      </span><span>alt</span><span>=</span><span>{</span><span>`</span><span>carousel-</span><span>${</span><span>idx</span><span>}`}
                      </span><span>fill</span><span>
                      </span><span>sizes</span><span>=</span><span>"(max-width: 768px) 50vw, 25vw"</span><span>
                      </span><span>className</span><span>=</span><span>"object-cover"</span><span>
                    />
                  </span><span></div</span><span>>
                ))}
              </span><span></div</span><span>>
            </span><span></section</span><span>>
          )
        }
        if (s._type === 'editorialPicks') {
          return (
            </span><span><section</span><span></span><span>key</span><span>=</span><span>{i}</span><span></span><span>className</span><span>=</span><span>"max-w-6xl mx-auto p-6"</span><span>>
              </span><span><h3</span><span></span><span>className</span><span>=</span><span>"text-xl mb-4"</span><span>>{s.title || 'Sélection'}</span><span></h3</span><span>>
              </span><span><div</span><span></span><span>className</span><span>=</span><span>"grid grid-cols-2 md:grid-cols-4 gap-4"</span><span>>
                {editorialProducts.map((p: any) => (
                  </span><span><a</span><span></span><span>key</span><span>=</span><span>{p.id}</span><span></span><span>href</span><span>=</span><span>{</span><span>`/</span><span>products</span><span>/${</span><span>p.id</span><span>}`} </span><span>className</span><span>=</span><span>"block"</span><span>>
                    </span><span><div</span><span></span><span>className</span><span>=</span><span>"relative aspect-square border"</span><span>>
                      {p.images?.[0]?.url && (
                        </span><span><Image</span><span>
                          </span><span>src</span><span>=</span><span>{p.images[0].url}</span><span>
                          </span><span>alt</span><span>=</span><span>{p.name}</span><span>
                          </span><span>fill</span><span>
                          </span><span>sizes</span><span>=</span><span>"(max-width: 768px) 50vw, 25vw"</span><span>
                          </span><span>className</span><span>=</span><span>"object-cover"</span><span>
                        />
                      )}
                    </span><span></div</span><span>>
                    </span><span><div</span><span></span><span>className</span><span>=</span><span>"mt-2 text-sm"</span><span>>
                      </span><span><div</span><span>>{p.name}</span><span></div</span><span>>
                      </span><span><div</span><span></span><span>className</span><span>=</span><span>"text-gray-600"</span><span>>{p.price} €</span><span></div</span><span>>
                    </span><span></div</span><span>>
                  </span><span></a</span><span>>
                ))}
              </span><span></div</span><span>>
            </span><span></section</span><span>>
          )
        }
        return null
      })}
    </span><span></main</span><span>>
  )
}
</span></span></code></div></div></pre>

---

# Étape 7 — Helper Supabase (pour les IDs de la sélection édito)

`src/lib/products.ts`

<pre class="overflow-visible!" data-start="12989" data-end="13594"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { supabaseClient } </span><span>from</span><span></span><span>'@/lib/supabase'</span><span></span><span>// tu utilises bien ce nom d'import dans ton projet</span><span>

</span><span>export</span><span></span><span>async</span><span></span><span>function</span><span></span><span>fetchProductsByIds</span><span>(</span><span>ids: string</span><span>[]) {
  </span><span>if</span><span> (!ids?.</span><span>length</span><span>) </span><span>return</span><span> []
  </span><span>const</span><span> { data, error } = </span><span>await</span><span> supabaseClient
    .</span><span>from</span><span>(</span><span>'products'</span><span>)
    .</span><span>select</span><span>(`
      id, name, price,
      product_images ( url )
    `)
    .</span><span>in</span><span>(</span><span>'id'</span><span>, ids)

  </span><span>if</span><span> (error) {
    </span><span>console</span><span>.</span><span>error</span><span>(</span><span>'[fetchProductsByIds]'</span><span>, error)
    </span><span>return</span><span> []
  }

  </span><span>// Aplatis les images pour correspondre à l’usage dans l’exemple</span><span>
  </span><span>return</span><span> (data || []).</span><span>map</span><span>(</span><span>(p: any</span><span>) => ({
    ...p,
    </span><span>images</span><span>: p.</span><span>product_images</span><span> || [],
  }))
}
</span></span></code></div></div></pre>

> Adapte les champs selon ta table Supabase (tu as déjà une `product_images(url)` dans tes morceaux de code récents).

---

# Étape 8 — Protéger l’accès au Studio (simple Basic Auth)

Option rapide si tu veux éviter que n’importe qui voit `/studio` :

`src/middleware.ts`

<pre class="overflow-visible!" data-start="13868" data-end="14931"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { </span><span>NextResponse</span><span> } </span><span>from</span><span></span><span>'next/server'</span><span>
</span><span>import</span><span></span><span>type</span><span> { </span><span>NextRequest</span><span> } </span><span>from</span><span></span><span>'next/server'</span><span>

</span><span>const</span><span></span><span>PROTECT</span><span> = </span><span>true</span><span></span><span>// mets à false si tu ne veux plus protéger</span><span>

</span><span>export</span><span></span><span>function</span><span></span><span>middleware</span><span>(</span><span>req: NextRequest</span><span>) {
  </span><span>if</span><span> (!</span><span>PROTECT</span><span>) </span><span>return</span><span></span><span>NextResponse</span><span>.</span><span>next</span><span>()

  </span><span>const</span><span> { pathname } = req.</span><span>nextUrl</span><span>
  </span><span>if</span><span> (!pathname.</span><span>startsWith</span><span>(</span><span>'/studio'</span><span>)) </span><span>return</span><span></span><span>NextResponse</span><span>.</span><span>next</span><span>()

  </span><span>const</span><span> auth = req.</span><span>headers</span><span>.</span><span>get</span><span>(</span><span>'authorization'</span><span>)
  </span><span>const</span><span> okUser = process.</span><span>env</span><span>.</span><span>STUDIO_USER</span><span>
  </span><span>const</span><span> okPass = process.</span><span>env</span><span>.</span><span>STUDIO_PASS</span><span>

  </span><span>if</span><span> (!okUser || !okPass) </span><span>return</span><span></span><span>NextResponse</span><span>.</span><span>next</span><span>() </span><span>// si non configuré, on laisse passer</span><span>

  </span><span>if</span><span> (!auth?.</span><span>startsWith</span><span>(</span><span>'Basic '</span><span>)) {
    </span><span>return</span><span></span><span>new</span><span></span><span>NextResponse</span><span>(</span><span>'Auth required'</span><span>, {
      </span><span>status</span><span>: </span><span>401</span><span>,
      </span><span>headers</span><span>: { </span><span>'WWW-Authenticate'</span><span>: </span><span>'Basic realm="Secure Area"'</span><span> },
    })
  }

  </span><span>const</span><span> [, hash] = auth.</span><span>split</span><span>(</span><span>' '</span><span>)
  </span><span>const</span><span> [user, pass] = </span><span>Buffer</span><span>.</span><span>from</span><span>(hash, </span><span>'base64'</span><span>).</span><span>toString</span><span>().</span><span>split</span><span>(</span><span>':'</span><span>)

  </span><span>if</span><span> (user === okUser && pass === okPass) </span><span>return</span><span></span><span>NextResponse</span><span>.</span><span>next</span><span>()

  </span><span>return</span><span></span><span>new</span><span></span><span>NextResponse</span><span>(</span><span>'Unauthorized'</span><span>, { </span><span>status</span><span>: </span><span>401</span><span> })
}

</span><span>export</span><span></span><span>const</span><span> config = {
  </span><span>matcher</span><span>: [</span><span>'/studio/:path*'</span><span>],
}
</span></span></code></div></div></pre>

Ajoute dans `.env.local` :

<pre class="overflow-visible!" data-start="14960" data-end="15022"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>STUDIO_USER</span><span>=blanche
</span><span>STUDIO_PASS</span><span>=un-mot-de-passe-solide
</span></span></code></div></div></pre>

> Alternative simple : activer **Vercel Password Protection** sur la route `/studio`.

---

# Étape 9 — Créer le projet Sanity & remplir les variables

1. Lance le Studio en local pour générer/relier le projet :

<pre class="overflow-visible!" data-start="15236" data-end="15270"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npx sanity@latest init
</span></span></code></div></div></pre>

* Sélectionne **Create new project** → nom : `blancherenaudin`.
* Dataset : `production`.
* Accepte la détection du `sanity/sanity.config.ts`.
* À la fin, récupère le **projectId** (copie-le).

2. Remplace `NEXT_PUBLIC_SANITY_PROJECT_ID` dans `.env.local` par la vraie valeur.
3. Redémarre le dev server.
4. Va sur `http://localhost:3000/studio` → connecte-toi (ou via Basic Auth si activé).
5. Dans le Studio, crée le doc **Homepage** (singleton) → remplis un titre, une image, etc. →  **Publish** .

---

# Étape 10 — Vérifier l’affichage

* Va sur `/` (Homepage).
* Tu dois voir le Hero (image + titres) et tes sections.
* Si tu ajoutes une section “Sélection édito” avec des `productIds` existants, ça doit s’afficher (images/prix depuis Supabase).

---

# Étape 11 — Déploiement Vercel

Dans Vercel → Project Settings → **Environment Variables** (Production + Preview + Development) :

<pre class="overflow-visible!" data-start="16169" data-end="16356"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>NEXT_PUBLIC_SANITY_PROJECT_ID</span><span>=tonProjectId
</span><span>NEXT_PUBLIC_SANITY_DATASET</span><span>=production
</span><span>STUDIO_USER</span><span>=blanche
</span><span>STUDIO_PASS</span><span>=un-mot-de-passe-solide
</span><span># (optionnel)</span><span>
</span><span># SANITY_API_READ_TOKEN=xxxxx</span><span>
</span></span></code></div></div></pre>

Déploie → vérifie `/studio` et `/`.
