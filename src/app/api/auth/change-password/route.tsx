// src/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase()

    // Vérifier l'authentification
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Validation des données
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Les mots de passe sont requis' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien" },
        { status: 400 }
      )
    }

    // ✅ Étape 1 : Vérifier le mot de passe actuel en tentant de se reconnecter
    if (!user.email) {
      return NextResponse.json(
        { error: 'Email utilisateur non disponible' },
        { status: 400 }
      )
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      console.error('Current password verification failed:', signInError)
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      )
    }

    console.log('✅ Current password verified')

    // ✅ Étape 2 : Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Erreur lors de la mise à jour' },
        { status: 500 }
      )
    }

    console.log('✅ Password updated successfully for user:', user.id)

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    })
  } catch (error: any) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
