// Forzar rendering dinámico en todas las páginas admin
// (no pre-renderizar en build time porque requieren DB y auth)
export const dynamic = "force-dynamic";

import { AdminLayoutClient } from "./AdminLayoutClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
