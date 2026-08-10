import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImagePlus, Plus, X, Loader2 } from "lucide-react";
import type { Product } from "@/data/products";
import { useCategories } from "@/hooks/useCategories";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: Omit<Product, "slug">) => void;
}

const AdminProductDialog = ({ open, onOpenChange, product, onSave }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: dbCategories = [] } = useCategories(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [trending, setTrending] = useState(false);
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const categoriesList = useMemo(() => dbCategories.map((c) => c.name), [dbCategories]);

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setCategory(product?.category ?? categoriesList[0] ?? "Infantil menina");
      setPrice(product?.price ?? "");
      setDescription(product?.description ?? "");
      setDimensions(product?.dimensions ?? "");
      setTrending(product?.trending ?? false);
      setImage(product?.image ?? "");
      setImagePreview(product?.image ?? "");
      setShowNewCategory(false);
      setNewCategory("");
    }
  }, [open, product, categoriesList]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const url = await uploadStorageFile(file, "produtos");
      setImage(url);
      toast.success("Imagem enviada com sucesso!");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Tente novamente";
      toast.error("Erro ao enviar imagem: " + msg);
      setImagePreview(product?.image ?? "");
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategory(trimmed);
    setNewCategory("");
    setShowNewCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price || uploading) return;
    onSave({ name, category, price, description, dimensions, trending, image });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Image */}
          <div>
            <Label>Imagem do Produto</Label>
            <div
              className="mt-1 border-2 border-dashed border-border rounded-xl h-44 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden bg-muted"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus size={32} />
                  <span className="text-sm">Clique para enviar imagem</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="prod-name">Nome *</Label>
            <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* Category */}
          <div>
            <Label>Categoria *</Label>
            {showNewCategory ? (
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Nome da nova categoria"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                  autoFocus
                />
                <Button type="button" size="sm" onClick={handleAddCategory} className="shrink-0">
                  <Plus size={16} />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewCategory(false)} className="shrink-0">
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoriesList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    {category && !categoriesList.includes(category) && (
                      <SelectItem value={category}>{category}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" variant="outline" onClick={() => setShowNewCategory(true)} title="Nova categoria">
                  <Plus size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="prod-price">Preço *</Label>
            <CurrencyInput 
              id="prod-price" 
              placeholder="R$ 0,00" 
              value={price} 
              onValueChange={(_val, formatted) => setPrice(formatted)} 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="prod-desc">Descrição</Label>
            <Textarea id="prod-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Dimensions */}
          <div>
            <Label htmlFor="prod-dim">Dimensões</Label>
            <Input id="prod-dim" placeholder="Ex: 2.5m x 2.2m" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
          </div>

          {/* Trending */}
          <div className="flex items-center gap-2">
            <Checkbox id="prod-trend" checked={trending} onCheckedChange={(v) => setTrending(v === true)} />
            <Label htmlFor="prod-trend" className="cursor-pointer">Produto em alta</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {product ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProductDialog;
