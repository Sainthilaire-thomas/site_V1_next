# 🎯 Définition du MVP Newsletter - Phase 1

Excellente idée ! Avant de générer la doc, mettons-nous d'accord sur le **périmètre exact du MVP** . Je te propose une approche pragmatique basée sur ton infrastructure existante.

---

## 🤔 Questions Clés pour Définir le MVP

### 1. **Gestion des Abonnés** 👥

**Proposition MVP :**

- ✅ Formulaire d'inscription simple (footer site)
- ✅ Double opt-in obligatoire (email confirmation)
- ✅ Liste des abonnés dans l'admin
- ✅ Désabonnement en 1 clic
- ✅ Statuts basiques : `pending`, `active`, `unsubscribed`

**Questions :**

- ❓ Import CSV dès le MVP ou Phase 2 ?
- ❓ Segmentation manuelle (tags) dès le MVP ou juste "tous les abonnés" ?

**Ma recommandation :**

```
MVP : Pas de segmentation, envoi à tous les abonnés actifs
Phase 2 : Tags manuels + segments dynamiques
```

---

### 2. **Création de Campagnes** 📨

**Proposition MVP :**

- ✅ Création de campagne avec :
  - Nom interne
  - Objet de l'email
  - Texte de prévisualisation (preview text)
- ✅ Contenu email :
  - **Option A** : Éditeur de texte simple (textarea) + insertion manuelle de liens
  - **Option B** : Template React fixe avec variables ({{first_name}}, {{product_link}})
  - **Option C** : Éditeur WYSIWYG basique (TinyMCE/Tiptap)

**Questions :**

- ❓ Quel niveau de complexité pour l'éditeur dans le MVP ?
- ❓ Templates pré-faits fixes ou éditeur flexible ?

**Ma recommandation :**

```
MVP : Template React fixe style Jacquemus avec zones éditables
  - Hero image (upload)
  - Titre principal (texte)
  - Sous-titre (texte)
  - CTA principal (texte + lien)
  - Grille 2x2 produits (sélection manuelle depuis dropdown)
  - Footer automatique

Phase 2 : Éditeur drag & drop avec blocs modulables
```

---

### 3. **Envoi & Planification** 📅

**Proposition MVP :**

- ✅ Envoi immédiat à tous les abonnés actifs
- ✅ Email de test (envoyer à 1 adresse pour prévisualisation)
- ✅ Confirmation avant envoi massif
- ⚠️ **Pas de planification différée** dans le MVP
- ⚠️ **Pas d'envoi progressif** (batching) dans le MVP

**Questions :**

- ❓ Planification (date/heure future) dès le MVP ou Phase 2 ?
- ❓ Limitation du nombre d'envois/jour ?

**Ma recommandation :**

```
MVP : Envoi immédiat uniquement + email de test
Phase 2 : Planification + envoi progressif
```

---

### 4. **Tracking & Analytics** 📊

**Proposition MVP :**

- ✅ Tracking email (via webhooks Resend) :
  - Envoyés
  - Délivrés
  - Ouverts (unique)
  - Cliqués (unique)
  - Désabonnés
- ✅ Tracking web (via analytics_events existant) :
  - Visites générées
  - Ajouts au panier
  - Achats
  - CA généré
- ✅ Vue unifiée par campagne :
  - Métriques email + web
  - Taux de conversion
  - Panier moyen
- ✅ Génération automatique des liens UTM

**Questions :**

- ❓ Dashboard global (toutes les campagnes) dès le MVP ou juste stats par campagne ?
- ❓ Détail des clics (quel lien a été cliqué) dès le MVP ?
- ❓ Funnel de conversion visuel dès le MVP ?

**Ma recommandation :**

```
MVP :
  - Stats par campagne (page dédiée)
  - Liste des campagnes avec KPIs basiques (ouvertures, CA)
  - Pas de détail des clics par lien
  - Pas de funnel visuel (juste les chiffres)

Phase 2 :
  - Dashboard global multi-campagnes
  - Heatmap des clics
  - Funnel de conversion animé
  - Comparaison cross-canal (Newsletter vs Instagram)
```

---

### 5. **Automatisations** 🤖

**Proposition MVP :**

- ⚠️ **AUCUNE automatisation dans le MVP**
- Raison : complexité technique élevée, nécessite :
  - Système de workflows
  - Triggers événementiels
  - Queue de jobs
  - Gestion des états

**Questions :**

- ❓ Es-tu d'accord pour reporter toutes les automatisations en Phase 2 ?
- ❓ Une exception pour "Email de bienvenue" après confirmation ?

**Ma recommandation :**

```
MVP : Aucune automatisation (envois manuels uniquement)

Phase 2 :
  - Email de bienvenue (trigger: confirmation)
  - Panier abandonné (trigger: add_to_cart + no purchase 24h)
  - Réactivation (trigger: no visit 60 days)
```

---

### 6. **Templates & Design** 🎨

**Proposition MVP :**

- ✅ **1 seul template** style Jacquemus :
  - Header avec logo
  - Hero image + overlay texte
  - CTA principal
  - Grille 2x2 produits
  - Footer (réseaux sociaux + lien désabonnement)
- ✅ Responsive (mobile-first)
- ✅ Variables dynamiques basiques :
  - `{{first_name}}` (si disponible)
  - Produits sélectionnés manuellement

**Questions :**

- ❓ Un seul template suffit pour le MVP ?
- ❓ Personnalisation du template (couleurs, fonts) ou fixe ?

**Ma recommandation :**

```
MVP : 1 template fixe, 0 personnalisation visuelle
Phase 2 : Bibliothèque de 3-5 templates + personnalisation
```

---

### 7. **Service Email** 📮

**Proposition MVP :**

- ✅ **Resend** (déjà partiellement configuré dans le projet)
- ✅ Configuration des webhooks pour tracking
- ✅ Templates React (cohérence avec Next.js)

**Questions :**

- ❓ Es-tu OK avec Resend ou préfères-tu SendGrid/Mailchimp ?
- ❓ As-tu déjà un compte Resend actif ?

**Ma recommandation :**

```
MVP : Resend (100 emails/jour gratuit, puis 1$/1000 emails)
Phase 2+ : Migration vers SendGrid si volumes > 10k/mois
```

---

### 8. **RGPD & Conformité** 🔒

**Proposition MVP :**

- ✅ Double opt-in obligatoire
- ✅ Lien de désabonnement dans chaque email
- ✅ Log de consentement (date, IP, source)
- ✅ Suppression définitive possible
- ⚠️ **Pas de centre de préférences** dans le MVP (juste désabo on/off)

**Questions :**

- ❓ Centre de préférences (fréquence, types de contenus) dès le MVP ?

**Ma recommandation :**

```
MVP : Opt-in/Opt-out uniquement
Phase 2 : Centre de préférences complet
```

---

### 9. **Interface Admin** 🖥️

**Proposition MVP :**

- ✅ Section "Newsletter" dans le menu admin (à côté de Products, Orders, etc.)
- ✅ Sous-pages :
  - `/admin/newsletter` → Dashboard (liste des campagnes + stats globales)
  - `/admin/newsletter/subscribers` → Liste des abonnés
  - `/admin/newsletter/campaigns` → Liste des campagnes
  - `/admin/newsletter/campaigns/new` → Créer une campagne
  - `/admin/newsletter/campaigns/[id]` → Éditer une campagne
  - `/admin/newsletter/campaigns/[id]/stats` → Stats d'une campagne

**Questions :**

- ❓ Cette structure te convient ?
- ❓ Veux-tu un dashboard global ou juste la liste des campagnes ?

**Ma recommandation :**

```
MVP :
  - Page "Campagnes" avec liste + bouton "Nouvelle campagne"
  - Pas de dashboard global (juste liste)
  - Stats détaillées par campagne uniquement

Phase 2 : Dashboard global avec graphiques multi-campagnes
```

---

## 📋 Récapitulatif MVP Phase 1 (ma proposition)

### ✅ **Inclus dans le MVP**

<pre class="font-ui border-border-100/50 overflow-x-scroll w-full rounded border-[0.5px] shadow-[0_2px_12px_hsl(var(--always-black)/5%)]"><table class="bg-bg-100 min-w-full border-separate border-spacing-0 text-sm leading-[1.88888] whitespace-normal"><thead class="border-b-border-100/50 border-b-[0.5px] text-left"><tr class="[tbody>&]:odd:bg-bg-500/10"><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Fonctionnalité</th><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Détail</th></tr></thead><tbody><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Abonnés</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Inscription footer → Double opt-in → Liste admin → Désabonnement</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Campagnes</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Création avec 1 template fixe React → Sélection manuelle de 4 produits → Objet/Preview text</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Envoi</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Envoi immédiat à tous actifs + Email de test avant</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Tracking Email</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Envoyés, Délivrés, Ouverts, Cliqués, Désabonnés (via webhooks Resend)</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Tracking Web</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Visites, Ajouts panier, Achats, CA (via <code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">analytics_events</code> existant)</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Analytics</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Page stats par campagne avec métriques email + web + taux conversion</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>UTM</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Génération auto : <code class="bg-text-200/5 border border-0.5 border-border-300 text-danger-000 whitespace-pre-wrap rounded-[0.4rem] px-1 py-px text-[0.9rem]">utm_source=newsletter&utm_medium=email&utm_campaign=xxx</code></td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>RGPD</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Double opt-in + Logs consentement + Désabonnement 1 clic</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>Admin</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">4 pages : Liste campagnes, Créer, Éditer, Stats</td></tr></tbody></table></pre>

### ❌ **Exclus du MVP (Phase 2+)**

<pre class="font-ui border-border-100/50 overflow-x-scroll w-full rounded border-[0.5px] shadow-[0_2px_12px_hsl(var(--always-black)/5%)]"><table class="bg-bg-100 min-w-full border-separate border-spacing-0 text-sm leading-[1.88888] whitespace-normal"><thead class="border-b-border-100/50 border-b-[0.5px] text-left"><tr class="[tbody>&]:odd:bg-bg-500/10"><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Fonctionnalité</th><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Quand</th></tr></thead><tbody><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Segmentation (tags, segments dynamiques)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Automatisations (bienvenue, panier abandonné)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Planification différée</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Éditeur drag & drop</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Templates multiples</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Tests A/B</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Heatmap des clics</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Funnel de conversion visuel</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Centre de préférences</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Dashboard global multi-campagnes</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Import/Export CSV</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 2</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Comparaison cross-canal (Newsletter vs Instagram)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">Phase 3</td></tr></tbody></table></pre>

---

## ⏱️ Estimation Temps de Développement MVP

<pre class="font-ui border-border-100/50 overflow-x-scroll w-full rounded border-[0.5px] shadow-[0_2px_12px_hsl(var(--always-black)/5%)]"><table class="bg-bg-100 min-w-full border-separate border-spacing-0 text-sm leading-[1.88888] whitespace-normal"><thead class="border-b-border-100/50 border-b-[0.5px] text-left"><tr class="[tbody>&]:odd:bg-bg-500/10"><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Tâche</th><th class="text-text-000 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] px-2 [&:not(:first-child)]:border-l-[0.5px]">Temps estimé</th></tr></thead><tbody><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>1. Base de données</strong> (tables, vues, RLS)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">4h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>2. API Routes</strong> (CRUD abonnés, campagnes, envoi)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">8h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>3. Webhooks Resend</strong> (tracking ouvertures/clics)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">3h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>4. Template Email React</strong> (1 template fixe)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">4h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>5. Formulaire inscription</strong> (frontend + double opt-in)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">4h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>6. Admin - Liste abonnés</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">3h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>7. Admin - Créer/Éditer campagne</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">6h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>8. Admin - Envoi + test</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">4h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>9. Admin - Stats campagne</strong> (avec analytics)</td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">6h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>10. Génération liens UTM</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">2h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>11. Tests & debug</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]">6h</td></tr><tr class="[tbody>&]:odd:bg-bg-500/10"><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>TOTAL</strong></td><td class="border-t-border-100/50 [&:not(:first-child)]:-x-[hsla(var(--border-100) / 0.5)] border-t-[0.5px] px-2 [&:not(:first-child)]:border-l-[0.5px]"><strong>~50h</strong> (1-2 semaines)</td></tr></tbody></table></pre>

