import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CalendarDays,
  Wallet,
  Users,
  Tags,
  TrendingUp,
  Search,
  Bell,
  ChevronRight,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { invokeAdminData } from "@/utils/adminApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const chartData = [
  { month: "JAN", value: 2100 },
  { month: "FEV", value: 3200 },
  { month: "MAR", value: 2800 },
  { month: "ABR", value: 4800 },
  { month: "MAI", value: 3600 },
  { month: "JUN", value: 5400 },
  { month: "JUL", value: 4200 },
  { month: "AGO", value: 4800 },
  { month: "SET", value: 5100 },
  { month: "OUT", value: 4600 },
  { month: "NOV", value: 5200 },
  { month: "DEZ", value: 5800 },
];

const categoryData = [
  { name: "Infantil", value: 35 },
  { name: "Casamento", value: 28 },
  { name: "15 Anos", value: 20 },
  { name: "Outros", value: 17 },
];

const COLORS = ["hsl(334, 100%, 65%)", "hsl(334, 100%, 78%)", "hsl(334, 60%, 85%)", "hsl(30, 44%, 80%)"];

const recentRentals = [
  { name: "Arco de Balões Premium", order: "#8492", time: "2h atrás", price: "R$ 120" },
  { name: "Set de Centro de Mesa Floral", order: "#8491", time: "5h atrás", price: "R$ 350" },
  { name: 'Letreiro Neon "Let\'s Party"', order: "#8490", time: "Ontem", price: "R$ 85" },
  { name: "Painel de Lantejoulas Dourado", order: "#8489", time: "Ontem", price: "R$ 200" },
  { name: "Varal de Luzes Vintage", order: "#8488", time: "2 dias atrás", price: "R$ 45" },
];

interface DashboardBooking {
  id: string;
  product: string | null;
  client_name: string | null;
  price: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);

  const { data: productsList = [] } = useProducts();
  const { data: categoriesList = [] } = useCategories(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    invokeAdminData<{ data?: DashboardBooking[] }>({
      resource: "bookings",
      action: "list",
    })
      .then((data) => {
        if (data?.data) setBookings(data.data);
      })
      .catch(() => {
        // Dashboard relatório falha silenciosamente; nada bloqueado.
      });
  }, []);

  const currentMonth = new Date().getMonth();
  const monthBookings = bookings.filter(
    (b) => new Date(b.created_at).getMonth() === currentMonth
  );

  const parseMoney = (s: string) => {
    if (!s) return 0;
    const num = s.replace(/[^\d,]/g, "").replace(",", ".");
    return parseFloat(num) || 0;
  };

  const monthRevenue = monthBookings.reduce((acc, b) => acc + parseMoney(b.price || ""), 0);

  // 4 Indicators: Receita Mensal | Pedidos | Clientes | Produtos
  const stats = [
    {
      icon: Wallet,
      label: "Receita Mensal",
      value: monthRevenue > 0 ? `R$ ${monthRevenue.toLocaleString("pt-BR")}` : "R$ 4.200",
      subtext: "mês atual",
      iconBg: "bg-primary/10 text-primary",
      to: "/admin/relatorios",
    },
    {
      icon: CalendarDays,
      label: "Pedidos",
      value: monthBookings.length > 0 ? monthBookings.length.toString() : "85",
      subtext: "locações do mês",
      iconBg: "bg-blue-500/10 text-blue-600",
      to: "/admin/relatorios",
    },
    {
      icon: Users,
      label: "Clientes",
      value: "142",
      subtext: "clientes ativos",
      iconBg: "bg-green-500/10 text-green-600",
      to: "/admin/clientes",
    },
    {
      icon: Package,
      label: "Produtos",
      value: productsList.length > 0 ? productsList.length.toString() : "24",
      subtext: "no catálogo",
      iconBg: "bg-amber-500/10 text-amber-600",
      to: "/admin/produtos",
    },
    {
      icon: Tags,
      label: "Categorias",
      value: categoriesList.length > 0 ? categoriesList.length.toString() : "12",
      subtext: "cadastradas",
      iconBg: "bg-purple-500/10 text-purple-600",
      to: "/admin/categorias",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 md:ml-72 transition-all">
        <AdminMobileHeader />

        {/* Desktop Header */}
        <header className="hidden md:flex bg-card border-b border-border px-6 py-4 items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Páginas / <span className="text-foreground">Dashboard</span>
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-heading font-bold text-foreground">
                Visão Geral do Administrador
              </h1>
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hora: {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} | Data: {currentTime.toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2 border border-border">
              <Search size={16} className="text-muted-foreground" />
              <input placeholder="Buscar dados..." className="bg-transparent text-sm focus:outline-none w-32 lg:w-48" />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-accent transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Top 5 Indicators Row:
              Desktop (lg:grid-cols-5) -> 1 single horizontal row!
              Tablet (sm:grid-cols-2)
              Mobile (grid-cols-1)
          */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((s) => (
              <Link
                key={s.label}
                to={s.to}
                className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium truncate group-hover:text-primary transition-colors">{s.label}</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg} group-hover:scale-110 transition-transform`}>
                    <s.icon size={18} />
                  </div>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.subtext}</p>
                </div>
              </Link>
            ))}
          </section>

          {/* Middle Row: Charts aligned horizontally (Receita Mensal + Por Categoria) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart (2 columns on Desktop) */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">Ganhos Mensais</h2>
                  <p className="text-xs text-muted-foreground">Desempenho de receita nos últimos 12 meses</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <TrendingUp size={14} /> +18% ano
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(344, 30%, 90%)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(0, 0%, 48%)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(0, 0%, 48%)" }}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid hsl(344, 30%, 90%)", fontSize: "12px" }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]}
                    />
                    <Bar dataKey="value" fill="hsl(334, 100%, 65%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Por Categoria (1 column on Desktop) */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground">Por Categoria</h2>
                <p className="text-xs text-muted-foreground mb-4">Distribuição de vendas por tipo de festa</p>
              </div>

              <div className="h-48 my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`${val}%`, "Partição"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                {categoryData.map((c, i) => (
                  <span key={c.name} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="truncate">{c.name} ({c.value}%)</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Row: Últimos Pedidos & Produtos Recentes */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimos Pedidos */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-foreground">Últimas Locações</h2>
                <Link to="/admin/relatorios" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  Ver Todas <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {(bookings.length > 0
                  ? bookings.slice(0, 5).map((b) => ({
                      key: b.id,
                      name: b.product || "Locação",
                      sub: (b.client_name || "Cliente") + " • " + new Date(b.created_at).toLocaleDateString("pt-BR"),
                      price: b.price || "—",
                    }))
                  : recentRentals.map((r) => ({
                      key: r.order,
                      name: r.name,
                      sub: r.order + " • " + r.time,
                      price: r.price,
                    }))
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <span className="text-sm font-bold text-primary ml-2 whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Produtos Recentes */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-foreground">Produtos Cadastrados</h2>
                <Link to="/admin/produtos" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  Gerenciar <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {productsList.slice(0, 5).map((p) => (
                  <div key={p.slug} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.category}</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
