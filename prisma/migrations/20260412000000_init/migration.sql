-- Arya Estética — Migración inicial
-- Generada manualmente (sin DB local disponible)
-- Ejecutar con: npx prisma migrate deploy

-- Enums
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING_PICKUP', 'READY', 'REDEEMED', 'CANCELLED');

-- Service
CREATE TABLE "Service" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "basePrice"   INTEGER NOT NULL,
    "description" TEXT,
    "imageUrl"    TEXT,
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "isLaser"     BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- Client
CREATE TABLE "Client" (
    "id"        TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName"  TEXT NOT NULL,
    "whatsapp"  TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- LaserDay
CREATE TABLE "LaserDay" (
    "id"          TEXT NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL,
    "slots"       INTEGER NOT NULL,
    "description" TEXT,
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaserDay_pkey" PRIMARY KEY ("id")
);

-- Appointment
CREATE TABLE "Appointment" (
    "id"               TEXT NOT NULL,
    "clientId"         TEXT NOT NULL,
    "status"           "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt"      TIMESTAMP(3),
    "totalEstimated"   INTEGER NOT NULL,
    "totalCharged"     INTEGER,
    "notes"            TEXT,
    "isLaserDay"       BOOLEAN NOT NULL DEFAULT false,
    "laserDayId"       TEXT,
    "reminder1DaySent" BOOLEAN NOT NULL DEFAULT false,
    "reminderHoursSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AppointmentItem
CREATE TABLE "AppointmentItem" (
    "id"            TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId"     TEXT NOT NULL,
    "priceAtBooking" INTEGER NOT NULL,
    "finalPrice"    INTEGER,

    CONSTRAINT "AppointmentItem_pkey" PRIMARY KEY ("id")
);

-- GiftCard
CREATE TABLE "GiftCard" (
    "id"            TEXT NOT NULL,
    "code"          TEXT NOT NULL,
    "buyerId"       TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "totalAmount"   INTEGER NOT NULL,
    "status"        "GiftCardStatus" NOT NULL DEFAULT 'PENDING_PICKUP',
    "pdfUrl"        TEXT,
    "redeemedAt"    TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- GiftCardItem
CREATE TABLE "GiftCardItem" (
    "id"              TEXT NOT NULL,
    "giftCardId"      TEXT NOT NULL,
    "serviceId"       TEXT NOT NULL,
    "priceAtPurchase" INTEGER NOT NULL,

    CONSTRAINT "GiftCardItem_pkey" PRIMARY KEY ("id")
);

-- Expense
CREATE TABLE "Expense" (
    "id"          TEXT NOT NULL,
    "amount"      INTEGER NOT NULL,
    "category"    TEXT NOT NULL,
    "description" TEXT,
    "date"        TIMESTAMP(3) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AdminUser
CREATE TABLE "AdminUser" (
    "id"           TEXT NOT NULL,
    "username"     TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- Foreign keys
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_laserDayId_fkey"
    FOREIGN KEY ("laserDayId") REFERENCES "LaserDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AppointmentItem" ADD CONSTRAINT "AppointmentItem_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppointmentItem" ADD CONSTRAINT "AppointmentItem_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_buyerId_fkey"
    FOREIGN KEY ("buyerId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GiftCardItem" ADD CONSTRAINT "GiftCardItem_giftCardId_fkey"
    FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GiftCardItem" ADD CONSTRAINT "GiftCardItem_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
