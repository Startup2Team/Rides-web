declare module "qrcode-generator" {
  type ErrorCorrection = "L" | "M" | "Q" | "H";

  interface QRInstance {
    addData(data: string): void;
    make(): void;
    createSvgTag(cellSize?: number, margin?: number): string;
  }

  function qrcode(typeNumber: number, errorCorrectionLevel: ErrorCorrection): QRInstance;

  export = qrcode;
}
