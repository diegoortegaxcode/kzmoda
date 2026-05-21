import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Node 14 doesn't have atob/btoa natively — polyfill before jsPDF loads
function ensureBase64Globals() {
  const g = global as typeof globalThis & { atob?: (s: string) => string; btoa?: (s: string) => string };
  if (!g.atob) g.atob = (s) => Buffer.from(s, "base64").toString("binary");
  if (!g.btoa) g.btoa = (s) => Buffer.from(s, "binary").toString("base64");
}

async function fetchImgBase64(url: string): Promise<{ data: string; format: string } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    const format = ct.includes("png") ? "PNG" : ct.includes("webp") ? "WEBP" : "JPEG";
    return { data: Buffer.from(buf).toString("base64"), format };
  } catch {
    return null;
  }
}

const ROSE: [number, number, number] = [233, 30, 99];
const ROSE_LIGHT: [number, number, number] = [252, 228, 236];
const GOLD: [number, number, number] = [212, 175, 55];
const BLACK: [number, number, number] = [15, 15, 15];
const GRAY: [number, number, number] = [120, 120, 120];

export async function GET() {
  ensureBase64Globals();

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  // ── 1. Fetch settings + products ─────────────────────────────────────────
  const [settings, products] = await Promise.all([
    db.storeSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
      db.product.findMany({
      where: { active: true },
      include: { category: { select: { name: true } } },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  // ── 2. Load images in parallel (timeout 3s each) ──────────────────────────
  type ImgEntry = { data: string; format: string } | null;
  const imageMap = new Map<string, ImgEntry>();

  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (products as any[]).filter((p) => p.images?.length > 0).map(async (p) => {
      const img = await fetchImgBase64(p.images[0]);
      imageMap.set(p.id, img);
    })
  );

  // ── 3. Init PDF ───────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297
  const MARGIN = 14;

  // ── 4. Header ─────────────────────────────────────────────────────────────
  // Rose background bar
  doc.setFillColor(...ROSE);
  doc.rect(0, 0, W, 36, "F");

  // Gold top accent line
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 2.5, "F");

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(settings.name.toUpperCase(), MARGIN, 17);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 200, 220);
  doc.text(settings.catalogTagline || "Catálogo Oficial de Productos", MARGIN, 25);

  // Date + count (right-aligned)
  const dateStr = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  doc.setFontSize(7.5);
  doc.setTextColor(255, 200, 220);
  doc.text(`${products.length} productos · ${dateStr}`, W - MARGIN, 25, { align: "right" });

  // Gold separator
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, 33, W - MARGIN * 2, 0.8, "F");

  // ── 5. Table ──────────────────────────────────────────────────────────────
  const IMG_W = 18;
  const IMG_H = 14;
  const ROW_H = IMG_H + 5;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableBody = (products as any[]).map((p): any[] => [
    { content: "" },                                           // image cell
    { content: p.name },
    { content: p.sku },
    { content: p.category.name },
    { content: `S/ ${Number(p.price).toFixed(2)}`, styles: { halign: "right", fontStyle: "bold" as const } },
    { content: String(p.stock), styles: { halign: "center" as const } },
  ]);

  autoTable(doc, {
    head: [["", "Producto", "SKU", "Categoría", "Precio", "Stock"]],
    body: tableBody,
    startY: 42,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      textColor: BLACK,
      minCellHeight: ROW_H,
      valign: "middle",
    },
    headStyles: {
      fillColor: ROSE,
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold",
      fontSize: 7.5,
      minCellHeight: 8,
    },
    alternateRowStyles: { fillColor: ROSE_LIGHT },
    columnStyles: {
      0: { cellWidth: IMG_W + 4, halign: "center" },
      1: { cellWidth: 60 },
      2: { cellWidth: 30, font: "courier", fontSize: 7, textColor: GRAY },
      3: { cellWidth: 35, textColor: GRAY },
      4: { cellWidth: 28 },
      5: { cellWidth: 15 },
    },
    didDrawCell: (data) => {
      // Draw product image (or placeholder) in column 0
      if (data.section !== "body" || data.column.index !== 0) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const product = (products as any[])[data.row.index];
      if (!product) return;

      const x = data.cell.x + 2;
      const y = data.cell.y + (data.cell.height - IMG_H) / 2;
      const img = imageMap.get(product.id);

      if (img) {
        try {
          doc.addImage(`data:image/${img.format.toLowerCase()};base64,${img.data}`, img.format, x, y, IMG_W, IMG_H);
          return;
        } catch { /* fall through to placeholder */ }
      }

      // Colored placeholder with initial
      const colors: Array<[number, number, number]> = [
        [233, 30, 99], [212, 175, 55], [79, 70, 229], [16, 185, 129],
      ];
      const color = colors[data.row.index % colors.length];
      doc.setFillColor(...color);
      doc.roundedRect(x, y, IMG_W, IMG_H, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const initial = (product.name as string)[0]?.toUpperCase() ?? "?";
      doc.text(initial, x + IMG_W / 2, y + IMG_H / 2 + 1.5, { align: "center" });
    },
  });

  // ── 6. Footer on every page ───────────────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } })
    .internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer bar
    doc.setFillColor(...BLACK);
    doc.rect(0, H - 14, W, 14, "F");

    // Gold accent
    doc.setFillColor(...GOLD);
    doc.rect(0, H - 14, W, 1.5, "F");

    // WhatsApp
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(settings.name, MARGIN, H - 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(212, 175, 55);
    doc.text(`WhatsApp: ${settings.whatsapp}`, MARGIN, H - 3.5);

    // Page number
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(7);
    doc.text(`Página ${i} de ${totalPages}`, W - MARGIN, H - 5.5, { align: "right" });
  }

  // ── 7. Return PDF ─────────────────────────────────────────────────────────
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="catalogo-kmoda-${Date.now()}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
