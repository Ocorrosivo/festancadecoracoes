import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { Megaphone, Globe, Save, CheckCircle2, ExternalLink, Code2 } from "lucide-react";

const FacebookIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import { useToast } from "@/hooks/use-toast";
import { getTrackingConfig, saveTrackingConfig, type TrackingConfig } from "@/utils/trackingConfig";

const AdminMarketing = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<TrackingConfig>({ facebookPixelId: "", googleTagId: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getTrackingConfig());
  }, []);

  const handleSave = () => {
    saveTrackingConfig(config);
    setSaved(true);
    toast({ title: "Configurações salvas!", description: "As tags serão ativadas no próximo carregamento da página." });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-0.5">
              Páginas / <span className="text-foreground">Marketing</span>
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-heading font-bold text-foreground">Marketing & Rastreamento</h1>
              <Megaphone size={20} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Configure seus pixels e tags de rastreamento para medir conversões e otimizar campanhas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Facebook Pixel */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FacebookIcon size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-foreground">Facebook Pixel</h2>
                  <p className="text-xs text-muted-foreground">Meta Ads & Conversions API</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                O Facebook Pixel rastreia visitantes, conversões e permite criar públicos personalizados para suas campanhas de anúncios no Facebook e Instagram.
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Pixel ID</label>
                  <input
                    type="text"
                    value={config.facebookPixelId}
                    onChange={(e) => setConfig({ ...config, facebookPixelId: e.target.value })}
                    placeholder="Ex: 123456789012345"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-mono"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-xl">
                  <Code2 size={16} className="text-primary mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Como encontrar seu Pixel ID:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Acesse o <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Gerenciador de Eventos do Meta</a></li>
                      <li>Selecione seu Pixel na coluna esquerda</li>
                      <li>Copie o ID que aparece abaixo do nome do Pixel</li>
                    </ol>
                  </div>
                </div>
                {config.facebookPixelId && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-green-600 font-medium">Pixel configurado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Google Tag */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Globe size={24} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-foreground">Google Tag</h2>
                  <p className="text-xs text-muted-foreground">Google Analytics & Google Ads</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                A tag do Google permite rastrear visitas, comportamento dos usuários e conversões de campanhas do Google Ads e Analytics.
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tag ID (Measurement ID)</label>
                  <input
                    type="text"
                    value={config.googleTagId}
                    onChange={(e) => setConfig({ ...config, googleTagId: e.target.value })}
                    placeholder="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-mono"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-xl">
                  <Code2 size={16} className="text-primary mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Como encontrar seu Tag ID:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Acesse o <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics</a> ou <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Tag Manager</a></li>
                      <li>Vá em Admin → Fluxos de dados</li>
                      <li>Copie o ID de medição (começa com G- ou AW-)</li>
                    </ol>
                  </div>
                </div>
                {config.googleTagId && (
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-green-600 font-medium">Tag configurada</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Save size={18} />
              Salvar Configurações
            </button>
            {saved && (
              <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle2 size={16} />
                Salvo com sucesso!
              </span>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminMarketing;