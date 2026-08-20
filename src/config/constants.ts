import { formatWhatsAppUrlNumber } from "@/utils/phoneMask";

export const WHATSAPP_NUMBER = "5551991205664";

export const COMPANY = {
  name: "Festança Decorações",
  tagline: "Você sonha, nós realizamos.",
  email: "Festanca.decoracoes@outlook.com",
  phone: "(51) 99120-5664",
  address: "Av. Frederico Dihl, 3408 – Alvorada/RS | Bairro: Aparecida – CEP: 94853-250",
  instagram: "https://www.instagram.com/festanca.decoracoes",
  facebook: "https://www.facebook.com/share/1C2VPeVVFx/",
  tiktok: "https://www.tiktok.com/@festanca.decoracoes",
  maps: "https://maps.app.goo.gl/NfMJ7mKQ5PSZJEuc6",
};

export function buildWhatsAppUrl(message: string, customNumber?: string): string {
  const num = formatWhatsAppUrlNumber(customNumber, WHATSAPP_NUMBER);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
