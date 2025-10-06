# 📚 Documentation complète - Module de gestion des clients (Admin)

## 🎯 Objectif

Créer un module complet de gestion des clients dans l'interface d'administration, permettant de :

- Lister tous les clients avec recherche et filtres
- Voir le détail d'un client
- Modifier les informations client
- Gérer les rôles (customer ↔ admin)
- Consulter l'historique des commandes et statistiques

---

## 📁 Structure des fichiers à créer

```
src/
├── app/
│   ├── admin/
│   │   └── customers/
│   │       ├── page.tsx                    # Liste des clients (Server Component)
│   │       ├── CustomersClient.tsx         # Client Component pour la liste
│   │       ├── CustomersFilter.tsx         # Filtres de recherche
│   │       └── [id]/
│   │           ├── page.tsx                # Détail client (Server Component)
│   │           ├── CustomerDetailClient.tsx # Client Component pour le détail
│   │           ├── actions.ts              # Server Actions
│   │           └── tabs/
│   │               ├── OrdersTab.tsx       # Onglet commandes
│   │               ├── AddressesTab.tsx    # Onglet adresses
│   │               ├── WishlistTab.tsx     # Onglet wishlist
│   │               └── NotesTab.tsx        # Onglet notes admin
│   └── api/
│       └── admin/
│           └── customers/
│               ├── route.ts                # GET /api/admin/customers
│               ├── [id]/
│               │   ├── route.ts            # GET/PATCH /api/admin/customers/[id]
│               │   ├── orders/
│               │   │   └── route.ts        # GET /api/admin/customers/[id]/orders
│               │   ├── addresses/
│               │   │   └── route.ts        # GET /api/admin/customers/[id]/addresses
│               │   └── notes/
│               │       └── route.ts        # GET/POST /api/admin/customers/[id]/notes
│               └── stats/
│                   └── route.ts            # GET /api/admin/customers/stats
├── components/
│   └── admin/
│       └── customers/
│           ├── CustomerCard.tsx            # Card pour afficher un client
│           ├── CustomerStats.tsx           # Widget stats client
│           ├── OrdersList.tsx              # Liste des commandes du client
│           └── NoteForm.tsx                # Formulaire d'ajout de note
└── lib/
    └── validation/
        └── adminCustomers.ts               # Schémas Zod pour validation
```

---

## 🗄️ Structure de données

### Table `profiles` (existante)

sql

```sql
- id: uuid (PK, ref auth.users)
- first_name: varchar
- last_name: varchar
- phone: varchar
- avatar_url: varchar
- role: varchar(default: 'customer')
- created_at: timestamptz
- updated_at: timestamptz
```

### Table `customer_notes` (à créer)

sql

```sql
CREATETABLEpublic.customer_notes (
  id uuid PRIMARYKEYDEFAULT gen_random_uuid(),
  customer_id uuid NOTNULLREFERENCES auth.users(id),
  admin_id uuid NOTNULLREFERENCES auth.users(id),
  note textNOTNULL,
  created_at timestamptz NOTNULLDEFAULTnow(),
  updated_at timestamptz NOTNULLDEFAULTnow()
);

-- Index pour les performances
CREATEINDEX idx_customer_notes_customer ON customer_notes(customer_id);
CREATEINDEX idx_customer_notes_created ON customer_notes(created_at DESC);
```

---

## 🔧 Schémas de validation (Zod)

### `src/lib/validation/adminCustomers.ts`

typescript

```typescript
import{ z }from'zod'

// Schéma de mise à jour du profil client
exportconst customerUpdateSchema = z.object({
  first_name: z.string().min(1,'Prénom requis').optional(),
  last_name: z.string().min(1,'Nom requis').optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(['customer','admin']).optional(),
  avatar_url: z.string().url().optional().nullable(),
})

// Schéma de création de note
exportconst customerNoteCreateSchema = z.object({
  note: z.string().min(1,'Note requise').max(1000,'Note trop longue'),
})

// Schéma de filtres pour la liste
exportconst customersFilterSchema = z.object({
  q: z.string().optional(),// recherche
  role: z.enum(['customer','admin','all']).optional(),
  sort: z.enum(['newest','oldest','name','orders','revenue']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

exporttypeCustomerUpdate= z.infer<typeof customerUpdateSchema>
exporttypeCustomerNoteCreate= z.infer<typeof customerNoteCreateSchema>
exporttypeCustomersFilter= z.infer<typeof customersFilterSchema>
```

---

## 🛣️ Routes API

### 1. `src/app/api/admin/customers/route.ts`

**Responsabilité** : Lister tous les clients avec stats et filtres

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'
import{ customersFilterSchema }from'@/lib/validation/adminCustomers'

