# Guide de développement - Fonctionnalités images manquantes

// src/components/admin/Breadcrumb.tsx
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type BreadcrumbItem = {
  label: string
  href: string
  icon?: string
}

type Props = {
  productName?: string
  productId?: string
}

export function Breadcrumb({ productName, productId }: Props = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', href: '/admin', icon: '🏠' }
    ]

    // Parse pathname
    const segments = pathname.split('/').filter(Boolean)

    // Remove 'admin' depuis les segments car déjà dans items
    const adminIndex = segments.indexOf('admin')
    if (adminIndex !== -1) {
      segments.splice(adminIndex, 1)
    }

    // Construire les breadcrumbs
    let currentPath = '/admin'

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const prevSegment = i > 0 ? segments[i - 1] : null
      currentPath +=`/${segment}`

    // Logique de labeling intelligente
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      let icon: string | undefined

    // Cas spéciaux
      if (segment === 'products') {
        label = 'Produits'
        icon = '📦'
      } else if (segment === 'media') {
        label = 'Médias'
        icon = '🖼️'
        // Si on a un product_id dans les params, ajouter le contexte produit
        const prodId = searchParams.get('product_id')
        if (prodId && productName) {
          // Insérer le breadcrumb produit avant média
          items.push({
            label: 'Produits',
            href: '/admin/products',
            icon: '📦'
          })
          items.push({
            label: productName,
            href:`/admin/products/${prodId}`,
          })
        }
      } else if (segment === 'new') {
        label = 'Nouveau'
        icon = '➕'
      } else if (segment === 'orders') {
        label = 'Commandes'
        icon = '🛒'
      } else if (segment === 'customers') {
        label = 'Clients'
        icon = '👥'
      } else if (segment === 'settings') {
        label = 'Paramètres'
        icon = '⚙️'
      } else if (segment.match(/^[0-9a-f-]{36}$/i)) {
        // UUID - afficher le nom du produit si disponible
        if (prevSegment === 'products' && productName) {
          label = productName
        } else {
          label = 'Détail'
        }
      }

    items.push({ label, href: currentPath, icon })
    }

    return items
  }, [pathname, searchParams, productName])

  // Ne rien afficher si on est sur la page d'accueil admin
  if (breadcrumbs.length <= 1) return null

  return (
    `<nav 
      aria-label="Fil d'Ariane" 
      className="mb-6 text-sm"
    >`
      `<ol className="flex items-center gap-2 flex-wrap">`
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

    return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                `<span className="text-gray-400 dark:text-gray-600 select-none">`
                  /
              
              )}

    {isLast ? (`<span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">`
                  {item.icon && `<span className="text-base">`{item.icon}}
                  `<span className="max-w-[200px] truncate" title={item.label}>`
                    {item.label}

    ) : (`<Link                   href={item.href}                   className="text-violet hover:underline transition-colors flex items-center gap-1.5"                 >`
                  {item.icon && `<span className="text-base">`{item.icon}}
                  `<span className="max-w-[150px] truncate" title={item.label}>`
                    {item.label}

    `</Link>`
              )}
            `</li>`
          )
        })}
      `</ol>`
    `</nav>`
  )
}

**Projet:** .blancherenaudin

**Date:** 03/10/2025

**Auteur:** Assistant technique

**Priorité:** Moyenne à élevée selon la fonctionnalité

---

## 📋 Vue d'ensemble

Ce document détaille l'implémentation des 6 fonctionnalités manquantes du système de gestion d'images. Chaque section contient l'architecture, le code, et les étapes d'intégration.

---

## 1. Éditeur visuel (crop/rotate) ⭐⭐⭐

**Impact:** Élevé | **Effort:** Moyen | **Priorité:** 1

### Architecture

```
┌─────────────────────────────────────────────┐
│ MediaGridClient.tsx                         │
│  └─ Bouton "Éditer" sur chaque image       │
│      └─ Ouvre <ImageEditorModal>           │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ ImageEditorModal.tsx                        │
│  ├─ react-easy-crop pour le crop           │
│  ├─ Boutons rotation 90°/180°/270°         │
│  ├─ Ratios prédéfinis (1:1, 4:5, 16:9)     │
│  └─ Sauvegarde → API                        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ /api/admin/product-images/edit              │
│  ├─ Récupère l'original depuis bucket      │
│  ├─ Applique crop + rotate avec Sharp      │
│  ├─ Sauvegarde dans storage_master          │
│  ├─ Régénère toutes les variantes          │
│  └─ Met à jour la DB                        │
└─────────────────────────────────────────────┘
```

### Installation

bash

```bash
npminstall react-easy-crop
```

### Code : Composant Modal

typescript

