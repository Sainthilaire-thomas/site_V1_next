// src/app/account/settings/change-password/ChangePasswordForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ChangePasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    let isValid = true

    // Validation mot de passe actuel
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis'
      isValid = false
    }

    // Validation nouveau mot de passe
    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis'
      isValid = false
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Minimum 8 caractères'
      isValid = false
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent'
      isValid = false
    }

    // Validation confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe'
      isValid = false
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    const toastId = toast.loading('Modification en cours...')

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du changement')
      }

      toast.success('Mot de passe modifié avec succès', { id: toastId })

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      // Redirection après 1 seconde
      setTimeout(() => {
        router.push('/account/settings')
      }, 1000)
    } catch (error: any) {
      console.error('Change password error:', error)
      toast.error(error.message || 'Erreur lors du changement', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }))
      }
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bouton retour */}
      <Link
        href="/account/settings"
        className="inline-flex items-center gap-2 text-[13px] tracking-[0.05em] lowercase text-grey-medium hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Retour aux paramètres
      </Link>

      <div className="border border-grey-light p-6 space-y-6">
        {/* Mot de passe actuel */}
        <div className="space-y-2">
          <label className="text-[11px] tracking-[0.1em] uppercase text-grey-medium">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              disabled={isLoading}
              className={`
                w-full px-4 py-3 text-[15px] bg-white border transition-colors
                ${
                  errors.currentPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-grey-light focus:border-black'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="Entrez votre mot de passe actuel"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-medium hover:text-black"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-[11px] text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        {/* Nouveau mot de passe */}
        <div className="space-y-2">
          <label className="text-[11px] tracking-[0.1em] uppercase text-grey-medium">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              disabled={isLoading}
              className={`
                w-full px-4 py-3 text-[15px] bg-white border transition-colors
                ${
                  errors.newPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-grey-light focus:border-black'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="Minimum 8 caractères"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-medium hover:text-black"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-[11px] text-red-500">{errors.newPassword}</p>
          )}
          <p className="text-[11px] text-grey-medium">
            Le mot de passe doit contenir au moins 8 caractères
          </p>
        </div>

        {/* Confirmation */}
        <div className="space-y-2">
          <label className="text-[11px] tracking-[0.1em] uppercase text-grey-medium">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={isLoading}
              className={`
                w-full px-4 py-3 text-[15px] bg-white border transition-colors
                ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-grey-light focus:border-black'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              placeholder="Retapez le nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-medium hover:text-black"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3">
        <Link
          href="/account/settings"
          className="flex-1 px-6 py-3 text-[13px] tracking-[0.05em] lowercase font-medium text-grey-medium hover:text-black border border-grey-light hover:border-black transition-colors text-center"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 text-[13px] tracking-[0.05em] lowercase font-medium bg-black text-white hover:bg-grey-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Modification...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
