"use client";

import Image from "next/image";
import { useState } from "react";

interface LogoImageProps {
  size: number;
}

export function LogoImage({ size }: LogoImageProps) {
  const [error, setError] = useState(false);

  if (error) return null; // Cae al texto del Logo si la imagen no carga

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/brand/arya-logo.png"
        alt=""
        fill
        className="object-contain"
        onError={() => setError(true)}
        priority
      />
    </div>
  );
}
