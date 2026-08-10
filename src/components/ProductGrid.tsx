import { useState } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

const ProductGrid = () => {
  const { data: products = [], isLoading } = useProducts();
  const [page, setPage] = useState(1);

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-center text-muted-foreground">Carregando produtos...</p>
      </main>
    );
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <p className="text-muted-foreground text-sm">Mostrando {paginatedProducts.length} de {products.length} decorações</p>
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
          {paginatedProducts.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-accent"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProductGrid;
