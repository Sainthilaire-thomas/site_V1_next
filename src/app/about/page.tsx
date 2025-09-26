// src/app/about/page.tsx
"use client";

import Header from "@/components/layout/Header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6">
              À Propos
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              .blancherenaudin est née de la passion pour la mode contemporaine
              et l’artisanat d&rsquo;exception. Chaque pièce est pensée pour
              sublimer la femme moderne.
            </p>
          </div>
        </section>

        {/* Histoire */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-8">
                  Notre Histoire
                </h2>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p>
                    Fondée en 2020, .blancherenaudin puise son inspiration dans
                    l&rsquo;héritage de la haute couture française tout en
                    embrassant une vision résolument contemporaine.
                  </p>
                  <p>
                    Notre atelier parisien perpétue les techniques
                    traditionnelles du savoir-faire français, adaptées aux
                    besoins de la femme d&rsquo;aujourd&rsquo;hui qui recherche
                    l’élégance sans compromis.
                  </p>
                  <p>
                    Chaque création est le fruit d&rsquo;un travail minutieux où
                    se rencontrent innovation et tradition, modernité et
                    intemporalité.
                  </p>
                </div>
              </div>
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=800&fit=crop"
                  alt="Atelier .blancherenaudin"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Philosophie */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-12">
              Notre Philosophie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Savoir-faire",
                  description:
                    "Chaque pièce est confectionnée dans notre atelier parisien par des artisans expérimentés.",
                },
                {
                  title: "Qualité",
                  description:
                    "Nous sélectionnons avec soin les plus belles matières pour garantir durabilité et confort.",
                },
                {
                  title: "Élégance",
                  description:
                    "Nos créations subliment la silhouette féminine avec raffinement et modernité.",
                },
              ].map((item) => (
                <div key={item.title} className="p-8">
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-violet-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Découvrez nos Collections
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Explorez l&rsquo;univers .blancherenaudin et trouvez les pièces
              qui révéleront votre style unique.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center px-8 py-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Voir les Collections
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
