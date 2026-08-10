import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { getBookings } from "@/data/bookings";

const AdminBookings = () => {
  const bookings = getBookings();

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        <AdminMobileHeader />
        <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8">Gestão de Locações</h1>
        <div className="bg-card rounded-2xl border border-primary/10 overflow-hidden">
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Nenhuma locação registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/10 bg-accent/50 text-muted-foreground">
                    <th className="text-left py-3 px-4">Produto</th>
                    <th className="text-left py-3 px-4">Data do Evento</th>
                    <th className="text-left py-3 px-4">Valor</th>
                    <th className="text-left py-3 px-4">Registrado em</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice().reverse().map((b) => (
                    <tr key={b.id} className="border-b border-primary/5 hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{b.productName}</td>
                      <td className="py-3 px-4">{b.date}</td>
                      <td className="py-3 px-4 text-primary font-bold">{b.price}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default AdminBookings;
