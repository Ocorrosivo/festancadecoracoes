import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import { Search, Bell } from "lucide-react";

interface SettingsLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function SettingsLayout({ title, children }: SettingsLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background font-body flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-72 transition-all">
        <AdminMobileHeader />
        
        <header className="hidden md:flex bg-card border-b border-border px-6 py-4 items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Configurações / <span className="text-foreground">{title}</span>
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-heading font-bold text-foreground">
                {title}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hora: {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} | Data: {currentTime.toLocaleDateString("pt-BR")}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2 border border-border">
              <Search size={16} className="text-muted-foreground" />
              <input placeholder="Buscar configurações..." className="bg-transparent text-sm focus:outline-none w-32 lg:w-48" />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-accent transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
