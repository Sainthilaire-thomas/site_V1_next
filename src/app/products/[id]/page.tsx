"use client";

import { use, useState, useEffect } from "react";
import { mockProducts } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { LazyImage } from "@/components/common/LazyImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const { addItem, totalItems } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      toast.error("Veuillez sélectionner une taille");
      return;
    }

    if (product.colors && !selectedColor) {
      toast.error("Veuillez sélectionner une couleur");
      return;
    }

    // Créer l'item avec la quantité
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      size: selectedSize,
      color: selectedColor,
    };

    // Ajouter avec la quantité séparément
    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }

    // Animation du compteur panier
    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 1000);

    toast.success(`${product.name} ajouté au panier !`);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? "Retiré de la wishlist" : "Ajouté à la wishlist"
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec compteur panier */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-light text-gray-900 hover:text-violet-600 transition-colors"
          >
            .blancherenaudin
          </Link>

          {/* Compteur panier cliquable */}
          <Link href="/cart">
            <Button
              variant="outline"
              size="sm"
              className={`relative border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300 ${
                showCartAnimation ? "scale-110 bg-violet-100" : ""
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Panier
              {totalItems > 0 && (
                <Badge
                  className={`absolute -top-2 -right-2 bg-violet-600 text-white min-w-[20px] h-5 text-xs flex items-center justify-center transition-all duration-300 ${
                    showCartAnimation ? "animate-bounce" : ""
                  }`}
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-violet-600 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-violet-600 transition-colors"
          >
            Produits
          </Link>
          <span>/</span>
          <span className="text-violet-600 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Galerie d'images */}
          <div className="space-y-4">
            <div className="relative group">
              <LazyImage
                src={product.images?.[selectedImageIndex] || "/placeholder.jpg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
              />

              {/* Badge stock */}
              <div className="absolute top-4 right-4">
                <Badge
                  variant={product.inStock ? "default" : "destructive"}
                  className="bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm"
                >
                  {product.inStock ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      En stock
                    </>
                  ) : (
                    "Épuisé"
                  )}
                </Badge>
              </div>

              {/* Actions rapides */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleWishlist}
                  className="bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleShare}
                  className="bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Miniatures */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 relative ${
                      selectedImageIndex === index
                        ? "ring-2 ring-violet-600"
                        : "opacity-70 hover:opacity-100"
                    } rounded-lg overflow-hidden transition-all`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="space-y-8">
            {/* En-tête */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className="border-violet-200 text-violet-700"
                >
                  {product.category}
                </Badge>
                {product.featured && (
                  <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    ⭐ Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-light text-violet-600">
                  {product.price}€
                </span>

                {/* Note fictive */}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="ml-1">(4.8)</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Sélection des options */}
            <div className="space-y-6">
              {/* Tailles */}
              {product.sizes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Taille</h3>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className={
                          selectedSize === size
                            ? "bg-violet-600 hover:bg-violet-700"
                            : "border-gray-300 hover:border-violet-300"
                        }
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Couleurs */}
              {product.colors && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Couleur</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={
                          selectedColor === color ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                        className={
                          selectedColor === color
                            ? "bg-violet-600 hover:bg-violet-700"
                            : "border-gray-300 hover:border-violet-300"
                        }
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Quantité</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="border-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.inStock ? "Ajouter au panier" : "Produit épuisé"}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className="flex-1 border-violet-200 hover:border-violet-300 hover:bg-violet-50"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isWishlisted ? "Retiré" : "Favoris"}
                </Button>

                <Link href="/products" className="flex-1">
                  <Button variant="outline" className="w-full border-gray-300">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>
              </div>
            </div>

            <Separator />

            {/* Avantages */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Services inclus</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-violet-600" />
                  </div>
                  <span>Livraison gratuite dès 75€</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-violet-600" />
                  </div>
                  <span>Retours gratuits sous 30 jours</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-600" />
                  </div>
                  <span>Garantie qualité .blancherenaudin</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section supplémentaire - Détails */}
        <Card className="mt-16 max-w-7xl mx-auto border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Détails du produit
                </h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex justify-between">
                    <span>Catégorie</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  {product.sizes && (
                    <div className="flex justify-between">
                      <span>Tailles disponibles</span>
                      <span className="font-medium">
                        {product.sizes.join(", ")}
                      </span>
                    </div>
                  )}
                  {product.colors && (
                    <div className="flex justify-between">
                      <span>Couleurs disponibles</span>
                      <span className="font-medium">
                        {product.colors.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Référence</span>
                    <span className="font-medium">
                      BR-{product.id.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Composition & Entretien
                </h3>
                <div className="space-y-3 text-gray-600">
                  <p>• Matières premium sélectionnées</p>
                  <p>• Confection artisanale française</p>
                  <p>• Lavage délicat recommandé</p>
                  <p>• Séchage à plat conseillé</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