```typescript
// src/components/admin/ImageEditorModal.tsx
'use client'

import{ useState, useCallback }from'react'
importCropperfrom'react-easy-crop'
importtype{Area}from'react-easy-crop'

typeProps={
  imageId:string
  productId:string
  originalUrl:string
onClose:()=>void
onSave:()=>void
}

constASPECT_RATIOS={
  free:{ value:0, label:'Libre'},
  square:{ value:1, label:'1:1 (Carré)'},
  portrait:{ value:4/5, label:'4:5 (Portrait)'},
  landscape:{ value:16/9, label:'16:9 (Paysage)'},
}

exportfunctionImageEditorModal({
  imageId,
  productId,
  originalUrl,
  onClose,
  onSave,
}:Props){
const[crop, setCrop]=useState({ x:0, y:0})
const[zoom, setZoom]=useState(1)
const[rotation, setRotation]=useState(0)
const[aspect, setAspect]=useState<number>(ASPECT_RATIOS.free.value)
const[croppedAreaPixels, setCroppedAreaPixels]=useState<Area|null>(null)
const[saving, setSaving]=useState(false)

const onCropComplete =useCallback(
(_:Area, croppedAreaPixels:Area)=>{
setCroppedAreaPixels(croppedAreaPixels)
},
[]
)

asyncfunctionhandleSave(){
if(!croppedAreaPixels)return

setSaving(true)
try{
const res =awaitfetch('/api/admin/product-images/edit',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          imageId,
          productId,
          crop: croppedAreaPixels,
          rotation,
}),
})

if(!res.ok)thrownewError(await res.text())

onSave()
onClose()
}catch(err:any){
alert(err.message||'Erreur lors de la sauvegarde')
}finally{
setSaving(false)
}
}

return(
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
<div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
{/* Header */}
<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
<h2 className="text-xl font-semibold">Éditer l'image</h2>
<button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
>
            ✕
</button>
</div>

{/* Crop area */}
<div className="relative flex-1 bg-gray-900">
<Cropper
            image={originalUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect ||undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
/>
</div>

{/* Controls */}
<div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
{/* Aspect ratio */}
<div className="flex gap-2 flex-wrap">
<span className="text-sm font-medium self-center">Ratio:</span>
{Object.entries(ASPECT_RATIOS).map(([key,{ value, label }])=>(
<button
                key={key}
                onClick={()=>setAspect(value)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  aspect === value
?'bg-violet text-white border-violet'
:'border-gray-300 dark:border-gray-600 hover:border-violet'
}`}
>
{label}
</button>
))}
</div>

{/* Rotation */}
<div className="flex gap-2 items-center">
<span className="text-sm font-medium">Rotation:</span>
<button
              onClick={()=>setRotation((r)=> r +90)}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-violet"
>
90°
</button>
<button
              onClick={()=>setRotation((r)=> r +180)}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-violet"
>
180°
</button>
<button
              onClick={()=>setRotation(0)}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-violet"
>
Réinitialiser
</button>
<span className="text-sm text-gray-500">({rotation}°)</span>
</div>

{/* Zoom */}
<div className="flex gap-2 items-center">
<span className="text-sm font-medium">Zoom:</span>
<input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e)=>setZoom(Number(e.target.value))}
              className="flex-1"
/>
<span className="text-sm text-gray-500">{zoom.toFixed(1)}x</span>
</div>

{/* Actions */}
<div className="flex gap-2 justify-end pt-2">
<button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
>
Annuler
</button>
<button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 disabled:opacity-50"
>
{saving ?'Enregistrement...':'Enregistrer'}
</button>
</div>
</div>
</div>
</div>
)
}
```

### Code : Route API

typescript

```typescript
// src/app/api/admin/product-images/edit/route.ts
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
importsharpfrom'sharp'

exportasyncfunctionPOST(req:Request){
const{ imageId, productId, crop, rotation }=await req.json()

if(!imageId ||!productId ||!crop){
returnNextResponse.json(
{ error:'Paramètres manquants'},
{ status:400}
)
}

// 1. Récupérer l'image originale
const{ data: img, error: imgErr }=await supabaseAdmin
.from('product_images')
.select('storage_original')
.eq('id', imageId)
.single()

if(imgErr ||!img?.storage_original){
returnNextResponse.json({ error:'Image non trouvée'},{ status:404})
}

// 2. Télécharger l'original depuis le bucket
const{ data: fileData, error: downloadErr }=await supabaseAdmin.storage
.from('product-images')
.download(img.storage_original)

if(downloadErr ||!fileData){
returnNextResponse.json(
{ error:'Téléchargement échoué'},
{ status:500}
)
}

const buffer =Buffer.from(await fileData.arrayBuffer())

// 3. Appliquer crop + rotation avec Sharp
const{ x, y, width, height }= crop
let processed =sharp(buffer)

// Rotation d'abord
if(rotation && rotation !==0){
    processed = processed.rotate(rotation)
}

// Puis crop
  processed = processed.extract({
    left:Math.round(x),
    top:Math.round(y),
    width:Math.round(width),
    height:Math.round(height),
})

const editedBuffer =await processed.toBuffer()

// 4. Sauvegarder dans storage_master
const masterPath =`products/${productId}/master/${imageId}.jpg`
const{ error: uploadErr }=await supabaseAdmin.storage
.from('product-images')
.upload(masterPath, editedBuffer,{
      contentType:'image/jpeg',
      upsert:true,
})

if(uploadErr){
returnNextResponse.json(
{ error: uploadErr.message},
{ status:500}
)
}

// 5. Mettre à jour la DB
const{ error: updateErr }=await supabaseAdmin
.from('product_images')
.update({ storage_master: masterPath })
.eq('id', imageId)

if(updateErr){
returnNextResponse.json(
{ error: updateErr.message},
{ status:500}
)
}

// 6. Régénérer les variantes (utiliser storage_master au lieu de original)
awaitgenerateVariants(productId, imageId, editedBuffer)

returnNextResponse.json({ ok:true})
}

// Réutiliser la fonction de génération de variantes de upload/route.ts
asyncfunctiongenerateVariants(
  productId:string,
  imageId:string,
  buffer:Buffer
){
// (Copier la fonction du fichier upload/route.ts)
}
```

### Intégration dans MediaGridClient

typescript

```typescript
// src/app/admin/media/MediaGridClient.tsx
import{ImageEditorModal}from'@/components/admin/ImageEditorModal'

