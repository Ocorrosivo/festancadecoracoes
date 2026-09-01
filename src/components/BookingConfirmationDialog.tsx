import { useState, useEffect } from "react";
import { CheckCircle, MessageCircle, PartyPopper, Calendar, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildWhatsAppUrl } from "@/config/constants";
import { supabase } from "@/integrations/supabase/client";

interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  variationName?: string | null;
  productCode?: string;
  productSlug?: string;
  productImage?: string;
  date: string;
  price: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientCity?: string;
  bookingTime?: string;
  bookingNotes?: string;
}

const BookingConfirmationDialog = ({
  open,
  onOpenChange,
  productName,
  variationName,
  productCode,
  productSlug,
  productImage,
  date,
  price,
  clientName,
  clientPhone,
  clientEmail,
  clientCity,
  bookingTime,
  bookingNotes,
}: BookingConfirmationDialogProps) => {
  const [countdown, setCountdown] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setSaved(false);
      return;
    }

    if (!saved) {
      // Persiste o produto junto da variação selecionada (quando houver),
      // e sempre o preço efetivo já resolvido pela página.
      const productLabel = variationName ? `${productName} — ${variationName}` : productName;
      supabase.functions.invoke("create-booking", {
        body: {
          client_name: clientName || "",
          client_phone: clientPhone || "",
          client_email: clientEmail || "",
          client_city: clientCity || "",
          booking_time: bookingTime || "",
          booking_notes: bookingNotes || "",
          product: productLabel,
          date,
          price,
        },
      }).then(() => setSaved(true)).catch(() => setSaved(true));
    }
  }, [open, saved, clientName, clientPhone, clientEmail, clientCity, bookingTime, bookingNotes, productName, variationName, date, price]);

  useEffect(() => {
    if (!open) {
      setCountdown(3);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const productLabel = variationName ? `${productName} — ${variationName}` : productName;
          
          const baseUrl = window.location.origin;
          const urlProduto = productSlug ? `${baseUrl}/produto/${productSlug}` : baseUrl;
          const imgAbsoluta = productImage?.startsWith("http") ? productImage : (productImage ? `${baseUrl}${productImage}` : "");
          
          const message = `Olá! Gostaria de fazer uma reserva.

👤 Cliente: ${clientName || ""}
📦 Produto: ${productLabel}
🔢 Código: ${productCode || "N/A"}
📅 Data: ${date}
💰 Valor: ${price}

🔗 Ver produto:
${urlProduto}

🖼️ Imagem:
${imgAbsoluta}

Podemos confirmar a disponibilidade?`;

          window.open(buildWhatsAppUrl(message), "_blank");
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, productName, variationName, productCode, productSlug, productImage, date, price, clientName, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <AnimatePresence>
          {open && (
            <>
              {/* Animated success icon */}
              <motion.div
                className="flex justify-center pt-2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="text-primary" size={40} strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Confetti particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-primary"
                  initial={{ opacity: 0, y: 0, x: "50%" }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -60 - i * 15],
                    x: `${50 + (i % 2 === 0 ? -1 : 1) * (20 + i * 10)}%`,
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                >
                  <PartyPopper size={14} />
                </motion.div>
              ))}

              <DialogHeader>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DialogTitle className="text-center text-xl">
                    Reserva Confirmada! 🎉
                  </DialogTitle>
                </motion.div>
              </DialogHeader>

              <motion.div
                className="space-y-4 py-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-accent rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Tag size={16} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Produto</span>
                    <span className="font-bold ml-auto">{variationName ? `${productName} — ${variationName}` : productName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-bold ml-auto">{date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary shrink-0 text-base">💰</span>
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-bold text-primary ml-auto">{price}</span>
                  </div>
                </div>

                <motion.div
                  className="text-center space-y-3 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <MessageCircle size={20} className="text-primary" />
                    </motion.div>
                    <span className="text-sm">Redirecionando para o WhatsApp em</span>
                  </div>
                  <motion.span
                    key={countdown}
                    className="text-5xl font-bold text-primary block"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {countdown}
                  </motion.span>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmationDialog;
