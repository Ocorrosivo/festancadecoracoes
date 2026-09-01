import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, CheckCircle, XCircle, Loader2, Tags, ImagePlus } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import {
  useCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryItem,
} from "@/hooks/useCategories";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories(false);
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [createOpen, setCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fileRefNew = useRef<HTMLInputElement>(null);
  const fileRefEdit = useRef<HTMLInputElement>(null);
  const [newCatIcon, setNewCatIcon] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | null, isEdit: boolean) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadStorageFile(file, "categorias");
      if (isEdit) setEditIcon(url);
      else setNewCatIcon(url);
      toast.success("Imagem enviada!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente";
      toast.error("Erro ao enviar imagem: " + msg);
    } finally {
      setUploading(false);
      if (isEdit && fileRefEdit.current) fileRefEdit.current.value = "";
      if (!isEdit && fileRefNew.current) fileRefNew.current.value = "";
    }
  };

  const handleCreate = () => {
    if (!newCatName.trim()) return;
    addCategory.mutate(
      { name: newCatName.trim(), icon: newCatIcon },
      {
        onSuccess: () => {
          toast.success("Categoria criada no Supabase!");
          setCreateOpen(false);
          setNewCatName("");
          setNewCatIcon("");
        },
        onError: (err: Error) => {
          toast.error(err?.message || "Erro ao criar categoria.");
        },
      }
    );
  };

  const handleEdit = () => {
    if (!editingCategory || !editName.trim()) return;
    updateCategory.mutate(
      { id: editingCategory.id, data: { name: editName.trim(), icon: editIcon } },
      {
        onSuccess: () => {
          toast.success("Categoria atualizada!");
          setEditingCategory(null);
          setEditIcon("");
        },
        onError: () => {
          toast.error("Erro ao atualizar.");
        },
      }
    );
  };

  const handleToggleStatus = (cat: CategoryItem) => {
    updateCategory.mutate(
      { id: cat.id, data: { is_active: !cat.is_active } },
      {
        onSuccess: () => {
          toast.success(`Categoria ${!cat.is_active ? "ativada" : "desativada"}!`);
        },
      }
    );
  };

  const handleMoveOrder = (cat: CategoryItem, direction: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
    const index = sorted.findIndex((c) => c.id === cat.id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetCat = sorted[targetIndex];
    const currentOrder = cat.display_order;
    const targetOrder = targetCat.display_order;

    updateCategory.mutate({ id: cat.id, data: { display_order: targetOrder } });
    updateCategory.mutate({ id: targetCat.id, data: { display_order: currentOrder } });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCategory.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Categoria excluída!");
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Erro ao excluir.");
      },
    });
  };

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />

        <header className="hidden md:flex bg-card border-b border-border px-6 py-4 items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Páginas / <span className="text-foreground">Categorias</span>
            </p>
            <h1 className="text-xl font-heading font-bold text-foreground">
              Gestão de Categorias
            </h1>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="rounded-xl gap-2 shadow-md">
            <Plus size={16} /> Nova Categoria
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="md:hidden mb-4">
            <Button onClick={() => setCreateOpen(true)} className="w-full rounded-xl gap-2 shadow-md">
              <Plus size={16} /> Nova Categoria
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : sortedCategories.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <Tags size={48} className="mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Nenhuma categoria cadastrada</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50 text-muted-foreground">
                    <th className="text-left py-3 px-4">Ordem</th>
                    <th className="text-left py-3 px-4">Nome da Categoria</th>
                    <th className="text-left py-3 px-4">Slug</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map((cat, idx) => (
                    <tr key={cat.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="w-6 text-xs font-bold text-muted-foreground">{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveOrder(cat, "up")}
                            className="p-1 hover:bg-accent rounded disabled:opacity-30"
                            title="Mover para cima"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sortedCategories.length - 1}
                            onClick={() => handleMoveOrder(cat, "down")}
                            className="p-1 hover:bg-accent rounded disabled:opacity-30"
                            title="Mover para baixo"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">{cat.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs font-mono">{cat.slug}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cat.is_active ? "bg-green-500/15 text-green-700 border-green-300" : "bg-red-500/15 text-red-700 border-red-300"}
                        >
                          {cat.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingCategory(cat); setEditName(cat.name); setEditIcon(cat.icon || ""); }}
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(cat)}
                            title={cat.is_active ? "Desativar" : "Ativar"}
                            className={cat.is_active ? "text-red-500 hover:text-red-600" : "text-green-600 hover:text-green-700"}
                          >
                            {cat.is_active ? <XCircle size={15} /> : <CheckCircle size={15} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(cat.id)}
                            title="Excluir"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Dialog: Criar Categoria */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nome da Categoria</label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Infantil Menina"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Imagem da Categoria (Opcional)</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors relative flex flex-col items-center justify-center min-h-[120px]"
                onClick={() => fileRefNew.current?.click()}
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-primary" />
                ) : newCatIcon ? (
                  <img src={newCatIcon} alt="Preview" className="h-20 w-auto rounded object-cover" />
                ) : (
                  <>
                    <ImagePlus size={24} className="text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Clique para enviar imagem</span>
                  </>
                )}
              </div>
              <input
                ref={fileRefNew}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0] || null, false)}
              />
            </div>

            <Button onClick={handleCreate} disabled={addCategory.isPending || uploading} className="w-full rounded-xl">
              {addCategory.isPending ? <Loader2 size={16} className="animate-spin" /> : "Criar Categoria"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Categoria */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Nome da Categoria</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Imagem da Categoria (Opcional)</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors relative flex flex-col items-center justify-center min-h-[120px]"
                onClick={() => fileRefEdit.current?.click()}
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-primary" />
                ) : editIcon ? (
                  <img src={editIcon} alt="Preview" className="h-20 w-auto rounded object-cover" />
                ) : (
                  <>
                    <ImagePlus size={24} className="text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Clique para enviar imagem</span>
                  </>
                )}
              </div>
              <input
                ref={fileRefEdit}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0] || null, true)}
              />
            </div>

            <Button onClick={handleEdit} disabled={updateCategory.isPending || uploading} className="w-full rounded-xl">
              {updateCategory.isPending ? <Loader2 size={16} className="animate-spin" /> : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir Categoria */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Categoria?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja excluir esta categoria? Os produtos associados a ela permanecerão no banco.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1 rounded-xl">
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
