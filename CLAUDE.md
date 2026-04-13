# CLAUDE.md — Arya Estética · Sistema de Gestión y Reservas

> Archivo de contexto persistente para Claude Code. Este documento describe el proyecto, las decisiones tomadas, el stack, el modelo de datos, los flujos y los lineamientos de diseño. Claude Code debe leerlo al inicio de cada sesión y respetarlo en todas sus decisiones.

---

## 1. Visión general del proyecto

**Arya Estética** es un centro de estética ubicado en Posadas, Misiones, Argentina. Este proyecto consiste en una **aplicación web** que cumple dos funciones simultáneas:

1. **Portal público para clientas** (sin login): permite ver los servicios, armar un "carrito" de servicios deseados, dejar sus datos (nombre, apellido, WhatsApp) y solicitar un turno. También permite comprar gift cards y anotarse a las jornadas mensuales de depilación láser.
2. **Panel administrador** (login único, solo la dueña): gestión de turnos, calendario, ingresos/egresos, estadísticas, validación de gift cards por QR y notificaciones.

El objetivo es que la experiencia sea **estéticamente premium**, **intuitiva** y que transmita la identidad visual de la marca (verde oliva natural, crema, dorado, tipografía serif elegante).

---

## 2. Stack técnico (decidido, no reabrir)

- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui para componentes base
- **ORM**: Prisma
- **Base de datos**: PostgreSQL (en Railway)
- **Auth admin**: NextAuth (Credentials provider, un solo usuario)
- **Generación de PDF gift cards**: `@react-pdf/renderer` o `pdf-lib`
- **Generación de QR**: `qrcode` (npm)
- **Fechas/horarios**: `date-fns` con timezone `America/Argentina/Cordoba`
- **Validación de formularios**: `zod` + `react-hook-form`
- **Despliegue**: Railway (el usuario ya tiene cuenta paga y otros proyectos desplegados)
- **Variables de entorno**: `.env` local + Railway env vars en producción

> Claude Code: si encontrás una mejor librería para alguna pieza puntual, podés proponerla, pero no cambies el stack base.

---

## 3. Identidad visual (obligatoria)

### Paleta de colores
```
--arya-green-dark:   #4A5D3A   /* verde oliva oscuro - texto sobre crema, botones primarios */
--arya-green:        #6B7F4F   /* verde oliva principal - logo, headers, acentos */
--arya-green-soft:   #8A9B6E   /* verde suave - hover, bordes */
--arya-cream:        #F1EFE0   /* fondo principal crema */
--arya-cream-light:  #F8F6EC   /* fondo secundario más claro */
--arya-gold:         #B8A668   /* dorado - bordes decorativos, detalles */
--arya-gold-soft:    #C8B97E   /* dorado suave */
--arya-text:         #3D3D3D   /* texto general */
--arya-text-muted:   #6B6B6B   /* texto secundario */
```

### Tipografía
- **Títulos / logo**: una serif elegante tipo "Cormorant Garamond", "Playfair Display" o "DM Serif Display" (importar desde Google Fonts)
- **Cuerpo**: una sans-serif limpia tipo "Inter" o "Manrope"

### Elementos visuales
- Fondos crema con ilustraciones sutiles de hojas/follaje en las esquinas (similar a los flyers que ya tiene la marca).
- Botones primarios: verde oliva con texto crema, esquinas levemente redondeadas (`rounded-md`), sombra muy sutil.
- Cards con bordes dorados finos, fondo crema claro.
- Mucho espacio en blanco, sensación de spa, calma.
- Logo "ARYA estética" siempre presente en header.

### Activos
El logo de Arya está en `/public/brand/arya-logo.png` (el usuario subirá las versiones color y monocromo a esa carpeta). Las imágenes de servicios irán en `/public/services/`.

---

## 4. Datos del negocio

- **Nombre**: Arya Estética
- **Dirección**: Edificio Puerta Real, Dpto 12 E, Villa Sarita, Posadas, Misiones, Argentina
- **Teléfono / WhatsApp**: +54 9 3764-285491
- **Instagram**: @arya_estetica
- **Email**: arya.estetica.1@gmail.com
- **Moneda**: ARS (pesos argentinos), formato `$ 25.000`
- **Zona horaria**: `America/Argentina/Cordoba`
- **Idioma de la app**: español (Argentina)
- **Admin único**:
  - Usuario: `arya`
  - Password: definido en variable de entorno `ADMIN_PASSWORD` (hashear con bcrypt al seedear)

---

## 5. Catálogo de servicios (seed inicial)

