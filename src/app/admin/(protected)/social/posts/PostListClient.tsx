// src/app/admin/(protected)/social/posts/PostsListClient.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Instagram,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  Edit,
  Plus,
  Search,
} from 'lucide-react'

// ✅ Interface mise à jour pour accepter null
interface Post {
  id: string | null                     // ✅ Accepte null
  post_type: string | null               // ✅ Accepte null
  account_type: string | null            // ✅ Accepte null
  account_handle: string | null
  caption: string | null
  post_url: string | null
  utm_campaign: string | null
  published_at: string | null            // ✅ Accepte null
  
  // Métriques Instagram
  impressions: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  reach: number | null
  engagement_rate: number | null
  
  // Métriques Web
  web_visits: number | null
  web_add_to_cart: number | null
  web_purchases: number | null
  web_revenue: number | null
  web_conversion_rate: number | null
  web_avg_order_value: number | null
  cpm_revenue: number | null
}

interface PostsListClientProps {
  initialPosts: Post[]
}

export function PostsListClient({ initialPosts }: PostsListClientProps) {
  const [posts] = useState<Post[]>(initialPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  // ✅ Helpers pour gérer les null
  const safeString = (value: string | null | undefined): string => value ?? ''
  const safeNumber = (value: number | null | undefined): number => value ?? 0
  const safeDate = (value: string | null | undefined): Date => {
    if (!value) return new Date()
    try {
      return new Date(value)
    } catch {
      return new Date()
    }
  }
  
  // Filtrer les posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = safeString(post.caption)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    
    const matchesAccount = accountFilter === 'all' || post.account_type === accountFilter
    const matchesType = typeFilter === 'all' || post.post_type === typeFilter
    
    return matchesSearch && matchesAccount && matchesType
  })
  
  // Badge pour le type de compte
  const getAccountBadge = (accountType: string | null) => {
    if (accountType === 'pro') {
      return <Badge>Pro</Badge>
    }
    return <Badge variant="secondary">Perso</Badge>
  }
  
  // Badge pour le type de post
  const getTypeBadge = (postType: string | null) => {
    const colors = {
      story: 'bg-purple-100 text-purple-800',
      feed: 'bg-blue-100 text-blue-800',
      reel: 'bg-pink-100 text-pink-800',
      carousel: 'bg-green-100 text-green-800',
    }
    
    const type = safeString(postType) as keyof typeof colors
    const colorClass = colors[type] || 'bg-gray-100 text-gray-800'
    
    return (
      <Badge variant="outline" className={colorClass}>
        {safeString(postType) || 'N/A'}
      </Badge>
    )
  }
  
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Instagram className="h-8 w-8" />
            Posts Instagram
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos publications et suivez leurs performances
          </p>
        </div>
        
        <Button asChild>
          <Link href="/admin/social/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau post
          </Link>
        </Button>
      </div>
      
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les captions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filtre compte */}
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les comptes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                <SelectItem value="pro">Professionnel</SelectItem>
                <SelectItem value="perso">Personnel</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filtre type */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="feed">Post Feed</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredPosts.length} post{filteredPosts.length > 1 ? 's' : ''} trouvé{filteredPosts.length > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>
      
      {/* Liste des posts */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
                <TableHead className="text-right">Visites</TableHead>
                <TableHead className="text-right">CA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Instagram className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchTerm || accountFilter !== 'all' || typeFilter !== 'all'
                          ? 'Aucun post ne correspond aux filtres'
                          : 'Aucun post pour le moment'}
                      </p>
                      {!searchTerm && accountFilter === 'all' && typeFilter === 'all' && (
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link href="/admin/social/posts/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un post
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id || Math.random()}>
                    <TableCell>
                      <div className="space-y-1 max-w-md">
                        <div className="font-medium line-clamp-2">
                          {safeString(post.caption) || 'Sans caption'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {post.published_at && formatDistanceToNow(safeDate(post.published_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getAccountBadge(post.account_type)}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(post.post_type)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {safeNumber(post.impressions).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-1">
                          <Heart className="h-3 w-3 text-muted-foreground" />
                          {safeNumber(post.likes)}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <MessageCircle className="h-3 w-3 text-muted-foreground" />
                          {safeNumber(post.comments)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {safeNumber(post.web_visits)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {safeNumber(post.web_revenue).toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.post_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/social/posts/${post.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
