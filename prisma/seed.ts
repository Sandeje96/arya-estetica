// Solo cargar .env en desarrollo — en producción Railway inyecta las variables
if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ─── Servicios ────────────────────────────────────────────────────────────────

const services = [
  // Tratamientos capilares
  { name: "Botox capilar libre de formol",             category: "capilar",             basePrice: 28000 },
  { name: "Keratina express",                           category: "capilar",             basePrice: 32000 },
  { name: "Tratamiento Keratínico libre de formol",     category: "capilar",             basePrice: 35000 },
  { name: "Laminado capilar libre de formol",           category: "capilar",             basePrice: 40000 },

  // Peinados
  { name: "Brushing cabello corto",                     category: "peinados",            basePrice: 12000 },
  { name: "Brushing cabello largo",                     category: "peinados",            basePrice: 15000 },
  { name: "Peinado recogido",                           category: "peinados",            basePrice: 40000 },
  { name: "Peinado semi recogido",                      category: "peinados",            basePrice: 35000 },
  { name: "Peinado recogido + trenzas",                 category: "peinados",            basePrice: 50000 },
  { name: "Peinado semi recogido + trenzas",            category: "peinados",            basePrice: 40000 },
  { name: "Planchita o bucles",                         category: "peinados",            basePrice: 25000 },
  { name: "Trenzas simples",                            category: "peinados",            basePrice: 25000 },

  // Cortes
  { name: "Corte de puntas",                            category: "cortes",              basePrice: 12000 },
  { name: "Corte de puntas + brushing",                 category: "cortes",              basePrice: 22000 },
  { name: "Corte de puntas + hidratación/nutrición",    category: "cortes",              basePrice: 28000 },

  // Combos
  { name: "Hidratación/nutrición + corte + brushing",   category: "combos",              basePrice: 45000 },
  { name: "Brushing + hidratación",                     category: "combos",              basePrice: 40000 },

  // Manos
  { name: "Manicura rusa + semi",                       category: "manos",               basePrice: 15000 },
  { name: "Manicura rusa + capping uñas cortas",        category: "manos",               basePrice: 20000 },
  { name: "Manicura rusa + capping uñas media",         category: "manos",               basePrice: 22000 },
  { name: "Manicura rusa + capping uñas largas",        category: "manos",               basePrice: 24000 },
  { name: "Manicura rusa + soft gel",                   category: "manos",               basePrice: 25000 },

  // Pies
  { name: "Pedicura rusa + semi",                       category: "pies",                basePrice: 16000 },
  { name: "Pedicura rusa + soft gel",                   category: "pies",                basePrice: 26000 },
  { name: "Adicional spa",                              category: "pies",                basePrice: 10000 },

  // Adicionales de uñas
  { name: "Diseño por cada par de uñas",                category: "adicionales_unas",    basePrice: 1000 },
  { name: "Retirado de otro lugar",                     category: "adicionales_unas",    basePrice: 5000 },
  { name: "Pedicura rusa + retirado definitivo",        category: "adicionales_unas",    basePrice: 10000 },
  { name: "Reconstrucción de uña (por uña)",            category: "adicionales_unas",    basePrice: 2000 },

  // Masoterapia (60 min)
  { name: "Masaje relajante cuello y espalda",          category: "masoterapia",         basePrice: 14000 },
  { name: "Masaje relajante piernas completas",         category: "masoterapia",         basePrice: 16000 },
  { name: "Masaje relajante cuerpo completo",           category: "masoterapia",         basePrice: 27000 },
  { name: "Masaje descontracturante cuello y espalda",  category: "masoterapia",         basePrice: 16000 },
  { name: "Masaje descontracturante piernas completas", category: "masoterapia",         basePrice: 18000 },
  { name: "Masaje descontracturante cuerpo completo",   category: "masoterapia",         basePrice: 29000 },
  { name: "Drenaje linfático cara y cuello",            category: "masoterapia",         basePrice: 22000 },
  { name: "Drenaje linfático espalda y cervical",       category: "masoterapia",         basePrice: 25000 },
  { name: "Drenaje linfático brazos",                   category: "masoterapia",         basePrice: 25000 },
  { name: "Drenaje linfático abdomen",                  category: "masoterapia",         basePrice: 25000 },
  { name: "Drenaje linfático piernas y pies",           category: "masoterapia",         basePrice: 28000 },

  // Cosmetología / Cosmiatría
  { name: "Limpieza facial profunda",                   category: "cosmetologia",        basePrice: 30000 },
  { name: "Masaje facial relajante",                    category: "cosmetologia",        basePrice: 20000 },
  { name: "Tratamiento control acné",                   category: "cosmetologia",        basePrice: 40000 },
  { name: "Tratamiento despigmentante",                 category: "cosmetologia",        basePrice: 40000 },
  { name: "Tratamiento peeling",                        category: "cosmetologia",        basePrice: 40000 },
  { name: "Tratamiento antiage",                        category: "cosmetologia",        basePrice: 40000 },
  { name: "Dermaplaning",                               category: "cosmetologia",        basePrice: 45000 },

  // Maquillaje
  { name: "Maquillaje social",                          category: "maquillaje",          basePrice: 35000 },
  { name: "Maquillaje blindado",                        category: "maquillaje",          basePrice: 45000 },

  // Alisados tradicionales
  { name: "Alisado tradicional cabello corto",          category: "alisados",            basePrice: 40000, description: "Aliplex, Argán, 5D, Crystal, Nanoplastia, Progresivo, Plastificado — hasta hombros" },
  { name: "Alisado tradicional cabello medio",          category: "alisados",            basePrice: 48000, description: "Hasta omóplatos" },
  { name: "Alisado tradicional cabello largo",          category: "alisados",            basePrice: 55000, description: "Hasta cintura" },
  { name: "Alisado tradicional cabello extra largo",    category: "alisados",            basePrice: 60000, description: "Hasta la cola" },

  // Alisados libres de formol, sulfatos y parabenos
  { name: "Alisado sin químicos cabello corto",         category: "alisados_sin_quimicos", basePrice: 50000, description: "Libre de formol, sulfatos y parabenos — hasta hombros" },
  { name: "Alisado sin químicos cabello medio",         category: "alisados_sin_quimicos", basePrice: 58000, description: "Hasta omóplatos" },
  { name: "Alisado sin químicos cabello largo",         category: "alisados_sin_quimicos", basePrice: 65000, description: "Hasta cintura" },
  { name: "Alisado sin químicos cabello extra largo",   category: "alisados_sin_quimicos", basePrice: 70000, description: "Hasta la cola" },

  // Depilación láser (solo jornadas mensuales)
  { name: "Depilación láser — 1 zona",                 category: "depilacion",          basePrice: 8000,  isLaser: true },
  { name: "Depilación láser — 2 zonas",                category: "depilacion",          basePrice: 14000, isLaser: true },
  { name: "Depilación láser — 3 zonas",                category: "depilacion",          basePrice: 18000, isLaser: true },
  { name: "Depilación láser — 4 zonas",                category: "depilacion",          basePrice: 21000, isLaser: true },
  { name: "Depilación láser — 5 zonas",                category: "depilacion",          basePrice: 24000, isLaser: true },
  { name: "Depilación láser — 6 zonas",                category: "depilacion",          basePrice: 26000, isLaser: true },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed de Arya Estética...");

  // Servicios
  console.log("📋 Cargando servicios...");
  let created = 0;
  let skipped = 0;

  for (const svc of services) {
    const existing = await db.service.findFirst({
      where: { name: svc.name, category: svc.category },
    });

    if (!existing) {
      await db.service.create({ data: svc });
      created++;
    } else {
      // Actualizar precio si cambió
      await db.service.update({
        where: { id: existing.id },
        data: { basePrice: svc.basePrice, active: true },
      });
      skipped++;
    }
  }

  console.log(`   ✓ ${created} servicios creados, ${skipped} ya existían (precios actualizados)`);

  // Admin
  console.log("👤 Configurando usuario admin...");

  const username = process.env.ADMIN_USERNAME ?? "arya";
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!rawPassword) {
    throw new Error(
      "❌ ADMIN_PASSWORD no está definida en .env. Abortando seed para no crear un admin sin contraseña."
    );
  }

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  await db.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  console.log(`   ✓ Admin '${username}' creado/actualizado`);

  console.log("\n✅ Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