exportasyncfunctionGET(req:Request){
// 1. Vérifier que l'utilisateur est admin
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

// 2. Parser les paramètres de recherche
const{ searchParams }=newURL(req.url)
const params ={
    q: searchParams.get('q')||undefined,
    role: searchParams.get('role')||'all',
    sort: searchParams.get('sort')||'newest',
    limit:Number(searchParams.get('limit')||50),
    offset:Number(searchParams.get('offset')||0),
}

const parsed = customersFilterSchema.safeParse(params)
if(!parsed.success){
returnNextResponse.json({ error: parsed.error},{ status:400})
}

const{ q, role, sort, limit, offset }= parsed.data

// 3. Construire la requête de base
let query = supabaseAdmin
.from('profiles')
.select(
`
      id,
      first_name,
      last_name,
      role,
      created_at,
      avatar_url
`,
{ count:'exact'}
)

// 4. Appliquer les filtres
if(q){
    query = query.or(
`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
)
}

if(role && role !=='all'){
    query = query.eq('role', role)
}

// 5. Appliquer le tri
switch(sort){
case'newest':
      query = query.order('created_at',{ ascending:false})
break
case'oldest':
      query = query.order('created_at',{ ascending:true})
break
case'name':
      query = query.order('last_name',{ ascending:true})
break
}

  query = query.range(offset, offset + limit -1)

const{ data: profiles, error, count }=await query

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

// 6. Récupérer les emails depuis auth.users
const userIds = profiles?.map((p)=> p.id)||[]
const{ data: authUsers }=await supabaseAdmin.auth.admin.listUsers()

const emailMap =newMap(
    authUsers.users.map((u)=>[u.id, u.email])
)

// 7. Récupérer les stats de commandes pour chaque client
const{ data: orderStats }=await supabaseAdmin
.from('orders')
.select('user_id, total_amount')
.in('user_id', userIds)
.in('status',['paid','processing','shipped','delivered'])

// Calculer les stats par client
const statsMap =newMap<string,{ orderCount:number; totalRevenue:number}>()

  orderStats?.forEach((order)=>{
const current = statsMap.get(order.user_id)||{ orderCount:0, totalRevenue:0}
    statsMap.set(order.user_id,{
      orderCount: current.orderCount+1,
      totalRevenue: current.totalRevenue+Number(order.total_amount),
})
})

// 8. Construire la réponse enrichie
const customers = profiles?.map((profile)=>{
const stats = statsMap.get(profile.id)||{ orderCount:0, totalRevenue:0}
return{
...profile,
      email: emailMap.get(profile.id)||'',
      order_count: stats.orderCount,
      total_revenue: stats.totalRevenue,
}
})

// 9. Tri additionnel si nécessaire (orders, revenue)
if(sort ==='orders'){
    customers?.sort((a, b)=> b.order_count- a.order_count)
}elseif(sort ==='revenue'){
    customers?.sort((a, b)=> b.total_revenue- a.total_revenue)
}

returnNextResponse.json({
    customers: customers ||[],
    total: count ||0,
})
}
```

---

### 2. `src/app/api/admin/customers/stats/route.ts`

**Responsabilité** : Fournir des statistiques globales

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'

exportasyncfunctionGET(){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

// Total clients
const{ count: totalCustomers }=await supabaseAdmin
.from('profiles')
.select('*',{ count:'exact', head:true})

// Nouveaux ce mois
const startOfMonth =newDate()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0,0,0,0)

const{ count: newThisMonth }=await supabaseAdmin
.from('profiles')
.select('*',{ count:'exact', head:true})
.gte('created_at', startOfMonth.toISOString())

// Clients actifs (au moins 1 commande)
const{ data: activeCustomers }=await supabaseAdmin
.from('orders')
.select('user_id',{ count:'exact'})
.not('user_id','is',null)

const uniqueActiveCustomers =newSet(
    activeCustomers?.map((o)=> o.user_id)
).size

// CA total
const{ data: orders }=await supabaseAdmin
.from('orders')
.select('total_amount')
.in('status',['paid','processing','shipped','delivered'])

const totalRevenue = orders?.reduce(
(sum, o)=> sum +Number(o.total_amount),
0
)||0

returnNextResponse.json({
    total: totalCustomers ||0,
    newThisMonth: newThisMonth ||0,
    active: uniqueActiveCustomers,
    totalRevenue:Math.round(totalRevenue),
})
}
```

---

### 3. `src/app/api/admin/customers/[id]/route.ts`

**Responsabilité** : Détail et modification d'un client

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'
import{ customerUpdateSchema }from'@/lib/validation/adminCustomers'

// GET : Récupérer les infos d'un client
exportasyncfunctionGET(
  _req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params

// Récupérer le profil
const{ data: profile, error: profileError }=await supabaseAdmin
.from('profiles')
.select('*')
.eq('id', id)
.single()

if(profileError ||!profile){
returnNextResponse.json({ error:'Client non trouvé'},{ status:404})
}

// Récupérer l'email depuis auth.users
const{ data: authUser }=await supabaseAdmin.auth.admin.getUserById(id)

const email = authUser.user?.email ||''

// Stats de commandes
const{ data: orders }=await supabaseAdmin
.from('orders')
.select('id, order_number, status, total_amount, created_at')
.eq('user_id', id)
.order('created_at',{ ascending:false})

const orderCount = orders?.length ||0
const totalRevenue = orders?.reduce(
(sum, o)=> sum +Number(o.total_amount),
0
)||0
const averageOrder = orderCount >0? totalRevenue / orderCount :0

returnNextResponse.json({
    customer:{
...profile,
      email,
},
    stats:{
      orderCount,
      totalRevenue,
      averageOrder,
},
    recentOrders: orders?.slice(0,5)||[],
})
}

// PATCH : Mettre à jour un client
exportasyncfunctionPATCH(
  req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params
const body =await req.json()

const parsed = customerUpdateSchema.safeParse(body)
if(!parsed.success){
returnNextResponse.json({ error: parsed.error.flatten()},{ status:400})
}

const{ data, error }=await supabaseAdmin
.from('profiles')
.update({
...parsed.data,
      updated_at:newDate().toISOString(),
})
.eq('id', id)
.select()
.single()

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

returnNextResponse.json({ customer: data })
}
```

---

### 4. `src/app/api/admin/customers/[id]/orders/route.ts`

**Responsabilité** : Récupérer toutes les commandes d'un client

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'

exportasyncfunctionGET(
  _req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params

const{ data: orders, error }=await supabaseAdmin
.from('orders')
.select(
`
      *,
      items:order_items(count)
`
)
.eq('user_id', id)
.order('created_at',{ ascending:false})

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

returnNextResponse.json({ orders: orders ||[]})
}
```

---

### 5. `src/app/api/admin/customers/[id]/addresses/route.ts`

**Responsabilité** : Récupérer les adresses d'un client

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'

exportasyncfunctionGET(
  _req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params

const{ data: addresses, error }=await supabaseAdmin
.from('addresses')
.select('*')
.eq('user_id', id)
.order('is_default',{ ascending:false})

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

returnNextResponse.json({ addresses: addresses ||[]})
}
```

---

### 6. `src/app/api/admin/customers/[id]/notes/route.ts`

**Responsabilité** : Gérer les notes administrateur sur un client

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'
import{ customerNoteCreateSchema }from'@/lib/validation/adminCustomers'

// GET : Récupérer toutes les notes d'un client
exportasyncfunctionGET(
  _req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params

const{ data: notes, error }=await supabaseAdmin
.from('customer_notes')
.select(
`
      *,
      admin:profiles!admin_id(first_name, last_name)
`
)
.eq('customer_id', id)
.order('created_at',{ ascending:false})

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

returnNextResponse.json({ notes: notes ||[]})
}

// POST : Ajouter une note
exportasyncfunctionPOST(
  req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params
const body =await req.json()

const parsed = customerNoteCreateSchema.safeParse(body)
if(!parsed.success){
returnNextResponse.json({ error: parsed.error.flatten()},{ status:400})
}

const{ data, error }=await supabaseAdmin
.from('customer_notes')
.insert({
      customer_id: id,
      admin_id: auth.user.id,
      note: parsed.data.note,
})
.select(
`
      *,
      admin:profiles!admin_id(first_name, last_name)
`
)
.single()

if(error){
returnNextResponse.json({ error: error.message},{ status:500})
}

returnNextResponse.json({ note: data })
}
```

---

## 📄 Pages & Composants

### 1. `src/app/admin/customers/page.tsx`

**Server Component** - Liste des clients

typescript

```typescript
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{CustomersClient}from'./CustomersClient'

exportconst dynamic ='force-dynamic'

exportdefaultasyncfunctionAdminCustomersPage({
  searchParams,
}:{
  searchParams:Promise<{
    q?:string
    role?:string
    sort?:string
}>
}){
const params =await searchParams

// Fetch initial data server-side pour SSR
const queryParams =newURLSearchParams()
if(params.q) queryParams.set('q', params.q)
if(params.role) queryParams.set('role', params.role)
if(params.sort) queryParams.set('sort', params.sort)

const[customersRes, statsRes]=awaitPromise.all([
fetch(
`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers?${queryParams}`,
{ cache:'no-store'}
),
fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/stats`,{
      cache:'no-store',
}),
])

const{ customers, total }=await customersRes.json()
const stats =await statsRes.json()

return(
<CustomersClient
      initialCustomers={customers}
      initialStats={stats}
      initialTotal={total}
/>
)
}
```

---

### 2. `src/app/admin/customers/CustomersClient.tsx`

**Client Component** - Interface de liste avec recherche

typescript

```typescript
'use client'

import{ useState }from'react'
importLinkfrom'next/link'
import{ useRouter, useSearchParams }from'next/navigation'
import{Badge}from'@/components/ui/badge'

typeCustomer={
  id:string
  first_name:string|null
  last_name:string|null
  email:string
  role:string
  created_at:string
  order_count:number
  total_revenue:number
}

typeStats={
  total:number
  newThisMonth:number
  active:number
  totalRevenue:number
}

typeProps={
  initialCustomers:Customer[]
  initialStats:Stats
  initialTotal:number
}

exportfunctionCustomersClient({
  initialCustomers,
  initialStats,
  initialTotal,
}:Props){
const router =useRouter()
const searchParams =useSearchParams()

const[searchQuery, setSearchQuery]=useState(searchParams.get('q')||'')

functionhandleSearch(e:React.FormEvent){
    e.preventDefault()
const params =newURLSearchParams(searchParams.toString())
if(searchQuery){
      params.set('q', searchQuery)
}else{
      params.delete('q')
}
    router.push(`/admin/customers?${params.toString()}`)
}

functionhandleRoleFilter(role:string){
const params =newURLSearchParams(searchParams.toString())
if(role ==='all'){
      params.delete('role')
}else{
      params.set('role', role)
}
    router.push(`/admin/customers?${params.toString()}`)
}

functionhandleSort(sort:string){
const params =newURLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.push(`/admin/customers?${params.toString()}`)
}

return(
<div className="space-y-6">
{/* En-tête */}
<div className="flex items-center justify-between">
<h1 className="text-2xl font-semibold">
Clients({initialTotal})
</h1>
</div>

{/* Stats rapides */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
<div className="text-sm text-gray-600 dark:text-gray-400">
Total clients
</div>
<div className="text-2xl font-bold">{initialStats.total}</div>
</div>
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
<div className="text-sm text-gray-600 dark:text-gray-400">
Nouveaux ce mois
</div>
<div className="text-2xl font-bold text-green-600 dark:text-green-400">
{initialStats.newThisMonth}
</div>
</div>
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
<div className="text-sm text-gray-600 dark:text-gray-400">
Clients actifs
</div>
<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
{initialStats.active}
</div>
</div>
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
<div className="text-sm text-gray-600 dark:text-gray-400">
CA total
</div>
<div className="text-2xl font-bold text-violet">
{initialStats.totalRevenue.toLocaleString()}€
</div>
</div>
</div>

{/* Filtres et recherche */}
<div className="flex flex-col md:flex-row gap-3">
{/* Recherche */}
<form onSubmit={handleSearch} className="flex-1">
<input
            type="search"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-4 py-2"
/>
</form>

{/* Filtre rôle */}
<select
          value={searchParams.get('role')||'all'}
          onChange={(e)=>handleRoleFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-4 py-2"
>
<option value="all">Tous les rôles</option>
<option value="customer">Clients</option>
<option value="admin">Administrateurs</option>
</select>

{/* Tri */}
<select
          value={searchParams.get('sort')||'newest'}
          onChange={(e)=>handleSort(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-4 py-2"
>
<option value="newest">Plus récents</option>
<option value="oldest">Plus anciens</option>
<option value="name">NomA-Z</option>
<option value="orders">Plus de commandes</option>
<option value="revenue">CA décroissant</option>
</select>
</div>

{/* Table */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
<div className="overflow-x-auto">
<table className="w-full text-sm">
<thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
<tr>
<th className="text-left py-3 px-4 font-medium">Client</th>
<th className="text-left py-3 px-4 font-medium">Email</th>
<th className="text-left py-3 px-4 font-medium">Rôle</th>
<th className="text-left py-3 px-4 font-medium">Inscription</th>
<th className="text-left py-3 px-4 font-medium">Commandes</th>
<th className="text-left py-3 px-4 font-medium">CA total</th>
<th className="text-left py-3 px-4 font-medium">Actions</th>
</tr>
</thead>
<tbody>
{initialCustomers.map((customer)=>(
<tr
                  key={customer.id}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
>
<td className="py-3 px-4">
<div className="font-medium">
{customer.first_name&& customer.last_name
?`${customer.first_name}${customer.last_name}`
:'Sans nom'}
</div>
</td>
<td className="py-3 px-4 text-gray-600 dark:text-gray-400">
{customer.email}
</td>
<td className="py-3 px-4">
<Badge
                      variant={
                        customer.role==='admin'?'default':'secondary'
}
>
{customer.role==='admin'?'👨‍💼 Admin':'👤 Client'}
</Badge>
</td>
<td className="py-3 px-4 text-gray-600 dark:text-gray-400">
{newDate(customer.created_at).toLocaleDateString('fr-FR')}
</td>
<td className="py-3 px-4">{customer.order_count}</td>
<td className="py-3 px-4 font-medium">
{customer.total_revenue.toFixed(2)}€
</td>
<td className="py-3 px-4">
<Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-violet hover:underline"
>
Voir
</Link>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>

{initialCustomers.length===0&&(
<div className="text-center py-12 text-gray-500 dark:text-gray-400">
Aucun client trouvé
</div>
)}
</div>
)
}
```

---

### 3. `src/

Réessayer

TR

Continuer

Modifier

### 3. `src/app/admin/customers/[id]/page.tsx`

**Server Component** - Détail d'un client

typescript

```typescript
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ notFound }from'next/navigation'
import{CustomerDetailClient}from'./CustomerDetailClient'

exportconst dynamic ='force-dynamic'

exportdefaultasyncfunctionAdminCustomerDetailPage({
  params,
}:{
  params:Promise<{ id:string}>
}){
const{ id }=await params

// Fetch toutes les données en parallèle
const[customerRes, ordersRes, addressesRes, notesRes]=awaitPromise.all([
fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}`,{
      cache:'no-store',
}),
fetch(
`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}/orders`,
{ cache:'no-store'}
),
fetch(
`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}/addresses`,
{ cache:'no-store'}
),
fetch(
`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${id}/notes`,
{ cache:'no-store'}
),
])

if(!customerRes.ok){
returnnotFound()
}

const customerData =await customerRes.json()
const{ orders }=await ordersRes.json()
const{ addresses }=await addressesRes.json()
const{ notes }=await notesRes.json()

return(
<CustomerDetailClient
      customer={customerData.customer}
      stats={customerData.stats}
      recentOrders={customerData.recentOrders}
      allOrders={orders}
      addresses={addresses}
      notes={notes}
/>
)
}
```

---

### 4. `src/app/admin/customers/[id]/CustomerDetailClient.tsx`

**Client Component** - Interface de détail avec onglets

typescript

```typescript
'use client'

import{ useState }from'react'
importLinkfrom'next/link'
import{ useRouter }from'next/navigation'
import{Badge}from'@/components/ui/badge'
import{ useToast }from'@/components/admin/Toast'
import{OrdersTab}from'./tabs/OrdersTab'
import{AddressesTab}from'./tabs/AddressesTab'
import{NotesTab}from'./tabs/NotesTab'
import{ updateCustomerAction }from'./actions'

typeCustomer={
  id:string
  first_name:string|null
  last_name:string|null
  email:string
  phone:string|null
  role:string
  avatar_url:string|null
  created_at:string
}

typeStats={
  orderCount:number
  totalRevenue:number
  averageOrder:number
}

typeOrder={
  id:string
  order_number:string
  status:string
  total_amount:number
  created_at:string
}

typeAddress={
  id:string
  type:string
  first_name:string
  last_name:string
  address_line_1:string
  address_line_2:string|null
  city:string
  postal_code:string
  country:string
  is_default:boolean
}

typeNote={
  id:string
  note:string
  created_at:string
  admin:{
    first_name:string
    last_name:string
}
}

typeProps={
  customer:Customer
  stats:Stats
  recentOrders:Order[]
  allOrders:Order[]
  addresses:Address[]
  notes:Note[]
}

exportfunctionCustomerDetailClient({
  customer: initialCustomer,
  stats,
  recentOrders,
  allOrders,
  addresses,
  notes: initialNotes,
}:Props){
const router =useRouter()
const{ showToast }=useToast()

const[customer, setCustomer]=useState(initialCustomer)
const[activeTab, setActiveTab]=useState<'orders'|'addresses'|'notes'>(
'orders'
)
const[isEditing, setIsEditing]=useState(false)
const[editForm, setEditForm]=useState({
    first_name: customer.first_name||'',
    last_name: customer.last_name||'',
    phone: customer.phone||'',
    role: customer.role,
})

asyncfunctionhandleSave(){
try{
const result =awaitupdateCustomerAction(customer.id, editForm)
if(result.ok){
setCustomer({...customer,...editForm })
setIsEditing(false)
showToast('Client mis à jour','success')
        router.refresh()
}else{
showToast('Erreur lors de la mise à jour','error')
}
}catch(error){
showToast('Erreur serveur','error')
}
}

functionhandleCancel(){
setEditForm({
      first_name: customer.first_name||'',
      last_name: customer.last_name||'',
      phone: customer.phone||'',
      role: customer.role,
})
setIsEditing(false)
}

const displayName =
    customer.first_name&& customer.last_name
?`${customer.first_name}${customer.last_name}`
: customer.email

return(
<div className="space-y-6">
{/* Navigation */}
<div className="text-sm">
<Link
          href="/admin/customers"
          className="underline hover:text-violet transition-colors"
>
          ← Retour aux clients
</Link>
</div>

{/* En-tête */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
<div className="flex items-start justify-between mb-6">
<div className="flex-1">
{isEditing ?(
<div className="space-y-3 max-w-md">
<div className="grid grid-cols-2 gap-3">
<input
                    type="text"
                    placeholder="Prénom"
                    value={editForm.first_name}
                    onChange={(e)=>
setEditForm({...editForm, first_name: e.target.value})
}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
<input
                    type="text"
                    placeholder="Nom"
                    value={editForm.last_name}
                    onChange={(e)=>
setEditForm({...editForm, last_name: e.target.value})
}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
</div>
<input
                  type="tel"
                  placeholder="Téléphone"
                  value={editForm.phone}
                  onChange={(e)=>
setEditForm({...editForm, phone: e.target.value})
}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
<select
                  value={editForm.role}
                  onChange={(e)=>
setEditForm({...editForm, role: e.target.value})
}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
>
<option value="customer">👤 Client</option>
<option value="admin">👨‍💼 Administrateur</option>
</select>
</div>
):(
<>
<h1 className="text-2xl font-semibold mb-2">{displayName}</h1>
<div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
<div>📧 {customer.email}</div>
{customer.phone&&<div>📱 {customer.phone}</div>}
<div>
                    📅 Inscrit le{' '}
{newDate(customer.created_at).toLocaleDateString('fr-FR')}
</div>
</div>
</>
)}
</div>

<div className="flex items-center gap-3">
<Badge variant={customer.role==='admin'?'default':'secondary'}>
{customer.role==='admin'?'👨‍💼 Admin':'👤 Client'}
</Badge>

{isEditing ?(
<div className="flex gap-2">
<button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
>
                  ✓ Sauver
</button>
<button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
>
                  ✕ Annuler
</button>
</div>
):(
<button
                onClick={()=>setIsEditing(true)}
                className="px-4 py-2 border border-violet text-violet rounded hover:bg-violet hover:text-white transition-colors text-sm"
>
                ✏️ Modifier
</button>
)}
</div>
</div>

{/* Stats rapides */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
<div>
<div className="text-sm text-gray-600 dark:text-gray-400">
Commandes
</div>
<div className="text-2xl font-bold">{stats.orderCount}</div>
</div>
<div>
<div className="text-sm text-gray-600 dark:text-gray-400">
CA total
</div>
<div className="text-2xl font-bold text-green-600 dark:text-green-400">
{stats.totalRevenue.toFixed(2)}€
</div>
</div>
<div>
<div className="text-sm text-gray-600 dark:text-gray-400">
Panier moyen
</div>
<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
{stats.averageOrder.toFixed(2)}€
</div>
</div>
</div>

{/* Actions rapides */}
<div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">

            href={`mailto:${customer.email}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
>
            📧 Envoyer un email
</a>
{/* Autres actions rapides possibles */}
</div>
</div>

{/* Onglets */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
{/* En-têtes des onglets */}
<div className="flex border-b border-gray-300 dark:border-gray-600">
<button
            onClick={()=>setActiveTab('orders')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab ==='orders'
?'bg-violet text-white'
:'hover:bg-gray-50 dark:hover:bg-gray-700'
}`}
>
            📦 Commandes({allOrders.length})
</button>
<button
            onClick={()=>setActiveTab('addresses')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab ==='addresses'
?'bg-violet text-white'
:'hover:bg-gray-50 dark:hover:bg-gray-700'
}`}
>
            📍 Adresses({addresses.length})
</button>
<button
            onClick={()=>setActiveTab('notes')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab ==='notes'
?'bg-violet text-white'
:'hover:bg-gray-50 dark:hover:bg-gray-700'
}`}
>
            📝 Notes({initialNotes.length})
</button>
</div>

{/* Contenu des onglets */}
<div className="p-6">
{activeTab ==='orders'&&<OrdersTab orders={allOrders}/>}
{activeTab ==='addresses'&&<AddressesTab addresses={addresses}/>}
{activeTab ==='notes'&&(
<NotesTab customerId={customer.id} initialNotes={initialNotes}/>
)}
</div>
</div>
</div>
)
}
```

---

### 5. `src/app/admin/customers/[id]/actions.ts`

**Server Actions** - Actions côté serveur

typescript

```typescript
'use server'

import{ revalidatePath }from'next/cache'
import{ customerUpdateSchema }from'@/lib/validation/adminCustomers'

exportasyncfunctionupdateCustomerAction(
  customerId:string,
  data:{
    first_name:string
    last_name:string
    phone:string
    role:string
}
){
const parsed = customerUpdateSchema.safeParse(data)
if(!parsed.success){
return{ ok:falseasconst, error: parsed.error.flatten()}
}

const res =awaitfetch(
`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/customers/${customerId}`,
{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(parsed.data),
}
)

if(!res.ok){
return{ ok:falseasconst, error:{ message:'Erreur serveur'}}
}

revalidatePath(`/admin/customers/${customerId}`)
revalidatePath('/admin/customers')
return{ ok:trueasconst}
}
```

---

### 6. `src/app/admin/customers/[id]/tabs/OrdersTab.tsx`

**Onglet Commandes**

typescript

```typescript
'use client'

importLinkfrom'next/link'
import{Badge}from'@/components/ui/badge'

typeOrder={
  id:string
  order_number:string
  status:string
  total_amount:number
  created_at:string
  items?:{ count:number}[]
}

typeProps={
  orders:Order[]
}

const statusColors:Record
string,
'default'|'secondary'|'destructive'|'outline'
>={
  pending:'secondary',
  paid:'default',
  processing:'outline',
  shipped:'default',
  delivered:'default',
  cancelled:'destructive',
  refunded:'secondary',
}

const statusLabels:Record<string,string>={
  pending:'En attente',
  paid:'Payée',
  processing:'En préparation',
  shipped:'Expédiée',
  delivered:'Livrée',
  cancelled:'Annulée',
  refunded:'Remboursée',
}

exportfunctionOrdersTab({ orders }:Props){
if(orders.length===0){
return(
<div className="text-center py-8 text-gray-500 dark:text-gray-400">
Aucune commande pour ce client
</div>
)
}

return(
<div className="space-y-3">
{orders.map((order)=>(
<div
          key={order.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-violet transition-colors"
>
<div className="flex items-start justify-between">
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium hover:text-violet transition-colors"
>
{order.order_number}
</Link>
<Badge variant={statusColors[order.status||'pending']}>
{statusLabels[order.status||'pending']}
</Badge>
</div>
<div className="text-sm text-gray-600 dark:text-gray-400">
{newDate(order.created_at).toLocaleDateString('fr-FR',{
                  day:'numeric',
                  month:'long',
                  year:'numeric',
                  hour:'2-digit',
                  minute:'2-digit',
})}
</div>
</div>
<div className="text-right">
<div className="font-semibold text-lg">
{Number(order.total_amount).toFixed(2)}€
</div>
{order.items&& order.items[0]?.count >0&&(
<div className="text-sm text-gray-600 dark:text-gray-400">
{order.items[0].count} article{order.items[0].count>1?'s':''}
</div>
)}
</div>
</div>
</div>
))}
</div>
)
}
```

---

### 7. `src/app/admin/customers/[id]/tabs/AddressesTab.tsx`

**Onglet Adresses**

typescript

```typescript
'use client'

typeAddress={
  id:string
  type:string
  first_name:string
  last_name:string
  address_line_1:string
  address_line_2:string|null
  city:string
  postal_code:string
  country:string
  is_default:boolean
}

typeProps={
  addresses:Address[]
}

exportfunctionAddressesTab({ addresses }:Props){
if(addresses.length===0){
return(
<div className="text-center py-8 text-gray-500 dark:text-gray-400">
Aucune adresse enregistrée
</div>
)
}

return(
<div className="grid md:grid-cols-2 gap-4">
{addresses.map((address)=>(
<div
          key={address.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
>
<div className="flex items-start justify-between mb-3">
<div className="flex items-center gap-2">
<span className="text-2xl">
{address.type==='shipping'?'📦':'🏠'}
</span>
<span className="font-medium capitalize">{address.type}</span>
</div>
{address.is_default&&(
<span className="px-2 py-0.5 bg-violet/10 text-violet text-xs rounded">
Par défaut
</span>
)}
</div>

<div className="space-y-1 text-sm">
<div className="font-medium">
{address.first_name}{address.last_name}
</div>
<div className="text-gray-600 dark:text-gray-400">
{address.address_line_1}
</div>
{address.address_line_2&&(
<div className="text-gray-600 dark:text-gray-400">
{address.address_line_2}
</div>
)}
<div className="text-gray-600 dark:text-gray-400">
{address.postal_code}{address.city}
</div>
<div className="font-medium">{address.country}</div>
</div>
</div>
))}
</div>
)
}
```

---

### 8. `src/app/admin/customers/[id]/tabs/NotesTab.tsx`

**Onglet Notes administrateur**

typescript

```typescript
'use client'

import{ useState }from'react'
import{ useRouter }from'next/navigation'
import{ useToast }from'@/components/admin/Toast'

typeNote={
  id:string
  note:string
  created_at:string
  admin:{
    first_name:string
    last_name:string
}
}

typeProps={
  customerId:string
  initialNotes:Note[]
}

exportfunctionNotesTab({ customerId, initialNotes }:Props){
const router =useRouter()
const{ showToast }=useToast()
const[notes, setNotes]=useState(initialNotes)
const[newNote, setNewNote]=useState('')
const[isSubmitting, setIsSubmitting]=useState(false)

asyncfunctionhandleAddNote(e:React.FormEvent){
    e.preventDefault()
if(!newNote.trim())return

setIsSubmitting(true)
try{
const res =awaitfetch(`/api/admin/customers/${customerId}/notes`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ note: newNote }),
})

if(!res.ok)thrownewError('Erreur')

const{ note }=await res.json()
setNotes([note,...notes])
setNewNote('')
showToast('Note ajoutée','success')
      router.refresh()
}catch(error){
showToast('Erreur lors de l\'ajout','error')
}finally{
setIsSubmitting(false)
}
}

return(
<div className="space-y-6">
{/* Formulaire d'ajout */}
<form onSubmit={handleAddNote} className="space-y-3">
<textarea
          value={newNote}
          onChange={(e)=>setNewNote(e.target.value)}
          placeholder="Ajouter une note administrative (visible uniquement par les admins)..."
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 focus:ring-2 focus:ring-violet focus:border-transparent"
/>
<button
          type="submit"
          disabled={!newNote.trim()|| isSubmitting}
          className="px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
{isSubmitting ?'Ajout...':'+ Ajouter la note'}
</button>
</form>

{/* Liste des notes */}
{notes.length===0?(
<div className="text-center py-8 text-gray-500 dark:text-gray-400">
Aucune note pour ce client
</div>
):(
<div className="space-y-3">
{notes.map((note)=>(
<div
              key={note.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
>
<div className="flex items-start justify-between mb-2">
<div className="font-medium">
{note.admin.first_name}{note.admin.last_name}
</div>
<div className="text-sm text-gray-500 dark:text-gray-400">
{newDate(note.created_at).toLocaleDateString('fr-FR',{
                    day:'numeric',
                    month:'short',
                    year:'numeric',
                    hour:'2-digit',
                    minute:'2-digit',
})}
</div>
</div>
<div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
{note.note}
</div>
</div>
))}
</div>
)}
</div>
)
}
```

---

## 🔐 Sécurité : Middleware `requireAdmin`

### `src/lib/auth/requireAdmin.ts`

typescript

```typescript
import{ createServerClient }from'@supabase/ssr'
import{ cookies }from'next/headers'
importtype{Database}from'@/lib/database.types'

exportasyncfunctionrequireAdmin(){
const cookieStore =awaitcookies()
const supabase =createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
      cookies:{get:(k)=> cookieStore.get(k)?.value,set(){},remove(){}},
}
)

const{
    data:{ user },
}=await supabase.auth.getUser()

if(!user){
return{
      ok:falseasconst,
      status:401,
      message:'Non authentifié',
}
}

const{ data: profile }=await supabase
.from('profiles')
.select('role')
.eq('id', user.id)
.single()

if(profile?.role !=='admin'){
return{
      ok:falseasconst,
      status:403,
      message:'Accès refusé',
}
}

return{
    ok:trueasconst,
    user,
    profile,
}
}
```

---

## 🧭 Mise à jour de la navigation

### `src/components/admin/AdminNav.tsx`

Ajouter le lien "Clients" dans la navigation :

typescript

```typescript
// Ajouter cette ligne dans le composant
<Link
  href="/admin/customers"
  className={`px-3 py-2 rounded transition-colors ${
    pathname.startsWith('/admin/customers')
?'bg-violet text-white'
:'hover:bg-gray-100 dark:hover:bg-gray-700'
}`}
>
Clients
</Link>
```

---

## 📊 Migration SQL

### Créer la table `customer_notes`

sql

```sql
-- Migration pour la table customer_notes
CREATETABLEIFNOTEXISTSpublic.customer_notes (
  id uuid PRIMARYKEYDEFAULT gen_random_uuid(),
  customer_id uuid NOTNULLREFERENCES auth.users(id)ONDELETECASCADE,
  admin_id uuid NOTNULLREFERENCES auth.users(id)ONDELETECASCADE,
  note textNOTNULL,
  created_at timestamptz NOTNULLDEFAULTnow(),
  updated_at timestamptz NOTNULLDEFAULTnow()
);

-- Index pour améliorer les performances
CREATEINDEX idx_customer_notes_customer_id ONpublic.customer_notes(customer_id);
CREATEINDEX idx_customer_notes_created_at ONpublic.customer_notes(created_at DESC);

-- RLS (Row Level Security)
ALTERTABLEpublic.customer_notes ENABLEROWLEVEL SECURITY;

-- Policy : seuls les admins peuvent lire/écrire
CREATE POLICY "Admins can view customer notes"
ONpublic.customer_notes
FORSELECT
TO authenticated
USING(
EXISTS(
SELECT1FROMpublic.profiles
WHERE profiles.id = auth.uid()
AND profiles.role ='admin'
)
);

CREATE POLICY "Admins can insert customer notes"
ONpublic.customer_notes
FORINSERT
TO authenticated
WITHCHECK(
EXISTS(
SELECT1FROMpublic.profiles
WHERE profiles.id = auth.uid()
AND profiles.role ='admin'
)
);

-- Trigger pour updated_at
CREATEORREPLACEFUNCTION update_customer_notes_updated_at()
RETURNSTRIGGERAS $$
BEGIN
  NEW.updated_at =now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATETRIGGER customer_notes_updated_at
  BEFORE UPDATEONpublic.customer_notes
FOR EACH ROW
EXECUTEFUNCTION update_customer_notes_updated_at();
```

---

## ✅ Checklist d'implémentation

### Phase 1 : Backend (API Routes)

```
□ Créer lib/validation/adminCustomers.ts
□ Créer lib/auth/requireAdmin.ts
□ Créer api/admin/customers/route.ts
□ Créer api/admin/customers/stats/route.ts
□ Créer api/admin/customers/[id]/route.ts
□ Créer api/admin/customers/[id]/orders/route.ts
□ Créer api/admin/customers/[id]/addresses/route.ts
□ Créer api/admin/customers/[id]/notes/route.ts
□ Exécuter la migration SQL pour customer_notes
```

### Phase 2 : Frontend (Pages & Composants)

```
□ Créer admin/customers/page.tsx
□ Créer admin/customers/CustomersClient.tsx
□ Créer admin/customers/[id]/page.tsx
□ Créer admin/customers/[id]/CustomerDetailClient.tsx
□ Créer admin/customers/[id]/actions.ts
□ Créer admin/customers/[id]/tabs/OrdersTab.tsx
□ Créer admin/customers/[id]/tabs/AddressesTab.tsx
□ Créer admin/customers/[id]/tabs/NotesTab.tsx
```

### Phase 3 : Navigation & Tests

```
□ Ajouter le lien "Clients" dans AdminNav.tsx
□ Tester la liste des clients
□ Tester le détail d'un client
□ Tester la modification du profil
□ Tester l'ajout de notes
□ Tester les filtres et la recherche
□ Vérifier les permissions admin
```

---

## 🚀 Optimisations futures (Phase 2)

### Fonctionnalités avancées

typescript

```typescript
// 1. Export CSV des clients
exportasyncfunctionexportCustomersCSV(){
// Générer un CSV de tous les clients
}

// 2. Bloquer/débloquer un compte
exportasyncfunctiontoggleCustomerStatus(customerId:string, blocked:boolean)
```

Réessayer

TR

Continuer

Modifier

## 🚀 Optimisations futures (Phase 2) - Suite

### Fonctionnalités avancées

typescript

```typescript
// 2. Bloquer/débloquer un compte
exportasyncfunctiontoggleCustomerStatus(customerId:string, blocked:boolean){
// Mettre à jour auth.users avec un champ custom metadata
// ou créer une table customer_status
}

// 3. Envoyer un email personnalisé
exportasyncfunctionsendCustomEmail(customerId:string, subject:string, content:string){
// Intégration avec un service email (Resend, SendGrid, etc.)
}

// 4. Créer une commande manuelle pour le client
exportasyncfunctioncreateManualOrder(customerId:string, orderData:any){
// Créer une commande sans passer par le panier
}

// 5. Appliquer un coupon personnalisé
exportasyncfunctioncreatePersonalCoupon(customerId:string, discount:number){
// Générer un coupon unique pour ce client
}

// 6. Fusionner des comptes doublons
exportasyncfunctionmergeCustomerAccounts(keepId:string, mergeId:string){
// Transférer toutes les données du compte à fusionner
}

// 7. Supprimer un compte (RGPD)
exportasyncfunctiondeleteCustomerAccount(customerId:string){
// Anonymiser les commandes et supprimer les données personnelles
}
```

---

## 📊 Composants additionnels utiles

### 1. `src/components/admin/customers/CustomerStats.tsx`

**Widget de statistiques pour la page de détail**

typescript

```typescript
'use client'

