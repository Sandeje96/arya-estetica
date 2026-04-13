"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const username = form.get("username") as string;
    const password = form.get("password") as string;

    if (!username || !password) {
      setError("Completá usuario y contraseña.");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        window.location.href = callbackUrl;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4" noValidate>
      {/* Usuario */}
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
          Usuario
        </span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="off"
          placeholder="arya"
          required
          className={cn(
            "px-4 py-3 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm",
            "placeholder:text-arya-text-muted/40 focus:outline-none focus:ring-2 focus:ring-arya-green/40 focus:border-arya-green-soft transition-colors"
          )}
        />
      </label>

      {/* Contraseña */}
      <label className="flex flex-col gap-1.5">
        <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">
          Contraseña
        </span>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(
              "w-full pr-10 px-4 py-3 rounded-lg border border-arya-gold/30 bg-arya-cream text-arya-text font-sans text-sm",
              "placeholder:text-arya-text-muted/40 focus:outline-none focus:ring-2 focus:ring-arya-green/40 focus:border-arya-green-soft transition-colors"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-arya-text-muted/50 hover:text-arya-text-muted transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        </div>
      </label>

      {/* Error */}
      {error && (
        <p
          className="font-sans text-sm text-destructive bg-destructive/8 border border-destructive/20 px-3 py-2.5 rounded-lg"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium tracking-wide hover:bg-arya-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {isPending ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden />
            Ingresando…
          </>
        ) : (
          <>
            <LogIn size={15} aria-hidden />
            Ingresar
          </>
        )}
      </button>
    </form>
  );
}
