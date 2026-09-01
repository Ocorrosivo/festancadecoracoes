import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, ImagePlus, Loader2, GripVertical, Star, Trash2, Plus, X } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useProducts, useAddProduct, useUpdateProduct, type CreatedProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { uploadStorageFile } from "@/utils/supabaseStorage";
import { invokeAdminData } from "@/utils/adminApi";
import { toNumberOrNull, type ProductImage } from "@/utils/productImagePrice";
import { toast } from "sonner";

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: products = [] } = useProducts();
  const { data: dbCategories = [] } = useCategories(true);
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [codigo, setCodigo] = useState("");
  const [trending, setTrending] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const categoriesList = useMemo(() => dbCategories.map((c) => c.name), [dbCategories]);

  // Load product data for editing
  useEffect(() => {
    if (isEditing && products.length > 0) {
      const product = products.find((p) => p.id === id);
      if (!product) {
        toast.error("Produto não encontrado");
        navigate("/admin/produtos");
        return;
      }
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price);
      setDescription(product.description || "");
      setDimensions(product.dimensions || "");
      setCodigo(product.codigo || "");
      setTrending(product.trending || false);

      // Load images from product_images table
      (async () => {
        try {
          const data = await invokeAdminData<{ data?: ProductImage[] }>({
            resource: "product_images",
            action: "list",
            id,
          });
          if (data?.data && data.data.length > 0) {
            setImages(data.data.map((img, idx) => ({
              id: img.id,
              product_id: img.product_id,
              image_url: img.image_url,
              custom_price: toNumberOrNull(img.custom_price ?? img.price),
              nome_opcional: img.nome_opcional ?? null,
              is_primary: img.is_primary,
              ordem: img.ordem ?? idx,
            })));
          } else if (product.image) {
            setImages([{ image_url: product.image, is_primary: true, ordem: 0, custom_price: null, nome_opcional: null }]);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erro desconhecido";
          toast.error("Erro ao carregar imagens: " + msg);
        }
      })();
    }
  }, [isEditing, id, products, navigate]);

  useEffect(() => {
    if (!isEditing && categoriesList.length > 0 && !category) {
      setCategory(categoriesList[0]);
    }
  }, [categoriesList, isEditing, category]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newImages: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadStorageFile(file, "produtos");
        newImages.push({
          image_url: url,
          custom_price: null,
          nome_opcional: null,
          is_primary: images.length === 0 && newImages.length === 0,
          ordem: images.length + newImages.length,
        });
      }
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} imagem(ns) enviada(s)!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente";
      toast.error("Erro ao enviar imagem: " + msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  };

  const setPrimary = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const updateImagePrice = (idx: number, value: number | null) => {
    setImages((prev) => prev.map((img, i) => i === idx ? { ...img, custom_price: value } : img));
  };

  const updateImageName = (idx: number, value: string) => {
    setImages((prev) => prev.map((img, i) => i === idx ? { ...img, nome_opcional: value } : img));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated.map((img, i) => ({ ...img, ordem: i }));
    });
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategory(trimmed);
    setNewCategory("");
    setShowNewCategory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price) {
      toast.error("Preencha nome, categoria e preço.");
      return;
    }
    if (images.length === 0) {
      toast.error("Adicione pelo menos uma imagem.");
      return;
    }
    if (!images.some((img) => img.is_primary)) {
      toast.error("Defina uma imagem como principal.");
      return;
    }

    setSaving(true);
    try {
      const primaryImage = images.find((img) => img.is_primary)?.image_url || images[0].image_url;
      // Se não houver código, pode ser interessante usar um fallback, mas deixaremos salvar vazio se quiser, 
      // ou gerar baseado no ID se for criado, porém o backend gera o ID. Vamos deixar como está ou pegar do nome.
      const productData = { name, category, price, description, dimensions, codigo: codigo.trim() || undefined, trending, image: primaryImage };

      if (isEditing) {
        const product = products.find((p) => p.id === id);
        if (!product) throw new Error("Produto não encontrado");
        await new Promise<void>((resolve, reject) => {
          updateProduct.mutate({ slug: product.slug, data: productData }, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });
        // Save images
        await invokeAdminData({
          resource: "product_images",
          action: "upsert_all",
          id,
          payload: { images },
        });
        toast.success("Produto atualizado!");
      } else {
        // A Edge Function devolve o id do produto criado. Buscar depois por
        // nome era ambíguo: o catálogo tem nomes repetidos e as imagens podiam
        // acabar anexadas ao produto errado.
        const createdProduct = await new Promise<CreatedProduct | null>((resolve, reject) => {
          addProduct.mutate(productData, {
            onSuccess: (created) => resolve(created),
            onError: (err) => reject(err),
          });
        });
        if (createdProduct?.id) {
          await invokeAdminData({
            resource: "product_images",
            action: "upsert_all",
            id: createdProduct.id,
            payload: { images },
          });
        }
        toast.success("Produto cadastrado!");
      }
      navigate("/admin/produtos");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro ao salvar: " + msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />

        <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/produtos")} className="shrink-0">
              <ArrowLeft size={18} />
            </Button>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5 hidden sm:block">
                Produtos / <span className="text-foreground">{isEditing ? "Editar Produto" : "Novo Produto"}</span>
              </p>
              <h1 className="text-lg sm:text-xl font-heading font-bold text-foreground truncate">
                {isEditing ? "Editar Produto" : "Novo Produto"}
              </h1>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="rounded-xl gap-2 shrink-0">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">{isEditing ? "Salvar Alterações" : "Cadastrar Produto"}</span>
            <span className="sm:hidden">Salvar</span>
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Informações do Produto</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="prod-name">Nome *</Label>
                  <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do produto" required />
                </div>

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
                      <Button type="button" size="sm" onClick={handleAddCategory} className="shrink-0"><Plus size={16} /></Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewCategory(false)} className="shrink-0"><X size={16} /></Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categoriesList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          {category && !categoriesList.includes(category) && <SelectItem value={category}>{category}</SelectItem>}
                        </SelectContent>
                      </Select>
                      <Button type="button" size="icon" variant="outline" onClick={() => setShowNewCategory(true)} title="Nova categoria"><Plus size={16} /></Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="prod-price">Preço Principal *</Label>
                  <CurrencyInput 
                    id="prod-price" 
                    placeholder="R$ 0,00" 
                    value={price} 
                    onValueChange={(_val, formatted) => setPrice(formatted)} 
                    required 
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="prod-desc">Descrição</Label>
                  <Textarea id="prod-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                
                <div>
                  <Label htmlFor="prod-codigo">Código do Produto</Label>
                  <Input id="prod-codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: 0123" />
                </div>



                <div className="flex items-end">
                  <div className="flex items-center gap-2 pb-2">
                    <Checkbox id="prod-trend" checked={trending} onCheckedChange={(v) => setTrending(v === true)} />
                    <Label htmlFor="prod-trend" className="cursor-pointer">Produto em alta</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Imagens do Produto</h2>
                <span className="text-xs text-muted-foreground">{images.length} imagem(ns)</span>
              </div>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-sm">Enviando...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus size={32} />
                    <span className="text-sm">Clique ou arraste imagens aqui</span>
                    <span className="text-xs">PNG, JPG, WebP (múltiplas)</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className={`relative border rounded-xl overflow-hidden ${img.is_primary ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-muted">
                        <img src={img.image_url} alt={`Imagem ${idx + 1}`} className="w-full h-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            PRINCIPAL
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="p-3 space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Nome da variação (opcional)</label>
                          <Input
                            placeholder="Ex: Tema Coral, Azul bebê, Modelo A"
                            value={img.nome_opcional ?? ""}
                            onChange={(e) => updateImageName(idx, e.target.value)}
                            className="h-8 text-sm mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Preço desta imagem (opcional)</label>
                          <CurrencyInput
                            placeholder="Usa o preço principal"
                            value={img.custom_price}
                            onValueChange={(val) => updateImagePrice(idx, val)}
                            className="h-8 text-sm mt-1"
                          />
                          {img.custom_price == null && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">Usa o preço principal do produto</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            type="button"
                            variant={img.is_primary ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => setPrimary(idx)}
                            disabled={img.is_primary}
                          >
                            <Star size={12} /> Principal
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => moveImage(idx, idx - 1)}
                            disabled={idx === 0}
                          >
                            <GripVertical size={12} /> &uarr;
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => moveImage(idx, idx + 1)}
                            disabled={idx === images.length - 1}
                          >
                            <GripVertical size={12} /> &darr;
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => removeImage(idx)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AdminProductForm;
