// Este módulo corre SOLO en Node.js (API routes, server components).
// Nunca se importa desde el Edge middleware.
import bcrypt from "bcryptjs";

export async function verifyAdmin(
  username: string,
  password: string
): Promise<{ id: string; name: string } | null> {
  // Intentar verificar contra la DB
  try {
    const { db } = await import("./db");
    const admin = await db.adminUser.findUnique({ where: { username } });
    if (!admin) return null;
    const valid = await bcrypt.compare(password, admin.passwordHash);
    return valid ? { id: admin.id, name: username } : null;
  } catch {
    // Fallback dev: sin DB, comparar contra las env vars en texto plano
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    if (!envUser || !envPass) return null;
    if (username !== envUser || password !== envPass) return null;
    return { id: "dev-admin", name: username };
  }
}
