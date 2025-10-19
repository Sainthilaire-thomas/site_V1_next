# 📊 État d'Avancement du MVP Newsletter - 19 Octobre 2025

## ✅ Ce qui est TERMINÉ

### 1. Base de Données (100% ✅)

- ✅ Table `newsletter_subscribers` créée
- ✅ Double opt-in fonctionnel
- ✅ Logs de consentement RGPD
- ✅ Statuts : `pending`, `active`, `unsubscribed`

### 2. Système d'Inscription (100% ✅)

- ✅ Formulaire footer intégré au site
- ✅ API `/api/newsletter/subscribe` fonctionnelle
- ✅ Email de confirmation envoyé via Resend
- ✅ Page de confirmation `/newsletter/confirmed`
- ✅ Gestion des doublons (email déjà inscrit)
- ✅ Design minimaliste cohérent avec le site

### 3. Email Templates (100% ✅)

- ✅ Template de confirmation newsletter (style Jacquemus)
- ✅ Logo SVG intégré
- ✅ Design responsive
- ✅ Multi-formats (AVIF/WebP/JPEG)

### 4. Admin - Email Preview (100% ✅)

- ✅ Page `/admin/email-preview` accessible
- ✅ Liste de tous les templates (5 + newsletter)
- ✅ Boutons View + Test pour chaque template
- ✅ Route API `/api/admin/email-preview/newsletter-confirmation`

### 5. Infrastructure Resend (100% ✅)

- ✅ Compte Resend actif
- ✅ Domaine `blancherenaudin.com` vérifié
- ✅ API Key configurée
- ✅ Email `contact@blancherenaudin.com` opérationnel

---

## 🟡 Ce qui est PARTIELLEMENT fait

### 6. Tables BDD Campagnes (⚠️ 0% - À créer)

- ❌ Table `newsletter_campaigns` → **À créer**
- ❌ Table `newsletter_sends` → **À créer**
- ❌ Table `newsletter_clicks` → **À créer**
- ❌ Vue `newsletter_performance` → **À créer**

### 7. Admin - Gestion Abonnés (⚠️ 0%)

- ❌ Page `/admin/newsletter/subscribers` → **À créer**
- ❌ Liste avec filtres (actif/pending/désabo) → **À créer**
- ❌ Recherche par email → **À créer**
- ❌ Export CSV → **Phase 2**

---

## 🔴 Ce qui RESTE À FAIRE pour le MVP

### Phase 1A : Compléter la BDD (4h) 🔴 PRIORITÉ 1

#### Étape 1.1 : Migration SQL complète

sql

```sql
-- À exécuter dans Supabase
-- Créer les 3 tables manquantes :
- newsletter_campaigns
- newsletter_sends
- newsletter_clicks

-- Créer la vue newsletter_performance
-- Configurer RLS policies
```

**Fichiers à créer :**

```
supabase/migrations/20251019_newsletter_campaigns.sql
```

---

### Phase 1B : API Routes Campagnes (8h) 🔴 PRIORITÉ 2

#### Endpoints à créer :

**1. Gestion Abonnés**

```
GET  /api/admin/newsletter/subscribers        ✅ Simple(liste)
GET  /api/admin/newsletter/subscribers/[id]   ⚠️ Détail (Phase 2)
DELETE/api/admin/newsletter/subscribers/[id] ✅ Suppression RGPD
```

**2. Gestion Campagnes**

```
GET    /api/admin/newsletter/campaigns        ✅ Liste
POST   /api/admin/newsletter/campaigns        ✅ Créer
GET    /api/admin/newsletter/campaigns/[id]   ✅ Détail
PATCH  /api/admin/newsletter/campaigns/[id]   ✅ Éditer
DELETE/api/admin/newsletter/campaigns/[id]   ✅ Supprimer
```

**3. Envoi**

```
POST /api/admin/newsletter/campaigns/[id]/test  ✅ Email de test
POST /api/admin/newsletter/campaigns/[id]/send  ✅ Envoi final
```

**4. Stats**

```
GET /api/admin/newsletter/campaigns/[id]/stats ✅ Stats complètes
```

**5. Produits**

```
GET /api/admin/newsletter/products/search ✅ Recherche pour sélection
```

**6. Webhooks**

```
POST /api/webhooks/resend ✅ Tracking email (ouvertures, clics)
```

**Fichiers à créer :**

```
src/app/api/admin/newsletter/
├── subscribers/route.ts           ← 2h
├── subscribers/[id]/route.ts      ← 1h
├── campaigns/route.ts             ← 2h
├── campaigns/[id]/route.ts        ← 1h
├── campaigns/[id]/send/route.ts   ← 3h (critique)
├── campaigns/[id]/test/route.ts   ← 1h
├── campaigns/[id]/stats/route.ts  ← 2h
└── products/search/route.ts       ← 1h

src/app/api/webhooks/resend/route.ts ← 3h (critique)
```

