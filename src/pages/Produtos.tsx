import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, X, Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import SEO from "@/components/SEO";

const ITEMS_PER_PAGE = 12;

const ALPHABET = [
  "Todos",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

const startsWithLetter = (name: string, letter: string): boolean => {
  if (letter === "Todos") return true;
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
  return normalized.startsWith(letter.toUpperCase());
};

const Produtos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedLetter, setSelectedLetter] = useState<string>("Todos");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const catalogTopRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: dbCategories = [] } = useCategories(true);

  // Sync category from URL param (e.g. ?cat=Infantil+menina)
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) {
      setSelectedCategory(cat);
      setPage(1);
    }
  }, [searchParams]);

  // Combine database categories with unique categories from products
  const categoriesList = useMemo(() => {
    const fromCategoriesTable = dbCategories.map((c) => c.name);
    const fromProducts = products.map((p) => p.category);
    const set = new Set([...fromCategoriesTable, ...fromProducts]);
    return Array.from(set);
  }, [dbCategories, products]);

  const scrollToCatalogTop = () => {
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    if (cat === "Todos") {
      searchParams.delete("cat");
    } else {
      searchParams.set("cat", cat);
    }
    setSearchParams(searchParams, { replace: true });
    scrollToCatalogTop();
  };

  const handleSelectLetter = (letter: string) => {
    setSelectedLetter(letter);
    setPage(1);
    scrollToCatalogTop();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToCatalogTop();
  };

  // Filter products by category, search text, and A-Z letter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "Todos" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchLetter = startsWithLetter(p.name, selectedLetter);

      return matchCategory && matchSearch && matchLetter;
    });
  }, [search, selectedCategory, selectedLetter, products]);

  // Count available products per letter under current category & search for subtle UI hints
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const matchCategory =
        selectedCategory === "Todos" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      if (matchCategory && matchSearch) {
        const firstLetter = p.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .charAt(0)
          .toUpperCase();
        if (firstLetter >= "A" && firstLetter <= "Z") {
          counts[firstLetter] = (counts[firstLetter] || 0) + 1;
        }
      }
    });
    return counts;
  }, [products, selectedCategory, search]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Smart pagination range (e.g. 1, 2, 3 ... 10)
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Deduplicate in case totalPages is small
    return Array.from(new Set(rangeWithDots));
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-background font-display flex flex-col">
      <SEO
        title="Catálogo de Decorações"
        description="Explore nosso catálogo completo de decorações para festas infantis, casamentos, 15 anos e eventos."
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Nosso Catálogo</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Escolha os melhores kits e decorações para transformar seu evento em um momento inesquecível.
          </p>
        </div>

        {/* Scroll anchor target right above search bar */}
        <div ref={catalogTopRef} className="scroll-mt-24" />

        {/* Mobile Filter & Search Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm shadow-sm"
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 shadow-md hover:bg-primary/90 transition-all"
          >
            <Filter size={16} /> Categorias
          </button>
        </div>

        {/* Layout Container: Left Sidebar Categories + Right Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center justify-between">
                <span>Categorias</span>
                <span className="text-xs text-muted-foreground font-normal">
                  ({categoriesList.length})
                </span>
              </h2>

              <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                {/* Option: Todos */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory("Todos")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === "Todos"
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : "hover:bg-accent text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedCategory === "Todos" ? "border-white bg-white/20" : "border-muted-foreground/40"
                  }`}>
                    {selectedCategory === "Todos" && <Check size={12} />}
                  </div>
                  <span>Todos os Produtos</span>
                </button>

                {/* Category List */}
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-md"
                          : "hover:bg-accent text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-white bg-white/20" : "border-muted-foreground/40"
                      }`}>
                        {isSelected && <Check size={12} />}
                      </div>
                      <span className="truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Mobile Categories Modal / Drawer */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
              <div className="relative w-80 max-w-[85vw] bg-card h-full p-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                  <h3 className="font-bold text-lg">Categorias</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-2 rounded-lg hover:bg-accent">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                  <button
                    onClick={() => { handleSelectCategory("Todos"); setMobileFilterOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      selectedCategory === "Todos" ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
                    }`}
                  >
                    <span>Todos os Produtos</span>
                  </button>
                  {categoriesList.map((cat) => {
                    const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        onClick={() => { handleSelectCategory(cat); setMobileFilterOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left ${
                          isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Right Main Content (Search + Alphabet Filter + Products Grid + Pagination) */}
          <section className="lg:col-span-3 space-y-5">
            {/* Desktop Search + Info Bar */}
            <div className="hidden lg:flex items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Exibindo <span className="font-bold text-foreground">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "produto" : "produtos"}
                {selectedCategory !== "Todos" && (
                  <span className="ml-1 text-primary font-medium">em "{selectedCategory}"</span>
                )}
                {selectedLetter !== "Todos" && (
                  <span className="ml-1 text-primary font-medium">(Letra {selectedLetter})</span>
                )}
              </div>
            </div>

            {/* Alphabet Filter Bar (A-Z) */}
            <div className="bg-card p-2.5 md:p-3.5 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-2 px-1 text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-foreground/70">
                  Filtro Alfabético
                </span>
                {selectedLetter !== "Todos" && (
                  <button
                    onClick={() => handleSelectLetter("Todos")}
                    className="flex items-center gap-1 text-primary hover:underline text-[11px] font-bold"
                  >
                    <RotateCcw size={12} /> Limpar letra
                  </button>
                )}
              </div>

              {/* Alphabet Buttons Container */}
              <div className="flex items-center gap-1 md:gap-1.5 overflow-x-auto pb-1 md:pb-0 scroll-smooth no-scrollbar flex-nowrap md:flex-wrap">
                {ALPHABET.map((item) => {
                  const isSelected = selectedLetter === item;
                  const count = item === "Todos" ? filteredProducts.length : letterCounts[item] || 0;
                  const hasProducts = item === "Todos" || count > 0;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectLetter(item)}
                      title={item === "Todos" ? "Exibir todos os produtos" : `Filtrar por "${item}" (${count} produtos)`}
                      className={`transition-all select-none font-bold text-xs md:text-sm shrink-0 flex items-center justify-center rounded-xl ${
                        item === "Todos"
                          ? "px-3.5 py-1.5 md:px-4 md:py-2 min-h-[34px] md:min-h-[36px]"
                          : "w-8 h-8 md:w-9 md:h-9 min-w-[32px] md:min-w-[36px]"
                      } ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary/20"
                          : hasProducts
                          ? "bg-muted/40 hover:bg-primary/10 hover:text-primary text-foreground border border-border/60 hover:border-primary/30"
                          : "bg-muted/20 text-muted-foreground/50 hover:bg-muted/40 border border-transparent"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results count mobile */}
            <div className="lg:hidden flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                <strong className="text-foreground">{filteredProducts.length}</strong> produtos encontrados
                {selectedLetter !== "Todos" && ` (Letra ${selectedLetter})`}
              </span>
              {(selectedCategory !== "Todos" || selectedLetter !== "Todos" || search) && (
                <button
                  onClick={() => {
                    handleSelectCategory("Todos");
                    setSelectedLetter("Todos");
                    setSearch("");
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Products Grid */}
            {isLoadingProducts ? (
              <div className="text-center py-24 text-muted-foreground bg-card rounded-2xl border border-border">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p>Carregando produtos...</p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in-50 duration-300">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.slug} {...p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border p-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <Search size={22} />
                </div>
                <p className="text-lg font-bold text-foreground mb-2">
                  {selectedLetter !== "Todos"
                    ? `Nenhum produto encontrado para a letra "${selectedLetter}".`
                    : "Nenhum produto encontrado"}
                </p>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                  {selectedLetter !== "Todos"
                    ? `Não encontramos decorações iniciando com a letra "${selectedLetter}" ${
                        selectedCategory !== "Todos" ? `na categoria "${selectedCategory}"` : ""
                      }. Tente selecionar outra letra ou clique em "Todos".`
                    : "Tente buscar por outro termo ou selecione outra categoria."}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {selectedLetter !== "Todos" && (
                    <button
                      onClick={() => handleSelectLetter("Todos")}
                      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all"
                    >
                      Ver Todos (A-Z)
                    </button>
                  )}
                  {selectedCategory !== "Todos" && (
                    <button
                      onClick={() => handleSelectCategory("Todos")}
                      className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-secondary/80 transition-all"
                    >
                      Todas as Categorias
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination with Smooth Scroll */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-6 flex-wrap">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3.5 h-10 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all border border-border bg-card hover:bg-accent text-foreground disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Page Numbers */}
                {paginationRange.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof p === "number" && handlePageChange(p)}
                    disabled={typeof p !== "number"}
                    className={`min-w-[38px] md:min-w-[42px] h-10 px-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${
                      p === page
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : typeof p === "number"
                        ? "border border-border bg-card hover:bg-accent text-foreground shadow-sm"
                        : "cursor-default text-muted-foreground border-transparent bg-transparent"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 h-10 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all border border-border bg-card hover:bg-accent text-foreground disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  aria-label="Próxima página"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Produtos;
