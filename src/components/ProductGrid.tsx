import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const ProductGrid = () => {
  const { data: products = [], isLoading } = useProducts();

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-center text-muted-foreground">Carregando produtos...</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <p className="text-muted-foreground text-sm">Mostrando {products.length} decorações</p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start border-t border-border/50 sm:border-none pt-4 sm:pt-0">
            <span className="text-sm font-medium">Ordenar por:</span>
            <select className="text-sm bg-transparent border-none focus:ring-0 font-bold text-primary cursor-pointer">
              <option>Mais Recentes</option>
              <option>Preço: Menor para Maior</option>
              <option>Preço: Maior para Menor</option>
              <option>Mais Populares</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {products.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>

      </div>
    </main>
  );
};

export default ProductGrid;
