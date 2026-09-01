import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Download, Upload, Package } from "lucide-react";
import { useProducts, useAddProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { Product } from "@/data/products";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const parseCSV = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  const t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"' && t[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  const filtered = rows.filter(r => r.some(v => v.trim() !== ""));
  if (filtered.length < 2) return [];
  const headers = filtered[0].map(h => h.trim());
  return filtered.slice(1).map(r => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories(false);
  const addProduct = useAddProduct();
  const deleteProductMutation = useDeleteProduct();

  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    const term = normalize(debouncedSearch.trim());
    if (term.length < 3) return products;

    const startsWithTerm: Product[] = [];
    const containsTerm: Product[] = [];

    for (const p of products) {
      const normalizedName = normalize(p.name);
      if (normalizedName.startsWith(term)) {
        startsWithTerm.push(p);
      } else if (normalizedName.includes(term)) {
        containsTerm.push(p);
      }
    }

    return [...startsWithTerm, ...containsTerm];
  }, [products, debouncedSearch]);

  const handleExport = () => {
    if (products.length === 0) {
      toast.error("Nenhum produto para exportar.");
      return;
    }
    const rows = products.map((p) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description ?? "",
      dimensions: p.dimensions ?? "",
      trending: p.trending ? "true" : "false",
      image: p.image ?? "",
    }));
    exportToCSV(rows, `produtos-${new Date().toISOString().slice(0, 10)}`);
    toast.success(`${rows.length} produto(s) exportado(s)!`);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        toast.error("CSV vazio ou inválido.");
        return;
      }
      const existingSlugs = new Set(products.map((p) => p.slug));
      const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let ok = 0, skip = 0, fail = 0;
      for (const r of rows) {
        const name = r.name?.trim();
        const category = r.category?.trim();
        const price = r.price?.trim();
        if (!name || !category || !price) { fail++; continue; }
        if (existingSlugs.has(slugify(name))) { skip++; continue; }
        try {
          await new Promise<void>((resolve, reject) => {
            addProduct.mutate({
              name,
              category,
              price,
              description: r.description || "",
              dimensions: r.dimensions || "",
              trending: /^(true|1|sim)$/i.test(r.trending || ""),
              image: r.image || "",
            }, { onSuccess: () => resolve(), onError: (err) => reject(err) });
          });
          ok++;
        } catch {
          fail++;
        }
      }
      toast.success(`Importação concluída: ${ok} novo(s), ${skip} ignorado(s), ${fail} com erro.`);
    } catch (err: unknown) {
      toast.error("Erro ao importar: " + (err instanceof Error ? err.message : "arquivo inválido"));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    if (deleteSlug) {
      deleteProductMutation.mutate(deleteSlug, {
        onSuccess: () => toast.success("Produto excluído!"),
      });
      setDeleteSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-heading font-bold text-foreground">Gestão de Produtos</h1>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button variant="outline" onClick={handleImportClick} disabled={importing} className="gap-2 flex-1 sm:flex-none">
                <Upload size={16} /> <span className="hidden sm:inline">{importing ? "Importando..." : "Importar CSV"}</span>
              </Button>
              <Button variant="outline" onClick={handleExport} className="gap-2 flex-1 sm:flex-none">
                <Download size={16} /> <span className="hidden sm:inline">Exportar CSV</span>
              </Button>
              <Button onClick={() => navigate("/admin/produtos/novo")} className="gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Plus size={16} /> Novo Produto
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border mb-6 max-w-md">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              placeholder="Buscar produto (min. 3 letras)..."
              className="bg-transparent text-sm focus:outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground text-xs shrink-0">
                &times;
              </button>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
              {debouncedSearch.length >= 3 && (
                <p className="text-sm mt-1">Tente buscar com outros termos</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <div
                  key={p.slug}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package size={40} className="opacity-30" />
                      </div>
                    )}
                    {p.trending && (
                      <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full font-bold">
                        Em alta
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
                          {p.category}
                        </p>
                        <h3 className="font-bold text-foreground truncate mt-0.5">{p.name}</h3>
                      </div>
                      <span className="text-primary font-bold text-sm whitespace-nowrap shrink-0">
                        {p.price}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 h-8 text-xs rounded-lg"
                        onClick={() => navigate(`/admin/produtos/${p.id}/editar`)}
                      >
                        <Pencil size={13} /> Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteSlug(p.slug)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent className="w-[calc(100%-24px)] rounded-2xl mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
