# 📋 Documentation MVP Globale - Gestion des Événements Offline

## 🎯 Vue d'ensemble

Système complet pour tracker l'impact des événements offline via **codes promo ET/OU QR codes trackés** . L'utilisateur choisit la méthode d'attribution selon le contexte.

---

## 💡 Concept : Flexibilité d'attribution

### **3 modes possibles par événement**

typescript

```typescript
typeAttributionMode = 'promo_only' | 'qr_only' | 'both'

// Mode 1 : CODE PROMO UNIQUEMENT
// → Événement avec distribution de flyers papier
// → Tracking via code promo saisi au checkout

// Mode 2 : QR CODE UNIQUEMENT
// → Événement avec affichage digital
// → Tracking via scan QR → landing page → achat
// → Pas de code promo nécessaire

// Mode 3 : LES DEUX (recommandé)
// → Maximum de flexibilité
// → QR code pour capter l'intérêt + visite
// → Code promo pour inciter à l'achat
// → Attribution combinée
```

### **Exemple concret**

```
🎪 Pop-up StoreParisMarais
└─ Mode:"both"
   ├─ 📱 QRCode sur la vitrine
   │   → Scan → /events/popup-paris → Découverte produits
   │   → Tracking:150visites(UTM)
   │
   └─ 🎟️ Carte avec code "POPUP15" distribuée
       → Saisie au checkout → -15%
       → Tracking:45 utilisations

Résultat:
-150 visites trackées(intérêt)
-45 commandes avec code(conversion)
-Taux conversion:30%
```

---

## 📊 Architecture de données - MVP GLOBALE

### **Table : `offline_events`**

sql

```sql
CREATETABLE offline_events (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),

-- Informations générales
  name TEXTNOTNULL,
  slug TEXTUNIQUENOTNULL,
typeTEXTNOTNULLCHECK(typeIN('popup','market','private_sale','collab')),
  description TEXT,

-- Localisation & dates
  location TEXT,
  start_date DATENOTNULL,
  end_date DATENOTNULL,

-- Budget & objectifs
  budget DECIMAL(10,2),
  target_revenue DECIMAL(10,2),
  target_orders INTEGER,

-- 🎯 MODE D'ATTRIBUTION (nouveauté)
  attribution_mode TEXTNOTNULLDEFAULT'both'
CHECK(attribution_mode IN('promo_only','qr_only','both')),

-- Attribution CODE PROMO (si mode = promo_only ou both)
  promo_code TEXTUNIQUE,
  promo_discount_percent INTEGERCHECK(promo_discount_percent BETWEEN1AND100),
  promo_discount_amount DECIMAL(10,2)CHECK(promo_discount_amount >0),
  promo_usage_limit INTEGER,

-- Attribution QR CODE (si mode = qr_only ou both)
  utm_source TEXTDEFAULT'offline',
  utm_medium TEXTDEFAULT'qr_code',
  utm_campaign TEXTUNIQUE,
  landing_page_url TEXT,-- /events/[slug]

-- Contenu de la landing page (optionnel)
  landing_hero_image TEXT,
  landing_hero_title TEXT,
  landing_hero_subtitle TEXT,
  landing_cta_text TEXTDEFAULT'Découvrir la collection',

-- Produits mis en avant (pour landing page)
  featured_product_ids UUID[],

-- Statut
statusTEXTDEFAULT'draft'CHECK(statusIN('draft','active','completed','archived')),
  is_active BOOLEANDEFAULTtrue,

-- Metadata
  created_at TIMESTAMPDEFAULTNOW(),
  updated_at TIMESTAMPDEFAULTNOW(),
  created_by UUID REFERENCES profiles(id),

-- Contraintes métier
CONSTRAINT check_promo_or_qr CHECK(
    attribution_mode ='both'OR
(attribution_mode ='promo_only'AND promo_code ISNOTNULL)OR
(attribution_mode ='qr_only'AND utm_campaign ISNOTNULL)
),
CONSTRAINT check_discount_type CHECK(
    promo_discount_percent ISNULLOR promo_discount_amount ISNULL
)
);

-- Index
CREATEINDEX idx_offline_events_status ON offline_events(status);
CREATEINDEX idx_offline_events_dates ON offline_events(start_date, end_date);
CREATEINDEX idx_offline_events_promo_code ON offline_events(promo_code)WHERE promo_code ISNOTNULL;
CREATEINDEX idx_offline_events_utm ON offline_events(utm_campaign)WHERE utm_campaign ISNOTNULL;
CREATEINDEX idx_offline_events_attribution_mode ON offline_events(attribution_mode);

-- Trigger updated_at
CREATEORREPLACEFUNCTION update_offline_events_updated_at()
RETURNSTRIGGERAS $$
BEGIN
  NEW.updated_at =NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATETRIGGER trigger_update_offline_events_updated_at
  BEFORE UPDATEON offline_events
FOR EACH ROW
EXECUTEFUNCTION update_offline_events_updated_at();

-- Commentaires
COMMENTONCOLUMN offline_events.attribution_mode IS'Mode d''attribution: promo_only (code promo seul), qr_only (QR code seul), both (les deux)';
COMMENTONCOLUMN offline_events.utm_campaign IS'Identifiant unique pour tracking analytics (ex: popup-paris-marais-oct24)';
```

### **Modification table `coupons`**

sql

```sql
ALTERTABLE coupons
ADDCOLUMN event_id UUID REFERENCES offline_events(id)ONDELETESETNULL;

CREATEINDEX idx_coupons_event_id ON coupons(event_id);

COMMENTONCOLUMN coupons.event_id IS'Lien vers offline_events si le coupon est généré pour un événement';
```

### **Vue analytics : `event_performance`**

sql

```sql
CREATEVIEW event_performance AS
SELECT
  e.id,
  e.name,
  e.slug,
  e.type,
  e.location,
  e.start_date,
  e.end_date,
  e.status,
  e.attribution_mode,
  e.budget,
  e.target_revenue,
  e.target_orders,

-- Info code promo
  e.promo_code,
  e.promo_discount_percent,
  e.promo_discount_amount,
  c.used_count as promo_uses,
  c.usage_limit as promo_limit,
  c.is_active as promo_is_active,

-- Info QR code
  e.utm_campaign,
  e.landing_page_url,

-- Métriques COMMANDES (via code promo)
COUNT(DISTINCTCASE
WHEN o.promo_code = e.promo_code
THEN o.id
END)as orders_from_promo,

COALESCE(SUM(CASE
WHEN o.promo_code = e.promo_code
THEN o.total_amount
END),0)as revenue_from_promo,

COALESCE(AVG(CASE
WHEN o.promo_code = e.promo_code
THEN o.total_amount
END),0)as avg_order_value_promo,

-- Métriques WEB (via UTM campaign)
COUNT(DISTINCTCASE
WHEN ae.utm_campaign = e.utm_campaign
THEN ae.session_id
END)as web_visits,

COUNT(DISTINCTCASE
WHEN ae.utm_campaign = e.utm_campaign
AND ae.event_type ='page_view'
THEN ae.session_id
END)as web_pageviews,

COUNT(DISTINCTCASE
WHEN ae.utm_campaign = e.utm_campaign
AND ae.event_type ='add_to_cart'
THEN ae.session_id
END)as web_add_to_cart,

COUNT(DISTINCTCASE
WHEN ae.utm_campaign = e.utm_campaign
AND ae.event_type ='purchase'
THEN ae.order_id
END)as orders_from_utm,

COALESCE(SUM(CASE
WHEN ae.utm_campaign = e.utm_campaign
AND ae.event_type ='purchase'
THEN ae.revenue
END),0)as revenue_from_utm,

-- Métriques COMBINÉES (selon mode)
CASE
WHEN e.attribution_mode ='promo_only'THEN
COUNT(DISTINCTCASEWHEN o.promo_code = e.promo_code THEN o.id END)
WHEN e.attribution_mode ='qr_only'THEN
COUNT(DISTINCTCASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'THEN ae.order_id END)
WHEN e.attribution_mode ='both'THEN
COUNT(DISTINCTCASEWHEN o.promo_code = e.promo_code THEN o.id END)+
COUNT(DISTINCTCASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'AND(o2.promo_code ISNULLOR o2.promo_code != e.promo_code)THEN ae.order_id END)
ENDas total_orders,

CASE
WHEN e.attribution_mode ='promo_only'THEN
COALESCE(SUM(CASEWHEN o.promo_code = e.promo_code THEN o.total_amount END),0)
WHEN e.attribution_mode ='qr_only'THEN
COALESCE(SUM(CASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'THEN ae.revenue END),0)
WHEN e.attribution_mode ='both'THEN
COALESCE(SUM(CASEWHEN o.promo_code = e.promo_code THEN o.total_amount END),0)+
COALESCE(SUM(CASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'AND(o2.promo_code ISNULLOR o2.promo_code != e.promo_code)THEN ae.revenue END),0)
ENDas total_revenue,

-- Taux de conversion (si QR code)
CASE
WHEN e.attribution_mode IN('qr_only','both')ANDCOUNT(DISTINCTCASEWHEN ae.utm_campaign = e.utm_campaign THEN ae.session_id END)>0
THENROUND((COUNT(DISTINCTCASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'THEN ae.order_id END)::numeric/
COUNT(DISTINCTCASEWHEN ae.utm_campaign = e.utm_campaign THEN ae.session_id END)*100),2)
ELSE0
ENDas web_conversion_rate,

-- ROI
CASE
WHEN e.budget >0
THENROUND((((
CASE
WHEN e.attribution_mode ='promo_only'THENCOALESCE(SUM(CASEWHEN o.promo_code = e.promo_code THEN o.total_amount END),0)
WHEN e.attribution_mode ='qr_only'THENCOALESCE(SUM(CASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'THEN ae.revenue END),0)
WHEN e.attribution_mode ='both'THEN
COALESCE(SUM(CASEWHEN o.promo_code = e.promo_code THEN o.total_amount END),0)+
COALESCE(SUM(CASEWHEN ae.utm_campaign = e.utm_campaign AND ae.event_type ='purchase'AND(o2.promo_code ISNULLOR o2.promo_code != e.promo_code)THEN ae.revenue END),0)
END
)- e.budget)/ e.budget *100)::numeric,2)
ELSE0
ENDas roi_percent,

-- Période
CASE
WHENCURRENT_DATE< e.start_date THEN'upcoming'
WHENCURRENT_DATEBETWEEN e.start_date AND e.end_date THEN'ongoing'
WHENCURRENT_DATE> e.end_date THEN'past'
ENDas event_period_status,

  e.created_at,
  e.updated_at

FROM offline_events e
LEFTJOIN coupons c ON c.event_id = e.id
LEFTJOIN orders o ON o.promo_code = e.promo_code AND o.payment_status ='paid'
LEFTJOIN orders o2 ON o2.id::text=ANY(
SELECT ae2.order_id
FROM analytics_events ae2
WHERE ae2.utm_campaign = e.utm_campaign
AND ae2.event_type ='purchase'
)
LEFTJOIN analytics_events ae ON ae.utm_campaign = e.utm_campaign
GROUPBY
  e.id, e.name, e.slug, e.type, e.location, e.start_date, e.end_date,
  e.status, e.attribution_mode, e.budget, e.target_revenue, e.target_orders,
  e.promo_code, e.promo_discount_percent, e.promo_discount_amount,
  e.utm_campaign, e.landing_page_url, e.created_at, e.updated_at,
  c.used_count, c.usage_limit, c.is_active;
```

---

## 🔧 Backend - Types TypeScript

### **Types**

typescript

```typescript
// src/lib/types/offlineEvents.ts

exporttypeOfflineEventType='popup'|'market'|'private_sale'|'collab';
exporttypeOfflineEventStatus='draft'|'active'|'completed'|'archived';
exporttypeAttributionMode='promo_only'|'qr_only'|'both';

exportinterfaceOfflineEvent{
  id:string;
  name:string;
  slug:string;
  type:OfflineEventType;
  description?:string;
location?:string;
  start_date:string;
  end_date:string;
  budget?:number;
  target_revenue?:number;
  target_orders?:number;

// Attribution
  attribution_mode:AttributionMode;

// Code promo
  promo_code?:string;
  promo_discount_percent?:number;
  promo_discount_amount?:number;
  promo_usage_limit?:number;

// QR Code
  utm_source?:string;
  utm_medium?:string;
  utm_campaign?:string;
  landing_page_url?:string;

// Landing page
  landing_hero_image?:string;
  landing_hero_title?:string;
  landing_hero_subtitle?:string;
  landing_cta_text?:string;

// Produits
  featured_product_ids?:string[];

// Status
  status:OfflineEventStatus;
  is_active:boolean;

// Meta
  created_at:string;
  updated_at:string;
  created_by?:string;
}

exportinterfaceOfflineEventPerformanceextendsOfflineEvent{
// Métriques code promo
  promo_uses:number;
  promo_limit?:number;
  promo_is_active:boolean;
  orders_from_promo:number;
  revenue_from_promo:number;
  avg_order_value_promo:number;

// Métriques QR/Web
  web_visits:number;
  web_pageviews:number;
  web_add_to_cart:number;
  orders_from_utm:number;
  revenue_from_utm:number;
  web_conversion_rate:number;

// Métriques combinées
  total_orders:number;
  total_revenue:number;
  roi_percent:number;
  event_period_status:'upcoming'|'ongoing'|'past';
}

exportinterfaceCreateOfflineEventInput{
  name:string;
  type:OfflineEventType;
  description?:string;
location?:string;
  start_date:string;
  end_date:string;
  budget?:number;
  target_revenue?:number;
  target_orders?:number;

// Mode d'attribution
  attribution_mode:AttributionMode;

// Code promo (si mode = promo_only ou both)
  promo_discount_percent?:number;
  promo_discount_amount?:number;
  promo_usage_limit?:number;

// Landing page (si mode = qr_only ou both)
  landing_hero_image?:string;
  landing_hero_title?:string;
  landing_hero_subtitle?:string;
  landing_cta_text?:string;

// Produits
  featured_product_ids?:string[];
}
```