exportfunctionMediaGridClient({ productId }:Props){
const[editingImage, setEditingImage]=useState<{
    id:string
    url:string
}|null>(null)

// ... reste du code ...

return(
<div className="space-y-6">
{/* ... code existant ... */}

{/* Dans la liste des images, ajouter un bouton Éditer */}
<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{images.map((img, i)=>(
<li key={img.id} className="...">
{/* ... code existant ... */}

<div className="space-y-2">
{/* Nouveau bouton Éditer */}
<button
                type="button"
                onClick={async()=>{
// Récupérer une URL signée pour l'éditeur
const res =awaitfetch(
`/api/admin/product-images/${img.id}/signed-url?variant=original`
)
const{ signedUrl }=await res.json()
setEditingImage({ id: img.id, url: signedUrl })
}}
                disabled={loading}
                className="w-full px-3 py-1.5 border border-violet text-violet rounded text-sm hover:bg-violet hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
                ✂️ Éditer
</button>

{/* ... autres boutons ... */}
</div>
</li>
))}
</ul>

{/* Modal d'édition */}
{editingImage && productId &&(
<ImageEditorModal
          imageId={editingImage.id}
          productId={productId}
          originalUrl={editingImage.url}
          onClose={()=>setEditingImage(null)}
          onSave={()=>{
setEditingImage(null)
refresh()
}}
/>
)}
</div>
)
}
```

---

## 2. Prévisualisation avant upload ⭐⭐

**Impact:** Moyen | **Effort:** Faible | **Priorité:** 4

### Code : Ajout dans MediaGridClient

typescript

```typescript
// src/app/admin/media/MediaGridClient.tsx

exportfunctionMediaGridClient({ productId }:Props){
const[files, setFiles]=useState<FileList|null>(null)
const[previews, setPreviews]=useState<string[]>([])// ✅ Nouveau

// Générer les previews quand les fichiers changent
useEffect(()=>{
if(!files || files.length===0){
setPreviews([])
return
}

const urls =Array.from(files).map((f)=>URL.createObjectURL(f))
setPreviews(urls)

// Cleanup
return()=> urls.forEach((url)=>URL.revokeObjectURL(url))
},[files])

return(
<div className="space-y-6">
{/* ... code existant ... */}

<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
<h3 className="font-medium mb-3">Importer des images</h3>

<div className="space-y-3">
{/* Input file */}
<label className="block">
<span className="sr-only">Choisir des fichiers</span>
<input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e)=>setFiles(e.target.files)}
              disabled={!productId || loading}
              className="..."
/>
</label>

{/* ✅ Prévisualisations */}
{previews.length>0&&(
<div className="space-y-2">
<div className="text-sm font-medium">
Aperçu({previews.length} image{previews.length>1?'s':''})
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
{previews.map((url, i)=>(
<div
                    key={i}
                    className="relative aspect-square rounded overflow-hidden border border-gray-200 dark:border-gray-700"
>
<img
                      src={url}
                      alt={`Aperçu ${i +1}`}
                      className="w-full h-full object-cover"
/>
<button
                      type="button"
                      onClick={()=>{
// Retirer ce fichier
const dt =newDataTransfer()
Array.from(files!).forEach((f, idx)=>{
if(idx !== i) dt.items.add(f)
})
setFiles(dt.files.length>0? dt.files:null)
}}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
>
                      ✕
</button>
</div>
))}
</div>
</div>
)}

{/* Bouton d'import */}
<button
            type="button"
            onClick={onUpload}
            disabled={!productId ||!files || loading}
            className="..."
>
{loading ?'Import en cours...':'Importer les images'}
</button>
</div>
</div>
</div>
)
}
```

---

## 3. Gestion par lot (bulk actions) ⭐⭐

**Impact:** Moyen | **Effort:** Moyen | **Priorité:** 5

### Architecture

typescript

```typescript
// État de sélection multiple
const[selectedIds, setSelectedIds]=useState<Set<string>>(newSet())

// Actions groupées
-Supprimer(DELETE multiple)
-Modifier l'alt en masse
-Exporter
-Télécharger en ZIP
```

### Code : Sélection multiple

typescript

```typescript
// src/app/admin/media/MediaGridClient.tsx

