import QRCode from "qrcode";

/**
 * Genera un QR como data URL PNG.
 * Se usa en el servidor (route handler de PDF) para incrustar el QR en la tarjeta.
 */
export async function generateQRDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width:     200,
    margin:    1,
    color: {
      dark:  "#4A5D3A", // arya-green-dark
      light: "#F1EFE0", // arya-cream
    },
  });
}