import{Line}from'react-chartjs-2'
import{
ChartasChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
Title,
Tooltip,
Legend,
}from'chart.js'

ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
Title,
Tooltip,
Legend
)

typeProps={
  orderHistory:Array<{
    month:string
    amount:number
    count:number
}>
}

exportfunctionCustomerStats({ orderHistory }:Props){
const data ={
    labels: orderHistory.map((h)=> h.month),
    datasets:[
{
        label:'CA mensuel (€)',
        data: orderHistory.map((h)=> h.amount),
        borderColor:'rgb(124, 58, 237)',
        backgroundColor:'rgba(124, 58, 237, 0.1)',
        tension:0.3,
},
{
        label:'Nombre de commandes',
        data: orderHistory.map((h)=> h.count),
        borderColor:'rgb(34, 197, 94)',
        backgroundColor:'rgba(34, 197, 94, 0.1)',
        tension:0.3,
        yAxisID:'y1',
},
],
}

const options ={
    responsive:true,
    interaction:{
      mode:'index'asconst,
      intersect:false,
},
    plugins:{
      legend:{
        position:'top'asconst,
},
      title:{
        display:true,
        text:'Évolution des achats sur 12 mois',
},
},
    scales:{
      y:{
        type:'linear'asconst,
        display:true,
        position:'left'asconst,
        title:{
          display:true,
          text:'CA (€)',
},
},
      y1:{
        type:'linear'asconst,
        display:true,
        position:'right'asconst,
        title:{
          display:true,
          text:'Commandes',
},
        grid:{
          drawOnChartArea:false,
},
},
},
}

return(
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
<Line data={data} options={options}/>
</div>
)
}
```

---

### 2. `src/components/admin/customers/CustomerCard.tsx`

**Card pour afficher un client dans une grille**

typescript

```typescript
'use client'

importLinkfrom'next/link'
import{Badge}from'@/components/ui/badge'

typeProps={
  customer:{
    id:string
    first_name:string|null
    last_name:string|null
    email:string
    role:string
    avatar_url:string|null
    order_count:number
    total_revenue:number
    created_at:string
}
}

exportfunctionCustomerCard({ customer }:Props){
const displayName =
    customer.first_name&& customer.last_name
?`${customer.first_name}${customer.last_name}`
: customer.email

return(
<Link
      href={`/admin/customers/${customer.id}`}
      className="block border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 hover:border-violet transition-colors"
>
<div className="flex items-start gap-3">
{/* Avatar */}
<div className="flex-shrink-0">
{customer.avatar_url?(
<img
              src={customer.avatar_url}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
/>
):(
<div className="w-12 h-12 rounded-full bg-violet/10 flex items-center justify-center text-violet font-semibold">
{displayName.charAt(0).toUpperCase()}
</div>
)}
</div>

{/* Infos */}
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1">
<h3 className="font-medium truncate">{displayName}</h3>
<Badge variant={customer.role==='admin'?'default':'secondary'}>
{customer.role==='admin'?'👨‍💼':'👤'}
</Badge>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
{customer.email}
</p>

{/* Stats */}
<div className="grid grid-cols-2 gap-2 text-sm">
<div>
<span className="text-gray-500 dark:text-gray-400">Commandes:</span>
<span className="ml-1 font-medium">{customer.order_count}</span>
</div>
<div>
<span className="text-gray-500 dark:text-gray-400">CA:</span>
<span className="ml-1 font-medium text-green-600 dark:text-green-400">
{customer.total_revenue.toFixed(0)}€
</span>
</div>
</div>
</div>
</div>
</Link>
)
}
```

---

### 3. `src/components/admin/customers/QuickActions.tsx`

**Menu d'actions rapides sur un client**

typescript

```typescript
'use client'

import{ useState }from'react'
import{ useRouter }from'next/navigation'
import{ useToast }from'@/components/admin/Toast'

typeProps={
  customerId:string
  customerEmail:string
  currentRole:string
}

exportfunctionQuickActions({ customerId, customerEmail, currentRole }:Props){
const router =useRouter()
const{ showToast }=useToast()
const[isOpen, setIsOpen]=useState(false)

asyncfunctionhandleToggleRole(){
const newRole = currentRole ==='admin'?'customer':'admin'
const confirm =window.confirm(
`Changer le rôle en "${newRole ==='admin'?'Administrateur':'Client'}" ?`
)
if(!confirm)return

try{
const res =awaitfetch(`/api/admin/customers/${customerId}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ role: newRole }),
})

if(!res.ok)thrownewError('Erreur')

showToast(`Rôle changé en ${newRole}`,'success')
      router.refresh()
}catch(error){
showToast('Erreur lors du changement de rôle','error')
}
}

functionhandleSendEmail(){
window.location.href=`mailto:${customerEmail}`
}

asyncfunctionhandleResetPassword(){
const confirm =window.confirm(
`Envoyer un email de réinitialisation de mot de passe à ${customerEmail} ?`
)
if(!confirm)return

try{
// Appeler l'API Supabase pour reset password
const res =awaitfetch('/api/auth/reset-password',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ email: customerEmail }),
})

if(!res.ok)thrownewError('Erreur')

showToast('Email de réinitialisation envoyé','success')
}catch(error){
showToast('Erreur lors de l\'envoi','error')
}
}

return(
<div className="relative">
<button
        onClick={()=>setIsOpen(!isOpen)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
>
        ⋮
</button>

{isOpen &&(
<>
{/* Overlay pour fermer */}
<div
            className="fixed inset-0 z-10"
            onClick={()=>setIsOpen(false)}
/>

{/* Menu */}
<div className="absolute right-0 top-full mt-1 w-56 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-20 overflow-hidden">
<button
              onClick={handleSendEmail}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
>
              📧 Envoyer un email
</button>
<button
              onClick={handleToggleRole}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
>
{currentRole ==='admin'?'👤 Rétrograder client':'👨‍💼 Promouvoir admin'}
</button>
<button
              onClick={handleResetPassword}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
>
              🔑 Réinitialiser mot de passe
</button>
<div className="border-t border-gray-200 dark:border-gray-700"/>
<button
              onClick={()=>{
if(confirm('Bloquer ce compte ?')){
// TODO: implémenter le blocage
showToast('Fonctionnalité à venir','error')
}
}}
              className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600 dark:text-red-400"
>
              🚫 Bloquer le compte
</button>
</div>
</>
)}
</div>
)
}
```

---

## 🔍 Filtres avancés

### `src/app/admin/customers/CustomersFilter.tsx`

**Composant de filtres avec date range**

typescript

```typescript
'use client'

import{ useState }from'react'
import{ useRouter, useSearchParams }from'next/navigation'

exportfunctionCustomersFilter(){
const router =useRouter()
const searchParams =useSearchParams()

const[filters, setFilters]=useState({
    role: searchParams.get('role')||'all',
    dateFrom: searchParams.get('dateFrom')||'',
    dateTo: searchParams.get('dateTo')||'',
    minOrders: searchParams.get('minOrders')||'',
    minRevenue: searchParams.get('minRevenue')||'',
})

functionhandleApplyFilters(){
const params =newURLSearchParams(searchParams.toString())

// Rôle
if(filters.role!=='all'){
      params.set('role', filters.role)
}else{
      params.delete('role')
}

// Dates
if(filters.dateFrom) params.set('dateFrom', filters.dateFrom)
else params.delete('dateFrom')

if(filters.dateTo) params.set('dateTo', filters.dateTo)
else params.delete('dateTo')

// Min commandes
if(filters.minOrders) params.set('minOrders', filters.minOrders)
else params.delete('minOrders')

// Min CA
if(filters.minRevenue) params.set('minRevenue', filters.minRevenue)
else params.delete('minRevenue')

    router.push(`/admin/customers?${params.toString()}`)
}

functionhandleReset(){
setFilters({
      role:'all',
      dateFrom:'',
      dateTo:'',
      minOrders:'',
      minRevenue:'',
})
    router.push('/admin/customers')
}

return(
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
<h3 className="font-medium mb-3">Filtres avancés</h3>

<div className="grid md:grid-cols-3 gap-3">
{/* Rôle */}
<div>
<label className="block text-sm font-medium mb-1">Rôle</label>
<select
            value={filters.role}
            onChange={(e)=>setFilters({...filters, role: e.target.value})}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
>
<option value="all">Tous</option>
<option value="customer">Clients</option>
<option value="admin">Admins</option>
</select>
</div>

{/* Date d'inscription (de) */}
<div>
<label className="block text-sm font-medium mb-1">Inscrit après le</label>
<input
            type="date"
            value={filters.dateFrom}
            onChange={(e)=>setFilters({...filters, dateFrom: e.target.value})}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
</div>

{/* Date d'inscription (à) */}
<div>
<label className="block text-sm font-medium mb-1">Inscrit avant le</label>
<input
            type="date"
            value={filters.dateTo}
            onChange={(e)=>setFilters({...filters, dateTo: e.target.value})}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
</div>

{/* Min commandes */}
<div>
<label className="block text-sm font-medium mb-1">Min.commandes</label>
<input
            type="number"
            min="0"
            placeholder="Ex: 5"
            value={filters.minOrders}
            onChange={(e)=>setFilters({...filters, minOrders: e.target.value})}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
</div>

{/* Min CA */}
<div>
<label className="block text-sm font-medium mb-1">Min.CA(€)</label>
<input
            type="number"
            min="0"
            placeholder="Ex: 500"
            value={filters.minRevenue}
            onChange={(e)=>setFilters({...filters, minRevenue: e.target.value})}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2"
/>
</div>

{/* Boutons */}
<div className="flex items-end gap-2">
<button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 transition-colors"
>
Appliquer
</button>
<button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
>
Réinitialiser
</button>
</div>
</div>
</div>
)
}
```

---

## 📤 Export CSV

### `src/app/api/admin/customers/export/route.ts`

**Export CSV de tous les clients**

typescript

```typescript
import{NextResponse}from'next/server'
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{ requireAdmin }from'@/lib/auth/requireAdmin'

exportasyncfunctionGET(req:Request){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

// Récupérer tous les clients
const{ data: profiles }=await supabaseAdmin
.from('profiles')
.select('*')
.order('created_at',{ ascending:false})

if(!profiles){
returnNextResponse.json({ error:'Aucun client'},{ status:404})
}

// Récupérer les emails
const{ data: authUsers }=await supabaseAdmin.auth.admin.listUsers()
const emailMap =newMap(authUsers.users.map((u)=>[u.id, u.email]))

// Récupérer les stats de commandes
const userIds = profiles.map((p)=> p.id)
const{ data: orders }=await supabaseAdmin
.from('orders')
.select('user_id, total_amount')
.in('user_id', userIds)
.in('status',['paid','processing','shipped','delivered'])

const statsMap =newMap<string,{ orderCount:number; totalRevenue:number}>()
  orders?.forEach((order)=>{
const current = statsMap.get(order.user_id)||{ orderCount:0, totalRevenue:0}
    statsMap.set(order.user_id,{
      orderCount: current.orderCount+1,
      totalRevenue: current.totalRevenue+Number(order.total_amount),
})
})

// Générer le CSV
const headers =[
'ID',
'Prénom',
'Nom',
'Email',
'Téléphone',
'Rôle',
'Date d\'inscription',
'Nb commandes',
'CA total (€)',
]

const rows = profiles.map((p)=>{
const stats = statsMap.get(p.id)||{ orderCount:0, totalRevenue:0}
return[
      p.id,
      p.first_name||'',
      p.last_name||'',
      emailMap.get(p.id)||'',
      p.phone||'',
      p.role,
newDate(p.created_at).toLocaleDateString('fr-FR'),
      stats.orderCount,
      stats.totalRevenue.toFixed(2),
]
})

const csv =[
    headers.join(','),
...rows.map((row)=>
      row.map((cell)=>`"${String(cell).replace(/"/g,'""')}"`).join(',')
),
].join('\n')

