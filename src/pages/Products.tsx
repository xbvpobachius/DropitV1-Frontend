import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus } from "lucide-react";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import Footer from "@/components/Footer";


const Products = () => {
  // Placeholder product data

  const products = [
    {
      id: 1,
      name: "Smart LED Sunset Lamp",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      category: "Home & Decor",
      price: "$29.99",
      trending: true,
    },
    {
      id: 2,
      name: "Portable Blender Pro",
      image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop",
      category: "Kitchen",
      price: "$24.99",
      trending: true,
    },
    {
      id: 3,
      name: "Wireless Earbuds Mini",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop",
      category: "Electronics",
      price: "$19.99",
      trending: false,
    },
    {
      id: 4,
      name: "Posture Corrector Belt",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
      category: "Health & Wellness",
      price: "$15.99",
      trending: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithScroll />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Trending <span className="text-primary">Products</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Discover winning products curated by AI. Add to your store with one click.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className="card-premium overflow-hidden hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {product.trending && (
                    <Badge className="absolute top-3 right-3 bg-primary text-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold text-primary">{product.price}</div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to My Store
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <Button variant="secondary" size="lg">
              Load More Products
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
