import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface ProductSliderProduct {
  id: string | number;
  name: string;
  image?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  profit?: number;
}

interface ProductSlider3DProps {
  products: ProductSliderProduct[];
  selectedProduct: string | number | null;
  onSelectProduct: (id: string | number) => void;
}

export const ProductSlider3D = ({ products, selectedProduct, onSelectProduct }: ProductSlider3DProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setTranslateX(currentX - startX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    setIsDragging(false);
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslateX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    setIsDragging(false);
    setTranslateX(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle empty products - must be after all hooks
  if (!products || products.length === 0) {
    return (
      <div className="relative w-full h-[700px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const isCenter = diff === 0;
    const isSelected = products[index].id === selectedProduct;

    let transform = "";
    let opacity = 1;
    let zIndex = 0;

    if (diff === 0) {
      // Center card
      transform = `translateX(0%) translateZ(0px) rotateY(0deg) scale(1.15)`;
      opacity = 1;
      zIndex = 10;
    } else if (diff === 1) {
      // Right 1
      transform = `translateX(70%) translateZ(-200px) rotateY(-35deg) scale(0.85)`;
      opacity = 0.7;
      zIndex = 5;
    } else if (diff === -1) {
      // Left 1
      transform = `translateX(-70%) translateZ(-200px) rotateY(35deg) scale(0.85)`;
      opacity = 0.7;
      zIndex = 5;
    } else if (diff === 2) {
      // Right 2
      transform = `translateX(130%) translateZ(-350px) rotateY(-45deg) scale(0.6)`;
      opacity = 0.4;
      zIndex = 1;
    } else if (diff === -2) {
      // Left 2
      transform = `translateX(-130%) translateZ(-350px) rotateY(45deg) scale(0.6)`;
      opacity = 0.4;
      zIndex = 1;
    } else {
      // Far away
      transform = `translateX(${diff > 0 ? 200 : -200}%) translateZ(-500px) rotateY(${diff > 0 ? -60 : 60}deg) scale(0.4)`;
      opacity = 0;
      zIndex = 0;
    }

    return {
      transform,
      opacity,
      zIndex,
      filter: isCenter ? "brightness(1.1)" : "brightness(0.7)",
    };
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-primary-foreground p-4 rounded-full transition-all duration-300 hover:scale-110 border border-primary/30"
        aria-label="Previous product"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-primary-foreground p-4 rounded-full transition-all duration-300 hover:scale-110 border border-primary/30"
        aria-label="Next product"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 3D Container */}
      <div
        ref={sliderRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: "1500px" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {products.map((product, index) => {
          const style = getCardStyle(index);
          const isCenter = index === currentIndex;
          const isSelected = product.id === selectedProduct;

          return (
            <div
              key={product.id}
              className="absolute cursor-pointer transition-all duration-700 ease-out"
              style={{
                ...style,
                width: "320px",
                transformStyle: "preserve-3d",
              }}
              onClick={() => {
                if (isCenter) {
                  onSelectProduct(product.id);
                } else {
                  setCurrentIndex(index);
                }
              }}
            >
              <div
                className={`relative overflow-hidden rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-primary border-primary shadow-lg shadow-primary/50"
                    : "border-border hover:border-primary/50"
                }`}
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--background)))"
                    : "hsl(var(--background))",
                }}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 z-20 bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg border-2 border-background">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {/* Product Image */}
                <div className="aspect-square overflow-hidden relative bg-muted/20">
                  <img
                    src={product.image ?? "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                    draggable={false}
                  />
                </div>

                {/* Product Info */}
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-muted-foreground">Cost</div>
                      <div className="font-semibold text-foreground">
                        ${product.purchasePrice?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">Sell</div>
                      <div className="font-semibold text-primary">
                        ${product.sellingPrice?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-1">Profit Margin</div>
                    <div className="text-lg font-bold text-primary">+{product.profit || 0}%</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to product ${index + 1}`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
        Drag or use arrows to navigate • Click center to select
      </div>
    </div>
  );
};
