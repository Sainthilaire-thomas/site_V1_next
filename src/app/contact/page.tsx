// src/app/contact/page.tsx - Version avec Sanity
'use client'

import { useState, useEffect } from 'react'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import RichTextRenderer from '@/components/common/RichTextRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { sanityClient } from '@/lib/sanity.client'
import { PAGE_QUERY } from '@/lib/queries'

interface PageData {
  _id: string
  title: string
  slug: { current: string }
  content?: any[]
  seo?: {
    title?: string
    description?: string
    image?: any
  }
}

export default function ContactPage() {
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les données Sanity
  useEffect(() => {
    const fetchContactPage = async () => {
      try {
        setIsLoading(true)
        const data = await sanityClient.fetch(PAGE_QUERY, { slug: 'contact' })
        setPageData(data || null)
      } catch (error) {
        console.error('Erreur lors du fetch de la page Contact:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContactPage()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('Message envoyé avec succès !')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader variant="default" showNavigation={true} />

      <main className="pt-6">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              {pageData?.title || 'Contact'}
            </h1>
            {pageData?.seo?.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {pageData.seo.description}
              </p>
            )}
            {!pageData?.seo?.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une question ? Un projet sur mesure ? Notre équipe est à votre
                écoute pour vous accompagner dans vos choix.
              </p>
            )}
          </div>
        </section>

        {/* Contenu personnalisé depuis Sanity */}
        {pageData?.content && (
          <section className="py-12 px-6 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
              <RichTextRenderer
                content={pageData.content}
                className="text-gray-600"
              />
            </div>
          </section>
        )}

        {/* Contact Form & Info */}
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Formulaire */}
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-8">
                  Envoyez-nous un message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Nom *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Sujet *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Objet de votre message"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Votre message..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              </div>

              {/* Informations */}
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-8">
                  Nos coordonnées
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Atelier & Showroom
                    </h3>
                    <p className="text-gray-600">
                      15 rue de la Mode
                      <br />
                      75003 Paris, France
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Horaires</h3>
                    <p className="text-gray-600">
                      Lundi - Vendredi : 10h - 19h
                      <br />
                      Samedi : 10h - 18h
                      <br />
                      Dimanche : Sur rendez-vous
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Contact</h3>
                    <p className="text-gray-600">
                      Tél : +33 1 23 45 67 89
                      <br />
                      Email : hello@blancherenaudin.com
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Sur mesure
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Nous réalisons des pièces sur mesure selon vos envies.
                      Prenez rendez-vous pour une consultation personnalisée.
                    </p>
                    <Button
                      variant="outline"
                      className="border-violet-600 text-violet-600 hover:bg-violet-50"
                    >
                      Prendre rendez-vous
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 px-6 bg-gray-50">
          <div className="container mx-auto text-center">
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">
                Carte interactive de l'atelier
                <br />
                <small>(À intégrer avec Google Maps ou Mapbox)</small>
              </p>
            </div>
          </div>
        </section>

        {/* Message pour l'admin */}
        {!pageData && !isLoading && (
          <section className="py-8 px-6 bg-yellow-50 border-t border-yellow-200">
            <div className="container mx-auto text-center">
              <p className="text-sm text-yellow-800">
                <strong>Admin :</strong> Créez une page "Contact" dans Sanity
                Studio avec le slug "contact" pour personnaliser ce contenu.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
