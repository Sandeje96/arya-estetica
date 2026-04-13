"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-arya-cream overflow-hidden">

      {/* ── Sidebar desktop ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-56 shrink-0 flex-col border-r border-arya-cream/10">
        <AdminSidebar />
      </aside>

      {/* ── Overlay mobile ───────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Drawer mobile ────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden transition-transform duration-200",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Menú de navegación"
      >
        <AdminSidebar onClose={() => setDrawerOpen(false)} />
      </aside>

      {/* ── Área principal ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-arya-gold/20 bg-arya-cream-light shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded text-arya-green-dark hover:bg-arya-gold/10 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} aria-hidden />
          </button>
          <span className="font-heading text-lg text-arya-green-dark">
            Arya Estética
          </span>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