// Retourner le CSV
returnnewNextResponse(csv,{
    headers:{
'Content-Type':'text/csv; charset=utf-8',
'Content-Disposition':`attachment; filename="clients-${newDate().toISOString().split('T')[0]}.csv"`,
},
})
}
```

**Bouton d'export dans la page liste :**

typescript

```typescript
// Dans CustomersClient.tsx, ajouter :

  href="/api/admin/customers/export"
  download
  className="px-4 py-2 border border-violet text-violet rounded hover:bg-violet hover:text-white transition-colors"
>
  📥 ExporterCSV
</a>
```

---

## 🎨 Vue grille alternative

### `src/app/admin/customers/CustomersGrid.tsx`

**Affichage en grille avec cards**

typescript

```typescript
'use client'

import{CustomerCard}from'@/components/admin/customers/CustomerCard'

typeCustomer={
  id:string
  first_name:string|null
  last_name:string|null
  email:string
  role:string
  avatar_url:string|null
  order_count:number
  total_revenue:number
  created_at:string
}

typeProps={
  customers:Customer[]
}

exportfunctionCustomersGrid({ customers }:Props){
if(customers.length===0){
return(
<div className="text-center py-12 text-gray-500 dark:text-gray-400">
Aucun client trouvé
</div>
)
}

return(
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{customers.map((customer)=>(
<CustomerCard key={customer.id} customer={customer}/>
))}
</div>
)
}
```

**Toggle table/grid dans CustomersClient.tsx :**

typescript

```typescript
const[viewMode, setViewMode]=useState<'table'|'grid'>('table')

// Boutons de switch
<div className="flex gap-2">
<button
    onClick={()=>setViewMode('table')}
    className={`px-3 py-1 rounded ${
      viewMode ==='table'
?'bg-violet text-white'
:'border border-gray-300 dark:border-gray-600'
}`}
>
    📋 Table
</button>
<button
    onClick={()=>setViewMode('grid')}
    className={`px-3 py-1 rounded ${
      viewMode ==='grid'
?'bg-violet text-white'
:'border border-gray-300 dark:border-gray-600'
}`}
>
    🔲 Grille
</button>
</div>

// Affichage conditionnel
{viewMode ==='table'?(
<CustomersTable customers={initialCustomers}/>
):(
<CustomersGrid customers={initialCustomers}/>
)}
```

---

## 📧 Intégration email (Resend)

### `src/lib/email.ts`

**Service d'envoi d'emails**

typescript

```typescript
import{Resend}from'resend'

const resend =newResend(process.env.RESEND_API_KEY)

exportasyncfunctionsendCustomerEmail({
  to,
  subject,
  html,
from='noreply@votresite.com',
}:{
  to:string
  subject:string
  html:string
from?:string
}){
try{
const{ data, error }=await resend.emails.send({
from,
      to,
      subject,
      html,
})

if(error){
console.error('Erreur envoi email:', error)
return{ ok:false, error }
}

return{ ok:true, data }
}catch(error){
console.error('Erreur envoi email:', error)
return{ ok:false, error }
}
}
```

### `src/app/api/admin/customers/[id]/send-email/route.ts`

**Endpoint pour envoyer un email**

typescript

```typescript
import{NextResponse}from'next/server'
import{ requireAdmin }from'@/lib/auth/requireAdmin'
import{ sendCustomerEmail }from'@/lib/email'
import{ z }from'zod'

const emailSchema = z.object({
  subject: z.string().min(1,'Sujet requis'),
  message: z.string().min(1,'Message requis'),
})

exportasyncfunctionPOST(
  req:Request,
{ params }:{ params:Promise<{ id:string}>}
){
const auth =awaitrequireAdmin()
if(!auth.ok){
returnNextResponse.json({ error: auth.message},{ status: auth.status})
}

const{ id }=await params
const body =await req.json()

const parsed = emailSchema.safeParse(body)
if(!parsed.success){
returnNextResponse.json({ error: parsed.error.flatten()},{ status:400})
}

// Récupérer l'email du client
const{ data: authUser }=await supabaseAdmin.auth.admin.getUserById(id)
if(!authUser.user?.email){
returnNextResponse.json({ error:'Email introuvable'},{ status:404})
}

// Envoyer l'email
const result =awaitsendCustomerEmail({
    to: authUser.user.email,
    subject: parsed.data.subject,
    html:`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${parsed.data.subject}</h2>
        <div style="white-space: pre-wrap;">${parsed.data.message}</div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Cet email a été envoyé depuis l'administration de votre boutique.
        </p>
      </div>
`,
})

if(!result.ok){
returnNextResponse.json({ error:'Erreur envoi email'},{ status:500})
}

returnNextResponse.json({ ok:true})
}
```

---

## 🧪 Tests recommandés

### Tests unitaires (Vitest)

typescript

```typescript
// tests/admin/customers.test.ts
import { describe, it, expect } from 'vitest'
import { customerUpdateSchema } from '@/lib/validation/adminCustomers'

