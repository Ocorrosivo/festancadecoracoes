import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logoFestanca from "@/assets/logo-festanca.png";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasValidSession, setAdminProfile } from "@/utils/adminSession";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    hasValidSession().then((valid) => {
      if (active && valid) navigate("/admin/dashboard", { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast({ title: "Aceite os termos para continuar", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: {
          action: "login",
          email: email.trim().toLowerCase(),
          password,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: data.error, description: "Verifique suas credenciais e tente novamente.", variant: "destructive" });
      } else if (data?.success) {
        // Sessão nativa do Supabase Auth: única fonte do access_token.
        // persistSession + autoRefreshToken cuidam da renovação automática.
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token,
        });
        if (sessionError) throw sessionError;

        setAdminProfile({
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name || "",
          role: data.admin.role || "Viewer",
          permissions: data.admin.permissions || {},
        });
        navigate("/admin/dashboard");
      }
    } catch (rawErr: unknown) {
      const err = rawErr as { context?: { json?: () => Promise<{ error?: string }> }; message?: string };
      let errorMessage = "Não foi possível conectar ao servidor. Tente novamente.";

      if (err?.context && typeof err.context.json === 'function') {
        try {
          const body = await err.context.json();
          if (body && body.error) {
            errorMessage = body.error;
          }
        } catch {
          // corpo não é JSON: mantém a mensagem genérica de conexão
        }
      } else if (err?.message) {
        if (err.message === "Edge Function returned a non-2xx status code") {
          errorMessage = "Email ou senha incorretos.";
        } else if (err.message === "Failed to send a request to the Edge Function") {
          // Rede, CORS ou variáveis de ambiente ausentes no build. O detalhe
          // técnico vai só para o console — nunca expor a URL interna ao usuário.
          console.error("Falha ao invocar a Edge Function admin-auth:", rawErr);
          errorMessage = import.meta.env.VITE_SUPABASE_URL
            ? "Não foi possível conectar ao servidor. Tente novamente."
            : "Erro de configuração do sistema. Entre em contato com o administrador.";
        } else {
          errorMessage = err.message;
        }
      }

      toast({ title: "Falha no Login", description: errorMessage, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background font-display flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-card rounded-2xl border border-primary/10 p-8 sm:p-10 space-y-6 shadow-xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex items-center justify-center mx-auto mb-4"
          >
            <img src={logoFestanca} alt="Festança Decorações" className="h-16 w-auto object-contain" />
          </motion.div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Faça login para acessar o painel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3.5 rounded-xl border border-primary/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-primary/10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={showPassword ? "hide" : "show"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary/30 accent-primary"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              Li e concordo com os termos de uso e política de privacidade
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Autenticando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Esqueci minha senha
          </button>
        </div>
      </motion.div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Entre em contato com o administrador para redefinir sua senha.
          </p>
          <button
            onClick={() => setForgotOpen(false)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-all mt-2"
          >
            Entendido
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogin;