### **Validation Zod**

typescript

```typescript
// src/lib/validation/offlineEvents.ts

import{ z }from'zod';

exportconst offlineEventSchema = z.object({
  name: z.string().min(3,"Le nom doit faire au moins 3 caractères").max(100),
  type: z.enum(['popup','market','private_sale','collab']),
  description: z.string().max(500).optional(),
location: z.string().max(200).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Format de date invalide"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Format de date invalide"),
  budget: z.number().positive().optional(),
  target_revenue: z.number().positive().optional(),
  target_orders: z.number().int().positive().optional(),

  attribution_mode: z.enum(['promo_only','qr_only','both']),

// Code promo
  promo_discount_percent: z.number().int().min(1).max(100).optional(),
  promo_discount_amount: z.number().positive().optional(),
  promo_usage_limit: z.number().int().positive().optional(),

// Landing page
  landing_hero_image: z.string().url().optional(),
  landing_hero_title: z.string().max(100).optional(),
  landing_hero_subtitle: z.string().max(200).optional(),
  landing_cta_text: z.string().max(50).optional(),

// Produits
  featured_product_ids: z.array(z.string().uuid()).optional(),

}).refine(
(data)=>newDate(data.start_date)<newDate(data.end_date),
{
    message:"La date de fin doit être après la date de début",
    path:["end_date"]
}
).refine(
(data)=>!(data.promo_discount_percent&& data.promo_discount_amount),
{
    message:"Choisissez soit un pourcentage, soit un montant fixe",
    path:["promo_discount_amount"]
}
).refine(
(data)=>{
// Si mode promo_only ou both → promo requis
if(data.attribution_mode==='promo_only'|| data.attribution_mode==='both'){
return!!(data.promo_discount_percent|| data.promo_discount_amount);
}
returntrue;
},
{
    message:"Un code promo nécessite une réduction (% ou montant)",
    path:["promo_discount_percent"]
}
);
```

---

## 📁 Structure des fichiers

```
src/
├── app/
│   └── admin/
│       └──(protected)/
│           └── events/                    # 🆕 Module événements
│               ├── page.tsx               # Liste des événements
│               ├── EventsListClient.tsx   # Client component liste
│               ├── new/
│               │   └── page.tsx           # Créer événement
│               └── [id]/
│                   ├── page.tsx           # Détails + stats
│                   ├── edit/
│                   │   └── page.tsx       # Éditer événement
│                   └── EventDetailClient.tsx
│
├── api/
│   └── admin/
│       └── events/                        # 🆕 API événements
│           ├── route.ts                   # GET/api/admin/events(liste)
│           │                              # POST/api/admin/events(créer)
│           ├── [id]/
│           │   └── route.ts               # GET/PATCH/DELETE/api/admin/events/[id]
│           └── [id]/
│               └── performance/
│                   └── route.ts           # GET/api/admin/events/[id]/performance
│
├── components/
│   └── admin/
│       └── events/                        # 🆕 Composants événements
│           ├── EventForm.tsx              # Formulaire création/édition
│           ├── EventCard.tsx              # Cardévénement(liste)
│           ├── EventStats.tsx             # Stats détaillées
│           ├── EventQRCode.tsx            # Générateur QR code
│           └── EventPromoCodeDisplay.tsx  # Affichage code promo
│
└── lib/
    ├── types/
    │   └── offlineEvents.ts               # TypesTypeScript
    ├── validation/
    │   └── offlineEvents.ts               # SchémasZod
    └── utils/
        └── eventHelpers.ts                # Helpers(génération code, slug...)
```

