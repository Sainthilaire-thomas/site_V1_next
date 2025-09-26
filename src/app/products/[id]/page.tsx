// src/app/products/[id]/page.tsx
"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCartStore } from "@/store/useCartStore";
import { useProductStore } from "@/store/useProductStore";
import { LazyImage } from "@/components/common/LazyImage";

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
  name: string; // "color" | "size" (ou autre)
  value: string; // "Blanc", "M", ...
  stock_quantity: number | null;
  price_modifier: number | null; // +10 / -5 (optionnel)
  sku: string | null;
  is_active: boolean | null;
  image_url?: string | null; // si présent dans ta table
};

// Variante normalisée pour l'UI
type Variant = {
  id: string;
  sku?: string | null;
  color?: string;
  size?: string;
  stock_quantity: number; // 0 si null
  price?: number | null; // prix final si modificateur appliqué
  image_url?: string | null;
};

/* ---------- Helpers UI ---------- */

// mapping FR -> hex + fallback
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

// détection simple des couleurs claires pour ajouter un anneau
const isLight = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 190; // ~ clair
};

/* ---------- Normalisation des variantes ---------- */

const normalizeVariants = (
  rows: RawPV[] | undefined,
  basePrice: number
): Variant[] => {
  if (!rows || rows.length === 0) return [];

  // On groupe par SKU (si présent), sinon par couple color|size pour garder des combinaisons cohérentes
  const groups = new Map<string, RawPV[]>();

  for (const r of rows) {
    const name = r.name?.toLowerCase();
    if (name !== "color" && name !== "size") {
      // ignore autres attributs pour l'instant
    }
    const color = rows.find(
      (x) =>
        (x.sku || x.id) === (r.sku || r.id) && x.name?.toLowerCase() === "color"
    )?.value;
    const size = rows.find(
      (x) =>
        (x.sku || x.id) === (r.sku || r.id) && x.name?.toLowerCase() === "size"
    )?.value;

    // clé préférée: sku ; fallback: color|size ; dernier fallback: id brut
    const key =
      r.sku || (color || size ? `${color ?? ""}|${size ?? ""}` : "") || r.id;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const result: Variant[] = [];
  for (const [key, items] of groups.entries()) {
    const color = items.find((i) => i.name?.toLowerCase() === "color")?.value;
    const size = items.find((i) => i.name?.toLowerCase() === "size")?.value;

    // stock: on prend la première valeur définie, sinon 0
    const stock =
      items.find((i) => typeof i.stock_quantity === "number")?.stock_quantity ??
      0;

    const priceMod =
      items.find((i) => typeof i.price_modifier === "number")?.price_modifier ??
      0;

    const active = items.every((i) => i.is_active !== false);

    if (!active) continue;

    result.push({
      id: items[0].id,
      sku: items[0].sku,
      color,
      size,
      stock_quantity: Math.max(0, stock || 0),
      price: basePrice + Number(priceMod || 0),
      image_url: items.find((i) => i.image_url)?.image_url ?? null,
    });
  }

  return result;
};

/* ====================== Composant ====================== */

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { addItem, totalItems } = useCartStore();
  const { fetchProductById } = useProductStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Sélections
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  // Variantes normalisées depuis product.variants (table product_variants)
  const variants: Variant[] = useMemo(() => {
    const base = product?.sale_price ?? product?.price ?? 0;
    return normalizeVariants(product?.variants as RawPV[] | undefined, base);
  }, [product]);

  const allColors = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.color).filter(Boolean))
      ) as string[],
    [variants]
  );
  const allSizes = useMemo(
    () =>
      Array.from(
        new Set(variants.map((v) => v.size).filter(Boolean))
      ) as string[],
    [variants]
  );

  // Disponibilités croisées
  const availableColors = useMemo(() => {
    if (!selectedSize) return allColors;
    return allColors.filter((c) =>
      variants.some(
        (v) => v.color === c && v.size === selectedSize && v.stock_quantity > 0
      )
    );
  }, [allColors, variants, selectedSize]);

  const availableSizes = useMemo(() => {
    if (!selectedColor) return allSizes;
    return allSizes.filter((s) =>
      variants.some(
        (v) => v.size === s && v.color === selectedColor && v.stock_quantity > 0
      )
    );
  }, [allSizes, variants, selectedColor]);

  // Variante actuelle
  const currentVariant: Variant | null = useMemo(
    () =>
      variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || null,
    [variants, selectedColor, selectedSize]
  );

  // Corrections si une sélection devient invalide
  useEffect(() => {
    if (selectedColor && !availableColors.includes(selectedColor)) {
      setSelectedColor("");
    }
  }, [availableColors, selectedColor]);
  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize("");
    }
  }, [availableSizes, selectedSize]);

  // Stock / Prix
  const variantStock = Math.max(0, currentVariant?.stock_quantity ?? 0);
  const productStock = Math.max(0, product?.stock_quantity ?? 0);
  const maxStock = variantStock || productStock;
  const inStock = maxStock > 0;

  const displayPrice =
    currentVariant?.price ?? product?.sale_price ?? product?.price;

  /* ---------- Actions ---------- */

  const handleAddToCart = () => {
    if (!product) return;

    // si variants, forcer les deux choix valides
    if (variants.length > 0) {
      if (!selectedColor) return toast.error("Choisissez une couleur");
      if (!selectedSize) return toast.error("Choisissez une taille");
      if (!currentVariant || currentVariant.stock_quantity <= 0)
        return toast.error("Variante indisponible");
    }

    const qty = Math.min(Math.max(1, quantity), Math.max(1, maxStock));

    // Ton store ajoute +1 à chaque appel → on boucle qty fois
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: displayPrice,
        image:
          currentVariant?.image_url ||
          product.images?.[0]?.url ||
          "/placeholder.jpg",
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        sku: currentVariant?.sku || undefined,
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
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-light text-gray-900">
              .blancherenaudin
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Panier
              </Button>
            </Link>
          </div>
        </header>

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
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-light text-gray-900">
              .blancherenaudin
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Panier
              </Button>
            </Link>
          </div>
        </header>

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

  /* ---------- Page ---------- */

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-light text-gray-900 hover:text-violet-600 transition-colors"
          >
            .blancherenaudin
          </Link>

          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Panier
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-violet-600 text-white min-w-[20px] h-5 text-xs flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

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
                  currentVariant?.image_url ||
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
                  {product.sale_price && !currentVariant?.price && (
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

            {/* Sélecteurs basés sur variants */}
            {variants.length > 0 && (
              <div className="space-y-8">
                {/* Couleur */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Couleur</h3>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((c) => {
                      const enabled = availableColors.includes(c);
                      const selected = selectedColor === c;
                      const hex = toHex(c);
                      const light = isLight(hex);
                      return (
                        <button
                          key={c}
                          onClick={() => enabled && setSelectedColor(c)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition
                            ${
                              selected
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white"
                            }
                            ${
                              enabled
                                ? "border-gray-300 hover:border-violet-300"
                                : "border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                          aria-pressed={selected}
                          title={c}
                        >
                          <span
                            className={`w-4 h-4 rounded-full ${
                              light ? "ring-1 ring-gray-300" : ""
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                          <span className="capitalize">{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Taille */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Taille</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((s) => {
                      const enabled = availableSizes.includes(s);
                      const selected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          onClick={() => enabled && setSelectedSize(s)}
                          className={`px-4 py-2 rounded-lg text-sm border transition min-w-[3.5rem] text-center
                            ${
                              selected
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white"
                            }
                            ${
                              enabled
                                ? "border-gray-300 hover:border-violet-300"
                                : "border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                          aria-pressed={selected}
                          title={`Taille ${s}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  {currentVariant && (
                    <p className="mt-2 text-xs text-gray-500">
                      Stock pour {selectedColor} / {selectedSize} :{" "}
                      <span className="font-medium">{variantStock}</span>
                    </p>
                  )}
                </div>
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
                disabled={
                  !inStock ||
                  (variants.length > 0 &&
                    (!selectedColor ||
                      !selectedSize ||
                      !currentVariant ||
                      variantStock === 0))
                }
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
                  {allSizes.length > 0 && (
                    <div className="flex justify-between">
                      <span>Tailles</span>
                      <span className="font-medium">{allSizes.join(", ")}</span>
                    </div>
                  )}
                  {allColors.length > 0 && (
                    <div className="flex justify-between">
                      <span>Couleurs</span>
                      <span className="font-medium capitalize">
                        {allColors.join(", ")}
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