Cargar estos servicios al hacer `prisma db seed`. Categorías y precios extraídos del catálogo oficial de la marca.

### Tratamientos capilares
- Botox capilar libre de formol — $28.000
- Keratina express — $32.000
- Tratamiento Keratínico libre de formol — $35.000
- Laminado capilar libre de formol — $40.000

### Peinados
- Brushing cabello corto — $12.000
- Brushing cabello largo — $15.000
- Peinado recogido — $40.000
- Peinado semi recogido — $35.000
- Peinado recogido + trenzas — $50.000
- Peinado semi recogido + trenzas — $40.000
- Planchita o bucles — $25.000
- Trenzas simples — $25.000

### Cortes
- Corte de puntas — $12.000
- Corte de puntas + brushing — $22.000
- Corte de puntas + hidratación profunda/nutrición — $28.000

### Combos
- Hidratación/nutrición + corte de puntas + brushing — $45.000
- Brushing + hidratación — $40.000

### Servicios para manos
- Manicura rusa + semi — $15.000
- Manicura rusa + capping uñas cortas — $20.000
- Manicura rusa + capping uñas media — $22.000
- Manicura rusa + capping uñas largas — $24.000
- Manicura rusa + soft gel — $25.000

### Servicios para pies
- Pedicura rusa + semi — $16.000
- Pedicura rusa + soft gel — $26.000
- Adicional spa (en ambos servicios) — $10.000

### Adicionales de uñas
- Diseño por cada par de uñas — $1.000
- Retirado de otro lugar — $5.000
- Pedicura rusa + retirado definitivo — $10.000
- Reconstrucción de uña (por uña) — $2.000

### Masoterapia (60 min cada sesión)
- Masaje relajante cuello y espalda — $14.000
- Masaje relajante piernas completas — $16.000
- Masaje relajante cuerpo completo — $27.000
- Masaje descontracturante cuello y espalda — $16.000
- Masaje descontracturante piernas completas — $18.000
- Masaje descontracturante cuerpo completo — $29.000
- Drenaje linfático cara y cuello — $22.000
- Drenaje linfático espalda y cervical — $25.000
- Drenaje linfático brazos — $25.000
- Drenaje linfático abdomen — $25.000
- Drenaje linfático piernas y pies — $28.000

### Cosmetología / Cosmiatría
- Limpieza facial profunda — $30.000
- Masaje facial relajante — $20.000
- Tratamiento control acné — $40.000
- Tratamiento despigmentante — $40.000
- Tratamiento peeling — $40.000
- Tratamiento antiage — $40.000
- Dermaplaning — $45.000

### Maquillaje
- Maquillaje social — $35.000
- Maquillaje blindado — $45.000

### Alisados tradicionales (Aliplex, Argán, 5D, Crystal, Nanoplastia, Progresivo, Plastificado)
- Corto (hasta hombros) — $40.000
- Medio (hasta omóplatos) — $48.000
- Largo (hasta cintura) — $55.000
- Extra largo (hasta la cola) — $60.000

### Alisados libres de formol, sulfatos y parabenos
- Corto — $50.000
- Medio — $58.000
- Largo — $65.000
- Extra largo — $70.000

### Depilación láser definitiva (Soprano Ice Titanium) — solo jornadas mensuales
- 1 zona — $8.000
- 2 zonas — $14.000
- 3 zonas — $18.000
- 4 zonas — $21.000
- 5 zonas — $24.000
- 6 zonas — $26.000

Planes promocionales (descuento sobre lista, pago anticipado):
- Plan 3 meses: 20% OFF
- Plan 4 meses: 25% OFF
- Plan 6 meses: 35% OFF

> **Nota importante**: los servicios de depilación láser **solo deben aparecer disponibles cuando hay una jornada activa cargada por la admin**. El resto del año, esa categoría no se muestra en el portal público o se muestra como "próximamente".

---

## 6. Modelo de datos (Prisma schema sugerido)