---

## 🎯 Validation Finale

**Avant de générer la doc, confirme-moi :**

1. ✅ **Es-tu OK avec ce périmètre MVP ?**
2. ✅ **Changements à apporter ?**
   - Plus de features à inclure ?
   - Certaines features à retirer ?
3. ✅ **Niveau de détail de la doc ?**
   - Ultra-détaillée (avec code SQL, schemas, exemples) ?
   - Ou plus concise (juste specs fonctionnelles) ?

**Une fois validé, je génère une doc markdown complète avec :**

- Vue d'ensemble du MVP
- Spécifications fonctionnelles détaillées
- Architecture technique (tables, API, composants)
- Guide d'implémentation pas-à-pas
- Wireframes/mockups textuels
- Aperçu Phases 2 & 3

**Dis-moi ce que tu en penses !** 🚀

Réessayer

TR

ok

# 📧 Documentation Technique - Module Newsletter MVP Phase 1

**Projet:** .blancherenaudin E-commerce

**Version:** 1.0.0 - MVP Phase 1

**Date:** 19 Octobre 2025

**Auteur:** Documentation Technique

---

## 📋 Table des Matières

1. [Vue d&#39;ensemble](#vue-densemble)
2. [Objectifs du MVP](#objectifs-du-mvp)
3. [Périmètre Fonctionnel](#p%C3%A9rim%C3%A8tre-fonctionnel)
4. [Architecture Technique](#architecture-technique)
5. [Base de Données](#base-de-donn%C3%A9es)
6. [API Routes](#api-routes)
7. [Interface Admin](#interface-admin)
8. [Templates Email](#templates-email)
9. [Tracking &amp; Analytics](#tracking--analytics)
10. [Guide d&#39;Implémentation](#guide-dimpl%C3%A9mentation)
11. [Tests &amp; Validation](#tests--validation)
12. [Phases Ultérieures](#phases-ult%C3%A9rieures)

---

## 🎯 Vue d'ensemble

### Description

Module de gestion de newsletters intégré au site e-commerce .blancherenaudin, permettant de créer et envoyer des campagnes email tout en trackant précisément leur impact sur les ventes grâce à l'intégration avec le système analytics existant.

### Objectif Principal

**Mesurer le ROI exact de chaque campagne newsletter** en suivant le parcours complet : Email envoyé → Ouverture → Clic → Visite site → Consultation produit → Ajout panier → Achat.

### Principes Clés

- ✅ **Intégration native** avec le système `analytics_events` existant
- ✅ **Cohérence cross-canal** (même structure UTM que Instagram, Google, etc.)
- ✅ **Simplicité MVP** : 1 template, pas d'automatisation, envois manuels
- ✅ **RGPD compliant** : Double opt-in, logs de consentement, désabonnement facile
- ✅ **Service email** : Resend (déjà configuré dans le projet)

---

## 🎯 Objectifs du MVP

### Ce que le MVP doit permettre

1. **Collecter des abonnés** via un formulaire simple
2. **Créer une campagne** avec 1 template fixe style Jacquemus
3. **Envoyer immédiatement** à tous les abonnés actifs (+ email de test)
4. **Tracker les performances** email (ouvertures, clics) + web (visites, achats, CA)
5. **Visualiser les résultats** dans une page stats dédiée par campagne
6. **Respecter le RGPD** avec double opt-in et désabonnement

### Ce que le MVP ne fait PAS (Phase 2+)

- ❌ Automatisations (bienvenue, panier abandonné, etc.)
- ❌ Segmentation avancée (tags, filtres dynamiques)
- ❌ Planification différée (envoi à date/heure future)
- ❌ Éditeur drag & drop (template fixe uniquement)
- ❌ Tests A/B
- ❌ Import/Export CSV
- ❌ Centre de préférences utilisateur
- ❌ Dashboard global multi-campagnes

---

## 📦 Périmètre Fonctionnel

### 1. Gestion des Abonnés 👥

#### Inscription

```
┌─────────────────────────────────────────┐
│  FOOTER SITE                            │
│                                         │
│  Newsletter                             │
│  ┌─────────────────────────────────┐   │
│  │ email@example.com           [>] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  En vous abonnant, vous acceptez...    │
└─────────────────────────────────────────┘
```

**Workflow :**

1. Utilisateur entre son email
2. Submit → Création dans DB avec `status = 'pending'`
3. Email de confirmation envoyé automatiquement
4. Utilisateur clique sur lien de confirmation
5. Status passe à `active`

**Champs collectés :**

- Email (obligatoire)
- Prénom (optionnel, pré-rempli si utilisateur connecté)
- Nom (optionnel, pré-rempli si utilisateur connecté)

#### Liste Admin

```
┌─────────────────────────────────────────────────────────────┐
│  ABONNÉS NEWSLETTER                          [+ Importer]   │
├─────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...                    Statut: [Tous ▼]       │
├─────────────────────────────────────────────────────────────┤
│  Email                  │ Prénom │ Statut  │ Inscrit le    │
├─────────────────────────────────────────────────────────────┤
│  alice@email.com        │ Alice  │ ✅ Actif │ 15/01/2025   │
│  bob@email.com          │ Bob    │ ⏳ Attente│ 18/01/2025  │
│  claire@email.com       │ Claire │ 🚫 Désabo│ 10/01/2025   │
└─────────────────────────────────────────────────────────────┘
```

**Fonctionnalités :**

- Liste paginée (50 par page)
- Filtres : Tous / Actifs / En attente / Désabonnés
- Recherche par email/nom
- Voir détails d'un abonné (clics : modal ou page dédiée)
- Supprimer définitivement (RGPD)

#### Désabonnement

```
┌─────────────────────────────────────────────────────────────┐
│  Vous êtes désabonné(e)                                     │
│                                                             │
│  Vous ne recevrez plus nos newsletters.                    │
│  Nous sommes tristes de vous voir partir ! 😢               │
│                                                             │
│  [Se réabonner]                                            │
└─────────────────────────────────────────────────────────────┘
```

**Workflow :**

1. Utilisateur clique sur "Se désabonner" dans un email
2. Lien : `/newsletter/unsubscribe?token=xxx`
3. Status passe à `unsubscribed`
4. Date `unsubscribed_at` enregistrée
5. Confirmation affichée

---

### 2. Création de Campagnes 📨

#### Formulaire de Création

```
┌─────────────────────────────────────────────────────────────┐
│  NOUVELLE CAMPAGNE                                          │
├─────────────────────────────────────────────────────────────┤
│  Informations générales                                     │
│                                                             │
│  Nom de la campagne (interne)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Collection Hiver 2025                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Objet de l'email                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ❄️ Nouvelle Collection Hiver                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Texte de prévisualisation                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Découvrez nos pièces essentielles pour l'hiver      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Contenu de l'email (Template Jacquemus)                   │
│                                                             │
│  Hero                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Upload image]                    [Parcourir]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Titre principal                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NOUVELLE COLLECTION                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Sous-titre                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Les essentiels de l'hiver                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CTA Principal                                              │
│  ┌─────────────────────────┐  ┌────────────────────────┐  │
│  │ Découvrir              │  │ /products/hauts        │  │
│  └─────────────────────────┘  └────────────────────────┘  │
│                                                             │
│  Grille Produits (2x2)                                     │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ Produit 1   ▼│  │ Produit 2   ▼│                       │
│  └──────────────┘  └──────────────┘                       │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ Produit 3   ▼│  │ Produit 4   ▼│                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Enregistrer brouillon]  [Prévisualiser]  [Envoyer un test]│
└─────────────────────────────────────────────────────────────┘
```

#### Sélection de Produits

```
┌─────────────────────────────────────────────────────────────┐
│  SÉLECTIONNER UN PRODUIT                                    │
├─────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...                                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐                                                   │
│  │ IMG  │  Robe Noire Asymétrique                          │
│  └──────┘  89.00€ • Stock: 12                              │
│                                                             │
│  ┌──────┐                                                   │
│  │ IMG  │  Pantalon Large Beige                            │
│  └──────┘  79.00€ • Stock: 8                               │
└─────────────────────────────────────────────────────────────┘
```

**Produits affichés :**

- Tous les produits actifs (`status = 'active'`)
- Avec stock > 0
- Recherche par nom
- Affichage : Image + Nom + Prix + Stock

---

### 3. Envoi & Prévisualisation 📤

#### Email de Test

```
┌─────────────────────────────────────────────────────────────┐
│  ENVOYER UN EMAIL DE TEST                                   │
├─────────────────────────────────────────────────────────────┤
│  Adresse email de test                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ votre.email@example.com                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ L'email sera envoyé avec vos données personnelles      │
│     (prénom si disponible) pour tester la personnalisation │
│                                                             │
│  [Annuler]                              [Envoyer le test]  │
└─────────────────────────────────────────────────────────────┘
```

**Workflow :**

1. Admin clique sur "Envoyer un test"
2. Modal s'ouvre avec champ email
3. Submit → Email envoyé via Resend
4. Toast de confirmation
5. Email reçu dans les 10 secondes

#### Envoi Final

```
┌─────────────────────────────────────────────────────────────┐
│  ENVOYER LA CAMPAGNE                                        │
├─────────────────────────────────────────────────────────────┤
│  Vous êtes sur le point d'envoyer cette campagne à :       │
│                                                             │
│  📧 2,847 abonnés actifs                                   │
│                                                             │
│  Objet: ❄️ Nouvelle Collection Hiver                       │
│  Preview: Découvrez nos pièces essentielles...             │
│                                                             │
│  ⚠️ ATTENTION : Cette action est irréversible              │
│                                                             │
│  [Annuler]                        [Confirmer l'envoi]      │
└─────────────────────────────────────────────────────────────┘
```

**Workflow :**

1. Admin clique sur "Envoyer maintenant"
2. Modal de confirmation s'ouvre
3. Affichage du nombre d'abonnés actifs
4. Confirmation → Status passe à `sending`
5. Envoi via API Resend (boucle sur tous les abonnés)
6. Status passe à `sent` une fois terminé
7. Redirection vers page stats

---

### 4. Tracking & Analytics 📊

#### Structure UTM Générée

typescript

```typescript
// Pour chaque lien dans l'email
https://blancherenaudin.com/product/uuid-robe-noire?
  utm_source=newsletter
&utm_medium=email
&utm_campaign=newsletter-2025-01-collection-hiver
&utm_content=product-grid-item-1
&subscriber=uuid-subscriber
```

**Paramètres :**

- `utm_source` : toujours `newsletter`
- `utm_medium` : toujours `email`
- `utm_campaign` : généré auto (`newsletter-YYYY-MM-{slug}`)
- `utm_content` : identifie le lien (`hero-cta`, `product-grid-item-1`, etc.)
- `subscriber` : UUID de l'abonné (pour tracking individuel)

#### Événements Trackés

typescript

```typescript
// 1. Pageview (automatique via AnalyticsTracker)
{
  event_type:'pageview',
  page_path:'/product/uuid-robe-noire',
  utm_source:'newsletter',
  utm_campaign:'newsletter-2025-01-collection-hiver',
  session_id:'session-uuid',
  properties:{
    subscriber_id:'subscriber-uuid',
    email_link_name:'product-grid-item-1'
}
}

// 2. Add to cart (automatique via useCartStore)
{
  event_type:'add_to_cart',
  product_id:'uuid-robe-noire',
  cart_value:89.00,
  utm_campaign:'newsletter-2025-01-collection-hiver',
  session_id:'session-uuid'
}

// 3. Purchase (webhook Stripe ou checkout success)
{
  event_type:'purchase',
  order_id:'order-uuid',
  revenue:89.00,
  utm_campaign:'newsletter-2025-01-collection-hiver',
  session_id:'session-uuid'
}
```

#### Page Stats Campagne

```
┌─────────────────────────────────────────────────────────────┐
│  📧 CAMPAGNE:CollectionHiver2025                        │
│  Envoyée le 15/01/2025 à 10:00                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 MÉTRIQUESEMAIL                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ Envoyés    │ │ Délivrés   │ │ Ouverts    │ │ Cliqués  ││
│  │   2,847    │ │   2,832    │ │    812     │ │   234    ││
│  │            │ │   99.5%    │ │   28.7%    │ │   8.3%   ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                             │
│  📈 MÉTRIQUESWEB(via Analytics)                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ Visites    │ │ Ajouts     │ │ Achats     │ │ CA       ││
│  │    189     │ │     42     │ │     12     │ │ 1,050€   ││
│  │            │ │            │ │   6.3%     │ │          ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                             │
│  🎯 TAUXDECONVERSION                                      │
│  Email → Site:80.8%(189/234 clics)                      │
│  Site → Panier:22.2%(42/189 visites)                    │
│  Panier → Achat:28.6%(12/42 paniers)                    │
│  GLOBAL:6.3%(12 achats /189 visites)                   │
│                                                             │
│  💰 PERFORMANCES                                            │
│  Panier moyen :87.50€                                      │
│  Revenu par clic :4.49€                                    │
│  Revenu par ouverture :1.29€                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📋 DÉTAILS                                                 │
│                                                             │
│  Désabonnés :3(0.1%)                                     │
│  Plaintes spam :0                                          │
│  Bounces:15(0.5%)                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Technique

### Stack

```
Frontend:Next.js15(AppRouter)+React19+TypeScript
Backend:APIRoutesNext.js
Database:Supabase(PostgreSQL)
Email:Resend
Analytics:Table analytics_events existante(réutilisée)
UI:Shadcn/UI+TailwindCSS
State:ReactHooks(pas de Zustand pour newsletter)
```

### Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEURSITE(Frontend)                                │
│                                                             │
│  Footer → Formulaire inscription                           │
│           ↓                                                 │
│           POST/api/newsletter/subscribe                    │
│           ↓                                                 │
│           INSERTnewsletter_subscribers(pending)           │
│           ↓                                                 │
│           Email confirmation envoyé(Resend)                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEUREMAIL                                          │
│                                                             │
│  Clique sur lien confirmation                               │
│           ↓                                                 │
│           GET/newsletter/confirm?token=xxx                 │
│           ↓                                                 │
│           UPDATE status ='active'                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  ADMIN(Backend)                                            │
│                                                             │
│  Créer campagne → POST/api/admin/newsletter/campaigns     │
│                 → INSERTnewsletter_campaigns(draft)       │
│                                                             │
│  Envoyer campagne → POST.../campaigns/[id]/send           │
│                   → UPDATE status ='sending'               │
│                   → Boucle sur abonnés actifs               │
│                   → Pour chaque abonné:                     │
│                       -Générer email avec liens UTM        │
│                       -Envoyer via Resend                  │
│                       -INSERT newsletter_sends             │
│                   → UPDATE status ='sent'                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  RESENDWEBHOOKS                                            │
│                                                             │
│  POST/api/webhooks/resend                                  │
│                                                             │
│  Events: email.delivered, email.opened, email.clicked       │
│          ↓                                                  │
│          UPDATE newsletter_sends                            │
│          UPDATEnewsletter_campaigns(aggregate)            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  UTILISATEURCLIQUEDANSEMAIL                              │
│                                                             │
│  Visite site avec UTM params                                │
│           ↓                                                 │
│           AnalyticsTracker capture UTM                      │
│           ↓                                                 │
│           INSERTanalytics_events(pageview)                │
│           ↓                                                 │
│           Actions: add_to_cart, purchase                    │
│           ↓                                                 │
│           INSERTanalytics_events(avec utm_campaign)       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  ADMIN-STATSCAMPAGNE                                     │
│                                                             │
│  GET/api/admin/newsletter/campaigns/[id]/stats            │
│      ↓                                                      │
│      SELECTnewsletter_campaigns(métriques email)          │
│      +                                                      │
│      SELECT analytics_events WHERE utm_campaign = xxx       │
│      ↓                                                      │
│      Agrégation et retour JSON                              │
│      ↓                                                      │
│      Affichage dashboard                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Données

### Tables à Créer

#### 1. `newsletter_subscribers`

sql

```sql
CREATETABLE newsletter_subscribers (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),

-- Identité
  email TEXTUNIQUENOTNULL,
  first_name TEXT,
  last_name TEXT,

-- Statut
statusTEXTNOTNULLCHECK(statusIN('pending','active','unsubscribed','bounced','complained'))DEFAULT'pending',

-- Métriques (calculées via aggregation)
  total_opens INTDEFAULT0,
  total_clicks INTDEFAULT0,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,

-- E-commerce (jointure avec orders via user_id)
  user_id UUID REFERENCES auth.users(id),

-- RGPD
  consent_given_at TIMESTAMPTZ NOTNULLDEFAULTNOW(),
  consent_ip TEXT,
  consent_source TEXTDEFAULT'website_footer',
  unsubscribed_at TIMESTAMPTZ,

-- Métadonnées
  created_at TIMESTAMPTZ DEFAULTNOW(),
  updated_at TIMESTAMPTZ DEFAULTNOW()
);

-- Indexes
CREATEINDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATEINDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATEINDEX idx_newsletter_subscribers_user_id ON newsletter_subscribers(user_id);

-- Trigger pour updated_at
CREATETRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATEON newsletter_subscribers
FOR EACH ROW
EXECUTEFUNCTION update_updated_at_column();
```

#### 2. `newsletter_campaigns`

sql

```sql
CREATETABLE newsletter_campaigns (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),

-- Informations
  name TEXTNOTNULL,
  subject TEXTNOTNULL,
  preview_text TEXT,

-- Contenu (stocké en JSONB pour flexibilité)
  content JSONB NOTNULL,
/* Structure:
  {
    hero_image_url: "https://...",
    title: "NOUVELLE COLLECTION",
    subtitle: "Les essentiels de l'hiver",
    cta_text: "Découvrir",
    cta_link: "/products/hauts",
    products: [
      { id: "uuid-1", position: 1 },
      { id: "uuid-2", position: 2 },
      { id: "uuid-3", position: 3 },
      { id: "uuid-4", position: 4 }
    ]
  }
  */

-- Statut
statusTEXTNOTNULLCHECK(statusIN('draft','sending','sent','cancelled'))DEFAULT'draft',

-- Tracking
  utm_campaign TEXTUNIQUENOTNULL,

-- Dates
  sent_at TIMESTAMPTZ,

-- Métriques Email (mises à jour par webhooks)
  sent INTDEFAULT0,
  delivered INTDEFAULT0,
  bounced INTDEFAULT0,
  opened INTDEFAULT0,
  clicked INTDEFAULT0,
  unsubscribed INTDEFAULT0,
  complained INTDEFAULT0,

-- Métriques calculées
  open_rate NUMERIC(5,2) GENERATED ALWAYS AS(
CASE
WHEN delivered >0THEN(opened::NUMERIC/ delivered *100)
ELSE0
END
) STORED,

  click_rate NUMERIC(5,2) GENERATED ALWAYS AS(
CASE
WHEN delivered >0THEN(clicked::NUMERIC/ delivered *100)
ELSE0
END
) STORED,

-- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULTNOW(),
  updated_at TIMESTAMPTZ DEFAULTNOW()
);

-- Indexes
CREATEINDEX idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATEINDEX idx_newsletter_campaigns_utm_campaign ON newsletter_campaigns(utm_campaign);
CREATEINDEX idx_newsletter_campaigns_sent_at ON newsletter_campaigns(sent_at DESC);

-- Trigger pour updated_at
CREATETRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATEON newsletter_campaigns
FOR EACH ROW
EXECUTEFUNCTION update_updated_at_column();
```

#### 3. `newsletter_sends`

sql

```sql
CREATETABLE newsletter_sends (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  campaign_id UUID NOTNULLREFERENCES newsletter_campaigns(id)ONDELETECASCADE,
  subscriber_id UUID NOTNULLREFERENCES newsletter_subscribers(id)ONDELETECASCADE,

-- Resend tracking
  resend_email_id TEXT,-- ID retourné par Resend

-- Statut
statusTEXTNOTNULLCHECK(statusIN(
'pending','sent','delivered','bounced',
'opened','clicked','unsubscribed','complained'
))DEFAULT'pending',

-- Événements
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  first_clicked_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,

-- Compteurs
  opens_count INTDEFAULT0,
  clicks_count INTDEFAULT0,

-- Erreurs
  bounce_reason TEXT,
  complaint_reason TEXT,

  created_at TIMESTAMPTZ DEFAULTNOW(),

-- Contrainte unicité
UNIQUE(campaign_id, subscriber_id)
);

-- Indexes
CREATEINDEX idx_newsletter_sends_campaign_id ON newsletter_sends(campaign_id);
CREATEINDEX idx_newsletter_sends_subscriber_id ON newsletter_sends(subscriber_id);
CREATEINDEX idx_newsletter_sends_status ON newsletter_sends(status);
CREATEINDEX idx_newsletter_sends_resend_id ON newsletter_sends(resend_email_id);
```

#### 4. `newsletter_clicks`

sql

```sql
CREATETABLE newsletter_clicks (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  send_id UUID NOTNULLREFERENCES newsletter_sends(id)ONDELETECASCADE,

-- Détail du clic
  link_url TEXTNOTNULL,
  utm_content TEXT,-- hero-cta, product-grid-item-1, etc.

  clicked_at TIMESTAMPTZ DEFAULTNOW()
);

-- Indexes
CREATEINDEX idx_newsletter_clicks_send_id ON newsletter_clicks(send_id);
CREATEINDEX idx_newsletter_clicks_link_url ON newsletter_clicks(link_url);
```

### Vues SQL

#### Vue `newsletter_performance`

sql

```sql
CREATEVIEW newsletter_performance AS
SELECT
  nc.id,
  nc.name,
  nc.subject,
  nc.utm_campaign,
  nc.status,
  nc.sent_at,

-- Métriques Email
  nc.sent,
  nc.delivered,
  nc.opened,
  nc.clicked,
  nc.unsubscribed,
  nc.open_rate,
  nc.click_rate,

-- Métriques Web (depuis analytics_events)
COUNT(DISTINCTCASE
WHEN ae.event_type ='pageview'
THEN ae.session_id
END)AS web_sessions,

COUNT(CASE
WHEN ae.event_type ='pageview'
THEN1
END)AS web_pageviews,

COUNT(DISTINCTCASE
WHEN ae.event_type ='pageview'
AND ae.page_path LIKE'/product/%'
THEN ae.session_id
END)AS web_product_views,

COUNT(CASE
WHEN ae.event_type ='add_to_cart'
THEN1
END)AS web_add_to_cart,

COUNT(DISTINCTCASE
WHEN ae.event_type ='purchase'
THEN ae.order_id
END)AS web_purchases,

COALESCE(SUM(CASE
WHEN ae.event_type ='purchase'
THEN ae.revenue
END),0)AS web_revenue,

-- Taux de conversion web
CASE
WHENCOUNT(DISTINCTCASEWHEN ae.event_type ='pageview'THEN ae.session_id END)>0
THEN(COUNT(DISTINCTCASEWHEN ae.event_type ='purchase'THEN ae.order_id END)::NUMERIC
/COUNT(DISTINCTCASEWHEN ae.event_type ='pageview'THEN ae.session_id END)*100)
ELSE0
ENDAS web_conversion_rate,

-- Panier moyen
CASE
WHENCOUNT(DISTINCTCASEWHEN ae.event_type ='purchase'THEN ae.order_id END)>0
THEN(COALESCE(SUM(CASEWHEN ae.event_type ='purchase'THEN ae.revenue END),0)
/COUNT(DISTINCTCASEWHEN ae.event_type ='purchase'THEN ae.order_id END))
ELSE0
ENDAS web_avg_order_value

FROM newsletter_campaigns nc
LEFTJOIN analytics_events ae
ON ae.utm_campaign = nc.utm_campaign
AND ae.utm_source ='newsletter'
AND ae.utm_medium ='email'
AND ae.created_at >= nc.sent_at
AND ae.created_at <= nc.sent_at +INTERVAL'7 days'-- Fenêtre d'attribution 7 jours

GROUPBY nc.id
ORDERBY nc.sent_at DESC NULLS LAST;
```

### Row Level Security (RLS)

sql

```sql
-- Activer RLS sur toutes les tables
ALTERTABLE newsletter_subscribers ENABLEROWLEVEL SECURITY;
ALTERTABLE newsletter_campaigns ENABLEROWLEVEL SECURITY;
ALTERTABLE newsletter_sends ENABLEROWLEVEL SECURITY;
ALTERTABLE newsletter_clicks ENABLEROWLEVEL SECURITY;

-- Policy pour subscribers : Inserts publics (inscription), le reste admin
CREATE POLICY "Public can subscribe"
ON newsletter_subscribers
FORINSERT
TO anon, authenticated
WITHCHECK(true);

CREATE POLICY "Admins can manage subscribers"
ON newsletter_subscribers
FORALL
TO authenticated
USING(
EXISTS(
SELECT1FROM profiles
WHERE profiles.id = auth.uid()
AND profiles.role ='admin'
)
);

-- Policy pour campaigns : Admin uniquement
CREATE POLICY "Admins can manage campaigns"
ON newsletter_campaigns
FORALL
TO authenticated
USING(
EXISTS(
SELECT1FROM profiles
WHERE profiles.id = auth.uid()
AND profiles.role ='admin'
)
);

-- Policy pour sends : Admin uniquement
CREATE POLICY "Admins can view sends"
ON newsletter_sends
FORSELECT
TO authenticated
USING(
EXISTS(
SELECT1FROM profiles
WHERE profiles.id = auth.uid()
AND profiles.role ='admin'
)
);

-- Policy pour clicks : Admin uniquement
CREATE POLICY "Admins can view clicks"
ON newsletter_clicks
FORSELECT
TO authenticated
USING(
EXISTS(
SELECT1FROM profiles
WHERE profiles.id = auth.uid()
AND profiles.role ='admin'
)
);
```

### Fonction Helper pour `updated_at`

sql

```sql
-- Fonction pour mettre à jour automatiquement updated_at
CREATEORREPLACEFUNCTION update_updated_at_column()
RETURNSTRIGGERAS $$
BEGIN
  NEW.updated_at =NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔌 API Routes

### Structure des Endpoints

```
/api/
├── newsletter/# Public endpoints
│   ├── subscribe                      # POST - Inscription
│   └── confirm                        # GET  - Confirmation email
│
├── admin/newsletter/# Admin endpoints (protected)
│   ├── subscribers/
│   │   ├── route.ts                   # GET (list), POST (create manual)
│   │   └── [id]/
│   │       └── route.ts               # GET, PATCH, DELETE
│   │
│   ├── campaigns/
│   │   ├── route.ts                   # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts               # GET, PATCH, DELETE
│   │       ├── send/route.ts          # POST - Envoyer campagne
│   │       ├── test/route.ts          # POST - Email de test
│   │       └── stats/route.ts         # GET  - Stats complètes
│   │
│   └── products/
│       └── search/route.ts            # GET - Recherche produits
│
└── webhooks/
    └── resend/route.ts                # POST - Webhooks Resend
```

### Détail des Endpoints

#### 1. `POST /api/newsletter/subscribe`

**Public** - Inscription à la newsletter

typescript

```typescript
// Request
{
  email:"alice@example.com",
  first_name?:"Alice",
  last_name?:"Dupont"
}

// Response 200
{
  success:true,
  message:"Email de confirmation envoyé à alice@example.com"
}

// Response 400
{
  success:false,
  error:"Email invalide"
}

// Response 409
{
  success:false,
  error:"Cet email est déjà inscrit"
}
```

**Logique :**

1. Validation email (Zod)
2. Vérifier si email existe déjà
   - Si `status = 'unsubscribed'` → Réactiver + envoyer confirmation
   - Si `status = 'active'` → Erreur 409
3. Créer subscriber avec `status = 'pending'`
4. Générer token de confirmation (JWT ou UUID)
5. Envoyer email de confirmation via Resend
6. Retourner succès

#### 2. `GET /api/newsletter/confirm?token=xxx`

**Public** - Confirmation d'inscription

typescript

```typescript
// Response 200 (HTML ou redirect)
<html>
<body>
<h1>Merci!</h1>
<p>Votre inscription est confirmée.</p>
</body>
</html>

// Response 400
{
  success:false,
  error:"Token invalide ou expiré"
}
```

**Logique :**

1. Décoder token
2. Récupérer subscriber par ID
3. Vérifier token + expiration (24h)
4. UPDATE `status = 'active'`, `consent_given_at = NOW()`
5. Afficher page de confirmation

#### 3. `GET /api/admin/newsletter/subscribers`

**Admin** - Liste des abonnés

typescript

```typescript
// Query params
?status=active&search=alice&limit=50&offset=0

// Response 200
{
  success:true,
  data:{
    subscribers:[
{
        id:"uuid-1",
        email:"alice@example.com",
        first_name:"Alice",
        last_name:"Dupont",
        status:"active",
        total_opens:5,
        total_clicks:2,
        created_at:"2025-01-15T10:00:00Z"
},
// ...
],
    total:2847,
    limit:50,
    offset:0
}
}
```

**Logique :**

1. Vérifier auth admin
2. Construire query avec filtres
3. Pagination
4. Retourner liste + métadonnées

#### 4. `DELETE /api/admin/newsletter/subscribers/[id]`

**Admin** - Supprimer définitivement (RGPD)

typescript

```typescript
// Response 200
{
  success:true,
  message:"Abonné supprimé définitivement"
}
```

**Logique :**

1. Vérifier auth admin
2. DELETE subscriber (CASCADE sur sends, clicks)
3. Retourner succès

#### 5. `POST /api/admin/newsletter/campaigns`

**Admin** - Créer une campagne

typescript

```typescript
// Request
{
  name:"Collection Hiver 2025",
  subject:"❄️ Nouvelle Collection Hiver",
  preview_text:"Découvrez nos pièces essentielles pour l'hiver",
  content:{
    hero_image_url:"https://...",
    title:"NOUVELLE COLLECTION",
    subtitle:"Les essentiels de l'hiver",
    cta_text:"Découvrir",
    cta_link:"/products/hauts",
    products:[
{ id:"uuid-1", position:1},
{ id:"uuid-2", position:2},
{ id:"uuid-3", position:3},
{ id:"uuid-4", position:4}
]
}
}

// Response 201
{
  success:true,
  campaign:{
    id:"uuid-campaign",
    name:"Collection Hiver 2025",
    status:"draft",
    utm_campaign:"newsletter-2025-01-collection-hiver",
    created_at:"2025-01-15T14:30:00Z"
}
}
```

**Logique :**

1. Vérifier auth admin
2. Validation (Zod)
3. Générer `utm_campaign` unique (`newsletter-{YYYY-MM}-{slug(name)}`)
4. INSERT campaign avec `status = 'draft'`
5. Retourner campagne créée

#### 6. `POST /api/admin/newsletter/campaigns/[id]/test`

**Admin** - Envoyer email de test

typescript

```typescript
// Request
{
  test_email:"admin@example.com"
}

// Response 200
{
  success:true,
  message:"Email de test envoyé à admin@example.com"
}
```

**Logique :**

1. Vérifier auth admin
2. Récupérer campaign + content
3. Générer email HTML avec template
4. Remplacer variables ({{first_name}} → "Admin")
5. Envoyer via Resend
6. Retourner succès

#### 7. `POST /api/admin/newsletter/campaigns/[id]/send`

**Admin** - Envoyer la campagne

typescript

```typescript
// Request
{}// Pas de body, juste confirmation

// Response 200
{
  success:true,
  message:"Campagne en cours d'envoi",
  sent_count:2847
}
```

**Logique :**

1. Vérifier auth admin
2. Récupérer campaign
3. Vérifier status = 'draft'
4. UPDATE status = 'sending'
5. Récupérer tous les subscribers actifs
6. Boucle sur chaque subscriber :

typescript

```typescript
for (const subscriber of subscribers) {
  // Générer liens UTM personnalisés
  const links = generateNewsletterLinks(campaign, subscriber)

  // Générer HTML email
  const html = renderEmailTemplate(campaign.content, links, subscriber)

  // Envoyer via Resend
  const { id: resendEmailId } = await resend.emails.send({
    from: 'newsletter@blancherenaudin.com',
    to: subscriber.email,
    subject: campaign.subject,
    html: html,
  })

  // Créer newsletter_send
  await supabase.from('newsletter_sends').insert({
    campaign_id: campaign.id,
    subscriber_id: subscriber.id,
    resend_email_id: resendEmailId,
    status: 'sent',
    sent_at: newDate(),
  })
}
```

7. UPDATE campaign : `status = 'sent'`, `sent_at = NOW()`, `sent = count`
8. Retourner succès

#### 8. `GET /api/admin/newsletter/campaigns/[id]/stats`

**Admin** - Stats complètes d'une campagne

typescript

```typescript
// Response 200
{
  success:true,
  campaign:{
    id:"uuid-campaign",
    name:"Collection Hiver 2025",
    subject:"❄️ Nouvelle Collection Hiver",
    sent_at:"2025-01-15T10:00:00Z",

// Métriques Email
    email:{
      sent:2847,
      delivered:2832,
      bounced:15,
      opened:812,
      clicked:234,
      unsubscribed:3,
      open_rate:28.7,
      click_rate:8.3
},

// Métriques Web
    web:{
      sessions:189,
      pageviews:456,
      product_views:123,
      add_to_cart:42,
      purchases:12,
      revenue:1050.00,
      conversion_rate:6.3,
      avg_order_value:87.50
},

// Funnel
    funnel:[
{ step:"Ouvert", value:812, rate:100},
{ step:"Cliqué", value:234, rate:28.8},
{ step:"Visité", value:189, rate:80.8},
{ step:"Vu produit", value:123, rate:65.1},
{ step:"Ajouté panier", value:42, rate:34.1},
{ step:"Acheté", value:12, rate:28.6}
],

// Top liens cliqués (optionnel Phase 2)
// top_links: [...]
}
}
```

**Logique :**

1. Vérifier auth admin
2. Récupérer campaign depuis `newsletter_campaigns`
3. Récupérer métriques web depuis `analytics_events` :

sql

```sql
WHERE utm_campaign = campaign.utm_campaign
AND utm_source ='newsletter'
AND utm_medium ='email'
AND created_at >= campaign.sent_at
AND created_at <= campaign.sent_at +INTERVAL'7 days'
```

4. Agréger données
5. Calculer funnel
6. Retourner JSON

#### 9. `POST /api/webhooks/resend`

**Public** (avec validation signature) - Webhooks Resend

typescript

```typescript
// Request (exemple email.delivered)
{
  type:"email.delivered",
  created_at:"2025-01-15T10:05:23Z",
  data:{
    email_id:"resend-email-id-123",
    to:"alice@example.com"
}
}

// Response 200
{
  received:true
}
```

**Logique :**

1. Vérifier signature Resend (sécurité)
2. Récupérer `newsletter_send` via `resend_email_id`
3. Switch sur event type :

typescript

```typescript
switch(event.type){
case'email.delivered':
UPDATE newsletter_sends SET status ='delivered', delivered_at =NOW()
UPDATE newsletter_campaigns SET delivered = delivered +1
break

case'email.opened':
UPDATE newsletter_sends SET
         status ='opened',
         first_opened_at =NOW()(ifnull),
         last_opened_at =NOW(),
         opens_count = opens_count +1
UPDATE newsletter_campaigns SET opened =COUNT(DISTINCT send_id WHERE status >='opened')
UPDATE newsletter_subscribers SET total_opens = total_opens +1
break

case'email.clicked':
UPDATE newsletter_sends SET
         status ='clicked',
         first_clicked_at =NOW()(ifnull),
         last_clicked_at =NOW(),
         clicks_count = clicks_count +1
INSERTnewsletter_clicks(send_id, link_url)
UPDATE newsletter_campaigns SET clicked =COUNT(DISTINCT send_id WHERE status >='clicked')
UPDATE newsletter_subscribers SET total_clicks = total_clicks +1
break

case'email.bounced':
UPDATE newsletter_sends SET status ='bounced', bounce_reason = event.data.reason
UPDATE newsletter_campaigns SET bounced = bounced +1
UPDATE newsletter_subscribers SET status ='bounced'
break

case'email.complained':
UPDATE newsletter_sends SET status ='complained'
UPDATE newsletter_campaigns SET complained = complained +1
UPDATE newsletter_subscribers SET status ='complained'
break
}
```

4. Retourner 200 (important pour Resend)

#### 10. `GET /api/admin/newsletter/products/search`

**Admin** - Recherche produits pour sélection

typescript

```typescript
// Query params
?q=robe&limit=10

// Response 200
{
  success:true,
  products:[
{
      id:"uuid-1",
      name:"Robe Noire Asymétrique",
      price:89.00,
      image_url:"https://...",
      stock:12
},
// ...
]
}
```

**Logique :**

1. Vérifier auth admin
2. Query products :

sql

```sql
SELECT p.id, p.name, p.price, p.total_stock,
(SELECT image_url FROM product_images WHERE product_id = p.id ORDERBY sort_order LIMIT1)
FROM products p
WHERE p.status='active'
AND p.total_stock >0
AND p.name ILIKE'%{query}%'
LIMIT10
```

3. Retourner liste

---

## 🖥️ Interface Admin

### Structure des Pages

```
/admin/newsletter/
├── page.tsx                           # Liste des campagnes
├── subscribers/
│   └── page.tsx                       # Liste des abonnés
├── campaigns/
│   ├── new/page.tsx                   # Créer campagne
│   └── [id]/
│       ├── page.tsx                   # Éditer campagne
│       └── stats/page.tsx             # Stats campagne
```

### Navigation

Ajouter dans `components/admin/AdminNav.tsx` :

tsx

```tsx
// Ajouter dans le menu admin
const navigationItems = [
  // ... existant
  {
    name: 'Newsletter',
    icon: Mail,
    submenu: [
      { name: 'Campagnes', href: '/admin/newsletter' },
      { name: 'Abonnés', href: '/admin/newsletter/subscribers' },
    ],
  },
]
```

### Wireframes Textuels

#### Page : Liste des Campagnes

```
┌─────────────────────────────────────────────────────────────┐
│  NEWSLETTER>Campagnes                                     │
│                                          [+Nouvelle campagne]│
├─────────────────────────────────────────────────────────────┤
│  Rechercher...Statut:[Toutes ▼]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ❄️ CollectionHiver2025                           │    │
│  │ Envoyée le 15/01/2025 à 10:00                     │    │
│  │                                                    │    │
│  │ 📧 2,847 envoyés  •  28.7% ouverts  •  8.3% clics │    │
│  │ 💰 1,050€ de CA   •  12 achats                    │    │
│  │                                                    │    │
│  │ [Voir stats][Dupliquer]                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🎁 FlashSale-20%                                 │    │
│  │ Brouillon                                          │    │
│  │                                                    │    │
│  │ [Éditer][Envoyer][Supprimer]                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Page : Créer/Éditer Campagne

Déjà décrit dans la section "Périmètre Fonctionnel > Création de Campagnes"

#### Page : Stats Campagne

Déjà décrit dans la section "Périmètre Fonctionnel > Tracking & Analytics"

#### Page : Liste Abonnés

Déjà décrit dans la section "Périmètre Fonctionnel > Gestion des Abonnés"

---

## 📧 Templates Email

### Template React Jacquemus

tsx

```tsx
// lib/newsletter/templates/jacquemus.tsx

import{
Html,
Head,
Body,
Container,
Section,
Img,
Text,
Button,
Link,
Hr,
}from'@react-email/components'

interfaceJacquemusTemplateProps{
  campaign:{
    subject:string
    content:{
      hero_image_url:string
      title:string
      subtitle:string
      cta_text:string
      cta_link:string
      products:Array<{
        id:string
        name:string
        price:number
        image_url:string
        link:string
}>
}
}
  subscriber:{
    first_name?:string
}
  unsubscribeLink:string
}

exportfunctionJacquemusTemplate({
  campaign,
  subscriber,
  unsubscribeLink
}:JacquemusTemplateProps){
const{ content }= campaign

return(
<Html>
<Head>
<style>{`
          @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo+Narrow&display=swap');

          body {
            font-family: 'Archivo Narrow', sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
          }

          .title {
            font-family: 'Archivo Black', sans-serif;
            font-size: 48px;
            letter-spacing: 0.05em;
            text-align: center;
            margin: 40px 0 20px 0;
            text-transform: uppercase;
          }

          .subtitle {
            font-size: 18px;
            letter-spacing: 0.15em;
            text-align: center;
            color: #666;
            margin: 0 0 40px 0;
            text-transform: lowercase;
          }

          .cta {
            background-color: #000;
            color: #fff;
            padding: 16px 48px;
            text-decoration: none;
            font-size: 13px;
            letter-spacing: 0.15em;
            text-transform: lowercase;
            display: inline-block;
          }

          .product-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 40px 0;
          }

          .product-card {
            text-align: center;
          }

          .product-name {
            font-size: 13px;
            letter-spacing: 0.05em;
            margin: 12px 0 4px 0;
            text-transform: lowercase;
          }

          .product-price {
            font-size: 13px;
            color: #666;
          }

          .footer {
            text-align: center;
            font-size: 11px;
            color: #999;
            margin: 60px 0 40px 0;
          }
        `}</style>
</Head>

<Body>
<ContainerclassName="container">
{/* Logo */}
<Sectionstyle={{ textAlign:'center', padding:'40px 0 20px 0'}}>
<Img
src="https://blancherenaudin.com/logo-blancherenaudin.png"
width="180"
alt=".blancherenaudin"
/>
</Section>

{/* Hero */}
<Section>
<Img
src={content.hero_image_url}
width="600"
alt={content.title}
style={{ width:'100%', height:'auto'}}
/>
</Section>

{/* Titre */}
<TextclassName="title">{content.title}</Text>

{/* Sous-titre */}
<TextclassName="subtitle">{content.subtitle}</Text>

{/* CTA */}
<Sectionstyle={{ textAlign:'center', margin:'40px 0'}}>
<Button
href={content.cta_link}
className="cta"
>
{content.cta_text}
</Button>
</Section>

{/* Grille Produits */}
<SectionclassName="product-grid">
{content.products.map((product)=>(
<divkey={product.id}className="product-card">
<Linkhref={product.link}>
<Img
src={product.image_url}
width="280"
alt={product.name}
style={{ width:'100%', height:'auto'}}
/>
<TextclassName="product-name">{product.name}</Text>
<TextclassName="product-price">{product.price}€</Text>
</Link>
</div>
))}
</Section>

<Hrstyle={{ borderColor:'#eee', margin:'60px 0'}}/>

{/* Footer */}
<SectionclassName="footer">
<Text>
              Suivez-nous sur{' '}
<Linkhref="https://instagram.com/blancherenaudin">
                Instagram
</Link>
</Text>

<Textstyle={{ marginTop:'20px'}}>
              Vous recevez cet email car vous êtes inscrit(e) à notre newsletter.
</Text>

<Text>
<Linkhref={unsubscribeLink}>
                Se désabonner
</Link>
</Text>

<Textstyle={{ marginTop:'20px'}}>
              .blancherenaudin<br />
              Paris, France
</Text>
</Section>
</Container>
</Body>
</Html>
)
}
```

### Fonction de Rendu

typescript

```typescript
// lib/newsletter/render.ts

import{ render }from'@react-email/render'
import{JacquemusTemplate}from'./templates/jacquemus'
import{ generateNewsletterLinks }from'./tracking'

exportasyncfunctionrenderNewsletterEmail(
  campaign:NewsletterCampaign,
  subscriber:NewsletterSubscriber
):Promise<string>{
// Récupérer les produits complets depuis la DB
const productIds = campaign.content.products.map(p => p.id)
const{ data: products }=await supabase
.from('products')
.select('id, name, price, images:product_images(image_url)')
.in('id', productIds)

// Générer les liens UTM pour chaque produit
const productsWithLinks = products.map((product, index)=>({
    id: product.id,
    name: product.name,
    price: product.price,
    image_url: product.images[0]?.image_url,
    link:generateNewsletterLinks(
      campaign,
      subscriber,
`/product/${product.id}`,
`product-grid-item-${index +1}`
)
}))

// Générer lien de désabonnement
const unsubscribeLink =`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?token=${generateUnsubscribeToken(subscriber.id)}`

// Render template React → HTML
const html =render(
<JacquemusTemplate
      campaign={{
...campaign,
        content:{
...campaign.content,
          cta_link:generateNewsletterLinks(
            campaign,
            subscriber,
            campaign.content.cta_link,
'hero-cta'
),
          products: productsWithLinks
}
}}
      subscriber={subscriber}
      unsubscribeLink={unsubscribeLink}
/>
)

return html
}
```

### Fonction Génération Liens UTM

typescript

```typescript
// lib/newsletter/tracking.ts

exportfunctiongenerateNewsletterLinks(
  campaign:NewsletterCampaign,
  subscriber:NewsletterSubscriber,
  path:string,
  linkName?:string
):string{
const url =newURL(path, process.env.NEXT_PUBLIC_BASE_URL)

// UTM standards
  url.searchParams.set('utm_source','newsletter')
  url.searchParams.set('utm_medium','email')
  url.searchParams.set('utm_campaign', campaign.utm_campaign)

// Tracking détaillé
if(linkName){
    url.searchParams.set('utm_content', linkName)
}

// Identifiant abonné
  url.searchParams.set('subscriber', subscriber.id)

return url.toString()
}

// Exemple de résultat :
// https://blancherenaudin.com/product/uuid-robe?
//   utm_source=newsletter
//   &utm_medium=email
//   &utm_campaign=newsletter-2025-01-collection-hiver
//   &utm_content=product-grid-item-1
//   &subscriber=uuid-subscriber
```

---

## 📊 Tracking & Analytics

### Intégration avec `analytics_events`

Le système de tracking newsletter **réutilise intégralement** la table `analytics_events` existante. Aucune modification de cette table n'est nécessaire.

#### Flux de Tracking

```
1. Email envoyé avec liens UTM
         ↓
2. Utilisateur clique → Atterrit sur le site
         ↓
3. AnalyticsTracker.tsx (déjà en place) capture automatiquement :
   - Page visitée
   - UTM params (source, medium,
```

Réessayer

TR

Continuer

campaign, content)

- Session ID
  ↓

4. INSERT dans analytics_events avec utm_campaign = 'newsletter-2025-01-...'
   ↓
5. Actions utilisateur (add_to_cart, purchase) → Même utm_campaign préservé
   ↓
6. Attribution automatique des ventes à la campagne newsletter

````

#### Code de Tracking (déjà en place ✅)
```typescript
// lib/analytics.ts (EXISTANT - pas de modification)

export async function trackPageView(pagePath: string) {
  const searchParams = new URLSearchParams(window.location.search)

  const eventData = {
    event_type: 'pageview',
    page_path: pagePath,
    page_title: document.title,
    session_id: getOrCreateSessionId(),

    // 🔥 UTM automatiquement capturés
    utm_source: searchParams.get('utm_source'),      // 'newsletter'
    utm_medium: searchParams.get('utm_medium'),      // 'email'
    utm_campaign: searchParams.get('utm_campaign'),  // 'newsletter-2025-01-...'
    utm_content: searchParams.get('utm_content'),    // 'product-grid-item-1'

    // Device info, geo, etc. (déjà existant)
    ...getDeviceInfo(),

    properties: {
      subscriber_id: searchParams.get('subscriber')
    }
  }

  // Fire & Forget
  supabase.from('analytics_events').insert(eventData)
}
````

### Attribution des Ventes

```sql
-- Les ventes sont automatiquement attribuées via utm_campaign
SELECT
  o.order_number,
  o.total_amount,
  ae.utm_campaign,
  nc.name AS campaign_name
FROM orders o
JOIN analytics_events ae
  ON ae.session_id = o.session_id
  AND ae.event_type = 'purchase'
JOIN newsletter_campaigns nc
  ON nc.utm_campaign = ae.utm_campaign
WHERE ae.utm_source = 'newsletter'
  AND o.created_at >= nc.sent_at
  AND o.created_at <= nc.sent_at + INTERVAL '7 days'
```

### Fenêtre d'Attribution

**MVP : 7 jours**

- Un achat est attribué à la newsletter si effectué dans les 7 jours suivant l'envoi
- Configurable dans la vue `newsletter_performance`

**Phase 2+ : Personnalisable**

- Permettre de changer la fenêtre (1 jour, 7 jours, 14 jours, 30 jours)
- Attribution last-click (dernier canal avant achat)

---

## 🛠️ Guide d'Implémentation

### Étape 1 : Base de Données (4h)

#### 1.1 Créer le fichier de migration

```sql
-- supabase/migrations/20250119_newsletter.sql

-- Tables
CREATE TABLE newsletter_subscribers (...);
CREATE TABLE newsletter_campaigns (...);
CREATE TABLE newsletter_sends (...);
CREATE TABLE newsletter_clicks (...);

-- Indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
-- ... (tous les index décrits précédemment)

-- Vue newsletter_performance
CREATE VIEW newsletter_performance AS
SELECT ...
-- (vue complète décrite précédemment)

-- RLS Policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can subscribe" ON newsletter_subscribers ...
-- ... (toutes les policies décrites précédemment)

-- Fonction helper
CREATE OR REPLACE FUNCTION update_updated_at_column() ...
```

#### 1.2 Exécuter la migration

```bash
# Via Supabase CLI
supabase db push

# Ou manuellement dans Supabase Dashboard > SQL Editor
# Copier/coller le contenu du fichier SQL
```

#### 1.3 Vérifier les tables

```sql
-- Vérifier les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'newsletter%';

-- Doit retourner :
-- newsletter_subscribers
-- newsletter_campaigns
-- newsletter_sends
-- newsletter_clicks

-- Vérifier la vue
SELECT * FROM newsletter_performance LIMIT 1;
```

---

### Étape 2 : Configuration Resend (1h)

#### 2.1 Créer un compte Resend

1. Aller sur https://resend.com
2. Créer un compte
3. Vérifier le domaine `blancherenaudin.com` :
   - Ajouter les DNS records SPF, DKIM, DMARC
   - Attendre validation (24-48h max)

#### 2.2 Générer une API Key

```
Resend Dashboard > API Keys > Create API Key
→ Copier la clé : re_xxxxxxxxxxxx
```

#### 2.3 Ajouter dans `.env.local`

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx

# Webhook secret (généré par Resend)
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

#### 2.4 Configurer les webhooks

```
Resend Dashboard > Webhooks > Add Endpoint

URL: https://votredomaine.com/api/webhooks/resend
Events:
  ✅ email.sent
  ✅ email.delivered
  ✅ email.delivery_delayed
  ✅ email.bounced
  ✅ email.opened
  ✅ email.clicked
  ✅ email.complained

Secret: whsec_xxxxxxxxxxxx (auto-généré)
```

#### 2.5 Initialiser le client Resend

```typescript
// lib/newsletter/resend.ts

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
```

---

### Étape 3 : API Routes (8h)

#### 3.1 Endpoint Inscription

```typescript
// app/api/newsletter/subscribe/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/newsletter/resend'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Email invalide'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = subscribeSchema.parse(body)

    const supabase = await createClient()

    // Vérifier si email existe déjà
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', data.email)
      .single()

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà inscrit' },
          { status: 409 }
        )
      }

      // Réactiver si désabonné
      if (existing.status === 'unsubscribed') {
        await supabase
          .from('newsletter_subscribers')
          .update({ status: 'pending', unsubscribed_at: null })
          .eq('id', existing.id)
      }
    } else {
      // Créer nouvel abonné
      const { error } = await supabase.from('newsletter_subscribers').insert({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        status: 'pending',
        consent_ip: req.headers.get('x-forwarded-for') || req.ip,
        consent_source: 'website_footer',
      })

      if (error) throw error
    }

    // Envoyer email de confirmation
    const confirmToken = generateConfirmToken(data.email)
    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/confirm?token=${confirmToken}`

    await resend.emails.send({
      from: 'newsletter@blancherenaudin.com',
      to: data.email,
      subject: 'Confirmez votre inscription',
      html: `
        <p>Bonjour${data.first_name ? ` ${data.first_name}` : ''},</p>
        <p>Merci de votre intérêt pour .blancherenaudin !</p>
        <p>Pour confirmer votre inscription à notre newsletter, cliquez sur le lien ci-dessous :</p>
        <p><a href="${confirmUrl}">Confirmer mon inscription</a></p>
        <p>Ce lien est valide 24 heures.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Email de confirmation envoyé à ${data.email}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Subscribe error:', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}

function generateConfirmToken(email: string): string {
  // Simple JWT ou UUID avec expiration 24h
  const payload = {
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}
```

#### 3.2 Endpoint Confirmation

```typescript
// app/api/newsletter/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token manquant' },
      { status: 400 }
    )
  }

  try {
    // Décoder token
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))

    // Vérifier expiration
    if (payload.exp < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Token expiré' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Activer l'abonné
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'active',
        consent_given_at: new Date().toISOString(),
      })
      .eq('email', payload.email)
      .eq('status', 'pending')

    if (error) throw error

    // Rediriger vers page de confirmation
    return redirect('/newsletter/confirmed')
  } catch (error) {
    console.error('Confirm error:', error)
    return NextResponse.json(
      { success: false, error: 'Token invalide' },
      { status: 400 }
    )
  }
}
```

#### 3.3 Endpoint Création Campagne

```typescript
// app/api/admin/newsletter/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'
import slugify from 'slugify'

const campaignSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  subject: z.string().min(1, 'Objet requis'),
  preview_text: z.string().optional(),
  content: z.object({
    hero_image_url: z.string().url(),
    title: z.string(),
    subtitle: z.string(),
    cta_text: z.string(),
    cta_link: z.string(),
    products: z
      .array(
        z.object({
          id: z.string().uuid(),
          position: z.number(),
        })
      )
      .length(4, 'Exactement 4 produits requis'),
  }),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Vérifier auth admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = campaignSchema.parse(body)

    // Générer utm_campaign unique
    const now = new Date()
    const datePrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const slug = slugify(data.name, { lower: true, strict: true })
    const utmCampaign = `newsletter-${datePrefix}-${slug}`

    // Vérifier unicité
    const { data: existing } = await supabase
      .from('newsletter_campaigns')
      .select('id')
      .eq('utm_campaign', utmCampaign)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Une campagne avec ce nom existe déjà ce mois-ci' },
        { status: 409 }
      )
    }

    // Créer campagne
    const { data: campaign, error } = await supabase
      .from('newsletter_campaigns')
      .insert({
        name: data.name,
        subject: data.subject,
        preview_text: data.preview_text,
        content: data.content,
        utm_campaign: utmCampaign,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, campaign }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query params
  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Build query
  let query = supabase
    .from('newsletter_campaigns')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: campaigns, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: {
      campaigns,
      total: count,
      limit,
      offset,
    },
  })
}
```

#### 3.4 Endpoint Envoi Campagne

```typescript
// app/api/admin/newsletter/campaigns/[id]/send/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { renderNewsletterEmail } from '@/lib/newsletter/render'
import { resend } from '@/lib/newsletter/resend'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  // Auth check (admin)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const campaignId = params.id

    // Récupérer campagne
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    // Vérifier status
    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cette campagne a déjà été envoyée' },
        { status: 400 }
      )
    }

    // Passer en status "sending"
    await supabase
      .from('newsletter_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId)

    // Récupérer tous les abonnés actifs
    const { data: subscribers, error: subsError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active')

    if (subsError) throw subsError

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'Aucun abonné actif' }, { status: 400 })
    }

    console.log(`Sending campaign to ${subscribers.length} subscribers...`)

    // Boucle d'envoi
    let sentCount = 0

    for (const subscriber of subscribers) {
      try {
        // Générer HTML personnalisé
        const html = await renderNewsletterEmail(campaign, subscriber)

        // Envoyer via Resend
        const { data: emailData, error: emailError } = await resend.emails.send(
          {
            from: 'newsletter@blancherenaudin.com',
            to: subscriber.email,
            subject: campaign.subject,
            html: html,
            headers: {
              'X-Campaign-ID': campaign.id,
              'X-Subscriber-ID': subscriber.id,
            },
          }
        )

        if (emailError) throw emailError

        // Créer newsletter_send
        await supabase.from('newsletter_sends').insert({
          campaign_id: campaign.id,
          subscriber_id: subscriber.id,
          resend_email_id: emailData.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })

        sentCount++

        // Petit délai pour éviter rate limiting
        if (sentCount % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error)
        // Continue avec les autres abonnés
      }
    }

    // Finaliser campagne
    await supabase
      .from('newsletter_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent: sentCount,
      })
      .eq('id', campaignId)

    console.log(
      `Campaign sent to ${sentCount}/${subscribers.length} subscribers`
    )

    return NextResponse.json({
      success: true,
      message: 'Campagne envoyée avec succès',
      sent_count: sentCount,
      total_subscribers: subscribers.length,
    })
  } catch (error) {
    console.error('Send campaign error:', error)

    // Revenir à draft en cas d'erreur
    await supabase
      .from('newsletter_campaigns')
      .update({ status: 'draft' })
      .eq('id', params.id)

    return NextResponse.json(
      { error: "Erreur lors de l'envoi" },
      { status: 500 }
    )
  }
}
```

#### 3.5 Endpoint Stats Campagne

```typescript
// app/api/admin/newsletter/campaigns/[id]/stats/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const campaignId = params.id

    // Récupérer campagne
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campagne introuvable' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'sent') {
      return NextResponse.json({
        success: true,
        campaign: {
          ...campaign,
          email: null,
          web: null,
          funnel: null,
        },
      })
    }

    // Récupérer métriques web depuis analytics_events
    const attributionWindow = 7 // jours
    const windowEnd = new Date(campaign.sent_at)
    windowEnd.setDate(windowEnd.getDate() + attributionWindow)

    const { data: webEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('utm_campaign', campaign.utm_campaign)
      .eq('utm_source', 'newsletter')
      .eq('utm_medium', 'email')
      .gte('created_at', campaign.sent_at)
      .lte('created_at', windowEnd.toISOString())

    if (eventsError) throw eventsError

    // Calculer métriques web
    const uniqueSessions = new Set(webEvents?.map((e) => e.session_id) || [])
      .size

    const pageviews =
      webEvents?.filter((e) => e.event_type === 'pageview').length || 0

    const productViews =
      webEvents?.filter(
        (e) =>
          e.event_type === 'pageview' && e.page_path?.startsWith('/product/')
      ).length || 0

    const addToCarts =
      webEvents?.filter((e) => e.event_type === 'add_to_cart').length || 0

    const purchases =
      webEvents?.filter((e) => e.event_type === 'purchase').length || 0

    const revenue =
      webEvents
        ?.filter((e) => e.event_type === 'purchase')
        .reduce((sum, e) => sum + (e.revenue || 0), 0) || 0

    // Sessions uniques par étape du funnel
    const viewedProductSessions = new Set(
      webEvents
        ?.filter(
          (e) =>
            e.event_type === 'pageview' && e.page_path?.startsWith('/product/')
        )
        .map((e) => e.session_id) || []
    ).size

    const addToCartSessions = new Set(
      webEvents
        ?.filter((e) => e.event_type === 'add_to_cart')
        .map((e) => e.session_id) || []
    ).size

    // Retourner stats complètes
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        sent_at: campaign.sent_at,

        // Métriques Email
        email: {
          sent: campaign.sent,
          delivered: campaign.delivered,
          bounced: campaign.bounced,
          opened: campaign.opened,
          clicked: campaign.clicked,
          unsubscribed: campaign.unsubscribed,
          complained: campaign.complained,

          open_rate: campaign.open_rate,
          click_rate: campaign.click_rate,
          click_to_open_rate:
            campaign.opened > 0
              ? ((campaign.clicked / campaign.opened) * 100).toFixed(2)
              : 0,
        },

        // Métriques Web
        web: {
          sessions: uniqueSessions,
          pageviews: pageviews,
          product_views: productViews,
          add_to_cart: addToCarts,
          purchases: purchases,
          revenue: revenue.toFixed(2),

          conversion_rate:
            uniqueSessions > 0
              ? ((purchases / uniqueSessions) * 100).toFixed(2)
              : 0,

          avg_order_value: purchases > 0 ? (revenue / purchases).toFixed(2) : 0,
        },

        // Funnel
        funnel: {
          opened: campaign.opened,
          clicked: campaign.clicked,
          visited: uniqueSessions,
          viewed_product: viewedProductSessions,
          added_to_cart: addToCartSessions,
          purchased: purchases,
        },
      },
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    )
  }
}
```

#### 3.6 Webhook Resend

```typescript
// app/api/webhooks/resend/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'
import { Webhook } from 'svix'

export async function POST(req: NextRequest) {
  // Vérifier signature
  const payload = await req.text()
  const headers = {
    'svix-id': req.headers.get('svix-id') || '',
    'svix-timestamp': req.headers.get('svix-timestamp') || '',
    'svix-signature': req.headers.get('svix-signature') || '',
  }

  const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!)

  let event: any
  try {
    event = wh.verify(payload, headers)
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Resend webhook event:', event.type)

  const supabase = createClient()

  // Récupérer newsletter_send via resend_email_id
  const { data: send } = await supabase
    .from('newsletter_sends')
    .select('id, campaign_id, subscriber_id')
    .eq('resend_email_id', event.data.email_id)
    .single()

  if (!send) {
    console.warn('Send not found for email_id:', event.data.email_id)
    return NextResponse.json({ received: true })
  }

  // Traiter selon le type d'événement
  switch (event.type) {
    case 'email.delivered':
      await supabase
        .from('newsletter_sends')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', send.id)

      await supabase.rpc('increment', {
        table_name: 'newsletter_campaigns',
        column_name: 'delivered',
        row_id: send.campaign_id,
      })
      break

    case 'email.opened':
      const { data: currentSend } = await supabase
        .from('newsletter_sends')
        .select('first_opened_at, opens_count')
        .eq('id', send.id)
        .single()

      await supabase
        .from('newsletter_sends')
        .update({
          status: 'opened',
          first_opened_at:
            currentSend?.first_opened_at || new Date().toISOString(),
          last_opened_at: new Date().toISOString(),
          opens_count: (currentSend?.opens_count || 0) + 1,
        })
        .eq('id', send.id)

      // Update campaign (unique opens)
      if (!currentSend?.first_opened_at) {
        await supabase.rpc('increment', {
          table_name: 'newsletter_campaigns',
          column_name: 'opened',
          row_id: send.campaign_id,
        })
      }

      // Update subscriber
      await supabase.rpc('increment', {
        table_name: 'newsletter_subscribers',
        column_name: 'total_opens',
        row_id: send.subscriber_id,
      })
      await supabase
        .from('newsletter_subscribers')
        .update({ last_opened_at: new Date().toISOString() })
        .eq('id', send.subscriber_id)
      break

    case 'email.clicked':
      const { data: currentClickSend } = await supabase
        .from('newsletter_sends')
        .select('first_clicked_at, clicks_count')
        .eq('id', send.id)
        .single()

      await supabase
        .from('newsletter_sends')
        .update({
          status: 'clicked',
          first_clicked_at:
            currentClickSend?.first_clicked_at || new Date().toISOString(),
          last_clicked_at: new Date().toISOString(),
          clicks_count: (currentClickSend?.clicks_count || 0) + 1,
        })
        .eq('id', send.id)

      // Enregistrer le clic
      await supabase.from('newsletter_clicks').insert({
        send_id: send.id,
        link_url: event.data.link,
        clicked_at: new Date().toISOString(),
      })

      // Update campaign (unique clicks)
      if (!currentClickSend?.first_clicked_at) {
        await supabase.rpc('increment', {
          table_name: 'newsletter_campaigns',
          column_name: 'clicked',
          row_id: send.campaign_id,
        })
      }

      // Update subscriber
      await supabase.rpc('increment', {
        table_name: 'newsletter_subscribers',
        column_name: 'total_clicks',
        row_id: send.subscriber_id,
      })
      await supabase
        .from('newsletter_subscribers')
        .update({ last_clicked_at: new Date().toISOString() })
        .eq('id', send.subscriber_id)
      break

    case 'email.bounced':
      await supabase
        .from('newsletter_sends')
        .update({
          status: 'bounced',
          bounce_reason: event.data.reason,
        })
        .eq('id', send.id)

      await supabase.rpc('increment', {
        table_name: 'newsletter_campaigns',
        column_name: 'bounced',
        row_id: send.campaign_id,
      })

      // Marquer subscriber comme bounced
      await supabase
        .from('newsletter_subscribers')
        .update({ status: 'bounced' })
        .eq('id', send.subscriber_id)
      break

    case 'email.complained':
      await supabase
        .from('newsletter_sends')
        .update({ status: 'complained' })
        .eq('id', send.id)

      await supabase.rpc('increment', {
        table_name: 'newsletter_campaigns',
        column_name: 'complained',
        row_id: send.campaign_id,
      })

      await supabase
        .from('newsletter_subscribers')
        .update({ status: 'complained' })
        .eq('id', send.subscriber_id)
      break
  }

  return NextResponse.json({ received: true })
}

// Helper function increment (à créer en SQL)
// CREATE OR REPLACE FUNCTION increment(table_name text, column_name text, row_id uuid)
// RETURNS void AS $$
// BEGIN
//   EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
//   USING row_id;
// END;
// $$ LANGUAGE plpgsql;
```

---

### Étape 4 : Interface Admin (6h)

#### 4.1 Liste des Campagnes

```tsx
// app/admin/(protected)/newsletter/page.tsx

import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function NewsletterCampaignsPage() {
  const supabase = await createServerClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Récupérer campagnes
  const { data: campaigns } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campagnes Newsletter</h1>
        <Link href="/admin/newsletter/campaigns/new">
          <Button>+ Nouvelle campagne</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{campaign.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.subject}
                  </p>
                </div>
                <Badge
                  variant={
                    campaign.status === 'sent'
                      ? 'default'
                      : campaign.status === 'sending'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>

            {campaign.status === 'sent' && (
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Envoyés</p>
                    <p className="text-2xl font-bold">{campaign.sent}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taux d'ouverture</p>
                    <p className="text-2xl font-bold">{campaign.open_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taux de clic</p>
                    <p className="text-2xl font-bold">{campaign.click_rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Envoyé le</p>
                    <p className="font-medium">
                      {new Date(campaign.sent_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/newsletter/campaigns/${campaign.id}/stats`}
                  >
                    <Button variant="outline" size="sm">
                      Voir les stats
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}

            {campaign.status === 'draft' && (
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/admin/newsletter/campaigns/${campaign.id}`}>
                    <Button variant="outline" size="sm">
                      Éditer
                    </Button>
                  </Link>
                  <Button variant="default" size="sm">
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {!campaigns ||
        (campaigns.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Aucune campagne pour le moment
              </p>
              <Link href="/admin/newsletter/campaigns/new">
                <Button>Créer la première campagne</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
```

#### 4.2 Page Stats (déjà décrite dans la section Périmètre Fonctionnel)

---

### Étape 5 : Formulaire Inscription Frontend (4h)

```tsx
// components/newsletter/SubscribeForm.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Veuillez entrer votre email')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          'Email de confirmation envoyé ! Vérifiez votre boîte de réception.'
        )
        setEmail('')
      } else {
        toast.error(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="votre.email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Envoi...' : "S'inscrire"}
      </Button>
    </form>
  )
}
```

Intégrer dans le footer :

```tsx
// components/layout/FooterMinimal.tsx

import { SubscribeForm } from '@/components/newsletter/SubscribeForm'

export function FooterMinimal() {
  return (
    <footer>
      {/* ... contenu existant */}

      <div className="mt-12">
        <h3 className="text-sm font-bold mb-4">NEWSLETTER</h3>
        <p className="text-sm text-gray-600 mb-4">
          Recevez en exclusivité nos nouvelles collections et offres spéciales
        </p>
        <SubscribeForm />
        <p className="text-xs text-gray-500 mt-2">
          En vous abonnant, vous acceptez notre{' '}
          <a href="/privacy" className="underline">
            politique de confidentialité
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
```

---

### Étape 6 : Tests & Validation (6h)

#### 6.1 Tests Manuels

**Checklist :**

- [ ] Inscription newsletter (footer)
- [ ] Réception email de confirmation
- [ ] Clic sur lien de confirmation → Status `active`
- [ ] Créer campagne (admin)
- [ ] Envoyer email de test
- [ ] Envoyer campagne réelle (à 1-2 emails de test)
- [ ] Vérifier réception email
- [ ] Cliquer sur lien dans l'email → Atterrissage avec UTM
- [ ] Vérifier insertion dans `analytics_events`
- [ ] Ajouter un produit au panier
- [ ] Vérifier événement `add_to_cart` avec `utm_campaign`
- [ ] Compléter un achat
- [ ] Vérifier événement `purchase` avec `utm_campaign`
- [ ] Consulter page stats → Vérifier cohérence métriques
- [ ] Désabonner via lien → Status `unsubscribed`

#### 6.2 Tests Webhooks

```bash
# Installer Resend CLI pour tester webhooks en local
npm install -g resend-cli

# Démarrer tunnel
resend webhooks listen http://localhost:3000/api/webhooks/resend

# Envoyer un email de test via Resend
# → Observer les webhooks dans la console
```

---

## 📊 Tests & Validation

### Environnement de Test

```bash
# .env.local pour tests
RESEND_API_KEY=re_test_xxxxx  # Clé de test Resend
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Scénarios de Test

**Scénario 1 : Inscription complète**

1. Utilisateur entre email dans footer
2. Vérifie réception email confirmation
3. Clique sur lien → Redirection vers page confirmée
4. Admin vérifie subscriber `status = 'active'`

**Scénario 2 : Campagne complète**

1. Admin crée campagne
2. Envoie email de test → Vérifie réception
3. Envoie campagne finale
4. Vérifie métriques email (ouvertures, clics)
5. Clique dans email → Vérifie UTM params
6. Achète un produit
7. Vérifie attribution dans stats

**Scénario 3 : RGPD**

1. Inscription → Vérifie log `consent_given_at`
2. Désabonnement → Vérifie `unsubscribed_at`
3. Suppression → Vérifie cascade delete

---

## 🚀 Phases Ultérieures

### Phase 2 : Optimisations & Features Avancées (3-4 semaines)

#### Segmentation

- Tags manuels sur abonnés (VIP, Prospect, etc.)
- Segments dynamiques (clients actifs, paniers > 100€, etc.)
- Filtres avancés lors de l'envoi

#### Automatisations

- Email de bienvenue (trigger: confirmation)
- Panier abandonné (trigger: add_to_cart + no purchase 24h)
- Réactivation (trigger: no visit 60 days)
- Retour en stock (trigger: product restocked)

#### Planification

- Envoi différé (date/heure future)
- Envoi récurrent (hebdomadaire, mensuel)
- Envoi progressif (batches pour éviter spam)

#### Analytics Avancés

- Dashboard global multi-campagnes
- Heatmap des clics (visualisation liens cliqués)
- Funnel de conversion animé
- Comparaison cross-canal (Newsletter vs Instagram vs Google)

#### Templates

- Bibliothèque de 3-5 templates
- Personnalisation visuelle (couleurs, fonts)
- Variables dynamiques avancées (dernière consultation, recommandations AI)

---

### Phase 3 : Professionnalisation (2-3 semaines)

#### Tests A/B

- Tester 2 objets d'email
- Tester 2 CTA différents
- Winner automatique (meilleur taux d'ouverture/clic)

#### Import/Export

- Import CSV massif d'abonnés
- Export des stats en CSV/Excel
- Export liste abonnés filtrée

#### Centre de Préférences

- Fréquence d'envoi (quotidien, hebdo, mensuel)
- Types de contenus (nouveautés, promos, lookbooks)
- Mise à jour profil (nom, prénom)

#### Éditeur Avancé

- Drag & drop de blocs (Hero, Produits, Texte, CTA, etc.)
- Preview desktop/mobile en temps réel
- Enregistrement de templates custom

---

### Phase 4+ : Intelligence & Scale (optionnel)

#### Personnalisation AI

- Recommandations produits basées sur historique
- Envoi au meilleur moment (per-subscriber send time optimization)
- Génération automatique d'objet A/B

#### Multi-canal

- SMS newsletters (Twilio)
- Push notifications web
- In-app messaging

#### Intégrations

- Zapier (sync avec CRM)
- Google Sheets (export auto)
- Slack (notifications admin)

---

## 📚 Annexes

### Ressources Externes

- **Resend Documentation** : https://resend.com/docs
- **React Email** : https://react.email
- **Supabase RLS** : https://supabase.com/docs/guides/auth/row-level-security

### Support

Pour toute question sur cette implémentation :

1. Consulter cette documentation
2. Vérifier les logs console navigateur
3. Vérifier les logs Supabase (Dashboard > Logs)
4. Vérifier les logs Resend (Dashboard > Emails)

---

## ✅ Checklist de Mise en Production

**Avant le lancement :**

- [ ] Migration SQL exécutée sur Supabase production
- [ ] Variables d'environnement configurées (production)
- [ ] Domaine vérifié sur Resend
- [ ] Webhooks Resend configurés (URL production)
- [ ] DKIM/SPF/DMARC configurés (DNS)
- [ ] Email "from" autorisé (`newsletter@blancherenaudin.com`)
- [ ] Tests complets en staging
- [ ] Page de désabonnement fonctionnelle
- [ ] Page de confirmation fonctionnelle
- [ ] Politique de confidentialité mise à jour (mention newsletter)
- [ ] Formulaire footer visible sur toutes les pages
- [ ] Navigation admin mise à jour (lien Newsletter)
- [ ] Première campagne de test envoyée avec succès
- [ ] Stats affichées correctement
- [ ] Attribution des ventes vérifiée

---

## 🎉 Conclusion

Ce MVP Newsletter Phase 1 vous permettra de :

✅ **Collecter des abonnés** de manière RGPD-compliant
✅ **Créer et envoyer des campagnes** professionnelles
✅ **Tracker précisément le ROI** grâce à l'intégration analytics
✅ **Mesurer l'impact sur les ventes** avec attribution automatique
✅ **Avoir une base solide** pour les automatisations futures

**Temps estimé total : 50h (1-2 semaines)**

**Une fois le MVP validé, les Phases 2 et 3 apporteront :**

- Automatisations (panier abandonné, bienvenue, etc.)
- Segmentation avancée
- Dashboard multi-campagnes
- Tests A/B
- Et bien plus !

---

**Document généré le 19 Octobre 2025**
**Version 1.0.0 - MVP Phase 1**
**Prêt pour implémentation** 🚀

```

```
