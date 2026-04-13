import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Disponible en el cliente como process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP
    NEXT_PUBLIC_BUSINESS_WHATSAPP: process.env.BUSINESS_WHATSAPP ?? "5493764285491",
  },
};

export default nextConfig;
