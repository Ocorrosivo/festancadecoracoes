/**
 * Normaliza e extrai apenas os dígitos válidos de um telefone brasileiro.
 * Trata prefixos como "+55" ou "55" quando o número completo é fornecido.
 */
export function normalizePhoneDigits(value: unknown): string {
  if (value === null || value === undefined) return "";
  let digits = String(value).replace(/\D/g, "");

  // Se vier com prefixo internacional 55 e tiver mais que 11 dígitos (ex: 5541984027094 = 13 dígitos)
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  // Limita ao tamanho máximo de um número brasileiro com DDD (11 dígitos: 2 DDD + 9 celular)
  return digits.slice(0, 11);
}

/**
 * Formata um número brasileiro dinamicamente:
 * - 10 dígitos (Fixo): (DD) XXXX-XXXX
 * - 11 dígitos (Celular): (DD) 9XXXX-XXXX
 * - Dígitos parciais durante digitação
 */
export function formatBrazilianPhone(value: unknown): string {
  const digits = normalizePhoneDigits(value);
  if (!digits) return "";

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  // Se tem 11 dígitos (Celular com 9 dígitos após DDD)
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  // Se tem de 7 a 10 dígitos (Fixo padrão ou digitação intermediária)
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

/**
 * Formata o número para o padrão internacional do WhatsApp (wa.me/55...)
 * Exemplo: "(41) 98402-7094" -> "5541984027094"
 */
export function formatWhatsAppUrlNumber(value: unknown, defaultFallback = "5511999999999"): string {
  if (!value) return defaultFallback;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return defaultFallback;

  // Se tem 10 ou 11 dígitos (DDD + número), adiciona DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  // Se já tem 12 ou 13 dígitos e começa com 55, mantém
  if (digits.length >= 12 && digits.startsWith("55")) {
    return digits.slice(0, 13);
  }

  return digits || defaultFallback;
}