---

### Phase 1C : Template Email Campagne (4h) 🔴 PRIORITÉ 3

**Créer le template React Jacquemus complet**

typescript

```typescript
// lib/newsletter/templates/jacquemus.tsx

Interface:
-Hero image + overlay texte
-Titre principal
-Sous-titre
-CTA principal
-Grille 2x2 produits
-Footer(logo + liens + désabonnement)

Variables dynamiques :
-{{first_name}}
-LiensUTM automatiques
-Produits sélectionnés
```

**Fichiers à créer :**

```
src/lib/newsletter/
├── templates/jacquemus.tsx        ← 3h
├── render.ts                      ← 1h(fonction de rendu)
└── tracking.ts                    ← 1h(génération liens UTM)
```

---

### Phase 1D : Interface Admin (12h) 🔴 PRIORITÉ 4

#### Pages à créer :

**1. Liste Abonnés** (3h)

tsx

```tsx
src/app/admin/newsletter/subscribers/page.tsx

Features:
-Listepaginée(50/page)
-Filtres:Tous/Actifs/Pending/Désabonnés
-Recherche par email
-Colonnes:Email,Prénom,Statut,Date inscription
-Action:Supprimer(RGPD)
```

**2. Liste Campagnes** (3h)

tsx

```tsx
src/app/admin/newsletter/page.tsx

Features:
-Liste des campagnes(toutes statuts)
-Card par campagne avec :
-Nom+ sujet + status badge
-Métriques si envoyée(ouvertures,CA)
-Actions: Éditer /Envoyer/Stats
-Bouton"Nouvelle campagne"
```

**3. Créer/Éditer Campagne** (4h)

tsx

```tsx
src/app/admin/newsletter/campaigns/new/page.tsx
src/app/admin/newsletter/campaigns/[id]/page.tsx

Formulaire:
-Nom interne
-Objet email
-Preview text
-Heroimage(upload)
-Titre
-Sous-titre
-CTA(texte + lien)
-4produits(sélection dropdown)
-Actions:Sauvegarder/Prévisualiser/Test/Envoyer
```

**4. Stats Campagne** (2h)

tsx

```tsx
src/app/admin/newsletter/campaigns/[id]/stats/page.tsx

Dashboard:
-Métriques email(envoyés, ouverts, clics, taux)
-Métriques web(visites, paniers, achats,CA)
-Funnel de conversion
-Taux par étape
```

**Fichiers à créer :**

```
src/app/admin/newsletter/
├── page.tsx                        ← 3h(liste campagnes)
├── subscribers/page.tsx            ← 3h(liste abonnés)
├── campaigns/
│   ├── new/page.tsx                ← 4h(créer campagne)
│   └── [id]/
│       ├── page.tsx                ← 2h(éditer)
│       └── stats/page.tsx          ← 2h(stats)

src/components/admin/newsletter/
├── CampaignForm.tsx                ← Réutilisable create/edit
├── ProductSelector.tsx             ← Dropdown recherche produits
└── StatsDisplay.tsx                ← Dashboard stats
```

---

### Phase 1E : Tests & Debug (6h) 🟡

**Scénarios de test complets :**

1. ✅ **Inscription** → Email → Confirmation → Active
2. ❌ **Créer campagne** → Form → Save → Draft
3. ❌ **Envoyer test** → Email reçu
4. ❌ **Envoyer campagne** → 2-3 emails → Vérifier réception
5. ❌ **Cliquer dans email** → Atterrissage avec UTM
6. ❌ **Acheter produit** → Vérifier attribution dans stats
7. ❌ **Webhooks** → Ouvertures/clics trackés
8. ✅ **Désabonnement** → Status updated

---

## 📊 Récapitulatif Temps Restant

| Phase            | Tâches                         | Temps estimé | Priorité       |
| ---------------- | ------------------------------ | ------------ | -------------- |
| **1A. BDD**      | Migration SQL (3 tables + vue) | 4h           | 🔴 P1          |
| **1B. API**      | 13 endpoints + webhooks        | 8h           | 🔴 P2          |
| **1C. Template** | Email React Jacquemus          | 4h           | 🔴 P3          |
| **1D. Admin**    | 4 pages + composants           | 12h          | 🔴 P4          |
| **1E. Tests**    | Tests E2E complets             | 6h           | 🟡 P5          |
| **TOTAL**        |                                | **34h**      | **~1 semaine** |

