"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore";
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

/* ---------- Types venant directement du select Supabase ---------- */
type RawImage = { url: string; alt_text: string | null };
type RawVariant = {
  id: string;
  product_id: string | null;
  name: string; // "color" | "size"
  value: string; // "Noir", "M" ...
  stock_quantity: number | null;
  price_modifier: number | null;
  sku: string | null;
  is_active: boolean | null;
};
type RawProduct = {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  images?: RawImage[] | null;
  variants?: RawVariant[] | null;
  category?: { name: string } | null;
  is_featured?: boolean | null;
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

/* ---------- Parsing variantes (inspiré de ton ancienne implémentation) ---------- */
function parseVariants(rows: RawVariant[] | null | undefined) {
  const out = {
    colors: [] as string[],
    sizes: [] as string[],
    stockByCombo: new Map<string, number>(), // "color|size" -> stock
    modByColor: new Map<string, number>(), // "Noir" -> +5
    modBySize: new Map<string, number>(), // "M" -> +0
    colorSku: new Map<string, string | null>(),
    sizeSku: new Map<string, string | null>(),
  };
  if (!rows?.length) return out;

  const colors = rows.filter(
    (r) => r.name?.toLowerCase() === "color" && r.is_active !== false
  );
  const sizes = rows.filter(
    (r) => r.name?.toLowerCase() === "size" && r.is_active !== false
  );

  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();

  colors.forEach((r) => {
    colorSet.add(r.value);
    out.modByColor.set(r.value, r.price_modifier ?? 0);
    out.colorSku.set(r.value, r.sku ?? null);
  });

  sizes.forEach((r) => {
    sizeSet.add(r.value);
    out.modBySize.set(r.value, r.price_modifier ?? 0);
    out.sizeSku.set(r.value, r.sku ?? null);
  });

  // Stock par combinaison :
  // 1) si des SKU correspondent 1-1 à une combo (même SKU sur les deux), on groupe par SKU
  const skuGroups = new Map<
    string,
    { color?: string; size?: string; stock: number }
  >();
  rows.forEach((r) => {
    if (!r.sku) return;
    if (!skuGroups.has(r.sku)) skuGroups.set(r.sku, { stock: 0 });
    const g = skuGroups.get(r.sku)!;
    if (r.name?.toLowerCase() === "color") g.color = r.value;
    if (r.name?.toLowerCase() === "size") g.size = r.value;
    if (typeof r.stock_quantity === "number")
      g.stock = Math.max(g.stock, r.stock_quantity);
  });
  skuGroups.forEach((g) => {
    if (g.color && g.size)
      out.stockByCombo.set(`${g.color}|${g.size}`, g.stock);
  });

  // 2) fallback : si pas de corrélation SKU, min(stock color, stock size)
  if (out.stockByCombo.size === 0) {
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const stock = Math.min(
          Math.max(0, c.stock_quantity ?? 0),
          Math.max(0, s.stock_quantity ?? 0)
        );
        out.stockByCombo.set(`${c.value}|${s.value}`, stock);
      });
    });
  }

  out.colors = [...colorSet];
  out.sizes = [...sizeSet];
  return out;
}

/* ====================== Composant ====================== */

export default function ProductDetailClient({
  product,
}: {
  product: RawProduct;
}) {
  const { addItem } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { colors, sizes, stockByCombo, modByColor, modBySize } = useMemo(
    () => parseVariants(product.variants),
    [product.variants]
  );

  // Auto-sélection si une seule option
  if (colors.length === 1 && !selectedColor) setSelectedColor(colors[0]);
  if (sizes.length === 1 && !selectedSize) setSelectedSize(sizes[0]);

  // Stock par combo
  const currentVariantStock = useMemo(() => {
    if (!selectedColor || !selectedSize) return 0;
    return stockByCombo.get(`${selectedColor}|${selectedSize}`) ?? 0;
  }, [selectedColor, selectedSize, stockByCombo]);

  // Stock total fallback sur le produit
  const productStock = Math.max(0, product.stock_quantity ?? 0);
  const maxStock = Math.max(currentVariantStock, productStock);
  const inStock = maxStock > 0;

  // Prix courant = base + modifs couleur + taille
  const basePrice = product.sale_price ?? product.price ?? 0;
  const priceDelta =
    (modByColor.get(selectedColor) ?? 0) + (modBySize.get(selectedSize) ?? 0);
  const displayPrice = basePrice + priceDelta;

  const mainImage = product.images?.[selectedImageIndex];

  const canAddToCart =
    inStock &&
    (colors.length === 0 || !!selectedColor) &&
    (sizes.length === 0 || !!selectedSize);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any).share({
        title: product?.name,
        text: product?.short_description ?? product?.description ?? "",
        url: typeof window !== "undefined" ? window.location.href : "",
      });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor)
      return toast.error("Choisissez une couleur");
    if (sizes.length > 0 && !selectedSize)
      return toast.error("Choisissez une taille");
    if (!inStock) return toast.error("Produit non disponible");

    const qty = Math.min(Math.max(1, quantity), Math.max(1, maxStock));

    addItem({
      id: `${product.id}${selectedColor ? `:${selectedColor}` : ""}${
        selectedSize ? `:${selectedSize}` : ""
      }`,
      name:
        product.name +
        [
          selectedColor ? ` – ${selectedColor}` : "",
          selectedSize ? ` / ${selectedSize}` : "",
        ].join(""),
      price: displayPrice,
      image: mainImage?.url ?? product.images?.[0]?.url ?? "/placeholder.jpg",
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });

    toast.success(`${product.name} ajouté au panier (${qty})`);
  };

  return (
    <div className="space-y-8">
      {/* Fil d'ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
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
            <img
              src={mainImage?.url ?? "/placeholder.jpg"}
              alt={product.name}
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
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden ${
                    selectedImageIndex === i
                      ? "ring-2 ring-violet-600"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} ${i + 1}`}
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
                      <span className="font-medium">{currentVariantStock}</span>
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
                  setQuantity(Math.min(Math.max(1, v), Math.max(1, maxStock)));
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
              <Link href="/products" className="flex-1">
                <Button variant="outline" className="w-full border-gray-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-900">
              Services inclus
            </h3>
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
  );
}
