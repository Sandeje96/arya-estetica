import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ServiciosAdmin, type ServiceRow } from "@/components/admin/ServiciosAdmin";

export const metadata: Metadata = { title: "Servicios · Admin" };
export const dynamic = "force-dynamic";

async function getServices(): Promise<ServiceRow[]> {
  try {
    const rows = await db.service.findMany({
      orderBy: [{ category: "asc" }, { basePrice: "asc" }],
    });
    return rows.map((s) => ({
      id:          s.id,
      name:        s.name,
      category:    s.category,
      basePrice:   s.basePrice,
      description: s.description,
      active:      s.active,
      isLaser:     s.isLaser,
    }));
  } catch {
    return [];
  }
}

export default async function ServiciosPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-light text-arya-green-dark">Servicios</h1>
        <p className="font-sans text-sm text-arya-text-muted mt-0.5">
          Administrá el catálogo de servicios. Podés activar, desactivar, editar precios o agregar nuevos.
        </p>
      </div>

      <ServiciosAdmin initialServices={services} />
    </div>
  );
}