exportfunctionMediaGridClient({ productId }:Props){
const[selectedIds, setSelectedIds]=useState<Set<string>>(newSet())

functiontoggleSelection(id:string){
setSelectedIds((prev)=>{
const next =newSet(prev)
if(next.has(id)){
        next.delete(id)
}else{
        next.add(id)
}
return next
})
}

functionselectAll(){
setSelectedIds(newSet(images.map((img)=> img.id)))
}

functionclearSelection(){
setSelectedIds(newSet())
}

asyncfunctionbulkDelete(){
if(!confirm(`Supprimer ${selectedIds.size} image(s) ?`))return

setLoading(true)
try{
awaitPromise.all(
Array.from(selectedIds).map((id)=>
fetch(`/api/admin/product-images/${id}`,{ method:'DELETE'})
)
)
setSuccess(`${selectedIds.size} image(s) supprimée(s)`)
clearSelection()
awaitrefresh()
}catch(err:any){
setError(err.message)
}finally{
setLoading(false)
}
}

asyncfunctionbulkUpdateAlt(){
const newAlt =prompt('Nouveau texte alternatif pour toutes les images :')
if(!newAlt)return

setLoading(true)
try{
awaitPromise.all(
Array.from(selectedIds).map((id)=>
fetch(`/api/admin/product-images/${id}/alt`,{
            method:'PATCH',
            headers:{'content-type':'application/json'},
            body:JSON.stringify({ alt: newAlt }),
})
)
)
setSuccess(`${selectedIds.size} alt text mis à jour`)
clearSelection()
awaitrefresh()
}catch(err:any){
setError(err.message)
}finally{
setLoading(false)
}
}

return(
<div className="space-y-6">
{/* Barre d'actions groupées */}
{selectedIds.size>0&&(
<div className="bg-violet/10 border border-violet/20 rounded-lg p-4 flex items-center justify-between">
<div className="text-sm font-medium">
{selectedIds.size} image{selectedIds.size>1?'s':''}{' '}
            sélectionnée{selectedIds.size>1?'s':''}
</div>
<div className="flex gap-2">
<button
              onClick={bulkUpdateAlt}
              disabled={loading}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
>
Modifier alt
</button>
<button
              onClick={bulkDelete}
              disabled={loading}
              className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-600 hover:text-white"
>
Supprimer
</button>
<button
              onClick={clearSelection}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:underline"
>
Annuler
</button>
</div>
</div>
)}

{/* Actions rapides */}
{images.length>0&&(
<div className="flex gap-2 text-sm">
<button
            onClick={selectAll}
            className="text-violet hover:underline"
>
Tout sélectionner
</button>
{selectedIds.size>0&&(
<button
              onClick={clearSelection}
              className="text-gray-600 dark:text-gray-400 hover:underline"
>
Tout désélectionner
</button>
)}
</div>
)}

{/* Liste des images avec checkboxes */}
<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{images.map((img, i)=>(
<li
            key={img.id}
            className={`border rounded-lg p-3 space-y-3 transition-colors ${
              selectedIds.has(img.id)
?'border-violet bg-violet/5'
:'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
}`}
>
{/* Checkbox de sélection */}
<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
<label className="inline-flex items-center gap-2 cursor-pointer">
<input
                  type="checkbox"
                  checked={selectedIds.has(img.id)}
                  onChange={()=>toggleSelection(img.id)}
                  className="rounded border-gray-300 text-violet focus:ring-violet"
/>
<span>#{i +1}</span>
</label>
{img.is_primary&&(
<span className="px-2 py-0.5 bg-violet/10 text-violet rounded font-medium">
                  ★ Principale
</span>
)}
</div>

{/* ... reste du code existant ... */}
</li>
))}
</ul>
</div>
)
}
```

---

## 4. Historique des modifications ⭐

**Impact:** Faible | **Effort:** Moyen | **Priorité:** 7

### Schema DB

sql

```sql
-- Nouvelle table image_history
CREATETABLE image_history (
  id UUID PRIMARYKEYDEFAULT gen_random_uuid(),
  image_id UUID NOTNULLREFERENCES product_images(id)ONDELETECASCADE,
actionTEXTNOTNULL,-- 'upload', 'edit', 'delete', 'reorder', 'set_primary'
  user_id UUID NOTNULLREFERENCES profiles(id),
  metadata JSONB,-- Détails de l'action
  created_at TIMESTAMPTZ DEFAULTNOW()
);

CREATEINDEX idx_image_history_image ON image_history(image_id);
CREATEINDEX idx_image_history_created ON image_history(created_at DESC);
```

### Code : Helper pour logger

typescript

```typescript
// src/lib/imageHistory.ts
import{ supabaseAdmin }from'./supabase-admin'

exportasyncfunctionlogImageAction(
  imageId:string,
  action:string,
  userId:string,
  metadata?:any
){
await supabaseAdmin.from('image_history').insert({
    image_id: imageId,
    action,
    user_id: userId,
    metadata: metadata ||{},
})
}
```

### Code : Composant d'historique

typescript

```typescript
// src/components/admin/ImageHistory.tsx
'use client'

import{ useEffect, useState }from'react'

typeHistoryEntry={
  id:string
  action:string
  created_at:string
  metadata:any
  user:{ name:string; email:string}
}

exportfunctionImageHistory({ imageId }:{ imageId:string}){
const[history, setHistory]=useState<HistoryEntry[]>([])
const[loading, setLoading]=useState(true)

useEffect(()=>{
fetch(`/api/admin/product-images/${imageId}/history`)
.then((r)=> r.json())
.then((data)=>setHistory(data.history||[]))
.finally(()=>setLoading(false))
},[imageId])

if(loading)return<div className="text-sm text-gray-500">Chargement...</div>

return(
<div className="space-y-2">
<h4 className="text-sm font-medium">Historique</h4>
{history.length===0?(
<p className="text-sm text-gray-500 italic">Aucun historique</p>
):(
<ul className="space-y-2">
{history.map((entry)=>(
<li
              key={entry.id}
              className="text-sm border-l-2 border-gray-300 dark:border-gray-600 pl-3"
>
<div className="font-medium">{getActionLabel(entry.action)}</div>
<div className="text-gray-500 text-xs">
{newDate(entry.created_at).toLocaleString('fr-FR')} •{' '}
{entry.user.name}
</div>
</li>
))}
</ul>
)}
</div>
)
}

functiongetActionLabel(action:string):string{
const labels:Record<string,string>={
    upload:'📤 Image importée',
    edit:'✂️ Image éditée',
delete:'🗑️ Image supprimée',
    reorder:'↕️ Ordre modifié',
    set_primary:'⭐ Définie principale',
    update_alt:'✏️ Alt text modifié',
}
return labels[action]|| action
}
```

### Route API

typescript

```typescript
// src/app/api/admin/product-images/[imageId]/history/route.ts
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'

exportasyncfunctionGET(
  _req:Request,
{ params }:{ params:Promise<{ imageId:string}>}
){
const{ imageId }=await params

const{ data, error }=await supabaseAdmin
.from('image_history')
.select(
`
      *,
      user:profiles!user_id(name, email)
`
)
.eq('image_id', imageId)
.order('created_at',{ ascending:false})

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

returnNextResponse.json({ history: data })
}
```

---

## 5. Watermark automatique ⭐

**Impact:** Faible | **Effort:** Moyen | **Priorité:** 8

### Code : Ajout watermark avec Sharp

typescript

```typescript
// src/lib/watermark.ts
importsharpfrom'sharp'
importpathfrom'path'

/**
 * Ajoute un watermark à une image
 */
