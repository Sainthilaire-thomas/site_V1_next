// src/app/products/[id]/page.tsx - Avec UnifiedHeader
"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCartStore } from "@/store/useCartStore";
import { useProductStore } from "@/store/useProductStore";
import { LazyImage } from "@/components/common/LazyImage";
import UnifiedHeader from "@/components/layout/UnifiedHeader"; // 👈 Import du header unifié

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

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

/* ---------- Types ---------- */

interface Props {
  params: Promise<{ id: string }>;
}

// Ligne brute venant de la table product_variants
type RawPV = {
  id: string;
  product_id: string;
  name: string; // "color" | "size"
  value: string; // "Blanc", "XS", etc.
  stock_quantity: number | null;
  price_modifier: number | null;
  sku: string | null;
  is_active: boolean | null;
};

/* ---------- Helpers UI ---------- */

const toHex = (c?: string) => {
  const map: Record<string, string> = {
    blanc: "#ffffff",
    white: "#ffffff",
    ivoire: "#fffff0",
    beige: "#f5f0e6",
    sable: "#e5d3b3",
    noir: "#000000",
    black: "#000000",
    gris: "#9ca3af",
    argent: "#c0c0c0",
    rouge: "#d11a2a",
    bordeaux: "#7b1e3b",
    rose: "#f4a7bb",
    jaune: "#eab308",
    or: "#d4af37",
    vert: "#16a34a",
    émeraude: "#10b981",
    kaki: "#596859",
    bleu: "#1e3a8a",
    "bleu marine": "#0f172a",
    ciel: "#60a5fa",
  };
  const k = (c || "").trim().toLowerCase();
  return map[k] || (/#|rgb|hsl/.test(k) ? k : "#d1d5db");
};

const isLight = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 190;
};

/* ---------- Parsing des variantes pour votre structure ---------- */

const parseVariants = (rows: RawPV[] | undefined) => {
  if (!rows || rows.length === 0)
    return { colors: [], sizes: [], stockByVariant: new Map() };

  const colors = new Set<string>();
  const sizes = new Set<string>();
  const stockByVariant = new Map<string, number>(); // "color|size" -> stock

  // Séparer les couleurs et tailles
  const colorRows = rows.filter(
    (r) => r.name?.toLowerCase() === "color" && r.is_active !== false
  );
  const sizeRows = rows.filter(
    (r) => r.name?.toLowerCase() === "size" && r.is_active !== false
  );

  colorRows.forEach((row) => colors.add(row.value));
  sizeRows.forEach((row) => sizes.add(row.value));

  // Pour le stock, on doit faire des hypothèses car votre structure ne lie pas directement color+size
  // Option 1: Si vous avez des SKU qui lient color et size
  if (colorRows.some((r) => r.sku) && sizeRows.some((r) => r.sku)) {
    const skuGroups = new Map<
      string,
      { color?: string; size?: string; stock: number }
    >();

    rows.forEach((row) => {
      if (!row.sku) return;
      if (!skuGroups.has(row.sku)) {
        skuGroups.set(row.sku, { stock: 0 });
      }
      const group = skuGroups.get(row.sku)!;

      if (row.name?.toLowerCase() === "color") group.color = row.value;
      if (row.name?.toLowerCase() === "size") group.size = row.value;
      if (typeof row.stock_quantity === "number") {
        group.stock = Math.max(group.stock, row.stock_quantity);
      }
    });

    // Remplir stockByVariant
    skuGroups.forEach((group) => {
      if (group.color && group.size) {
        stockByVariant.set(`${group.color}|${group.size}`, group.stock);
      }
    });
  }

  // Option 2: Fallback - utiliser le stock individuel de chaque variante
  if (stockByVariant.size === 0) {
    // Si pas de SKU, on assume que chaque combinaison color/size a le stock min des deux
    colors.forEach((color) => {
      sizes.forEach((size) => {
        const colorRow = colorRows.find((r) => r.value === color);
        const sizeRow = sizeRows.find((r) => r.value === size);

        const colorStock = colorRow?.stock_quantity ?? 0;
        const sizeStock = sizeRow?.stock_quantity ?? 0;

        // Prendre le minimum (goulot d'étranglement) ou la moyenne
        const stock = Math.min(Math.max(0, colorStock), Math.max(0, sizeStock));
        stockByVariant.set(`${color}|${size}`, stock);
      });
    });
  }

  return {
    colors: Array.from(colors),
    sizes: Array.from(sizes),
    stockByVariant,
  };
};

