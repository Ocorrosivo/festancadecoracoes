import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import TrackingScripts from "./components/TrackingScripts";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading components for performance
const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Produtos = lazy(() => import("./pages/Produtos"));
const SobreNos = lazy(() => import("./pages/SobreNos"));
const Contato = lazy(() => import("./pages/Contato"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminClientes = lazy(() => import("./pages/admin/AdminClientes"));
const AdminRelatorios = lazy(() => import("./pages/admin/AdminRelatorios"));
const AdminClienteDetalhe = lazy(() => import("./pages/admin/AdminClienteDetalhe"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminGerenciar = lazy(() => import("./pages/admin/AdminGerenciar"));
const SettingsIdentity = lazy(() => import("./pages/admin/settings/SettingsIdentity"));
const SettingsHome = lazy(() => import("./pages/admin/settings/SettingsHome"));
const SettingsAbout = lazy(() => import("./pages/admin/settings/SettingsAbout"));
const SettingsContact = lazy(() => import("./pages/admin/settings/SettingsContact"));
const SettingsFooter = lazy(() => import("./pages/admin/settings/SettingsFooter"));
const SettingsSeo = lazy(() => import("./pages/admin/settings/SettingsSeo"));
const SettingsFaq = lazy(() => import("./pages/admin/settings/SettingsFaq"));
const AdminBanner = lazy(() => import("./pages/admin/AdminBanner"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const PoliticaReembolso = lazy(() => import("./pages/PoliticaReembolso"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// QueryClient configuration: refetchOnWindowFocus: false prevents tab-switch flickering!
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TrackingScripts />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/produto/:slug" element={<ProductDetail />} />
              <Route path="/sobre" element={<SobreNos />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/politica-de-reembolso" element={<PoliticaReembolso />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/produtos" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/produtos/novo" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/produtos/:id/editar" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
              <Route path="/admin/categorias" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
              <Route path="/admin/banner" element={<ProtectedRoute><AdminBanner /></ProtectedRoute>} />
              
              {/* Split Settings Routes */}
              <Route path="/admin/configuracoes" element={<ProtectedRoute><SettingsIdentity /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/identidade" element={<ProtectedRoute><SettingsIdentity /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/home" element={<ProtectedRoute><SettingsHome /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/sobre" element={<ProtectedRoute><SettingsAbout /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/contato" element={<ProtectedRoute><SettingsContact /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/rodape" element={<ProtectedRoute><SettingsFooter /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/seo" element={<ProtectedRoute><SettingsSeo /></ProtectedRoute>} />
              <Route path="/admin/configuracoes/faq" element={<ProtectedRoute><SettingsFaq /></ProtectedRoute>} />

              <Route path="/admin/clientes" element={<ProtectedRoute><AdminClientes /></ProtectedRoute>} />
              <Route path="/admin/clientes/:id" element={<ProtectedRoute><AdminClienteDetalhe /></ProtectedRoute>} />
              <Route path="/admin/relatorios" element={<ProtectedRoute><AdminRelatorios /></ProtectedRoute>} />
              <Route path="/admin/marketing" element={<ProtectedRoute><AdminMarketing /></ProtectedRoute>} />
              <Route path="/admin/gerenciar" element={<ProtectedRoute><AdminGerenciar /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