exportasyncfunctionaddWatermark(
  imageBuffer:Buffer,
  watermarkPath:string='./public/watermark.png',
  opacity:number=0.3
):Promise<Buffer>{
// Lire le watermark
const watermark =awaitsharp(watermarkPath)
.resize(200)// Taille du logo
.png()
.toBuffer()

// Obtenir les dimensions de l'image
const{ width, height }=awaitsharp(imageBuffer).metadata()

// Position du watermark (coin bas-droit avec marge)
const x =(width ||0)-220
const y =(height ||0)-80

// Appliquer le watermark
returnsharp(imageBuffer)
.composite([
{
        input: watermark,
        top: y,
        left: x,
        blend:'over',// ou 'multiply' pour effet plus subtil
},
])
.toBuffer()
}
```

### Intégration dans l'upload

typescript

```typescript
// src/app/api/admin/product-images/upload/route.ts
import{ addWatermark }from'@/lib/watermark'

exportasyncfunctionPOST(req:Request){
// ... code existant ...

for(const file of files){
let buffer =Buffer.from(await file.arrayBuffer())

// ✅ Ajouter le watermark si activé
const addWatermarkFlag = form.get('addWatermark')==='true'
if(addWatermarkFlag){
      buffer =awaitaddWatermark(buffer)
}

// ... suite du code upload ...
}
}
```

Réessayer

TR

Continuer

Modifier

# Guide de développement - Fonctionnalités images manquantes (suite)

---

## 6. Compression paramétrable ⭐⭐

**Impact:** Moyen | **Effort:** Faible | **Priorité:** 6

### Architecture

```
┌─────────────────────────────────────────────┐
│ MediaGridClient.tsx                         │
│  └─ Toggle "Paramètres de compression"     │
│      └─ Sliders pour qualité par format    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ /api/admin/product-images/upload            │
│  ├─ Reçoit les paramètres de qualité       │
│  ├─ Sharp génère avec qualités custom      │
│  └─ Sauvegarde dans le bucket               │
└─────────────────────────────────────────────┘
```

### Code : Composant de réglages

typescript

```typescript
// src/components/admin/CompressionSettings.tsx
'use client'

import{ useState }from'react'

typeCompressionPreset={
  avif:number
  webp:number
  jpeg:number
}

constPRESETS:Record<string,CompressionPreset>={
  max_quality:{ avif:80, webp:90, jpeg:95},
  balanced:{ avif:50, webp:78, jpeg:85},
  max_compression:{ avif:30, webp:60, jpeg:70},
}

typeProps={
  value:CompressionPreset
onChange:(settings:CompressionPreset)=>void
}

exportfunctionCompressionSettings({ value, onChange }:Props){
const[expanded, setExpanded]=useState(false)

functionapplyPreset(preset:keyoftypeofPRESETS){
onChange(PRESETS[preset])
}

return(
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
<button
        type="button"
        onClick={()=>setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-medium"
>
<span>⚙️ Paramètres de compression</span>
<span className="text-gray-500">{expanded ?'▼':'▶'}</span>
</button>

{expanded &&(
<div className="mt-4 space-y-4">
{/* Presets rapides */}
<div className="space-y-2">
<label className="text-xs font-medium text-gray-600 dark:text-gray-400">
Préréglages
</label>
<div className="flex gap-2 flex-wrap">
<button
                type="button"
                onClick={()=>applyPreset('max_quality')}
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded hover:border-violet transition-colors"
>
                🎨 Qualité maximale
</button>
<button
                type="button"
                onClick={()=>applyPreset('balanced')}
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded hover:border-violet transition-colors"
>
                ⚖️ Équilibré(défaut)
</button>
<button
                type="button"
                onClick={()=>applyPreset('max_compression')}
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded hover:border-violet transition-colors"
>
                🗜️ Compression max
</button>
</div>
</div>

{/* Réglages manuels */}
<div className="space-y-3">
{/* AVIF */}
<div className="space-y-1">
<div className="flex items-center justify-between text-xs">
<label className="font-medium">AVIF</label>
<span className="text-gray-500">{value.avif}%</span>
</div>
<input
                type="range"
                min="10"
                max="100"
                step="5"
                value={value.avif}
                onChange={(e)=>
onChange({...value, avif:Number(e.target.value)})
}
                className="w-full"
/>
<div className="text-xs text-gray-500">
Format le plus moderne, meilleure compression
</div>
</div>

{/* WebP */}
<div className="space-y-1">
<div className="flex items-center justify-between text-xs">
<label className="font-medium">WebP</label>
<span className="text-gray-500">{value.webp}%</span>
</div>
<input
                type="range"
                min="10"
                max="100"
                step="5"
                value={value.webp}
                onChange={(e)=>
onChange({...value, webp:Number(e.target.value)})
}
                className="w-full"
/>
<div className="text-xs text-gray-500">
Bon équilibre qualité/poids, compatible moderne
</div>
</div>

{/* JPEG */}
<div className="space-y-1">
<div className="flex items-center justify-between text-xs">
<label className="font-medium">JPEG</label>
<span className="text-gray-500">{value.jpeg}%</span>
</div>
<input
                type="range"
                min="10"
                max="100"
                step="5"
                value={value.jpeg}
                onChange={(e)=>
onChange({...value, jpeg:Number(e.target.value)})
}
                className="w-full"
/>
<div className="text-xs text-gray-500">
Fallback pour anciens navigateurs
</div>
</div>
</div>

{/* Estimation de taille */}
<div className="pt-3 border-t border-gray-200 dark:border-gray-700">
<div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
<div className="flex justify-between">
<span>Tailleestimée(2000x2000px):</span>
</div>
<div className="flex justify-between">
<span>• AVIF:</span>
<span className="font-mono">
~{Math.round((200*(100- value.avif))/100)}KB
</span>
</div>
<div className="flex justify-between">
<span>• WebP:</span>
<span className="font-mono">
~{Math.round((350*(100- value.webp))/100)}KB
</span>
</div>
<div className="flex justify-between">
<span>• JPEG:</span>
<span className="font-mono">
~{Math.round((500*(100- value.jpeg))/100)}KB
</span>
</div>
</div>
</div>
</div>
)}
</div>
)
}
```

### Intégration dans MediaGridClient

typescript

```typescript
// src/app/admin/media/MediaGridClient.tsx
import{CompressionSettings}from'@/components/admin/CompressionSettings'

exportfunctionMediaGridClient({ productId }:Props){
const[compressionSettings, setCompressionSettings]=useState({
    avif:50,
    webp:78,
    jpeg:85,
})

asyncfunctiononUpload(e?:React.MouseEvent<HTMLButtonElement>){
    e?.preventDefault()
if(!productId ||!files ||!files.length)return

setLoading(true)
setError(null)
setSuccess(null)

try{
const fd =newFormData()
Array.from(files).forEach((f)=> fd.append('files', f))
      fd.append('productId', productId)

// ✅ Ajouter les paramètres de compression
      fd.append('compressionSettings',JSON.stringify(compressionSettings))

const res =awaitfetch('/api/admin/product-images/upload',{
        method:'POST',
        body: fd,
})

if(!res.ok){
const msg =await res.text()
thrownewError(msg ||`Upload échoué (${res.status})`)
}

const data =await res.json()
const successCount = data.results?.filter((r:any)=> r.ok).length??0

setSuccess(`${successCount} image(s) importée(s) avec succès`)
setFiles(null)
awaitrefresh()
}catch(err:any){
setError(err?.message ??"Erreur lors de l'upload")
}finally{
setLoading(false)
}
}

return(
<div className="space-y-6">
{/* ... messages ... */}

{/* Upload */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
<h3 className="font-medium mb-3">Importer des images</h3>

<div className="space-y-3">
{/* Input file */}
<label className="block">
<span className="sr-only">Choisir des fichiers</span>
<input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e)=>setFiles(e.target.files)}
              disabled={!productId || loading}
              className="..."
/>
</label>

{/* ✅ Paramètres de compression */}
<CompressionSettings
            value={compressionSettings}
            onChange={setCompressionSettings}
/>

{/* Aperçu des fichiers */}
{files && files.length>0&&(
<div className="text-sm text-gray-600 dark:text-gray-400">
              📎 {files.length} fichier{files.length>1?'s':''} sélectionné
{files.length>1?'s':''}
</div>
)}

{/* Bouton d'import */}
<button
            type="button"
            onClick={onUpload}
            disabled={!productId ||!files || loading}
            className="..."
>
{loading ?'Import en cours...':'Importer les images'}
</button>
</div>
</div>

{/* ... reste du code ... */}
</div>
)
}
```

### Mise à jour de la route API

typescript

```typescript
// src/app/api/admin/product-images/upload/route.ts
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ getOriginalPath, inferExtFromMime }from'@/lib/images'
import{ randomUUID }from'crypto'
importsharpfrom'sharp'

// ✅ Types pour les paramètres de compression
typeCompressionSettings={
  avif:number
  webp:number
  jpeg:number
}

constDEFAULT_COMPRESSION:CompressionSettings={
  avif:50,
  webp:78,
  jpeg:85,
}

exportasyncfunctionPOST(req:Request){
const form =await req.formData()
const productId =String(form.get('productId')||'')
const files = form.getAll('files')asFile[]

// ✅ Récupérer les paramètres de compression
const compressionSettingsRaw = form.get('compressionSettings')
let compressionSettings:CompressionSettings=DEFAULT_COMPRESSION

if(compressionSettingsRaw){
try{
      compressionSettings =JSON.parse(String(compressionSettingsRaw))
}catch{
// Utiliser les valeurs par défaut en cas d'erreur
}
}

if(!productId || files.length===0){
returnNextResponse.json(
{ error:'productId et files requis'},
{ status:400}
)
}

const{ data: existing }=await supabaseAdmin
.from('product_images')
.select('id')
.eq('product_id', productId)
.eq('is_primary',true)
.limit(1)

const results:any[]=[]

for(let index =0; index < files.length; index++){
const file = files[index]
const arrayBuf =await file.arrayBuffer()
const buffer =Buffer.from(arrayBuf)
const ext =inferExtFromMime(file.type).replace('jpeg','jpg')
const imageId =randomUUID()

let width:number|null=null
let height:number|null=null
try{
const meta =awaitsharp(buffer).metadata()
      width = meta.width??null
      height = meta.height??null
}catch{}

const path =getOriginalPath(productId, imageId, ext)

const{ error: upErr }=await supabaseAdmin.storage
.from('product-images')
.upload(path, buffer,{ contentType: file.type, upsert:false})

if(upErr){
      results.push({ ok:false, error: upErr.message})
continue
}

const{ data: inserted, error: dbErr }=await supabaseAdmin
.from('product_images')
.insert({
        id: imageId,
        product_id: productId,
        storage_original: path,
        alt:null,
        is_primary:!existing || existing.length===0,
        sort_order: index,
        width,
        height,
})
.select('id')

if(dbErr){
      results.push({ ok:false, error: dbErr.message})
continue
}

// ✅ Générer les variantes avec les paramètres custom
const variantsResult =awaitgenerateVariants(
      productId,
      imageId,
      buffer,
      compressionSettings
)

    results.push({
      ok:true,
      id: imageId,
      variants: variantsResult,
})
}

returnNextResponse.json({ results })
}

/**
 * ✅ Génère les variantes avec paramètres de compression
 */
