import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// La verificación de credenciales se hace en un módulo separado
// para no contaminar el Edge runtime del middleware con código Node.js.
// auth.ts solo configura NextAuth con JWT puro; la lógica de DB
// está en lib/auth-verify.ts y se importa dinámicamente.

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        // Importación dinámica: solo se ejecuta en el API route (Node.js),
        // nunca en el Edge middleware
        const { verifyAdmin } = await import("./auth-verify");
        return verifyAdmin(username, password);
      },
    }),
  ],
  pages: {
    signIn:  "/admin/login",
    error:   "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
