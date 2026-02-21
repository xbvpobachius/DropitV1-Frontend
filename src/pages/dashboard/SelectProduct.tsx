import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { ProductSlider3D, type ProductSliderProduct } from "@/components/ProductSlider3D";

interface BackendProduct {
  id: string;
  user_id: string;
  name: string;
  source_url: string | null;
  status: string;
  created_at: string;
}

interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
}

const CATALOG_PREFIX = "catalog_";

const SelectProduct = () => {
  const navigate = useNavigate();
  const { refetch } = useOnboardingFlow();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductSliderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!localStorage.getItem("access_token")) {
        setLoading(false);
        return;
      }
      try {
        const [userList, catalogList] = await Promise.all([
          apiFetch<BackendProduct[]>("/users/products"),
          apiFetch<CatalogProduct[]>("/catalog/products").catch(() => []),
        ]);
        const userItems: ProductSliderProduct[] = userList.map((p) => ({
          id: p.id,
          name: p.name,
          image: undefined,
          purchasePrice: undefined,
          sellingPrice: undefined,
          profit: undefined,
        }));
        const catalogItems: ProductSliderProduct[] = (catalogList || []).map((c) => ({
          id: CATALOG_PREFIX + c.slug,
          name: c.name,
          image: undefined,
          purchasePrice: undefined,
          sellingPrice: undefined,
          profit: undefined,
        }));
        setProducts([...catalogItems, ...userItems]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isCatalogSelection = selectedProduct?.startsWith(CATALOG_PREFIX) ?? false;
  const catalogSlug = isCatalogSelection ? selectedProduct.slice(CATALOG_PREFIX.length) : null;
  const selectedCatalogProduct = catalogSlug
    ? products.find((p) => p.id === selectedProduct) as { name: string } | undefined
    : null;

  const handleContinue = async () => {
    if (!selectedProduct) {
      toast({
        title: "Select a product",
        description: "You must choose a product to continue",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isCatalogSelection && catalogSlug && selectedCatalogProduct) {
        await apiFetch("/users/products", {
          method: "POST",
          body: JSON.stringify({
            name: selectedCatalogProduct.name,
            catalog_slug: catalogSlug,
          }),
        });
      }
      await apiFetch("/onboarding/progress", {
        method: "PATCH",
        body: JSON.stringify({
          product_selected: true,
        }),
      });

      await refetch();
      navigate("/dashboard/create-store", { state: { fromPreviousStep: true } });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not save",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredStep="/dashboard/select-product">
      <div className="p-8 pt-24 max-w-7xl mx-auto bg-muted/30 min-h-screen">

        <div className="mb-16 text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Select your product</h1>
          <p className="text-muted-foreground text-lg">Choose from the catalog or your products</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">You don't have any products yet.</p>
            <p className="text-sm">Products are added from the backend or during onboarding.</p>
          </div>
        ) : (
          <>
            <ProductSlider3D
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={(id) => setSelectedProduct(String(id))}
            />

            {selectedProduct && (
              <div className="mt-16 text-center animate-fade-in">
                <Button
                  size="lg"
                  className="font-semibold"
                  onClick={handleContinue}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Continue to store setup →"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default SelectProduct;
