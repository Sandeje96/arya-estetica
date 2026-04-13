/**
 * Componente React PDF para la gift card de Arya Estética.
 * Formato CR80 (tarjeta de crédito estándar): 85.6mm × 54mm.
 *
 * Se usa exclusivamente en el route handler /api/gift-cards/[code]/pdf
 * que corre en Node.js (no en Edge).
 */

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/formatting";

// ─── Tipografías ──────────────────────────────────────────────────────────────
// Usamos fuentes embebidas para que el PDF sea portable.
// Si no existen los archivos locales, @react-pdf usa Helvetica como fallback.
Font.register({
  family: "Cormorant",
  fonts: [
    { src: "https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQ.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/cormorantgaramond/v22/co3bmX5slCNuHLi8bLeY9MK7whWMhyjQEl5fpw.woff2", fontWeight: 600 },
  ],
});

// ─── Colores Arya ─────────────────────────────────────────────────────────────
const C = {
  greenDark:  "#4A5D3A",
  green:      "#6B7F4F",
  greenSoft:  "#8A9B6E",
  cream:      "#F1EFE0",
  creamLight: "#F8F6EC",
  gold:       "#B8A668",
  goldSoft:   "#C8B97E",
  text:       "#3D3D3D",
  textMuted:  "#6B6B6B",
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    width:           "85.6mm",
    height:          "54mm",
    backgroundColor: C.cream,
    padding:         "5mm",
    position:        "relative",
    fontFamily:      "Helvetica",
  },
  // Borde dorado
  border: {
    position:        "absolute",
    top:             "2mm",
    left:            "2mm",
    right:           "2mm",
    bottom:          "2mm",
    borderWidth:     0.5,
    borderColor:     C.gold,
    borderStyle:     "solid",
    borderRadius:    2,
  },
  // Franja verde superior
  headerBar: {
    position:        "absolute",
    top:             0,
    left:            0,
    right:           0,
    height:          "14mm",
    backgroundColor: C.greenDark,
  },
  // Área de contenido principal
  content: {
    position:  "absolute",
    top:       "14mm",
    left:      "5mm",
    right:     "28mm",   // deja espacio para el QR
    bottom:    "5mm",
    flexDirection: "column",
    gap: 2,
  },
  // QR en esquina inferior derecha
  qrContainer: {
    position: "absolute",
    bottom:   "5mm",
    right:    "4mm",
    width:    "23mm",
    height:   "23mm",
    backgroundColor: C.creamLight,
    padding: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: C.gold,
    borderStyle: "solid",
  },
  qrImage: {
    width:  "100%",
    height: "100%",
  },
  // Textos en el header
  brandName: {
    position:   "absolute",
    top:        "3.5mm",
    left:       "5mm",
    fontFamily: "Cormorant",
    fontSize:   14,
    color:      C.cream,
    letterSpacing: 1,
  },
  giftCardLabel: {
    position:   "absolute",
    top:        "8mm",
    left:       "5mm",
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize:   7,
    color:      C.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  // Destinataria
  paraLabel: {
    fontSize:  5.5,
    color:     C.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  recipientName: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize:   11,
    color:      C.greenDark,
    marginTop:  1,
  },
  // Servicios
  serviceItem: {
    fontSize:  5.5,
    color:     C.text,
    marginTop: 2,
    paddingLeft: 4,
  },
  serviceItemBullet: {
    fontSize: 5.5,
    color:    C.goldSoft,
  },
  // Total
  totalRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
    marginTop:     "auto",
    paddingTop:    2,
    borderTopWidth: 0.4,
    borderTopColor: C.gold,
    borderTopStyle: "solid",
  },
  totalLabel: {
    fontSize: 5,
    color:    C.textMuted,
    flex:     1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontFamily: "Cormorant",
    fontWeight: 600,
    fontSize:   10,
    color:      C.greenDark,
  },
  // Datos de contacto (pie)
  contactRow: {
    position:  "absolute",
    bottom:    "2.5mm",
    left:      "5mm",
    right:     "28mm",
    flexDirection: "row",
    gap:       6,
  },
  contactText: {
    fontSize: 4.5,
    color:    C.textMuted,
  },
});

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GiftCardPDFProps {
  recipientName: string;
  services: Array<{ name: string; priceAtPurchase: number }>;
  totalAmount: number;
  qrDataUrl: string;  // PNG data URL generado por lib/qr.ts
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GiftCardPDF({
  recipientName,
  services,
  totalAmount,
  qrDataUrl,
}: GiftCardPDFProps) {
  // Limitar a 4 servicios para que entren en el espacio disponible
  const visibleServices = services.slice(0, 4);
  const extra = services.length - visibleServices.length;

  return (
    <Document title="Gift Card — Arya Estética">
      <Page size={[242.64, 153.07]} style={s.page}>
        {/* Franja verde */}
        <View style={s.headerBar} />

        {/* Borde dorado */}
        <View style={s.border} />

        {/* Marca en header */}
        <Text style={s.brandName}>ARYA estética</Text>
        <Text style={s.giftCardLabel}>Gift Card</Text>

        {/* Contenido central */}
        <View style={s.content}>
          <Text style={s.paraLabel}>Para</Text>
          <Text style={s.recipientName}>{recipientName}</Text>

          {visibleServices.map((srv, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={s.serviceItemBullet}>• </Text>
              <Text style={s.serviceItem}>{srv.name}</Text>
            </View>
          ))}

          {extra > 0 && (
            <Text style={{ ...s.serviceItem, color: C.textMuted }}>
              + {extra} servicio{extra > 1 ? "s" : ""} más
            </Text>
          )}

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Valor total</Text>
            <Text style={s.totalAmount}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>

        {/* QR */}
        <View style={s.qrContainer}>
          <Image src={qrDataUrl} style={s.qrImage} />
        </View>

        {/* Contacto */}
        <View style={s.contactRow}>
          <Text style={s.contactText}>Edif. Puerta Real, Dpto 12 E, Villa Sarita</Text>
          <Text style={s.contactText}>@arya_estetica</Text>
        </View>
      </Page>
    </Document>
  );
}
