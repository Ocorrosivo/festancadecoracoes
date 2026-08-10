export interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  is_primary: boolean;
  /** Preço opcional desta variação de imagem. `null` = usa o preço principal do produto. */
  custom_price?: number | null;
  /** Nome opcional da variação (ex.: tema, cor, modelo). */
  nome_opcional?: string | null;
  /** Ordem canônica de exibição. Começa em 0. */
  ordem?: number;
  /** Campos legados sincronizados pela Edge Function durante migração. */
  price?: number | null;
  sort_order?: number;
  created_at?: string | null;
}

/** Converte string/string|null do banco em número|null sem perder valores. */
export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const text = String(value).trim().replace(/^R\$\s*/i, "");
  if (!text) return null;
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Preço efetivo da variação selecionada:
 * usa `custom_price` quando preenchido (maior que zero), senão o preço principal do produto.
 */
export function getEffectivePrice(image: ProductImage | undefined | null, productPrice: string): string {
  const custom = toNumberOrNull(image?.custom_price);
  if (custom !== null && custom > 0) {
    return `R$ ${custom.toFixed(2).replace(".", ",")}`;
  }
  return productPrice;
}

/**
 * Nome da variação exibido na página pública.
 * Retorna `null` quando a imagem não tem nome opcional definido.
 */
export function getVariationName(image: ProductImage | undefined | null): string | null {
  const name = image?.nome_opcional?.trim();
  return name ? name : null;
}

/**
 * Mensagem WhatsApp do fluxo de reserva.
 * Sempre usa o preço efetivo da imagem selecionada (nunca o preço principal quando existe custom_price).
 */
export function buildWhatsAppMessage(opts: {
  productName: string;
  clientName: string;
  date?: string;
  price?: string;
  variationName?: string | null;
}): string {
  const lines: string[] = [
    `Olá! Gostaria de solicitar a reserva da decoração *${opts.productName}*`,
  ];
  if (opts.variationName) {
    lines.push(`Variação: *${opts.variationName}*`);
  }
  if (opts.price) {
    lines.push(`Valor da locação: *${opts.price}*`);
  }
  if (opts.date) {
    lines.push(`Data: *${opts.date}*`);
  }
  if (opts.clientName) {
    lines.push(`Meu nome: ${opts.clientName}`);
  }
  return lines.join("\n");
}