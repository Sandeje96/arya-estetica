import { Suspense } from "react";
import { LeafDecoration } from "@/components/brand/LeafDecoration";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-arya-cream flex items-center justify-center px-4 overflow-hidden">
      <LeafDecoration position="top-left"     size="lg" className="top-0 left-0"     opacity={0.12} />
      <LeafDecoration position="bottom-right" size="lg" className="bottom-0 right-0" opacity={0.10} />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        <div className="flex justify-center">
          <Logo size="lg" showTagline href="/" />
        </div>

        <div className="border border-arya-gold/30 rounded-2xl bg-arya-cream-light shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-arya-gold/15">
            <h1 className="font-heading text-xl font-light text-arya-green-dark">
              Panel de administración
            </h1>
            <p className="font-sans text-xs text-arya-text-muted mt-0.5">
              Ingresá con tus credenciales
            </p>
          </div>
          {/* LoginForm usa useSearchParams → necesita Suspense */}
          <Suspense fallback={<div className="px-6 py-6 h-56" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center font-sans text-xs text-arya-text-muted/50">
          <a href="/" className="hover:text-arya-green-dark transition-colors underline underline-offset-4">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  );
}