```prisma
model Service {
  id          String   @id @default(cuid())
  name        String
  category    String   // "capilar", "peinados", "cortes", "manos", "pies", "masoterapia", "cosmetologia", "maquillaje", "alisados", "depilacion", etc.
  basePrice   Int      // en pesos enteros
  description String?
  imageUrl    String?
  active      Boolean  @default(true)
  isLaser     Boolean  @default(false) // true para servicios de la jornada de depilación
  createdAt   DateTime @default(now())
  appointmentItems AppointmentItem[]
  giftCardItems    GiftCardItem[]
}

model Client {
  id        String        @id @default(cuid())
  firstName String
  lastName  String
  whatsapp  String        // formato +5493764xxxxxxx
  createdAt DateTime      @default(now())
  appointments Appointment[]
  giftCardsBought GiftCard[] @relation("buyer")
}

model Appointment {
  id            String   @id @default(cuid())
  clientId      String
  client        Client   @relation(fields: [clientId], references: [id])
  status        AppointmentStatus @default(PENDING) // PENDING, CONFIRMED, COMPLETED, CANCELLED
  scheduledAt   DateTime?  // null hasta que admin confirma
  totalEstimated Int       // suma de basePrice al momento de solicitar
  totalCharged   Int?      // lo que efectivamente cobró la admin
  notes         String?
  isLaserDay    Boolean  @default(false)
  laserDayId    String?
  laserDay      LaserDay? @relation(fields: [laserDayId], references: [id])
  reminder1DaySent Boolean @default(false)
  reminderHoursSent Boolean @default(false)
  createdAt     DateTime @default(now())
  items         AppointmentItem[]
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

model AppointmentItem {
  id            String      @id @default(cuid())
  appointmentId String
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  serviceId     String
  service       Service     @relation(fields: [serviceId], references: [id])
  priceAtBooking Int
  finalPrice     Int?       // editable por admin al completar
}

model LaserDay {
  id          String   @id @default(cuid())
  date        DateTime
  slots       Int      // cupos disponibles
  description String?
  active      Boolean  @default(true)
  appointments Appointment[]
}

model GiftCard {
  id          String   @id @default(cuid())
  code        String   @unique // token aleatorio para el QR
  buyerId     String
  buyer       Client   @relation("buyer", fields: [buyerId], references: [id])
  recipientName String
  totalAmount Int
  status      GiftCardStatus @default(PENDING_PICKUP) // PENDING_PICKUP, READY, REDEEMED, CANCELLED
  pdfUrl      String?
  redeemedAt  DateTime?
  createdAt   DateTime @default(now())
  items       GiftCardItem[]
}

enum GiftCardStatus {
  PENDING_PICKUP
  READY
  REDEEMED
  CANCELLED
}

model GiftCardItem {
  id         String   @id @default(cuid())
  giftCardId String
  giftCard   GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)
  serviceId  String
  service    Service  @relation(fields: [serviceId], references: [id])
  priceAtPurchase Int
}

model Expense {
  id        String   @id @default(cuid())
  amount    Int
  category  String   // "alquiler", "insumos", "sueldos", "marketing", "servicios", "impuestos", "otros" o personalizada
  description String?
  date      DateTime
  createdAt DateTime @default(now())
}

model AdminUser {
  id        String   @id @default(cuid())
  username  String   @unique
  passwordHash String
  createdAt DateTime @default(now())
}
```

---

## 7. Estructura de la aplicación

```
/app
  /(public)              -> portal cliente sin login
    /page.tsx            -> landing con hero + CTA "Reservar turno"
    /servicios/page.tsx  -> grilla de servicios con cards + carrito lateral
    /reservar/page.tsx   -> formulario datos cliente + confirmación
    /gift-card/page.tsx  -> flujo compra de gift card
    /jornada-depilacion/page.tsx -> anotarse a la jornada activa (si existe)
  /(admin)
    /login/page.tsx
    /dashboard/page.tsx       -> resumen: caja, próximos turnos, notificaciones
    /turnos/page.tsx          -> lista + filtros, confirmar/completar/cancelar
    /calendario/page.tsx      -> vista calendario mensual/semanal
    /servicios/page.tsx       -> ABM de servicios
    /jornadas/page.tsx        -> ABM de jornadas de depilación
    /gift-cards/page.tsx      -> lista, marcar como impresas, descargar PDF
    /gift-cards/validar/[code]/page.tsx -> validación por QR
    /finanzas/page.tsx        -> ingresos, egresos, balance
    /gastos/page.tsx          -> ABM de gastos
    /reportes/page.tsx        -> estadísticas
  /api
    /appointments/route.ts
    /gift-cards/route.ts
    /gift-cards/[code]/pdf/route.ts
    /gift-cards/[code]/redeem/route.ts
    /expenses/route.ts
    /reminders/cron/route.ts  -> endpoint para cron de Railway
/components
  /ui                    -> shadcn
  /brand                 -> Logo, LeafDecoration, etc.
  /public                -> ServiceCard, Cart, BookingForm
  /admin                 -> AppointmentTable, Calendar, StatsCards
/lib
  /db.ts                 -> Prisma client
  /auth.ts               -> NextAuth config
  /whatsapp.ts           -> generador de links wa.me
  /pdf/giftCard.tsx      -> componente React PDF
  /qr.ts
/prisma
  schema.prisma
  seed.ts
```

