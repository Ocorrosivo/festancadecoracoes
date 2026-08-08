import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
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

const monthlyData = [
  { month: "Jan", receita: 2100 },
  { month: "Fev", receita: 3200 },
  { month: "Mar", receita: 2800 },
  { month: "Abr", receita: 4800 },
  { month: "Mai", receita: 3600 },
  { month: "Jun", receita: 5400 },
  { month: "Jul", receita: 4200 },
  { month: "Ago", receita: 4800 },
  { month: "Set", receita: 5100 },
  { month: "Out", receita: 4600 },
  { month: "Nov", receita: 5200 },
  { month: "Dez", receita: 5800 },
];

const categoryData = [
  { name: "Casamento", value: 35 },
  { name: "Infantil", value: 28 },
  { name: "Formatura", value: 18 },
  { name: "Eventos", value: 19 },
];

const COLORS = ["hsl(334, 100%, 65%)", "hsl(334, 100%, 78%)", "hsl(334, 60%, 85%)", "hsl(30, 44%, 80%)"];

const AdminRelatorios = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("festiva_admin") !== "true") navigate("/admin");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-0.5">Páginas / <span className="text-foreground">Relatórios</span></p>
            <h1 className="text-xl font-heading font-bold text-foreground">Relatórios e Análises</h1>
          </div>

          {/* Summary Cards em linha única */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { icon: DollarSign, label: "Receita Anual", value: "R$ 51.600", color: "bg-primary/10 text-primary" },
              { icon: TrendingUp, label: "Crescimento", value: "+18%", color: "bg-green-50 text-green-500" },
              { icon: ShoppingBag, label: "Total Locações", value: "342", color: "bg-blue-50 text-blue-500" },
              { icon: BarChart3, label: "Ticket Médio", value: "R$ 150", color: "bg-amber-50 text-amber-500" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium truncate">{s.label}</span>
                </div>
                <p className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-heading font-bold text-foreground mb-1">Receita Mensal</h2>
              <p className="text-xs text-muted-foreground mb-6">Faturamento por mês no ano atual</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(344, 30%, 90%)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(0, 0%, 48%)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(0, 0%, 48%)" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(344, 30%, 90%)", fontSize: "12px" }} formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]} />
                    <Bar dataKey="receita" fill="hsl(334, 100%, 65%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-heading font-bold text-foreground mb-1">Por Categoria</h2>
              <p className="text-xs text-muted-foreground mb-6">Distribuição de locações</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {categoryData.map((c, i) => (
                  <span key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    {c.name} ({c.value}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRelatorios;
