# 🚀 Configuration Stripe pour la production

## Étape 1 : Activer le compte

### 1.1 Compléter le profil entreprise

Dans **Settings > Business settings** :

- [ ] **Type d'entreprise**
  - Entreprise individuelle (auto-entrepreneur)
  - SARL / EURL / SAS
  - Association
  - Autre
- [ ] **Informations légales**
  - Nom légal de l'entreprise
  - Numéro SIRET (France)
  - Adresse du siège social
  - Secteur d'activité
- [ ] **Représentant légal**
  - Nom et prénom
  - Date de naissance
  - Adresse personnelle
  - Numéro de téléphone

### 1.2 Vérification d'identité (KYC)

Stripe va demander :

- [ ] **Document d'identité**
  - Carte d'identité (recto-verso)
  - OU Passeport
  - OU Permis de conduire
- [ ] **Justificatif de domicile** (< 3 mois)
  - Facture électricité / gaz / eau
  - OU Avis d'imposition
  - OU Attestation d'hébergement
- [ ] **Document entreprise** (selon le type)
  - Kbis (pour les sociétés)
  - OU Extrait INSEE (auto-entrepreneur)
  - OU Statuts de l'association

**Délai de validation** : 24-48h en général

---

## Étape 2 : Configurer le compte bancaire

### 2.1 Ajouter les coordonnées bancaires

Dans **Settings > Bank accounts and scheduling** :

- [ ] **IBAN** (compte bancaire français)
  - Format : FR76 XXXX XXXX XXXX XXXX XXXX XXX
  - Doit être au nom de l'entreprise (pas personnel si société)
- [ ] **Devise du compte**
  - EUR pour la France
  - Autres devises disponibles selon pays

### 2.2 Vérification du compte bancaire

Stripe va effectuer **2 micro-virements** (quelques centimes) :

1. Tu reçois 2 petits virements (ex: 0,12€ et 0,35€)
2. Tu dois confirmer les montants dans le dashboard Stripe
3. Une fois confirmé, le compte est validé

**Délai** : 2-3 jours ouvrés pour recevoir les virements

---

## Étape 3 : Configurer les versements

### 3.1 Calendrier de paiement

Dans **Settings > Bank accounts and scheduling** :

**Fréquence des versements** :

- [ ] Quotidien (recommandé pour e-commerce)
- [ ] Hebdomadaire
- [ ] Mensuel

**Délai de versement** :

- Par défaut : J+2 (l'argent arrive 2 jours après la vente)
- Peut être J+7 au début (période de surveillance)

**Exemple** :

```
Client paie le lundi 10 → Tu reçois l'argent le mercredi 12
```

### 3.2 Minimum de versement

- Par défaut : pas de minimum
- Tu peux fixer un seuil (ex: ne verser que si > 100€)

---

## Étape 4 : Frais Stripe

### Tarification standard Europe

**Par transaction réussie** :

- 1,5% + 0,25€ par carte européenne
- 2,5% + 0,25€ par carte non-européenne
- 3,25% + 0,25€ par carte étrangère hors Europe

**Exemples** :

```
Vente de 100€ → Frais = 1,75€ → Tu reçois 98,25€
Vente de 50€  → Frais = 1,00€ → Tu reçois 49,00€
Vente de 200€ → Frais = 3,25€ → Tu reçois 196,75€
```

**Pas de frais** :

- ❌ Pas d'abonnement mensuel
- ❌ Pas de frais d'installation
- ❌ Pas de frais cachés
- ❌ Pas de frais sur les remboursements

**Remboursements** :

- Les frais Stripe ne sont PAS remboursés
- Exemple : vente 100€ (frais 1,75€) puis remboursement → tu perds 1,75€

---

## Étape 5 : Obligations légales (France)

### 5.1 Mentions légales sur le site

Tu dois afficher :

- [ ] CGV (Conditions Générales de Vente)
- [ ] Politique de confidentialité
- [ ] Mentions légales
- [ ] Droit de rétractation (14 jours pour e-commerce)

### 5.2 Déclaration fiscale

- [ ] **TVA** : si soumis (au-dessus du seuil auto-entrepreneur)
- [ ] **Déclaration revenus** : les paiements Stripe comptent comme CA
- [ ] **Comptabilité** : exporter les transactions Stripe régulièrement

### 5.3 Paiements Stripe dans la compta

Stripe fournit :

- Factures mensuelles (pour les frais)
- Export CSV de toutes les transactions
- Intégration comptable (QuickBooks, Pennylane, etc.)

---

## Étape 6 : Sécurité et conformité

### 6.1 Activation 3D Secure (SCA)

**Obligatoire en Europe depuis 2021** :

- [ ] Activé par défaut sur Stripe

- Authentification forte pour paiements > 30€
- Réduit drastiquement les fraudes

### 6.2 Radar (anti-fraude Stripe)

**Inclus gratuitement** :

- Bloque automatiquement les transactions suspectes
- Machine learning basé sur des millions de transactions
- Réduction des rétrofacturations (chargebacks)

### 6.3 Certificat PCI DSS

**Automatique avec Stripe** :

- Stripe est certifié PCI Level 1
- Tu n'as RIEN à faire
- Les données bancaires ne passent jamais par ton serveur

---

## Étape 7 : Passer en mode LIVE

### 7.1 Checklist finale avant activation

- [ ] Compte bancaire vérifié
- [ ] Documents validés par Stripe
- [ ] CGV/Mentions légales en ligne
- [ ] Tests en mode TEST réussis
- [ ] Webhook configuré en production
- [ ] Variables d'env LIVE configurées sur Vercel/Netlify

### 7.2 Basculer en mode LIVE

Dans le dashboard Stripe :

1. Toggle "View test data" → OFF
2. Récupérer les clés LIVE (`pk_live_...` et `sk_live_...`)
3. Les mettre dans les variables d'env de production
4. Déployer

**⚠️ ATTENTION** :

- En LIVE, les vraies cartes sont débitées
- Les erreurs coûtent de l'argent (remboursements, etc.)
- Teste TOUT en mode test avant !

---

## Timeline réaliste

```
Jour 1  : Créer compte Stripe + remplir infos
Jour 2  : Upload documents d'identité
Jour 3-4: Validation Stripe (attendre)
Jour 5  : Ajouter compte bancaire
Jour 7-8: Recevoir micro-virements
Jour 9  : Confirmer montants
Jour 10 : ✅ Compte validé, prêt pour LIVE
```

**Total : ~10 jours** pour avoir un compte opérationnel

---

## Aide et support

### Si tu as des questions

- **Chat Stripe** : [support@stripe.com](mailto:support@stripe.com) (réponse en 24h)
- **Documentation** : [https://stripe.com/docs](https://stripe.com/docs)
- **Forum** : [https://support.stripe.com](https://support.stripe.com)

### Documents utiles

- Guide d'activation : [https://stripe.com/docs/account/activation](https://stripe.com/docs/account/activation)
- Tarification France : [https://stripe.com/fr/pricing](https://stripe.com/fr/pricing)
- Obligations légales : [https://stripe.com/fr/legal](https://stripe.com/fr/legal)
