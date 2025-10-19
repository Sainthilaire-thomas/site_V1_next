// src/app/api/admin/newsletter/upload-hero/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/admin/newsletter/upload-hero
 * Upload temporaire d'une image hero (avant création campagne)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Vérifier auth admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // 2. Récupérer le fichier
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // 3. Valider le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // 4. Valider la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10MB)' },
        { status: 400 }
      )
    }

    // 5. Générer un nom unique
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `hero_${timestamp}_${randomStr}.${fileExt}`
    const filePath = `newsletter/heroes/${fileName}`

    console.log(`📸 Uploading temporary hero image: ${fileName}`)

    // 6. Convertir File en ArrayBuffer puis Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 7. Upload vers Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('❌ Upload error:', error)
      throw error
    }

    // 8. Générer l'URL publique
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('product-images').getPublicUrl(filePath)

    console.log('✅ Hero image uploaded:', publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      message: 'Image uploadée avec succès',
    })
  } catch (error) {
    console.error('❌ POST /upload-hero error:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    )
  }
}