---

## 8. Flujos principales

### 8.1 Cliente reserva turno
1. Entra al portal → ve landing → click "Reservar turno".
2. Ve servicios agrupados por categoría, con card (imagen, nombre, precio).
3. Va agregando servicios a un carrito lateral (sidebar derecho en desktop, bottom sheet en mobile) que muestra el subtotal en vivo.
4. Click "Agendar turno" → formulario: nombre, apellido, WhatsApp (con validación de formato argentino).
5. Submit → se crea `Appointment` con status `PENDING`, `scheduledAt = null`, `totalEstimated = suma`.
6. Pantalla de confirmación: "¡Gracias [Nombre]! Nos vamos a contactar al WhatsApp +54 9 3764-XXX para coordinar día y horario."
7. En el panel admin aparece notificación de nuevo turno pendiente.

### 8.2 Admin confirma turno
1. Admin entra a `/admin/turnos`, ve el pendiente.
2. Click → asigna fecha y hora → status pasa a `CONFIRMED` y aparece en el calendario.
3. Al confirmar, el sistema **genera dos botones de WhatsApp pre-armados** (`wa.me/549...?text=...`) que la admin puede usar para:
   - Confirmar el turno ahora.
   - (Más adelante, automáticamente) recordatorio 1 día antes y X horas antes.

### 8.3 Recordatorios semi-automáticos
- Existe un endpoint `/api/reminders/cron` que Railway llama por cron (cada hora).
- Busca turnos `CONFIRMED` cuyo `scheduledAt` esté a ~24h o ~3h y cuyos flags de recordatorio estén en false.
- Para cada uno, **crea una "notificación" en el dashboard admin** con un botón "Enviar recordatorio por WhatsApp" que abre el link `wa.me` con el mensaje pre-armado. Al hacer click, se marca el flag como enviado.
- (Importante: NO se envía solo, porque elegimos la opción semi-automática. La admin hace click).

### 8.4 Admin completa turno
1. Cuando la clienta vino y se hizo el servicio, admin va al turno y click "Completar".
2. Modal: muestra los items con sus precios base, cada uno editable (`finalPrice`). Total se recalcula.
3. Submit → status `COMPLETED`, `totalCharged` se guarda. Suma a ingresos.

### 8.5 Cancelación
- La clienta avisa por WhatsApp.
- Admin entra al turno y click "Cancelar". Status → `CANCELLED`. No suma a ingresos.

### 8.6 Gift Card
1. Cliente entra a `/gift-card`, selecciona servicios igual que en el flujo normal.
2. Ingresa: sus datos (comprador) + nombre del destinatario.
3. Submit → se crea `GiftCard` con `code` aleatorio (nanoid 12 chars) y status `PENDING_PICKUP`.
4. Pantalla de confirmación: "Gracias, te contactamos al WhatsApp para coordinar pago y retiro de la gift card física."
5. En el panel admin, la admin ve la gift card, descarga el **PDF tamaño tarjeta tipo carnet (85.6mm × 54mm, formato CR80)** con:
   - Diseño que respeta el modelo enviado: fondo crema, hojas decorativas, "GIFT CARD" en serif verde.
   - Lista de servicios incluidos.
   - Nombre del destinatario.
   - QR en la esquina inferior que apunta a `https://[dominio]/admin/gift-cards/validar/[code]`.
   - Datos de contacto de Arya.
6. Admin lo manda a la imprenta, lo entrega.

### 8.7 Validar gift card (QR)
1. Cliente viene con la tarjeta a usar el servicio.
2. Admin escanea el QR con su celular → abre `/admin/gift-cards/validar/[code]` (requiere estar logueada).
3. La página muestra los datos de la gift card y los servicios incluidos.
4. Si status === `READY` → botón "Marcar como utilizada" → status pasa a `REDEEMED`, se guarda `redeemedAt`.
5. Si ya fue usada → mensaje de error "Esta gift card ya fue utilizada el [fecha]".

### 8.8 Jornada de depilación
1. Admin va a `/admin/jornadas` y crea una `LaserDay` con fecha, cantidad de cupos y descripción.
2. Mientras esté activa y futura, en el portal público aparece un banner "Jornada de depilación: [fecha] — Reservá tu lugar".
3. El cliente entra a `/jornada-depilacion`, elige zonas (los servicios laser), llena sus datos.
4. Se crea un `Appointment` con `isLaserDay = true`, `laserDayId`, y `scheduledAt` ya seteado al día de la jornada (la admin le asignará horario después).

