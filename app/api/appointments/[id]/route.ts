import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── Schemas por acción ────────────────────────────────────────────────────────

const confirmSchema = z.object({
  action:      z.literal("confirm"),
  scheduledAt: z.string().datetime({ message: "Fecha inválida" }),
  notes:       z.string().max(500).optional(),
});

const completeSchema = z.object({
  action:       z.literal("complete"),
  totalCharged: z.number().int().positive(),
  items: z.array(
    z.object({
      id:         z.string(),
      finalPrice: z.number().int().nonnegative(),
    })
  ).min(1),
});

const cancelSchema = z.object({
  action: z.literal("cancel"),
});

const patchSchema = z.discriminatedUnion("action", [
  confirmSchema,
  completeSchema,
  cancelSchema,
]);

// ─── DELETE /api/appointments/[id] ───────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const appt = await db.appointment.findUnique({ where: { id }, select: { status: true } });
    if (!appt) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    if (appt.status !== "CANCELLED") {
      return NextResponse.json({ error: "Solo se pueden eliminar turnos cancelados" }, { status: 409 });
    }
    await db.appointment.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(`[DELETE /api/appointments/${id}]`, error);
    return NextResponse.json({ error: "Error al eliminar el turno" }, { status: 500 });
  }
}

// ─── PATCH /api/appointments/[id] ─────────────────────────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Solo admin autenticada
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = result.data;

  try {
    // Verificar que el turno existe
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { client: true, items: { include: { service: true } } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    // ── Confirmar ────────────────────────────────────────────────────────────
    if (data.action === "confirm") {
      if (appointment.status !== "PENDING") {
        return NextResponse.json(
          { error: "Solo se pueden confirmar turnos pendientes" },
          { status: 409 }
        );
      }

      const updated = await db.appointment.update({
        where: { id },
        data: {
          status:      "CONFIRMED",
          scheduledAt: new Date(data.scheduledAt),
          notes:       data.notes ?? appointment.notes,
        },
        include: { client: true, items: { include: { service: true } } },
      });

      return NextResponse.json(updated);
    }

    // ── Completar ────────────────────────────────────────────────────────────
    if (data.action === "complete") {
      if (appointment.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Solo se pueden completar turnos confirmados" },
          { status: 409 }
        );
      }

      // Actualizar cada item con su precio final
      await Promise.all(
        data.items.map((item) =>
          db.appointmentItem.update({
            where: { id: item.id },
            data:  { finalPrice: item.finalPrice },
          })
        )
      );

      const updated = await db.appointment.update({
        where: { id },
        data: {
          status:       "COMPLETED",
          totalCharged: data.totalCharged,
        },
        include: { client: true, items: { include: { service: true } } },
      });

      return NextResponse.json(updated);
    }

    // ── Cancelar ─────────────────────────────────────────────────────────────
    if (data.action === "cancel") {
      if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Este turno no puede cancelarse" },
          { status: 409 }
        );
      }

      const updated = await db.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { client: true, items: { include: { service: true } } },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error(`[PATCH /api/appointments/${id}]`, error);
    return NextResponse.json(
      { error: "Error al actualizar el turno" },
      { status: 500 }
    );
  }
}