asyncfunctiongenerateVariants(
  productId:string,
  imageId:string,
  buffer:Buffer,
  compression:CompressionSettings
){
constSIZES={
    xl:2048,
    lg:1280,
    md:768,
    sm:384,
}

const results =[]

for(const[sizeKey, maxSize]ofObject.entries(SIZES)){
// AVIF
try{
const avifBuffer =awaitsharp(buffer)
.resize(maxSize, maxSize,{ fit:'inside', withoutEnlargement:true})
.avif({ quality: compression.avif})// ✅ Qualité custom
.toBuffer()

const avifPath =`products/${productId}/${sizeKey}/${imageId}.avif`
await supabaseAdmin.storage
.from('product-images')
.upload(avifPath, avifBuffer,{
          contentType:'image/avif',
          upsert:true,
})
      results.push({ size: sizeKey, format:'avif', ok:true})
}catch(err:any){
      results.push({
        size: sizeKey,
        format:'avif',
        ok:false,
        error: err.message,
})
}

// WebP
try{
const webpBuffer =awaitsharp(buffer)
.resize(maxSize, maxSize,{ fit:'inside', withoutEnlargement:true})
.webp({ quality: compression.webp})// ✅ Qualité custom
.toBuffer()

const webpPath =`products/${productId}/${sizeKey}/${imageId}.webp`
await supabaseAdmin.storage
.from('product-images')
.upload(webpPath, webpBuffer,{
          contentType:'image/webp',
          upsert:true,
})
      results.push({ size: sizeKey, format:'webp', ok:true})
}catch(err:any){
      results.push({
        size: sizeKey,
        format:'webp',
        ok:false,
        error: err.message,
})
}

// JPEG
try{
const jpgBuffer =awaitsharp(buffer)
.resize(maxSize, maxSize,{ fit:'inside', withoutEnlargement:true})
.jpeg({ quality: compression.jpeg})// ✅ Qualité custom
.toBuffer()

const jpgPath =`products/${productId}/${sizeKey}/${imageId}.jpg`
await supabaseAdmin.storage
.from('product-images')
.upload(jpgPath, jpgBuffer,{
          contentType:'image/jpeg',
          upsert:true,
})
      results.push({ size: sizeKey, format:'jpg', ok:true})
}catch(err:any){
      results.push({
        size: sizeKey,
        format:'jpg',
        ok:false,
        error: err.message,
})
}
}

return results
}
```

---

## 📊 Fonctionnalités bonus

### 7. Export/Download ZIP

typescript

```typescript
// src/app/api/admin/product-images/export/route.ts
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
importarchiverfrom'archiver'
import{Readable}from'stream'

exportasyncfunctionPOST(req:Request){
const{ imageIds }=await req.json()

if(!Array.isArray(imageIds)|| imageIds.length===0){
returnNextResponse.json(
{ error:'imageIds requis'},
{ status:400}
)
}

// Créer un ZIP stream
const archive =archiver('zip',{ zlib:{ level:9}})
const chunks:Buffer[]=[]

  archive.on('data',(chunk)=> chunks.push(chunk))

// Récupérer toutes les images
const{ data: images }=await supabaseAdmin
.from('product_images')
.select('*')
.in('id', imageIds)

if(!images || images.length===0){
returnNextResponse.json({ error:'Images non trouvées'},{ status:404})
}

// Ajouter chaque image au ZIP
for(const img of images){
if(!img.storage_original)continue

const{ data: fileData }=await supabaseAdmin.storage
.from('product-images')
.download(img.storage_original)

if(fileData){
const buffer =Buffer.from(await fileData.arrayBuffer())
const filename = img.storage_original.split('/').pop()||'image.jpg'
      archive.append(buffer,{ name: filename })
}
}

await archive.finalize()
const zipBuffer =Buffer.concat(chunks)

returnnewNextResponse(zipBuffer,{
    headers:{
'Content-Type':'application/zip',
'Content-Disposition':`attachment; filename="images-${Date.now()}.zip"`,
},
})
}
```

### 8. Import depuis URL

typescript

```typescript
// src/components/admin/ImportFromUrl.tsx
'use client'

import{ useState }from'react'

typeProps={
  productId:string
onSuccess:()=>void
}

exportfunctionImportFromUrl({ productId, onSuccess }:Props){
const[url, setUrl]=useState('')
const[loading, setLoading]=useState(false)
const[error, setError]=useState<string|null>(null)

asyncfunctionhandleImport(){
if(!url)return

setLoading(true)
setError(null)

try{
const res =awaitfetch('/api/admin/product-images/import-url',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({ productId, url }),
})

if(!res.ok)thrownewError(await res.text())

setUrl('')
onSuccess()
}catch(err:any){
setError(err.message||'Erreur lors de l\'import')
}finally{
setLoading(false)
}
}

return(
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
<h3 className="font-medium mb-3">Importer depuis une URL</h3>

{error &&(
<div className="mb-3 text-sm text-red-600 dark:text-red-400">
          ❌ {error}
</div>
)}

<div className="flex gap-2">
<input
          type="url"
          value={url}
          onChange={(e)=>setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={loading}
          className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-sm"
/>
<button
          onClick={handleImport}
          disabled={!url || loading}
          className="px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
>
{loading ?'Import...':'Importer'}
</button>
</div>
</div>
)
}
```

typescript

```typescript
// src/app/api/admin/product-images/import-url/route.ts
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ randomUUID }from'crypto'
importsharpfrom'sharp'

