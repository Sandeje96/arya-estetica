"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Sparkles,
  Zap,
  Gift,
  TrendingUp,
  Receipt,
  BarChart2,
  LogOut,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard",  label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/turnos",     label: "Turnos",            icon: CalendarDays },
  { href: "/admin/calendario", label: "Calendario",        icon: Calendar },
  { href: "/admin/servicios",  label: "Servicios",         icon: Sparkles },
  { href: "/admin/jornadas",   label: "Jornadas láser",    icon: Zap },
  { href: "/admin/gift-cards", label: "Gift Cards",        icon: Gift },
  { href: "/admin/finanzas",   label: "Finanzas",          icon: TrendingUp },
  { href: "/admin/gastos",     label: "Gastos",            icon: Receipt },
  { href: "/admin/reportes",   label: "Reportes",          icon: BarChart2 },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-arya-green-dark text-arya-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-arya-cream/10">
        <Logo variant="light" size="sm" href="/admin/dashboard" />
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded text-arya-cream/60 hover:text-arya-cream hover:bg-arya-cream/10 transition-colors lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} aria-hidden />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Navegación admin">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-sans transition-colors",
                    active
                      ? "bg-arya-cream/15 text-arya-cream font-medium"
                      : "text-arya-cream/70 hover:text-arya-cream hover:bg-arya-cream/8"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    size={16}
                    className={cn(active ? "text-arya-gold" : "text-arya-cream/50")}
                    aria-hidden
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-arya-cream/10">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-sans text-arya-cream/60 hover:text-arya-cream hover:bg-arya-cream/8 transition-colors"
        >
          <LogOut size={16} aria-hidden />
          Cerrar sesión
        </button>
        <p className="mt-3 px-3 text-[10px] text-arya-cream/25 font-sans">
          Arya Estética · Panel admin
        </p>
      </div>
    </div>
  );
}
