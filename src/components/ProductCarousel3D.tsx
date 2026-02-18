import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
}

interface ProductCardProps {
  product: Product;
  position: [number, number, number];
  rotation: number;
  isSelected: boolean;
  onClick: () => void;
  scale: number;
}

const ProductCard3D = ({ product, position, rotation, isSelected, onClick, scale }: ProductCardProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation;
    }
  });

  return (
    <mesh ref={meshRef} position={position} onClick={onClick} scale={scale}>
      <planeGeometry args={[4, 5]} />
      <meshStandardMaterial transparent opacity={0} />
      <Html
        transform
        distanceFactor={1}
        position={[0, 0, 0.01]}
        style={{
          width: "400px",
          transition: "all 0.3s",
          pointerEvents: "auto",
        }}
      >
        <Card
          className={`overflow-hidden cursor-pointer relative group transition-all duration-300 ${
            isSelected
              ? "ring-2 ring-primary border-primary"
              : "border-border hover:border-primary/50"
          }`}
          style={{
            transform: `scale(${isSelected ? 1.05 : 1})`,
          }}
        >
          {isSelected && (
            <div className="absolute -top-3 -right-3 z-20 bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg border-2 border-background">
              <Check className="w-5 h-5" />
            </div>
          )}

          <div className="aspect-square overflow-hidden relative bg-muted/20">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            />
          </div>

          <div className="p-5 space-y-3">
            <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>

            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-muted-foreground">Cost</div>
                <div className="font-semibold text-foreground">
                  ${product.purchasePrice.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Sell</div>
                <div className="font-semibold text-primary">
                  ${product.sellingPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">Profit Margin</div>
              <div className="text-lg font-bold text-primary">+{product.profit}%</div>
            </div>
          </div>
        </Card>
      </Html>
    </mesh>
  );
};

interface ProductCarousel3DProps {
  products: Product[];
  selectedProduct: number | null;
  onSelectProduct: (id: number) => void;
}

const CarouselScene = ({ products, selectedProduct, onSelectProduct }: ProductCarousel3DProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const radius = 3.5;
  const angleStep = (Math.PI * 2) / products.length;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <group ref={groupRef}>
        {products.map((product, index) => {
          const angle = angleStep * index;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          const distanceFromFront = Math.abs(Math.cos(angle));
          const scale = 0.85 + distanceFromFront * 0.15;

          return (
            <ProductCard3D
              key={product.id}
              product={product}
              position={[x, 0, z]}
              rotation={-angle}
              isSelected={selectedProduct === product.id}
              onClick={() => onSelectProduct(product.id)}
              scale={scale}
            />
          );
        })}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
        enableRotate={true}
      />
    </>
  );
};

export const ProductCarousel3D = ({ products, selectedProduct, onSelectProduct }: ProductCarousel3DProps) => {
  return (
    <div className="w-full h-[700px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
        <Suspense fallback={null}>
          <CarouselScene
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={onSelectProduct}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
        Drag to rotate • Click to select
      </div>
    </div>
  );
};
