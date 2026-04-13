import { Header } from "@/components/brand/Header";
import { Footer } from "@/components/brand/Footer";
import { CartProvider } from "@/components/public/CartProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