exportasyncfunctionPOST(req:Request){
const{ productId, url }=await req.json()

if(!productId ||!url){
returnNextResponse.json(
{ error:'productId et url requis'},
{ status:400}
)
}

try{
// Télécharger l'image depuis l'URL
const response =awaitfetch(url)
if(!response.ok)thrownewError('Téléchargement échoué')

const arrayBuffer =await response.arrayBuffer()
const buffer =Buffer.from(arrayBuffer)

// Valider que c'est bien une image
const metadata =awaitsharp(buffer).metadata()
if(!metadata.format)thrownewError('Fichier invalide')

const imageId =randomUUID()
const ext = metadata.format==='jpeg'?'jpg': metadata.format

// Upload comme d'habitude
const path =`products/${productId}/original/${imageId}.${ext}`
const{ error: upErr }=await supabaseAdmin.storage
.from('product-images')
.upload(path, buffer,{
        contentType:`image/${metadata.format}`,
        upsert:false,
})

if(upErr)thrownewError(upErr.message)

// Insertion DB
const{ error: dbErr }=await supabaseAdmin
.from('product_images')
.insert({
        id: imageId,
        product_id: productId,
        storage_original: path,
        alt:null,
        is_primary:false,
        sort_order:999,
        width: metadata.width||null,
        height: metadata.height||null,
})

if(dbErr)thrownewError(dbErr.message)

// Générer les variantes
// (Réutiliser la fonction generateVariants)

returnNextResponse.json({ ok:true, id: imageId })
}catch(err:any){
returnNextResponse.json(
{ error: err.message||'Erreur serveur'},
{ status:500}
)
}
}
```

---

## 🔧 Configuration & optimisations

### Variables d'environnement

bash

```bash
# .env.local

# Durée de vie des URLs signées (en secondes)
IMAGE_SIGN_TTL=600

# Compression par défaut
DEFAULT_AVIF_QUALITY=50
DEFAULT_WEBP_QUALITY=78
DEFAULT_JPEG_QUALITY=85

# Watermark
ENABLE_WATERMARK=false
WATERMARK_OPACITY=0.3

# Limites
MAX_FILE_SIZE_MB=10
MAX_FILES_PER_UPLOAD=10
```

### Hook personnalisé pour les images

typescript

```typescript
// src/hooks/useProductImages.ts
import{ useState, useCallback }from'react'

typeProductImage={
  id:string
  alt:string|null
  is_primary:boolean
  sort_order:number
  width:number|null
  height:number|null
  storage_original:string
  storage_master:string|null
}

exportfunctionuseProductImages(productId:string|null){
const[images, setImages]=useState<ProductImage[]>([])
const[loading, setLoading]=useState(false)
const[error, setError]=useState<string|null>(null)

const refresh =useCallback(async()=>{
if(!productId){
setImages([])
return
}

setLoading(true)
setError(null)

try{
const res =awaitfetch(`/api/products/${productId}/images`,{
        cache:'no-store',
})
if(!res.ok)thrownewError(await res.text())
const data =await res.json()
setImages(data.images??[])
}catch(err:any){
setError(err.message||'Erreur')
setImages([])
}finally{
setLoading(false)
}
},[productId])

return{
    images,
    loading,
    error,
    refresh,
}
}
```

---

## 📝 Checklist d'implémentation

### Priorité 1 (Court terme - 1-2 semaines)

- [ ] **Éditeur visuel (crop/rotate)**
  - [ ] Installer `react-easy-crop`
  - [ ] Créer `ImageEditorModal.tsx`
  - [ ] Créer route `/api/admin/product-images/edit`
  - [ ] Intégrer dans `MediaGridClient`
  - [ ] Tester le workflow complet
  - [ ] Documenter l'usage
- [ ] **Prévisualisation avant upload**
  - [ ] Ajouter state `previews` dans `MediaGridClient`
  - [ ] Créer la grille d'aperçu
  - [ ] Ajouter bouton de suppression par preview
  - [ ] Tester sur mobile
- [ ] **Compression paramétrable**
  - [ ] Créer `CompressionSettings.tsx`
  - [ ] Mettre à jour route upload
  - [ ] Ajouter presets de qualité
  - [ ] Tester impact sur le poids des fichiers

### Priorité 2 (Moyen terme - 3-4 semaines)

- [ ] **Gestion par lot**
  - [ ] Ajouter sélection multiple (checkbox)
  - [ ] Créer barre d'actions groupées
  - [ ] Implémenter suppression en masse
  - [ ] Implémenter modification alt en masse
  - [ ] Ajouter export ZIP
- [ ] **Import depuis URL**
  - [ ] Créer composant `ImportFromUrl`
  - [ ] Créer route `/api/admin/product-images/import-url`
  - [ ] Ajouter validation d'URL
  - [ ] Gérer les erreurs réseau

### Priorité 3 (Long terme - optionnel)

- [ ] **Historique des modifications**
  - [ ] Créer table `image_history`
  - [ ] Implémenter logging automatique
  - [ ] Créer composant `ImageHistory`
  - [ ] Créer route GET history
- [ ] **Watermark automatique**
  - [ ] Préparer logo watermark
  - [ ] Créer fonction `addWatermark()`
  - [ ] Ajouter toggle dans l'interface
  - [ ] Tester positionnement et opacité

---

## 🚀 Améliorations futures

### Intelligence artificielle

- **Auto-tagging** : Détection automatique du contenu (vêtement, couleur, style)
- **Auto-crop intelligent** : Détection du sujet principal
- **Upscaling** : Amélioration de la résolution avec AI
- **Génération de descriptions** : Alt text automatique via vision AI

### Performance

- **CDN intégration** : Distribution via CloudFlare/AWS CloudFront
- **Lazy generation** : Variantes générées à la demande
- **Cache warming** : Pré-génération des variantes populaires
- **WebP/AVIF detection** : Format optimal selon le navigateur

### UX avancée

- **Lightbox/Gallery** : Aperçu plein écran avec navigation
- **Annotations** : Zones cliquables sur les images
- **Comparaison** : Vue côte-à-côte avant/après édition
- **Templates** : Designs pré-configurés pour certains types de produits

---

**Document généré le 03/10/2025**

**Version : 1.0**

**Statut : ✅ Prêt pour implémentation**
