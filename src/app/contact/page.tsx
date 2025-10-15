// src/app/contact/page.tsx
'use client'

import { useState } from 'react'
import HeaderMinimal from '@/components/layout/HeaderMinimal'
import FooterMinimal from '@/components/layout/FooterMinimal'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('message sent successfully')
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
      <HeaderMinimal />

      <main className="pt-32 pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Titre */}
          <h1 className="text-section mb-24 text-right">.contact</h1>

          {/* Grid 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Colonne gauche - Informations */}
            <div className="space-y-16">
              {/* <div>
                <h2 className="text-product mb-3">ATELIER</h2>
                <p className="text-body text-grey-medium">
                  25 boulevard de La Tour Maubourg
                  <br />
                  75007 Paris, France
                </p>
              </div> */}

              {/* <div>
                <h2 className="text-product mb-3">HOURS</h2>
                <p className="text-body text-grey-medium">
                  monday - friday: 10h - 19h
                  <br />
                  saturday: 10h - 18h
                  <br />
                  sunday: by appointment
                </p>
              </div> */}

              <div>
                <h2 className="text-product mb-3">CONTACT</h2>
                <p className="text-body text-grey-medium">
                  <br />
                  <a
                    href="mailto:contact@blancherenaudin.com"
                    className="hover:text-black transition-colors"
                  >
                    contact@blancherenaudin.com
                  </a>
                </p>
              </div>
            </div>

            {/* Colonne droite - Formulaire */}
            <div>
              <h2 className="text-product mb-8">SEND US A MESSAGE</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3"
                    >
                      name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="your name"
                      className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3"
                    >
                      email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3"
                  >
                    subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="message subject"
                    className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-[13px] tracking-[0.05em] font-semibold lowercase text-grey-medium mb-3"
                  >
                    message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="your message..."
                    rows={6}
                    className="w-full border-b border-grey-medium focus:border-black outline-none py-2 text-[13px] tracking-[0.05em] font-semibold lowercase transition-colors bg-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-[13px] tracking-[0.05em] font-semibold lowercase bg-white text-black border border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'sending...' : 'send message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <FooterMinimal />
    </div>
  )
}