describe('Customer validation', () => {
  it('should validate correct customer update', () => {
    const data = {
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '+33612345678',
      role: 'customer',
    }
    const result = customerUpdateSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid role', () => {
    const data = {
      role: 'super_admin', // invalide
    }
    const result = customerUpdateSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
```

### Tests E2E (Playwright)

typescript

```typescript
// tests/e2e/admin-customers.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin - Gestion clients', () => {
  test.beforeEach(async ({ page }) => {
    // Login en tant qu'admin
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('should display customers list', async ({ page }) => {
    await page.goto('/admin/customers')
    awaitexpect(page.locator('h1')).toContainText('Clients')
    awaitexpect(page.locator('table tbody tr')).toHaveCount.toBeGreaterThan(0)
  })

  test('should filter by role', async ({ page }) => {
    await page.goto('/admin/customers')
    await page.selectOption('select[name="role"]', 'admin')
    awaitexpect(page).toHaveURL(/role=admin/)
  })

  test('should edit customer profile', async ({ page }) => {
    await page.goto('/admin/customers')
    await page.click('table tbody tr:first-child a')

    await page.click('button:has-text("Modifier")')
    await page.fill('[name="first_name"]', 'Jean Updated')
    await page.click('button:has-text("Sauver")')

    awaitexpect(page.locator('h1')).toContainText('Jean Updated')
  })
})
```

---

## 📱 Responsive Design

### Breakpoints recommandés

css

```css
/* Mobile first */
-Base:0-640px(mobile)
-sm:640px+ (petite tablette)
-md:768px+ (tablette)
-lg:1024px+ (desktop)
-xl:1280px+ (large desktop)
```

### Exemple de table responsive

typescript

```typescript
// CustomersClient.tsx - version mobile
<div className="md:hidden space-y-3">
{initialCustomers.map((customer)=>(
<div
      key={customer.id}
      className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
>
<div className="flex items-center justify-between mb-2">
<h3 className="font-medium">
{customer.first_name}{customer.last_name}
</h3>
<Badge variant={customer.role==='admin'?'default':'secondary'}>
{customer.role}
</Badge>
</div>
<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
{customer.email}
</p>
<div className="flex justify-between text-sm">
<span>{customer.order_count} commandes
```

Réessayer

TR

Continuer

Modifier

typescript

```typescript
<span>{customer.order_count} commandes</span>
<span className="font-medium text-green-600 dark:text-green-400">
{customer.total_revenue.toFixed(2)}€
</span>
</div>
<Link
        href={`/admin/customers/${customer.id}`}
        className="block mt-3 text-center px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 transition-colors text-sm"
>
Voir le détail
</Link>
</div>
))}
</div>

{/* Table desktop */}
<div className="hidden md:block">
{/* Table existante */}
</div>
```

---

## 🔔 Notifications & Alertes

### `src/components/admin/customers/CustomerAlerts.tsx`

**Système d'alertes pour les clients**

typescript

```typescript
'use client'

import{Badge}from'@/components/ui/badge'

typeAlert={
  id:string
  type:'warning'|'info'|'success'
  message:string
}

typeProps={
  customer:{
    id:string
    order_count:number
    total_revenue:number
    created_at:string
    last_login?:string
}
}

exportfunctionCustomerAlerts({ customer }:Props){
const alerts:Alert[]=[]

// Client VIP (plus de 1000€ de CA)
if(customer.total_revenue>1000){
    alerts.push({
      id:'vip',
      type:'success',
      message:'⭐ Client VIP - CA supérieur à 1000€',
})
}

// Nouveau client (moins de 7 jours)
const daysSinceSignup =Math.floor(
(Date.now()-newDate(customer.created_at).getTime())/(1000*60*60*24)
)
if(daysSinceSignup <7){
    alerts.push({
      id:'new',
      type:'info',
      message:`🆕 Nouveau client (inscrit il y a ${daysSinceSignup} jours)`,
})
}

// Client inactif (pas de commande depuis 90 jours)
if(customer.last_login){
const daysSinceLogin =Math.floor(
(Date.now()-newDate(customer.last_login).getTime())/(1000*60*60*24)
)
if(daysSinceLogin >90){
      alerts.push({
        id:'inactive',
        type:'warning',
        message:`⚠️ Client inactif depuis ${daysSinceLogin} jours`,
})
}
}

// Client sans commande
if(customer.order_count===0&& daysSinceSignup >7){
    alerts.push({
      id:'no-orders',
      type:'warning',
      message:'⚠️ Aucune commande passée',
})
}

if(alerts.length===0)returnnull

return(
<div className="space-y-2 mb-4">
{alerts.map((alert)=>(
<div
          key={alert.id}
          className={`px-4 py-2 rounded-lg text-sm ${
            alert.type==='success'
?'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
: alert.type==='warning'
?'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800'
:'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
}`}
>
{alert.message}
</div>
))}
</div>
)
}
```

---

## 📊 Dashboard Analytics

### `src/app/admin/customers/analytics/page.tsx`

**Page d'analytics clients**

typescript

```typescript
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{CustomerAnalytics}from'./CustomerAnalytics'

exportconst dynamic ='force-dynamic'

exportdefaultasyncfunctionCustomersAnalyticsPage(){
// Récupérer les données pour les graphiques
const[customersData, ordersData]=awaitPromise.all([
    supabaseAdmin.from('profiles').select('created_at, role'),
    supabaseAdmin
.from('orders')
.select('created_at, total_amount, user_id')
.in('status',['paid','processing','shipped','delivered']),
])

// Analyser les inscriptions par mois
const signupsByMonth =newMap<string,number>()
  customersData.data?.forEach((c)=>{
const month =newDate(c.created_at).toISOString().slice(0,7)
    signupsByMonth.set(month,(signupsByMonth.get(month)||0)+1)
})

// Analyser le CA par cohorte
const cohortRevenue =newMap<string,{ revenue:number; customers:Set<string>}>()
  ordersData.data?.forEach((o)=>{
const month =newDate(o.created_at).toISOString().slice(0,7)
const current = cohortRevenue.get(month)||{ revenue:0, customers:newSet()}
    current.revenue+=Number(o.total_amount)
    current.customers.add(o.user_id!)
    cohortRevenue.set(month, current)
})

const analyticsData ={
    signupsByMonth:Array.from(signupsByMonth.entries()).map(([month, count])=>({
      month,
      count,
})),
    cohortRevenue:Array.from(cohortRevenue.entries()).map(([month, data])=>({
      month,
      revenue: data.revenue,
      customerCount: data.customers.size,
      averageRevenue: data.revenue/ data.customers.size,
})),
}

return<CustomerAnalytics data={analyticsData}/>
}
```

### `src/app/admin/customers/analytics/CustomerAnalytics.tsx`

typescript

```typescript
'use client'

import{Bar,Line}from'react-chartjs-2'
import{
ChartasChartJS,
CategoryScale,
LinearScale,
BarElement,
PointElement,
LineElement,
Title,
Tooltip,
Legend,
}from'chart.js'

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
PointElement,
LineElement,
Title,
Tooltip,
Legend
)

typeProps={
  data:{
    signupsByMonth:Array<{ month:string; count:number}>
    cohortRevenue:Array<{
      month:string
      revenue:number
      customerCount:number
      averageRevenue:number
}>
}
}

exportfunctionCustomerAnalytics({ data }:Props){
const signupsChartData ={
    labels: data.signupsByMonth.map((d)=> d.month),
    datasets:[
{
        label:'Nouvelles inscriptions',
        data: data.signupsByMonth.map((d)=> d.count),
        backgroundColor:'rgba(124, 58, 237, 0.5)',
        borderColor:'rgb(124, 58, 237)',
        borderWidth:1,
},
],
}

const revenueChartData ={
    labels: data.cohortRevenue.map((d)=> d.month),
    datasets:[
{
        label:'CA par cohorte (€)',
        data: data.cohortRevenue.map((d)=> d.revenue),
        borderColor:'rgb(34, 197, 94)',
        backgroundColor:'rgba(34, 197, 94, 0.1)',
        tension:0.3,
        yAxisID:'y',
},
{
        label:'CA moyen par client (€)',
        data: data.cohortRevenue.map((d)=> d.averageRevenue),
        borderColor:'rgb(59, 130, 246)',
        backgroundColor:'rgba(59, 130, 246, 0.1)',
        tension:0.3,
        yAxisID:'y1',
},
],
}

return(
<div className="space-y-6">
<h1 className="text-2xl font-semibold">Analytics clients</h1>

<div className="grid md:grid-cols-2 gap-6">
{/* Inscriptions par mois */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
<h2 className="text-lg font-medium mb-4">Nouvelles inscriptions</h2>
<Bar
            data={signupsChartData}
            options={{
              responsive:true,
              plugins:{
                legend:{ display:false},
},
}}
/>
</div>

{/* CA par cohorte */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
<h2 className="text-lg font-medium mb-4">CA par cohorte</h2>
<Line
            data={revenueChartData}
            options={{
              responsive:true,
              interaction:{
                mode:'index',
                intersect:false,
},
              scales:{
                y:{
                  type:'linear',
                  display:true,
                  position:'left',
                  title:{ display:true, text:'CA total (€)'},
},
                y1:{
                  type:'linear',
                  display:true,
                  position:'right',
                  title:{ display:true, text:'CA moyen (€)'},
                  grid:{ drawOnChartArea:false},
},
},
}}
/>
</div>
</div>

{/* Tableau récapitulatif */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
<table className="w-full text-sm">
<thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600">
<tr>
<th className="text-left py-3 px-4 font-medium">Mois</th>
<th className="text-left py-3 px-4 font-medium">Inscriptions</th>
<th className="text-left py-3 px-4 font-medium">Clients actifs</th>
<th className="text-left py-3 px-4 font-medium">CA total</th>
<th className="text-left py-3 px-4 font-medium">CA moyen/client</th>
</tr>
</thead>
<tbody>
{data.cohortRevenue.map((cohort, idx)=>{
const signup = data.signupsByMonth.find((s)=> s.month=== cohort.month)
return(
<tr
                  key={cohort.month}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0"
>
<td className="py-3 px-4">{cohort.month}</td>
<td className="py-3 px-4">{signup?.count ||0}</td>
<td className="py-3 px-4">{cohort.customerCount}</td>
<td className="py-3 px-4">{cohort.revenue.toFixed(2)}€</td>
<td className="py-3 px-4">{cohort.averageRevenue.toFixed(2)}€</td>
</tr>
)
})}
</tbody>
</table>
</div>
</div>
)
}
```

---

## 🎯 Segmentation clients

### `src/app/admin/customers/segments/page.tsx`

**Créer des segments de clients**

typescript

```typescript
import{ supabaseAdmin }from'@/lib/supabase-admin'
import{CustomerSegments}from'./CustomerSegments'

exportconst dynamic ='force-dynamic'

exportdefaultasyncfunctionCustomerSegmentsPage(){
// Définir les segments
const segments =[
{
      id:'vip',
      name:'VIP',
      description:'CA > 1000€',
      color:'gold',
      query:{ min_revenue:1000},
},
{
      id:'active',
      name:'Actifs',
      description:'3+ commandes',
      color:'green',
      query:{ min_orders:3},
},
{
      id:'new',
      name:'Nouveaux',
      description:'Inscrits < 30j, 0 commande',
      color:'blue',
      query:{ max_days_since_signup:30, max_orders:0},
},
{
      id:'inactive',
      name:'Inactifs',
      description:'Pas de commande depuis 90j',
      color:'orange',
      query:{ min_days_since_order:90},
},
]

// Compter les clients par segment
const segmentCounts =awaitPromise.all(
    segments.map(async(segment)=>{
// TODO: Implémenter la logique de requête basée sur segment.query
// Pour l'instant, on retourne des données mock
return{
...segment,
        count:Math.floor(Math.random()*100),
}
})
)

return<CustomerSegments segments={segmentCounts}/>
}
```

### `src/app/admin/customers/segments/CustomerSegments.tsx`

typescript

```typescript
'use client'

importLinkfrom'next/link'

typeSegment={
  id:string
  name:string
  description:string
  color:string
  count:number
}

typeProps={
  segments:Segment[]
}

exportfunctionCustomerSegments({ segments }:Props){
const colorClasses:Record<string,string>={
    gold:'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800',
    green:
'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-800',
    blue:'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800',
    orange:
'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-800',
}

return(
<div className="space-y-6">
<h1 className="text-2xl font-semibold">Segments de clients</h1>

<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
{segments.map((segment)=>(
<Link
            key={segment.id}
            href={`/admin/customers?segment=${segment.id}`}
            className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
              colorClasses[segment.color]
}`}
>
<div className="text-3xl font-bold mb-2">{segment.count}</div>
<div className="font-medium mb-1">{segment.name}</div>
<div className="text-sm opacity-80">{segment.description}</div>
</Link>
))}
</div>

{/* Actions par segment */}
<div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
<h2 className="text-lg font-medium mb-4">Actions recommandées</h2>
<div className="space-y-3">
<div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
<span className="text-2xl">💌</span>
<div>
<div className="font-medium">Nouveaux clients sans achat</div>
<p className="text-sm text-gray-600 dark:text-gray-400">
Envoyez un code promo de bienvenue(-10%)
</p>
<button className="mt-2 text-sm text-violet hover:underline">
                → Créer la campagne
</button>
</div>
</div>

<div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
<span className="text-2xl">🔔</span>
<div>
<div className="font-medium">Clients inactifs</div>
<p className="text-sm text-gray-600 dark:text-gray-400">
Relancez-les avec une offre personnalisée
</p>
<button className="mt-2 text-sm text-violet hover:underline">
                → Voir les clients
</button>
</div>
</div>

<div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
<span className="text-2xl">⭐</span>
<div>
<div className="font-medium">ClientsVIP</div>
<p className="text-sm text-gray-600 dark:text-gray-400">
Remerciez-les avec un cadeau exclusif
</p>
<button className="mt-2 text-sm text-violet hover:underline">
                → Programme fidélité
</button>
</div>
</div>
</div>
</div>
</div>
)
}
```

---

## 🔐 Gestion des permissions avancée

### `src/lib/rbac.ts`

**Role-Based Access Control**

typescript

```typescript
exporttypePermission=
|'customers:read'
|'customers:write'
|'customers:delete'
|'customers:export'
|'customers:send_email'

exporttypeRole='admin'|'manager'|'support'|'customer'

const rolePermissions:Record<Role,Permission[]>={
  admin:[
'customers:read',
'customers:write',
'customers:delete',
'customers:export',
'customers:send_email',
],
  manager:[
'customers:read',
'customers:write',
'customers:export',
'customers:send_email',
],
  support:['customers:read','customers:send_email'],
  customer:[],
}

exportfunctionhasPermission(role:Role, permission:Permission):boolean{
return rolePermissions[role]?.includes(permission)??false
}

exportfunctionhasAnyPermission(role:Role, permissions:Permission[]):boolean{
return permissions.some((p)=>hasPermission(role, p))
}

exportfunctionhasAllPermissions(role:Role, permissions:Permission[]):boolean{
return permissions.every((p)=>hasPermission(role, p))
}
```

### Utilisation dans les composants

typescript

```typescript
'use client'

import{ hasPermission }from'@/lib/rbac'

exportfunctionCustomerActions({ userRole, customerId }:Props){
const canEdit =hasPermission(userRole,'customers:write')
const canDelete =hasPermission(userRole,'customers:delete')
const canExport =hasPermission(userRole,'customers:export')

return(
<div className="flex gap-2">
{canEdit &&(
<button onClick={()=>editCustomer(customerId)}>Modifier</button>
)}
{canDelete &&(
<button onClick={()=>deleteCustomer(customerId)}>Supprimer</button>
)}
{canExport &&(
<button onClick={()=>exportCustomer(customerId)}>Exporter</button>
)}
</div>
)
}
```

---

## 📱 Notifications Push (optionnel)

### `src/lib/notifications.ts`

**Service de notifications**

typescript

```typescript
exportasyncfunctionsendNotification({
  userId,
  title,
  message,
  type ='info',
  link,
}:{
  userId:string
  title:string
  message:string
  type?:'info'|'success'|'warning'|'error'
  link?:string
}){
// Créer une notification en DB
const{ error }=await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    link,
    read:false,
})

if(error){
console.error('Erreur création notification:', error)
return{ ok:false, error }
}

// Optionnel: envoyer via push notification, websocket, etc.

return{ ok:true}
}
```

### Table notifications

sql

```sql
CREATETABLEpublic.notifications (
  id uuid PRIMARYKEYDEFAULT gen_random_uuid(),
  user_id uuid NOTNULLREFERENCES auth.users(id)ONDELETECASCADE,
  title varcharNOTNULL,
  message textNOTNULL,
typevarcharDEFAULT'info'CHECK(typeIN('info','success','warning','error')),
  link varchar,
readbooleanDEFAULTfalse,
  created_at timestamptz NOTNULLDEFAULTnow()
);

CREATEINDEX idx_notifications_user_id ONpublic.notifications(user_id);
CREATEINDEX idx_notifications_read ONpublic.notifications(read);
CREATEINDEX idx_notifications_created_at ONpublic.notifications(created_at DESC);
```

---

## 📝 Documentation utilisateur

### Guide d'utilisation pour les admins

**À créer dans `/docs/admin-customers.md`**

markdown

```markdown
# Guide de gestion des clients

## Accès au module

1. Connectez-vous en tant qu'administrateur
2. Cliquez sur "Clients" dans le menu de navigation

## Fonctionnalités principales

### Consulter la liste des clients

- Vue tableau ou grille
- Recherche par nom ou email
- Filtres : rôle, date d'inscription, CA minimum
- Tri par date, nom, nombre de commandes, CA

### Voir le détail d'un client

Cliquez sur un client pour accéder à :

- Informations personnelles
- Statistiques (commandes, CA, panier moyen)
- Historique des commandes
- Adresses enregistrées
- Notes administrateur

### Modifier un client

1. Cliquez sur "Modifier" en haut à droite
2. Modifiez les champs souhaités
3. Cliquez sur "Sauver"

⚠️ Le changement de rôle (customer ↔ admin) nécessite confirmation

### Ajouter une note

Les notes sont visibles uniquement par les administrateurs.
Utile pour :

- Suivi client personnalisé
- Problèmes résolus
- Accords commerciaux

### Exporter les données

Cliquez sur "Exporter CSV" pour télécharger la liste complète des clients.

## Bonnes pratiques

- ✅ Ajoutez des notes pour garder un historique des interactions
- ✅ Segmentez vos clients pour des actions marketing ciblées
- ✅ Surveillez les clients inactifs et relancez-les
- ✅ Remerciez vos clients VIP
- ❌ Ne changez jamais un rôle sans confirmation
- ❌ N'exportez pas les données clients sans raison valable (RGPD)
```

---

## 🚀 Déploiement

### Variables d'environnement nécessaires

bash

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (optionnel)
RESEND_API_KEY=your_resend_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Checklist de déploiement

```
□ Exécuter toutes les migrations SQL
□ Vérifier les permissions RLS sur customer_notes
□ Tester l'accès admin vs customer
□ Vérifier que les emails fonctionnent
□ Tester l'export CSV
□ Vérifier les performances sur une grande base (1000+ clients)
□ Configurer les index pour les requêtes fréquentes
□ Activer la compression des images d'avatar
□ Configurer le cache pour les stats
```

---

## 📊 Monitoring & Performance

### Requêtes à optimiser

sql

```sql
-- Index recommandés pour les performances

-- Pour la recherche de clients
CREATEINDEX idx_profiles_search ON profiles
USING gin(to_tsvector('french', first_name ||' '|| last_name));

-- Pour les stats de commandes
CREATEINDEX idx_orders_user_status ON orders(user_id,status)
WHEREstatusIN('paid','processing','shipped','delivered');

-- Pour les filtres par date
CREATEINDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATEINDEX idx_orders_created_at ON orders(created_at DESC);
```

### Caching recommandé

typescript

```typescript
// src/lib/cache.ts
import{ unstable_cache }from'next/cache'

exportconst getCachedCustomerStats =unstable_cache(
async()=>{
const res =awaitfetch('/api/admin/customers/stats')
return res.json()
},
['customer-stats'],
{
    revalidate:300,// 5 minutes
    tags:['customers'],
}
)
```

---

## ✅ Checklist finale complète

### Backend ✓

```
□ lib/validation/adminCustomers.ts
□ lib/auth/requireAdmin.ts
□ lib/rbac.ts (optionnel)
□ lib/email.ts (optionnel)
□ api/admin/customers/route.ts
□ api/admin/customers/stats/route.ts
□ api/admin/customers/export/route.ts
□ api/admin/customers/[id]/route.ts
□ api/admin/customers/[id]/orders/route.ts
□ api/admin/customers/[id]/addresses/route.ts
□ api/admin/customers/[id]/notes/route.ts
□ api/admin/customers/[id]/send-email/route.ts (optionnel)
```

### Frontend ✓

```
□ admin/customers/page.tsx
□ admin/customers/CustomersClient.tsx
□ admin/customers/CustomersFilter.tsx
□ admin/customers/CustomersGrid.tsx (optionnel)
□ admin/customers/[id]/page.tsx
□ admin/customers/[id]/CustomerDetailClient.tsx
□ admin/customers/[id]/actions.ts
□ admin/customers/[id]/tabs/OrdersTab.tsx
□ admin/customers/[id]/tabs/AddressesTab.tsx
□ admin/customers/[id]/tabs/NotesTab.tsx
□ admin/customers/analytics/page.tsx (optionnel)
□ admin/customers/segments/page.tsx (optionnel)
```

### Composants ✓

```
□ components/admin/customers/CustomerCard.tsx
□ components/admin/customers/CustomerStats.tsx (optionnel)
□ components/admin/customers/CustomerAlerts.tsx (optionnel)
□ components/admin/customers/QuickActions.tsx (optionnel)
```

### Base de données ✓

```
□ Migration SQL pour customer_notes
□ Index de performance
□ Policies RLS
□ Triggers updated_at
```

### Navigation & Tests ✓

```
□ Ajouter "Clients" dans AdminNav
□ Tests E2E avec Playwright
□ Tests unitaires Vitest
□ Documentation utilisateur
```

---

## 🎓 Prochaines étapes recommandées

### Court terme (1-2 semaines)

1. Implémenter la Phase 1 (MVP) complète
2. Tester avec des données réelles
3. Collecter les feedbacks des utilisateurs admin

### Moyen terme (1 mois)

4. Ajouter les analytics et segments
5. Implémenter l'envoi d'emails personnalisés
6. Créer les campagnes automatisées

### Long terme (3 mois)

7. Programme de fidélité
8. Machine learning pour prédictions (churn, LTV)
9. Intégration CRM externe

---

**🎉 Vous avez maintenant une documentation complète pour implémenter un module de gestion clients professionnel !**

Besoin d'aide sur une partie spécifique ? Je peux générer le code complet de n'importe quel fichier listé ci-dessus.

Réessayer

[Claude peut faire des erreurs. **Assurez-vous de vérifier ses réponses.**](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)

[ ]

site blanche

Sonnet 4.5