---

## 🎨 Interface Admin - Wireframes

### **Page Liste** (`/admin/events`)

```
┌─────────────────────────────────────────────────────────────┐
│  🎪 Événements Offline[+Nouvel événement]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tous][À venir][En cours][Terminés]                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🎪 Pop-up StoreParisMarais[En cours]   │  │
│  │ 📍 Paris,LeMarais • 15-17Oct2024                 │  │
│  │ 🎯 Mode:Code promo +QR code                        │  │
│  │                                                        │  │
│  │ 📊 KPIs:                                              │  │
│  │ • Commandes:35/30(117%) ✅                       │  │
│  │ • Revenus:5,850€ /5,000€(117%) ✅                 │  │
│  │ • ROI:+193%                                          │  │
│  │ • Visites web:145|Code promo:35 utilisations    │  │
│  │                                                        │  │
│  │ [Voir détails][Éditer][QRCode][...]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🏪 Marché de NoëlLyon[À venir]   │  │
│  │ 📍 Lyon,PlaceBellecour • 1-24Déc 2024            │  │
│  │ 🎯 Mode:Code promo uniquement                       │  │
│  │                                                        │  │
│  │ Code promo:NOEL_LYON(-20%)                         │  │
│  │ Débute dans 42 jours                                  │  │
│  │                                                        │  │
│  │ [Voir détails][Éditer][...]                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Page Création** (`/admin/events/new`)

```
┌─────────────────────────────────────────────────────────────┐
│  ← RetourCréer un événement offline               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 INFORMATIONSGÉNÉRALES                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Nom de l'événement *                                │    │
│  │ [Pop-up StoreParisMarais_________________]        │    │
│  │                                                      │    │
│  │ Type d'événement *                                   │    │
│  │()Pop-up store(•)Marché()Vente privée     │    │
│  │()Collaboration                                    │    │
│  │                                                      │    │
│  │ Description                                          │    │
│  │ [Événement de 3 jours dans le Marais avec...____]  │    │
│  │                                                      │    │
│  │ Lieu                          │ Dates                │    │
│  │ [Paris,LeMarais__]          │ [15/10] → [17/10]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  💰 BUDGET&OBJECTIFS                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Budget     │ Objectif revenus │ Objectif commandes  │    │
│  │ [2000€___] │ [5000€_________] │ [30_____________]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🎯 MODED'ATTRIBUTION*                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Comment souhaitez-vous tracker cet événement ?      │    │
│  │                                                      │    │
│  │()Code promo uniquement                           │    │
│  │     → Distribution de flyers avec code              │    │
│  │                                                      │    │
│  │()QR code uniquement                              │    │
│  │     → Affichage digital, scan pour visiter          │    │
│  │                                                      │    │
│  │(•)Lesdeux(recommandé)                           │    │
│  │     → QR code pour attirer + code promo pour       │    │
│  │       convertir                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🎟️ CODEPROMO(mode: les deux)                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Le code sera généré automatiquement:                │    │
│  │ POPUP_PARIS_OCT24 ✨                                │    │
│  │                                                      │    │
│  │ Réduction *                                          │    │
│  │(•)Pourcentage:[15___]%                           │    │
│  │()Montant fixe:[____]€                           │    │
│  │                                                      │    │
│  │ Limite d'utilisation(optionnel)                    │    │
│  │ [100__] utilisations maximum                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  📱 QRCODE&LANDINGPAGE(mode: les deux)                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ URL générée automatiquement:                        │    │
│  │ /events/popup-paris-marais-oct24 ✨                 │    │
│  │                                                      │    │
│  │ Image hero de la landing page                       │    │
│  │ [Choisir une image_____________][Upload]           │    │
│  │                                                      │    │
│  │ Titre hero                                           │    │
│  │ [Découvrez notre pop-up éphémère_____________]     │    │
│  │                                                      │    │
│  │ Sous-titre                                           │    │
│  │ [3 jours seulement au cœur du Marais_________]     │    │
│  │                                                      │    │
│  │ Texte du bouton CTA                                 │    │
│  │ [Découvrir la collection________________]           │    │
│  │                                                      │    │
│  │ Produits mis en avant(optionnel)                   │    │
│  │ [Sélectionner des produits__________][+]           │    │
│  │ • RobeLin Écru                              [x]    │    │
│  │ • ToteBagCuir[x]    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Enregistrer comme brouillon][Créer et activer]          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Page Détails** (`/admin/events/[id]`)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Retour   🎪 Pop-up StoreParisMarais[Éditer][...] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📍 Paris,LeMarais • 15-17Oct2024(En cours)           │
│  🎯 Mode:Code promo +QR code                              │
│                                                              │
│  ┌──────────────────┬──────────────────┬──────────────────┐│
│  │ 💰 REVENUS       │ 📦 COMMANDES     │ 🎯 ROI           ││
│  │                  │                  │                  ││
│  │  5,850€          │      35          │    +193%         ││
│  │  ━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━  │  ━━━━━━━━━━━━━  ││
│  │  5,000€(117%)   │  30(117%)       │  Budget:2,000€  ││
│  │                  │                  │                  ││
│  └──────────────────┴──────────────────┴──────────────────┘│
│                                                              │
│  📊 DÉTAILSPARCANAL                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [Code promo][QRCode/Web][Comparaison]         │    │
│  │                                                      │    │
│  │ 🎟️ CODEPROMO:POPUP_PARIS_OCT24                   │    │
│  │                                                      │    │
│  │ • Utilisations:35/100(35%)                      │    │
│  │ • Commandes:35                                      │    │
│  │ • Revenus:4,200€                                    │    │
│  │ • Panier moyen:120€                                 │    │
│  │ • Remises accordées:630€                            │    │
│  │                                                      │    │
│  │ [Copier le code][Voir les commandes]               │    │
│  │                                                      │    │
│  │ 📱 QRCODE&WEB                                    │    │
│  │                                                      │    │
│  │ • Visites:145                                       │    │
│  │ • Pages vues:387                                    │    │
│  │ • Ajouts panier:42(29%)                           │    │
│  │ • Commandes:18(12.4%)                             │    │
│  │ • Revenus:1,650€                                    │    │
│  │                                                      │    │
│  │ [Télécharger QR code][Voir page événement]        │    │
│  │                                                      │    │
│  │ ┌─────────────────────────────────────────────┐    │    │
│  │ │         QRCODE                              │    │    │
│  │ │   ███████  █  ██  ██  ███████               │    │    │
│  │ │   █     █  ██  █ ███  █     █               │    │    │
│  │ │   █ ███ █ ███ ██  ██  █ ███ █               │    │    │
│  │ │   █ ███ █  █  ██████  █ ███ █               │    │    │
│  │ │   █     █ █ █  █  ██  █     █               │    │    │
│  │ │   ███████ █ █ █ █ ███ ███████               │    │    │
│  │ │                                              │    │    │
│  │ │   Scannez pour découvrir                     │    │    │
│  │ └─────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🏆 TOPPRODUITSVENDUS                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1.RobeLin Écru            12 ventes • 1,440€     │    │
│  │ 2.ToteBagCuir8 ventes •   960€     │    │
│  │ 3.JupePlissée6 ventes •   780€     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  📈 CHRONOLOGIEDESCONVERSIONS                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │     12│                          ●                  │    │
│  │     10│              ●                              │    │
│  │      8│        ●                    ●               │    │
│  │      6│   ●                                ●        │    │
│  │      4│                                         ●   │    │
│  │      2│                                             │    │
│  │      0│─────────────────────────────────────────   │    │
│  │        15/1016/1017/1018/1019/10       │    │
│  │                                                      │    │
│  │ Pic d'activité:16/10 à 15h(12 commandes)         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implémentation - Étapes

### **Étape 1 : Database (30 min)**

1. Créer la table `offline_events`
2. Ajouter `event_id` à `coupons`
3. Créer la vue `event_performance`
4. Tester avec données de test

### **Étape 2 : Backend (2-3h)**

1. Types TypeScript
2. Schémas Zod
3. API Routes (CRUD + performance)
4. Helpers (génération code promo, slug, UTM...)

### **Étape 3 : Components (3-4h)**

1. `EventForm` (formulaire avec mode d'attribution)
2. `EventCard` (affichage liste)
3. `EventStats` (dashboard détaillé)
4. `EventQRCode` (générateur + download)

### **Étape 4 : Pages Admin (2-3h)**

1. Liste événements
2. Création événement
3. Détails événement
4. Édition événement

### **Étape 5 : Landing Page Public (2h)**

1. Page `/events/[slug]`
2. Tracking automatique des visites
3. Integration analytics

---

**Tu veux que je commence l'implémentation ? Par quelle étape on attaque ?** 🚀
