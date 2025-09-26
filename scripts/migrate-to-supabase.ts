// scripts/migrate-to-supabase.ts
// tout en haut de scripts/migrate-to-supabase.ts
import { config as loadEnv } from "dotenv";

// charge d'abord .env.local si présent
loadEnv({ path: ".env.local" });
// puis .env en fallback (sans écraser ce qui est déjà défini)
loadEnv({ path: ".env", override: false });
import { createClient } from "@supabase/supabase-js";
import { mockProducts, mockCollections } from "../src/lib/mock-data";
import type { Database } from "../lib/database.types";

// Helpers de typage basés sur le type généré par Supabase
type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

// Types déduits directement des mocks (aucun fichier de types requis)
type MockProduct = (typeof mockProducts)[number];
type MockCollection = (typeof mockCollections)[number];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Client non typé par DB côté JS (ok pour script), mais on pourrait faire:
// const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function migrateMockData() {
  try {
    console.log("🚀 Début de la migration des données...");

    // 1. Catégories
    console.log("📁 Création des catégories...");
    const categories = ["Vestes", "Robes", "Chemises"] as const;
    const createdCategories: Tables<"categories">[] = [];

    for (const categoryName of categories) {
      const insert: Inserts<"categories"> = {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
        description: `Collection ${categoryName} .blancherenaudin`,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert(insert)
        .select()
        .single();

      if (error) {
        // Si tu relances la migration, ces erreurs seront normales (doublons).
        console.error(`Erreur création catégorie ${categoryName}:`, error);
        continue;
      }

      createdCategories.push(data);
      console.log(`✅ Catégorie créée: ${categoryName}`);
    }

    // 2. Produits
    console.log("👗 Création des produits...");
    const createdProducts: Array<{
      original: MockProduct;
      created: Tables<"products">;
    }> = [];

    for (const product of mockProducts) {
      const category = createdCategories.find(
        (cat) => cat.name === product.category
      );

      const productInsert: Inserts<"products"> = {
        name: product.name,
        slug: `${product.id}-${product.name
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
        description: product.description,
        short_description: product.description.substring(0, 200),
        price: product.price,
        stock_quantity: product.inStock ? 15 : 0,
        is_featured: product.featured ?? false,
        is_active: true,
        category_id: category?.id ?? null,
        sku: `BR-${product.id.toUpperCase()}`,
      };

      const { data: createdProduct, error: productError } = await supabase
        .from("products")
        .insert(productInsert)
        .select()
        .single();

      if (productError || !createdProduct) {
        console.error(`Erreur création produit ${product.name}:`, productError);
        continue;
      }

      createdProducts.push({ original: product, created: createdProduct });

      // Images
      if (product.images?.length) {
        const imageInserts: Inserts<"product_images">[] = product.images.map(
          (imageUrl, index) => ({
            product_id: createdProduct.id,
            url: imageUrl,
            alt_text: `${product.name} - Image ${index + 1}`,
            sort_order: index,
            is_primary: index === 0,
          })
        );

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (imagesError) {
          console.error(
            `Erreur création images pour ${product.name}:`,
            imagesError
          );
        } else {
          console.log(`📸 Images créées pour ${product.name}`);
        }
      }

      // Variantes tailles
      if (product.sizes?.length) {
        const sizeVariants: Inserts<"product_variants">[] = product.sizes.map(
          (size) => ({
            product_id: createdProduct.id,
            name: "Size",
            value: size,
            stock_quantity: 5,
            is_active: true,
          })
        );

        const { error: sizesError } = await supabase
          .from("product_variants")
          .insert(sizeVariants);

        if (sizesError) {
          console.error(
            `Erreur création tailles pour ${product.name}:`,
            sizesError
          );
        }
      }

      // Variantes couleurs
      if (product.colors?.length) {
        const colorVariants: Inserts<"product_variants">[] = product.colors.map(
          (color) => ({
            product_id: createdProduct.id,
            name: "Color",
            value: color,
            stock_quantity: 5,
            is_active: true,
          })
        );

        const { error: colorsError } = await supabase
          .from("product_variants")
          .insert(colorVariants);

        if (colorsError) {
          console.error(
            `Erreur création couleurs pour ${product.name}:`,
            colorsError
          );
        }
      }

      console.log(`✅ Produit créé: ${product.name}`);
    }

    // 3. Collections
    console.log("🗂️ Création des collections...");
    for (const collection of mockCollections as MockCollection[]) {
      const collectionInsert: Inserts<"collections"> = {
        name: collection.name,
        slug: collection.id,
        description: collection.description,
        image_url: collection.image,
        is_featured: collection.featured ?? false,
        is_active: true,
      };

      const { data: createdCollection, error: collectionError } = await supabase
        .from("collections")
        .insert(collectionInsert)
        .select()
        .single();

      if (collectionError || !createdCollection) {
        console.error(
          `Erreur création collection ${collection.name}:`,
          collectionError
        );
        continue;
      }

      // Liaison produits <-> collection
      const collectionProducts: Inserts<"collection_products">[] =
        collection.products
          .map((p: { id: string }, index: number) => {
            const cp = createdProducts.find((x) => x.original.id === p.id);
            return cp
              ? {
                  collection_id: createdCollection.id,
                  product_id: cp.created.id,
                  sort_order: index,
                }
              : null;
          })
          .filter(Boolean) as Inserts<"collection_products">[];

      if (collectionProducts.length) {
        const { error: linkError } = await supabase
          .from("collection_products")
          .insert(collectionProducts);

        if (linkError) {
          console.error(
            `Erreur liaison produits collection ${collection.name}:`,
            linkError
          );
        } else {
          console.log(
            `🔗 ${collectionProducts.length} produits liés à ${collection.name}`
          );
        }
      }

      console.log(`✅ Collection créée: ${collection.name}`);
    }

    // 4. Coupons de démo
    console.log("🎫 Création des codes promo...");
    const now = Date.now();
    const coupons: Inserts<"coupons">[] = [
      {
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        minimum_amount: 50,
        usage_limit: 100,
        is_active: true,
        valid_from: new Date().toISOString(),
        valid_until: new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        code: "SUMMER20",
        type: "percentage",
        value: 20,
        minimum_amount: 100,
        usage_limit: 50,
        is_active: true,
        valid_from: new Date().toISOString(),
        valid_until: new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        code: "VIP15",
        type: "percentage",
        value: 15,
        minimum_amount: 75,
        usage_limit: 25,
        is_active: true,
        valid_from: new Date().toISOString(),
        valid_until: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { error: couponsError } = await supabase
      .from("coupons")
      .insert(coupons);
    if (couponsError) {
      console.error("Erreur création codes promo:", couponsError);
    } else {
      console.log("✅ Codes promo créés");
    }

    console.log("🎉 Migration terminée avec succès!");
    console.log("📊 Résumé:");
    console.log(`   - ${createdCategories.length} catégories créées`);
    console.log(`   - ${createdProducts.length} produits créés`);
    console.log(`   - ${mockCollections.length} collections créées`);
    console.log(`   - ${coupons.length} codes promo créés`);
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
  }
}

// Lancer seulement si exécuté directement (compatible ESM/tsx)
if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  migrateMockData();
}

export default migrateMockData;
