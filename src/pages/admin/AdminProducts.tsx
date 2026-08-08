import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import AdminProductDialog from "@/components/AdminProductDialog";
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
import { Plus, Pencil, Trash2, Search, Download, Upload } from "lucide-react";
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import type { Product } from "@/data/products";
import { exportToCSV } from "@/utils/exportUtils";
import { toast } from "sonner";

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
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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


  const handleSave = (data: Omit<Product, "slug">) => {
    if (editingProduct) {
      updateProduct.mutate(
        { slug: editingProduct.slug, data },
        { onSuccess: () => toast.success("Produto atualizado!") }
      );
    } else {
      addProduct.mutate(data, {
        onSuccess: () => toast.success("Produto cadastrado!"),
      });
    }
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (deleteSlug) {
      deleteProductMutation.mutate(deleteSlug, {
        onSuccess: () => toast.success("Produto excluído!"),
      });
      setDeleteSlug(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-heading font-bold text-foreground">Gestão de Produtos</h1>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button variant="outline" onClick={handleImportClick} disabled={importing} className="gap-2">
                <Upload size={16} /> {importing ? "Importando..." : "Importar CSV"}
              </Button>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download size={16} /> Exportar CSV
              </Button>
              <Button
                onClick={() => { setEditingProduct(null); setDialogOpen(true); }}
                className="gap-2"
              >
                <Plus size={16} /> Novo Produto
              </Button>
            </div>
          </div>


          <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 border border-border mb-6 max-w-sm">
            <Search size={16} className="text-muted-foreground" />
            <input
              placeholder="Buscar produto..."
              className="bg-transparent text-sm focus:outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50 text-muted-foreground">
                    <th className="text-left py-3 px-4">Imagem</th>
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4 hidden sm:table-cell">Categoria</th>
                    <th className="text-left py-3 px-4">Preço</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Dimensões</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        Carregando...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.slug} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-4">
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{p.name}</p>
                          {p.trending && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Em alta</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                        <td className="py-3 px-4 text-primary font-bold">{p.price}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{p.dimensions || "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditingProduct(p); setDialogOpen(true); }}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteSlug(p.slug)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <AdminProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
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
