/**
 * Gift Card PDF — Arya Estética
 * Formato CR80: 85.6mm × 54mm (242.64pt × 153.07pt)
 * Fuente única: Times-Roman (built-in, sin dependencias de red)
 */

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/formatting";

// ─── Colores ──────────────────────────────────────────────────────────────────
const GREEN  = "#4A5D3A";
const CREAM  = "#F1EFE0";
const GOLD   = "#B8A668";
const MUTED  = "#7A8A6A";

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    width:           242.64,
    height:          153.07,
    backgroundColor: CREAM,
    padding:         0,
    fontFamily:      "Times-Roman",
    position:        "relative",
  },

  // Borde fino dorado
  border: {
    position:    "absolute",
    top:         4,
    left:        4,
    right:       4,
    bottom:      4,
    borderWidth: 0.6,
    borderColor: GOLD,
    borderStyle: "solid",
  },

  // Área principal con padding
  inner: {
    position: "absolute",
    top:      10,
    left:     12,
    right:    12,
    bottom:   10,
    flexDirection: "column",
  },

  // ── Título GIFT CARD ────────────────────────────────────────────────────────
  title: {
    fontFamily:    "Times-Roman",
    fontSize:      28,
    color:         GREEN,
    letterSpacing: 6,
    textAlign:     "center",
    marginBottom:  4,
  },

  // Línea dorada separadora bajo el título
  titleDivider: {
    height:          0.6,
    backgroundColor: GOLD,
    marginBottom:    8,
  },

  // ── Campos DE / PARA / SERVICIO ─────────────────────────────────────────────
  fieldsBlock: {
    flexDirection: "column",
    gap:           3,
    flex:          1,
  },

  fieldRow: {
    flexDirection:  "row",
    alignItems:     "flex-end",
    gap:            4,
  },

  fieldLabel: {
    fontFamily:    "Times-Roman",
    fontSize:      7,
    color:         GREEN,
    letterSpacing: 1.5,
    minWidth:      40,
    paddingBottom: 1,
  },

  fieldValue: {
    fontFamily: "Times-Roman",
    fontSize:   8,
    color:      GREEN,
    flex:       1,
    borderBottomWidth: 0.5,
    borderBottomColor: MUTED,
    borderBottomStyle: "solid",
    paddingBottom: 1,
  },

  fieldValueEmpty: {
    fontFamily: "Times-Roman",
    fontSize:   8,
    color:      CREAM,  // invisible — solo sirve para mantener el underline
    flex:       1,
    borderBottomWidth: 0.5,
    borderBottomColor: MUTED,
    borderBottomStyle: "solid",
    paddingBottom: 1,
  },

  // ── Precio ──────────────────────────────────────────────────────────────────
  priceRow: {
    flexDirection:  "row",
    justifyContent: "flex-end",
    alignItems:     "center",
    gap:            4,
    marginTop:      3,
  },

  priceLabel: {
    fontFamily:    "Times-Roman",
    fontSize:      6,
    color:         MUTED,
    letterSpacing: 1,
  },

  priceValue: {
    fontFamily: "Times-Roman",
    fontSize:   11,
    color:      GREEN,
  },

  // ── Pie ─────────────────────────────────────────────────────────────────────
  footer: {
    flexDirection:  "row",
    alignItems:     "flex-end",
    justifyContent: "space-between",
    marginTop:      5,
    paddingTop:     4,
    borderTopWidth: 0.5,
    borderTopColor: GOLD,
    borderTopStyle: "solid",
  },

  // Contacto izquierda
  contactBlock: {
    flexDirection: "column",
    gap:           1.5,
  },

  contactLine: {
    fontFamily: "Times-Roman",
    fontSize:   5,
    color:      MUTED,
  },

  // Marca derecha
  brandBlock: {
    flexDirection: "column",
    alignItems:    "flex-end",
    gap:           1,
  },

  brandName: {
    fontFamily:    "Times-Roman",
    fontSize:      12,
    color:         GREEN,
    letterSpacing: 2,
  },

  brandSub: {
    fontFamily:    "Times-Roman",
    fontSize:      6,
    color:         MUTED,
    letterSpacing: 3,
  },

  // QR pequeño (cuando cabe)
  qrBox: {
    width:           28,
    height:          28,
    borderWidth:     0.4,
    borderColor:     GOLD,
    borderStyle:     "solid",
    padding:         1,
    backgroundColor: CREAM,
    marginLeft:      6,
  },
  qrImg: {
    width:  "100%",
    height: "100%",
  },
});

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GiftCardPDFProps {
  recipientName: string;
  buyerName:     string;
  services:      Array<{ name: string; priceAtPurchase: number }>;
  totalAmount:   number;
  qrDataUrl:     string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function GiftCardPDF({
  recipientName,
  buyerName,
  services,
  totalAmount,
  qrDataUrl,
}: GiftCardPDFProps) {
  // Resumir servicios en una línea (máx ~60 caracteres)
  const serviceLine = services.map((s) => s.name).join(" · ");
  const serviceDisplay =
    serviceLine.length > 58
      ? serviceLine.slice(0, 55) + "…"
      : serviceLine;

  return (
    <Document title="Gift Card — Arya Estética">
      <Page size={[242.64, 153.07]} style={s.page}>

        {/* Borde dorado */}
        <View style={s.border} />

        <View style={s.inner}>

          {/* Título */}
          <Text style={s.title}>GIFT CARD</Text>
          <View style={s.titleDivider} />

          {/* Campos */}
          <View style={s.fieldsBlock}>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>DE:</Text>
              <Text style={s.fieldValue}>{buyerName}</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>PARA:</Text>
              <Text style={s.fieldValue}>{recipientName}</Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>SERVICIO:</Text>
              <Text style={s.fieldValue}>{serviceDisplay}</Text>
            </View>
          </View>

          {/* Precio */}
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>VALOR TOTAL</Text>
            <Text style={s.priceValue}>{formatPrice(totalAmount)}</Text>
          </View>

          {/* Pie: contacto | marca + QR */}
          <View style={s.footer}>
            <View style={s.contactBlock}>
              <Text style={s.contactLine}>✆  +54 9 3764-285491</Text>
              <Text style={s.contactLine}>◎  @arya_estetica</Text>
              <Text style={s.contactLine}>⌖  Edif. Puerta Real, Dpto 12 E, Villa Sarita. Posadas.</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
              <View style={s.brandBlock}>
                <Text style={s.brandName}>ARYA</Text>
                <Text style={s.brandSub}>e s t é t i c a</Text>
              </View>
              <View style={s.qrBox}>
                <Image src={qrDataUrl} style={s.qrImg} />
              </View>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}
