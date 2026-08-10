import { useParams, Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Star, Info, CalendarDays, CheckCircle, Maximize2, AlertCircle, ShoppingBag } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useProducts } from "@/hooks/useProducts";
import { useProductImages } from "@/hooks/useProductImages";
import { getEffectivePrice, getVariationName, type ProductImage } from "@/utils/productImagePrice";
import BookingConfirmationDialog from "@/components/BookingConfirmationDialog";
import ImageModal from "@/components/ImageModal";
import { MaskedInput } from "@/components/ui/MaskedInput";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: products = [], isLoading, isError } = useProducts();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Índice da variação de imagem selecionada. Fonte única da verdade da galeria.
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const galleryProductId = useRef<string | null>(null);

  // Normalize slug matching safely
  const decodedSlug = useMemo(() => {
    if (!slug) return "";
    try {
      return decodeURIComponent(slug).toLowerCase().trim();
    } catch {
      return slug.toLowerCase().trim();
    }
  }, [slug]);

  const product = useMemo(() => {
    if (!decodedSlug || !Array.isArray(products) || products.length === 0) return null;

    return (
      products.find((p) => {
        if (!p || !p.slug) return false;
        const pSlug = p.slug.toLowerCase().trim();
        const pNameSlug = p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "";
        return pSlug === decodedSlug || pNameSlug === decodedSlug;
      }) || null
    );
  }, [products, decodedSlug]);

  useEffect(() => {
    setSelectedDate(null);
    setShowBooking(false);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientCity("");
    setBookingTime("");
    setBookingNotes("");
    setCurrentMonth(new Date());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const relatedProducts = useMemo(() => {
    if (!product) return products.slice(0, 4);
    return products.filter((p) => p && p.slug !== product.slug).slice(0, 4);
  }, [products, product]);

  // Variações de imagem do produto (leitura pública).
  const { data: dbImages = [] } = useProductImages(product?.id);

  // Galeria efetiva: usa product_images quando existirem, senão fallback para product.image.
  const galleryImages = useMemo<ProductImage[]>(() => {
    if (dbImages.length > 0) return dbImages;
    if (product?.image) {
      return [{ image_url: product.image, is_primary: true, ordem: 0, custom_price: null, nome_opcional: null }];
    }
    return [];
  }, [dbImages, product?.image]);

  // Reseta seleção apenas ao trocar de produto; atualizações da galeria preservam seleção válida.
  useEffect(() => {
    if (galleryProductId.current === product?.id) {
      setSelectedImageIndex((currentIdx) =>
        galleryImages.length === 0 ? 0 : Math.min(currentIdx, galleryImages.length - 1)
      );
      return;
    }
    galleryProductId.current = product?.id ?? null;
    const primaryIdx = galleryImages.findIndex((img) => img.is_primary);
    const startIdx = galleryImages.length === 0 ? 0 : (primaryIdx >= 0 ? primaryIdx : 0);
    setSelectedImageIndex(startIdx);
    setSelectedImageId(galleryImages[startIdx]?.id ?? null);
  }, [product?.id, galleryImages]);

  const selectImage = useCallback((idx: number) => {
    if (idx < 0 || idx >= galleryImages.length) return;
    setSelectedImageIndex(idx);
    setSelectedImageId(galleryImages[idx]?.id ?? null);
  }, [galleryImages]);

  const goPrev = useCallback(() => {
    if (galleryImages.length === 0) return;
    const next = (selectedImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImageIndex(next);
    setSelectedImageId(galleryImages[next]?.id ?? null);
  }, [galleryImages, selectedImageIndex]);

  const goNext = useCallback(() => {
    if (galleryImages.length === 0) return;
    const next = (selectedImageIndex + 1) % galleryImages.length;
    setSelectedImageIndex(next);
    setSelectedImageId(galleryImages[next]?.id ?? null);
  }, [galleryImages, selectedImageIndex]);

  // Teclado quando a galeria tem foco/mais de uma imagem.
  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) return; // ImageModal trata seu próprio teclado
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryImages.length, goPrev, goNext, modalOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-display flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          <div className="h-5 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="aspect-[4/3] bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-6 w-1/4 bg-muted rounded animate-pulse" />
              <div className="h-12 w-1/3 bg-muted rounded-xl animate-pulse" />
              <div className="h-48 bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. Custom 404 / Product Not Found Screen (Prevents Blank Screen)
  if (!product || isError) {
    return (
      <div className="min-h-screen bg-background font-display flex flex-col">
        <SEO
          title="Produto Não Encontrado"
          description="O produto solicitado não foi localizado em nosso catálogo de decorações."
        />
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-card rounded-3xl border border-border p-8 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Produto Não Encontrado</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Desculpe, a decoração que você procura não está disponível ou o link pode ter sido alterado.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
              <Link
                to="/produtos"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Ver Todo o Catálogo
              </Link>
              <Link
                to="/"
                className="bg-accent hover:bg-accent/80 text-foreground px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center"
              >
                Voltar para a Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    if (prev >= now) {
      setCurrentMonth(prev);
    }
  };
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const productName = product.name || "Decoração de Festa";
  const productPrice = product.price || "Sob consulta";
  const productCategory = product.category || "Geral";
  const productDescription = product.description || "Decoração completa planejada para tornar sua festa única e inesquecível.";
  const productDimensions = product.dimensions || "Sob consulta";

  // Seleção efetiva: prioriza o id selecionado (estável entre refetches), com fallback no índice.
  const idIndex = selectedImageId ? galleryImages.findIndex((img) => img.id === selectedImageId) : -1;
  const safeIndex = idIndex >= 0
    ? idIndex
    : Math.min(selectedImageIndex, Math.max(galleryImages.length - 1, 0));
  const selectedImage = galleryImages[safeIndex] ?? null;
  const productImage = selectedImage?.image_url || product.image || "";
  const selectedPrice = getEffectivePrice(selectedImage, productPrice);
  const selectedVariationName = getVariationName(selectedImage);

  return (
    <div className="min-h-screen bg-background font-display flex flex-col">
      {/* Dynamic SEO Meta Tags */}
      <SEO
        title={productName}
        description={productDescription.slice(0, 160)}
        image={productImage}
        url={`https://festancadecoracoes.com.br/produto/${product.slug}`}
      />

      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link to="/produtos" className="hover:text-primary transition-colors">Catálogo</Link>
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{productName}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Left Column: Product Image & Full Screen Trigger */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted cursor-pointer group shadow-sm border border-border"
              onClick={() => setModalOpen(true)}
              onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const delta = e.changedTouches[0]?.clientX - touchStartX.current;
                if (Math.abs(delta) > 40) (delta > 0 ? goPrev : goNext)();
                touchStartX.current = null;
              }}
              title="Clique para ampliar a imagem"
            >
              <img
                src={productImage}
                alt={selectedVariationName ? `${productName} — ${selectedVariationName}` : productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              {galleryImages.length > 1 && (
                <>
                  <button type="button" aria-label="Imagem anterior" onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/85 p-2 text-foreground shadow hover:bg-card">
                    <ChevronLeft size={20} />
                  </button>
                  <button type="button" aria-label="Próxima imagem" onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/85 p-2 text-foreground shadow hover:bg-card">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-card text-primary px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-xl flex items-center gap-1.5">
                  <Maximize2 size={16} /> Ver em Tela Cheia
                </span>
              </div>
            </div>
            {selectedVariationName && <p className="text-sm font-semibold text-primary">Variação: {selectedVariationName}</p>}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Variações do produto">
                {galleryImages.map((img, idx) => (
                  <button
                    type="button"
                    key={img.id ?? `${img.image_url}-${idx}`}
                    aria-label={`Selecionar imagem ${idx + 1}`}
                    aria-pressed={idx === safeIndex}
                    onClick={() => selectImage(idx)}
                    className={`shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === safeIndex ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Details & Booking Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
                {productCategory}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-foreground">{productName}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span className="text-sm text-muted-foreground">(24 Avaliações)</span>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valor da Locação</p>
                <p className="text-4xl font-bold text-primary">{selectedPrice}</p>
              </div>

              {/* Ver Disponibilidade Badge */}
              <div className="mt-3">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 text-green-600 font-bold text-sm border border-green-200">
                  <CheckCircle size={16} /> Ver Disponibilidade
                </span>
              </div>
            </div>

            {/* Calendar Block */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 text-base sm:text-lg">
                <CalendarDays size={20} className="text-primary" /> Selecione a Data do Evento
              </h3>
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={prevMonth} className="text-muted-foreground hover:text-primary transition-colors p-1">
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold capitalize">{monthName}</span>
                <button type="button" onClick={nextMonth} className="text-muted-foreground hover:text-primary transition-colors p-1">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                  <span key={d} className="py-2 font-bold text-muted-foreground">{d}</span>
                ))}
                {[...Array(firstDay)].map((_, i) => (
                  <span key={`empty-${i}`} className="py-2 text-muted-foreground/30">
                    {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate() - firstDay + i + 1}
                  </span>
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isPast = dateToCheck < today;
                  const isSelected = selectedDate === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => setSelectedDate(day)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-md"
                          : isPast
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : "hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-6 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/10" /> Disponível</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /> Sua Seleção</span>
              </div>
            </div>

            {/* Booking Box */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
              <h3 className="font-bold flex items-center gap-2 text-base">
                <CheckCircle size={18} className="text-primary" /> Solicitador de Locação
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate
                  ? `Data selecionada: ${selectedDate} de ${monthName}`
                  : "Selecione uma data no calendário acima para continuar."}
              </p>

              {selectedDate && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Nome completo *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">WhatsApp / Telefone *</label>
                      <MaskedInput
                        mask="(00) 00000-0000"
                        value={clientPhone}
                        onAccept={(val: string) => setClientPhone(val)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">E-mail (Opcional)</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Cidade / Bairro</label>
                      <input
                        type="text"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder="Ex: São Paulo / Tatuapé"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Horário do Evento</label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Observações (Opcional)</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Detalhes adicionais sobre o local ou evento"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedDate || !clientName.trim() || !clientPhone.trim()}
                onClick={() => setShowBooking(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                Solicitar Reserva no WhatsApp
              </button>
            </div>

            <BookingConfirmationDialog
              open={showBooking}
              onOpenChange={setShowBooking}
              productName={productName}
              date={`${selectedDate} de ${monthName}`}
              price={selectedPrice}
              variationName={selectedVariationName}
              clientName={clientName.trim()}
              clientPhone={clientPhone.trim()}
              clientEmail={clientEmail.trim()}
              clientCity={clientCity.trim()}
              bookingTime={bookingTime}
              bookingNotes={bookingNotes.trim()}
            />
          </motion.div>
        </div>

        {/* Product Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6 mb-16 shadow-sm"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Info size={20} className="text-primary" /> Detalhes da Decoração
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Categoria</p>
              <p className="font-medium">{productCategory}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Dimensões</p>
              <p className="font-medium">{productDimensions}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Disponibilidade</p>
              <p className="font-medium text-green-600">Pronta Entrega</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Serviço</p>
              <p className="font-medium">Montagem e Desmontagem</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-2 font-medium">Descrição Completa</p>
            <p className="text-sm leading-relaxed max-w-3xl text-foreground/90">
              {productDescription}
            </p>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">Outras Decorações</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/produto/${p.slug}`}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all"
                >
                  <div className="h-44 overflow-hidden bg-muted">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">Sem Imagem</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{p.category}</p>
                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{p.name}</h3>
                    <p className="text-primary font-bold mt-1 text-sm">{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Full Screen Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        src={productImage}
        alt={selectedVariationName ? `${productName} — ${selectedVariationName}` : productName}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;
