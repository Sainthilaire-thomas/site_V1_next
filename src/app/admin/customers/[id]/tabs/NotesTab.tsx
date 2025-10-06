'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/admin/Toast'

type Note = {
  id: string
  note: string
  created_at: string
  admin: {
    first_name: string
    last_name: string
  }
}

type Props = {
  customerId: string
  initialNotes: Note[]
}

export function NotesTab({ customerId, initialNotes }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [notes, setNotes] = useState(initialNotes)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      })

      if (!res.ok) throw new Error('Erreur')

      const { note } = await res.json()
      setNotes([note, ...notes])
      setNewNote('')
      showToast('Note ajoutée', 'success')
      router.refresh()
    } catch (error) {
      showToast("Erreur lors de l'ajout", 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddNote} className="space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Ajouter une note administrative (visible uniquement par les admins)..."
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded px-3 py-2 focus:ring-2 focus:ring-violet focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newNote.trim() || isSubmitting}
          className="px-4 py-2 bg-violet text-white rounded hover:bg-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Ajout...' : '+ Ajouter la note'}
        </button>
      </form>

      {/* Liste des notes */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucune note pour ce client
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium">
                  {note.admin.first_name} {note.admin.last_name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(note.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
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