/* ====================== Composant ====================== */

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { addItem } = useCartStore();
  const { fetchProductById } = useProductStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!data) {
          setError("Produit introuvable");
          return;
        }
        setProduct(data);
      } catch (e) {
        console.error(e);
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetchProductById]);

  // Parser les variantes selon votre structure
  const variantData = useMemo(() => {
    return parseVariants(product?.variants as RawPV[] | undefined);
  }, [product]);

  const { colors, sizes, stockByVariant } = variantData;

  // Auto-sélection si une seule option disponible
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
    if (sizes.length === 1 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [colors, sizes, selectedColor, selectedSize]);

  // Stock pour la combinaison sélectionnée
  const currentVariantStock = useMemo(() => {
    if (!selectedColor || !selectedSize) return 0;
    return stockByVariant.get(`${selectedColor}|${selectedSize}`) ?? 0;
  }, [selectedColor, selectedSize, stockByVariant]);

  // Stock total disponible
  const productStock = Math.max(0, product?.stock_quantity ?? 0);
  const maxStock = Math.max(currentVariantStock, productStock);
  const inStock = maxStock > 0;

  // Prix
  const basePrice = product?.sale_price ?? product?.price ?? 0;
  const displayPrice = basePrice; // Vous pouvez ajouter price_modifier ici si nécessaire

  // Debug info (temporaire)
  console.log("Debug Supabase variants:", {
    rawVariants: product?.variants,
    parsedColors: colors,
    parsedSizes: sizes,
    stockByVariant: Object.fromEntries(stockByVariant),
    selectedColor,
    selectedSize,
    currentVariantStock,
    maxStock,
    inStock,
  });

  /* ---------- Actions ---------- */

  const handleAddToCart = () => {
    if (!product) return;

    // Vérifications
    if (colors.length > 0 && !selectedColor) {
      return toast.error("Choisissez une couleur");
    }
    if (sizes.length > 0 && !selectedSize) {
      return toast.error("Choisissez une taille");
    }
    if (!inStock) {
      return toast.error("Produit non disponible");
    }

    const qty = Math.min(Math.max(1, quantity), Math.max(1, maxStock));

    // Ajouter au panier
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: product.images?.[0]?.url || "/placeholder.jpg",
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
    }

    toast.success(`${product.name} ajouté au panier (${qty})`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  /* ---------- Loading / Error ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* 👈 Header unifié pour le loading */}
        <UnifiedHeader variant="default" showNavigation={true} />

        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        {/* 👈 Header unifié pour l'erreur */}
        <UnifiedHeader variant="default" showNavigation={true} />

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            {error || "Produit introuvable"}
          </h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </div>
      </div>
    );
  }

  const canAddToCart =
    inStock &&
    (colors.length === 0 || selectedColor) &&
    (sizes.length === 0 || selectedSize);

  /* ---------- Page ---------- */

  return (
    <div className="min-h-screen bg-white">
      {/* 👈 Header unifié principal */}
      <UnifiedHeader variant="default" showNavigation={true} />

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-violet-600">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-violet-600">
            Produits
          </Link>
          <span>/</span>
          <span className="text-violet-600 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Galerie */}
          <div className="space-y-4">
            <div className="relative group">
              <LazyImage
                src={
                  product.images?.[selectedImageIndex]?.url ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                width={600}
                height={600}
                className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
              />

              <div className="absolute top-4 right-4">
                <Badge className="bg-white/90 text-gray-800 shadow backdrop-blur-sm">
                  {inStock ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      En stock
                    </>
                  ) : (
                    "Épuisé"
                  )}
                </Badge>
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-white/90 shadow hover:bg-white"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleShare}
                  className="bg-white/90 shadow hover:bg-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden ${
                      selectedImageIndex === i
                        ? "ring-2 ring-violet-600"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <LazyImage
                      src={img.url}
                      alt={`${product.name} ${i + 1}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className="border-violet-200 text-violet-700"
                >
                  {product.category?.name || "Produit"}
                </Badge>
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    ⭐ Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-light text-violet-600">
                    {displayPrice}€
                  </span>
                  {product.sale_price && (
                    <span className="text-xl text-gray-500 line-through">
                      {product.price}€
                    </span>
                  )}
                </div>
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
                {product.description || product.short_description}
              </p>
            </div>

            <Separator />

            {/* Sélecteurs */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div className="space-y-8">
                {/* Couleur */}
                {colors.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Couleur</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const selected = selectedColor === color;
                        const hex = toHex(color);
                        const light = isLight(hex);
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition
                              ${
                                selected
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white border-gray-300 hover:border-violet-300"
                              }`}
                            aria-pressed={selected}
                            title={color}
                          >
                            <span
                              className={`w-4 h-4 rounded-full ${
                                light ? "ring-1 ring-gray-300" : ""
                              }`}
                              style={{ backgroundColor: hex }}
                            />
                            <span className="capitalize">{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Taille */}
                {sizes.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Taille</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const selected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-lg text-sm border transition min-w-[3.5rem] text-center
                              ${
                                selected
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white border-gray-300 hover:border-violet-300"
                              }`}
                            aria-pressed={selected}
                            title={`Taille ${size}`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    {selectedColor && selectedSize && (
                      <p className="mt-2 text-xs text-gray-500">
                        Stock pour {selectedColor} / {selectedSize} :{" "}
                        <span className="font-medium">
                          {currentVariantStock}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantité */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Quantité</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="border-gray-300 w-11 h-11"
                  aria-label="Diminuer"
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={Math.max(1, maxStock)}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value || "1", 10);
                    if (isNaN(v)) return setQuantity(1);
                    setQuantity(
                      Math.min(Math.max(1, v), Math.max(1, maxStock))
                    );
                  }}
                  className="w-24 h-11 text-center text-lg font-medium border-gray-300"
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) => Math.min(q + 1, Math.max(1, maxStock)))
                  }
                  className="border-gray-300 w-11 h-11"
                  aria-label="Augmenter"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                {maxStock > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    Stock total dispo : {maxStock}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {inStock ? "Ajouter au panier" : "Produit épuisé"}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-violet-200 hover:border-violet-300 hover:bg-violet-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favoris
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </div>
            </div>

            <Separator />

            {/* Services */}
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

        {/* Détails */}
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
                    <span className="font-medium">
                      {product.category?.name || "N/A"}
                    </span>
                  </div>
                  {sizes.length > 0 && (
                    <div className="flex justify-between">
                      <span>Tailles</span>
                      <span className="font-medium">{sizes.join(", ")}</span>
                    </div>
                  )}
                  {colors.length > 0 && (
                    <div className="flex justify-between">
                      <span>Couleurs</span>
                      <span className="font-medium capitalize">
                        {colors.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Référence</span>
                    <span className="font-medium">
                      BR-{String(product.id).toUpperCase()}
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