### 8.9 Finanzas y reportes
- **Ingresos**: suma de `totalCharged` de turnos `COMPLETED` + gift cards en estado `READY` o `REDEEMED` (a definir si se contabilizan al cobrar o al canjear; por defecto **al cobrar**, o sea cuando admin marca la gift card como `READY`).
- **Egresos**: suma de `Expense.amount`.
- **Balance**: ingresos - egresos por mes.
- **Reportes** (página `/admin/reportes`):
  - Servicio más vendido por mes
  - Ingresos por categoría
  - Ingresos vs gastos por mes (gráfico de barras)
  - Clientes recurrentes vs nuevos
  - Tasa de cancelación
  - Horarios/días más demandados (heatmap)
- Usar `recharts` para los gráficos.

---

## 9. Categorías de gastos
Predefinidas (seed): `alquiler`, `insumos`, `sueldos`, `marketing`, `servicios`, `impuestos`, `otros`. La admin puede crear categorías nuevas desde el formulario de gasto (input con autocomplete).

---

## 10. Despliegue en Railway

1. Crear proyecto en Railway con servicio Postgres + servicio Next.js.
2. Variables de entorno necesarias:
   - `DATABASE_URL` (la inyecta Railway)
   - `NEXTAUTH_SECRET` (generar)
   - `NEXTAUTH_URL` (URL pública de Railway)
   - `ADMIN_USERNAME=arya`
   - `ADMIN_PASSWORD=...` (definir, hashear en seed)
   - `BUSINESS_WHATSAPP=5493764285491`
   - `PUBLIC_URL` (para los QR)
3. `package.json` debe tener:
   ```json
   "scripts": {
     "build": "prisma generate && prisma migrate deploy && next build",
     "start": "next start",
     "seed": "tsx prisma/seed.ts"
   }
   ```
4. Configurar **cron de Railway** para llamar a `/api/reminders/cron` cada hora. Proteger ese endpoint con un header `x-cron-secret`.
5. Después del primer deploy, ejecutar `npm run seed` desde la consola de Railway para cargar servicios y crear el usuario admin.

---

## 11. Lineamientos para Claude Code

- **Idioma de la UI**: español rioplatense (vos, no tú). Mensajes amables y cálidos.
- **Mobile-first**: la mayoría de las clientas van a entrar desde el celular. Todo tiene que verse hermoso en mobile.
- **Accesibilidad**: contraste correcto, labels en formularios, focus states visibles.
- **Validaciones**: WhatsApp argentino con regex, nombres no vacíos, etc.
- **Errores**: nunca pantallas en blanco. Siempre mensajes claros.
- **Seguridad**: rutas `/admin/*` protegidas por middleware de NextAuth. El endpoint de cron protegido por secret. Nunca exponer datos de clientas en endpoints públicos.
- **Confirmaciones destructivas**: cancelar turno, eliminar gasto, etc. siempre con modal de confirmación.
- **Sentite libre de mejorar**: si ves una oportunidad de mejorar UX, agregar una feature útil que no esté pensada, o hacer el código más mantenible, hacelo y dejá un comentario explicando por qué. Por ejemplo: búsqueda en la lista de turnos, exportar reportes a CSV, modo "vista de hoy" en el dashboard, etc.
- **Git**: hacé commits chicos y descriptivos en español. Una feature por commit.
- **Antes de codear cualquier feature grande**, releé la sección correspondiente de este archivo.

---

## 12. Orden de implementación sugerido

1. Setup Next.js + Tailwind + Prisma + shadcn + paleta y fuentes.
2. Schema Prisma + migración inicial + seed con servicios y admin.
3. Layout público con header/footer de marca + landing.
4. Página de servicios con carrito lateral.
5. Formulario de reserva + creación de Appointment.
6. Auth admin + layout admin.
7. Lista de turnos + confirmar/completar/cancelar.
8. Calendario admin.
9. Generación de links wa.me + sistema de notificaciones de recordatorio.
10. Endpoint cron de recordatorios.
11. Módulo de gift cards (compra, PDF, QR, validación).
12. Módulo de jornadas de depilación.
13. Módulo de gastos.
14. Dashboard con resumen.
15. Página de reportes con gráficos.
16. Deploy a Railway + seed productivo + cron.
17. QA mobile + ajustes finales de estética.

---

**Última actualización**: este archivo fue generado al inicio del proyecto. Si cambian decisiones, actualizalo.