---

## 🎯 Plan d'Action Recommandé

### Jour 1 : Base de Données + API Core (8h)

```
Matin(4h):
✅ Créer migration SQL complète
✅ Exécuter sur Supabase
✅ Vérifier tables + vue +RLS

Après-midi(4h):
✅ APICampagnes:GET(liste)+POST(create)
✅ APISubscribers:GET(liste)
```

### Jour 2 : Template Email + API Envoi (8h)

```
Matin(4h):
✅ TemplateReactJacquemus complet
✅ Fonction de rendu avec liens UTM

Après-midi(4h):
✅ API/campaigns/[id]/send(critique !)
✅ API/campaigns/[id]/test
```

### Jour 3 : Webhooks + API Stats (8h)

```
Matin(4h):
✅ WebhooksResend complets
✅ Tests webhooks avec ResendCLI

Après-midi(4h):
✅ API/campaigns/[id]/stats
✅ API/products/search
```

### Jour 4 : Interface Admin - Campagnes (8h)

```
Matin(4h):
✅ Page liste campagnes
✅ Bouton nouvelle campagne

Après-midi(4h):
✅ Formulaire créer campagne
✅ ProductSelector component
```

### Jour 5 : Interface Admin - Stats + Tests (10h)

```
Matin(3h):
✅ Page stats campagne
✅ Dashboard métriques

Après-midi(4h):
✅ Page liste abonnés
✅ Navigation admin mise à jour

Soir(3h):
✅ Tests complets E2E
✅ Debug& polish
```

---

## ✅ Critères de Validation MVP

Le MVP sera considéré comme **terminé et prêt pour production** quand :

### Fonctionnel

- [ ] Un visiteur peut s'inscrire depuis le footer
- [ ] Il reçoit un email de confirmation
- [ ] Il peut confirmer et devenir "active"
- [ ] Admin peut voir la liste des abonnés
- [ ] Admin peut créer une campagne avec 4 produits
- [ ] Admin peut envoyer un email de test
- [ ] Admin peut envoyer la campagne finale
- [ ] Les emails sont reçus avec le bon design
- [ ] Les liens UTM fonctionnent
- [ ] Les clics/ouvertures sont trackés (webhooks)
- [ ] Les achats sont attribués à la campagne
- [ ] Les stats s'affichent correctement

### Technique

- [ ] Toutes les tables BDD créées
- [ ] RLS policies actives
- [ ] Webhooks Resend configurés en production
- [ ] Variables d'env configurées
- [ ] Logs Supabase propres (pas d'erreurs)
- [ ] Logs Resend propres

### UX/UI

- [ ] Design cohérent avec le reste du site
- [ ] Responsive mobile/desktop
- [ ] Toasts de feedback utilisateur
- [ ] Loading states sur les boutons
- [ ] Messages d'erreur clairs

---

## 🚀 Après le MVP - Phase 2 (Optionnel)

Une fois le MVP validé, tu pourras ajouter :

### Semaine 2 : Automatisations (20h)

- Email de bienvenue automatique après confirmation
- Panier abandonné (si analytics détecte add_to_cart sans purchase)
- Réactivation (si pas de visite depuis 60 jours)

### Semaine 3 : Segmentation (15h)

- Tags manuels sur abonnés (VIP, Prospect, etc.)
- Segments dynamiques (clients actifs, paniers > 100€)
- Envoi à un segment spécifique

### Semaine 4 : Dashboard Global (10h)

- Vue multi-campagnes
- Comparaison de performances
- Graphiques d'évolution
- Export CSV des stats

---

## 📝 Notes Importantes

### Ce qui fonctionne déjà ✅

1. **Inscription newsletter** : Formulaire footer → Email confirmation → Active
2. **Email templates** : Design Jacquemus avec logo SVG
3. **Infrastructure Resend** : Domaine vérifié, emails envoyés
4. **Admin preview** : Tous les templates visibles dans `/admin/email-preview`

### Ce qui manque pour un MVP complet 🔴

1. **Tables campagnes** : newsletter_campaigns, newsletter_sends, newsletter_clicks
2. **API d'envoi** : POST /campaigns/[id]/send (le plus critique !)
3. **Webhooks** : POST /webhooks/resend pour tracker ouvertures/clics
4. **Template campagne** : Email React avec 4 produits + CTA
5. **Interface admin** : Créer/gérer/envoyer campagnes
6. **Page stats** : Voir le ROI de chaque campagne

### Bloquants techniques actuels ⚠️

- **Aucun !** Tout l'environnement est prêt (Resend OK, BDD OK, Auth OK)
- Il reste "juste" à coder les 34h de features listées ci-dessus
