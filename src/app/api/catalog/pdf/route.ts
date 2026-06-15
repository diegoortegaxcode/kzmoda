import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function ensureBase64Globals() {
  const g = global as typeof globalThis & { atob?: (s: string) => string; btoa?: (s: string) => string };
  if (!g.atob) g.atob = (s) => Buffer.from(s, "base64").toString("binary");
  if (!g.btoa) g.btoa = (s) => Buffer.from(s, "binary").toString("base64");
}

function parseS3Url(rawUrl: string): { bucket: string; key: string } | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname;
    const path = url.pathname.replace(/^\/+/, "");

    if (host.includes(".s3.") && host.endsWith(".amazonaws.com")) {
      return { bucket: host.split(".s3.")[0], key: decodeURIComponent(path) };
    }

    if (host.startsWith("s3.") && host.endsWith(".amazonaws.com")) {
      const [bucket, ...keyParts] = path.split("/");
      if (!bucket || keyParts.length === 0) return null;
      return { bucket, key: decodeURIComponent(keyParts.join("/")) };
    }
  } catch {
    return null;
  }

  return null;
}

function isDataImage(url: string): boolean {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(url);
}

function readDataImage(url: string): ImgEntry {
  const match = url.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  if (mime.includes("png")) return { data: match[2], format: "PNG" };
  return { data: match[2], format: "JPEG" };
}

async function normalizeImageForPdf(buf: Buffer): Promise<{ data: string; format: string } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const jpg = await sharp(buf, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    return { data: jpg.toString("base64"), format: "JPEG" };
  } catch {
    const signature = buf.subarray(0, 12).toString("hex");
    const isPng = signature.startsWith("89504e470d0a1a0a");
    const isJpeg = signature.startsWith("ffd8ff");
    if (isPng) return { data: buf.toString("base64"), format: "PNG" };
    if (isJpeg) return { data: buf.toString("base64"), format: "JPEG" };
    return null;
  }
}

async function fetchImgBase64(url: string): Promise<{ data: string; format: string } | null> {
  if (!url) return null;
  if (isDataImage(url)) return readDataImage(url);

  // 1. Try S3 SDK first (private buckets)
  try {
    const s3Ref = parseS3Url(url);
    if (s3Ref) {
      const res = await s3.send(new GetObjectCommand({ Bucket: s3Ref.bucket, Key: s3Ref.key }));
      const chunks: Uint8Array[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const chunk of res.Body as any) chunks.push(chunk);
      const buf = Buffer.concat(chunks);
      if (buf.length > 0) return normalizeImageForPdf(buf);
    }
  } catch { /* fall through */ }

  // 2. Fallback: public URL fetch (works if bucket has public-read ACL)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (compatible; KModaCatalog/1.0)",
      },
    });
    clearTimeout(t);
    if (r.ok) {
      const buf = await r.arrayBuffer();
      return normalizeImageForPdf(Buffer.from(buf));
    }
  } catch { /* ignore */ }

  return null;
}

const COVER_HERO_URL =
  "https://png.pngtree.com/png-vector/20240115/ourmid/pngtree-green-luxury-ladies-leather-pink-purse-png-image_11437673.png";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK:       [number, number, number] = [18,  18,  18];
const CHARCOAL:  [number, number, number] = [55,  55,  55];
const WARM_GRAY: [number, number, number] = [145, 138, 132];
const SILVER:    [number, number, number] = [208, 202, 196];
const CREAM:     [number, number, number] = [248, 244, 238];
const WHITE:     [number, number, number] = [255, 255, 255];
const ROSE:      [number, number, number] = [194,  24,  91];
const ROSE_DARK: [number, number, number] = [136,  14,  79];
const ROSE_BG:   [number, number, number] = [252, 228, 237];
const TEAL:      [number, number, number] = [39,  75,  78];
const COCOA:     [number, number, number] = [122, 88,  78];
const SAND:      [number, number, number] = [177, 145, 104];

type ImgEntry = { data: string; format: string } | null;

// ── Safe addImage ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeAddImage(doc: any, img: ImgEntry, x: number, y: number, w: number, h: number): boolean {
  if (!img) return false;
  try {
    doc.addImage(
      `data:image/${img.format.toLowerCase()};base64,${img.data}`,
      img.format, x, y, w, h,
    );
    return true;
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeAddImageContain(doc: any, img: ImgEntry, x: number, y: number, w: number, h: number): boolean {
  if (!img) return false;
  try {
    const src = `data:image/${img.format.toLowerCase()};base64,${img.data}`;
    const props = doc.getImageProperties(src);
    const ratio = props.width / props.height;
    let drawW = w;
    let drawH = w / ratio;
    if (drawH > h) {
      drawH = h;
      drawW = h * ratio;
    }
    const dx = x + (w - drawW) / 2;
    const dy = y + (h - drawH) / 2;
    doc.addImage(src, img.format, dx, dy, drawW, drawH);
    return true;
  } catch {
    return safeAddImage(doc, img, x, y, w, h);
  }
}

// ── Image placeholder ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawPlaceholder(doc: any, x: number, y: number, w: number, h: number) {
  // Charcoal background
  doc.setFillColor(45, 40, 38);
  doc.rect(x, y, w, h, "F");
  // Subtle warm center band
  doc.setFillColor(60, 52, 48);
  doc.rect(x, y + h * 0.35, w, h * 0.3, "F");
  // Rose thin line at bottom
  doc.setFillColor(...ROSE);
  doc.rect(x, y + h - 1.5, w, 1.5, "F");
  // "SIN IMAGEN" text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 110, 105);
  doc.text("S I N   I M A G E N", x + w / 2, y + h / 2 + 1.5, { align: "center" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawCoverImage(doc: any, img: ImgEntry, x: number, y: number, w: number, h: number) {
  if (!safeAddImage(doc, img, x, y, w, h)) drawPlaceholder(doc, x, y, w, h);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawCoverNumber(doc: any, label: string, x: number, y: number, color: [number, number, number] = WHITE) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.55);
  doc.rect(x, y, 13, 13, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...color);
  doc.text(label, x + 6.5, y + 8.7, { align: "center" });
}

export async function GET() {
  ensureBase64Globals();
  const { jsPDF } = await import("jspdf");

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

  const imageMap = new Map<string, ImgEntry>();
  const [, coverHeroImg] = await Promise.all([
    Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (products as any[]).filter((p) => p.images?.length > 0).map(async (p) => {
        imageMap.set(p.id, await fetchImgBase64(p.images[0]));
      })
    ),
    fetchImgBase64(COVER_HERO_URL),
  ]);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297

  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" }).toUpperCase();

  // ══════════════════════════════════════════════════════════════════════
  //  COVER — inspired by Nappa Dori newsletter style
  // ══════════════════════════════════════════════════════════════════════

  const vol = Math.max(1, Math.ceil(products.length / 9));
  const catSet = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (products as any[]).map((p) => p.category.name as string)
  );
  const catArr = [...catSet];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coverProducts = (products as any[]).filter((p) => imageMap.get(p.id)).slice(0, 4);
  const coverImg = (idx: number) => {
    const product = coverProducts[idx] ?? coverProducts[0];
    return product ? imageMap.get(product.id) ?? null : null;
  };

  // Minimal magazine cover inspired by editorial print layouts.
  doc.setFillColor(239, 235, 226);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...WHITE);
  doc.rect(21, 20, W - 42, H - 40, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(30);
  doc.setTextColor(55, 48, 43);
  doc.text(settings.name.toUpperCase().split("").join("  "), W / 2, 78, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...CHARCOAL);
  doc.text("C A T A L O G O   &   E S T I L O", W / 2, 98, { align: "center" });

  doc.setDrawColor(...SILVER);
  doc.setLineWidth(0.25);
  doc.line(W / 2 - 37, 114, W / 2 + 37, 114);

  const roman = ["I.", "II.", "III.", "IV.", "V.", "VI."];
  const coverCats = catArr.slice(0, 6).map((cat, idx) => `${roman[idx]} ${cat.toUpperCase()}`);
  doc.setFont("times", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(75, 67, 61);
  doc.text(coverCats.slice(0, 3).join("     "), W / 2, 132, { align: "center" });
  if (coverCats.length > 3) {
    doc.text(coverCats.slice(3, 6).join("     "), W / 2, 144, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...WARM_GRAY);
  doc.text(`VOL.${String(vol).padStart(2, "0")}  |  ${dateStr}  |  ${products.length} PRODUCTOS`, W / 2, 158, { align: "center" });

  // Hero image — fixed brand purse, contained with cream background
  const heroX = 26, heroY = 162, heroW = W - 52, heroH = 100;
  doc.setFillColor(248, 244, 240);
  doc.rect(heroX, heroY, heroW, heroH, "F");
  if (coverHeroImg) {
    safeAddImageContain(doc, coverHeroImg, heroX, heroY, heroW, heroH);
  } else {
    drawPlaceholder(doc, heroX, heroY, heroW, heroH);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...CHARCOAL);
  const tagline = settings.catalogTagline || "Moda femenina seleccionada para pedidos, ventas y colecciones de temporada.";
  doc.text(doc.splitTextToSize(tagline, W - 72), W / 2, 272, { align: "center" });

  doc.setFillColor(...ROSE);
  doc.rect(W / 2 - 17, 281, 34, 0.8, "F");

  // Footer contact band
  doc.setFillColor(...WHITE);
  doc.rect(21, H - 33, W - 42, 13, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...WARM_GRAY);
  const footerBits = [
    settings.whatsapp ? `WhatsApp: ${settings.whatsapp}` : "",
    settings.instagram ? `Instagram: ${settings.instagram}` : "",
    settings.address || "",
  ].filter(Boolean);
  doc.text(footerBits.join("  |  "), W / 2, H - 3, { align: "center" });

  // ══════════════════════════════════════════════════════════════════════
  //  PRODUCT PAGES — clean catalogue grid, 9 per page
  // ══════════════════════════════════════════════════════════════════════
  const PER_PAGE = 9;
  const totalPages = Math.ceil(products.length / PER_PAGE);
  const pagePadX = 16;
  const pageTop = 20;
  const pageBottom = 18;
  const gutterX = 10;
  const gutterY = 12;
  const cellW = (W - pagePadX * 2 - gutterX * 2) / 3;
  const cellH = (H - pageTop - pageBottom - gutterY * 2) / 3;
  const imgH = cellH - 18;

  for (let pg = 0; pg < totalPages; pg++) {
    doc.addPage();

    doc.setFillColor(...WHITE);
    doc.rect(0, 0, W, H, "F");

    // Subtle catalogue-page texture.
    doc.setDrawColor(236, 236, 232);
    doc.setLineWidth(0.12);
    for (let x = -H; x < W + H; x += 6) {
      doc.line(x, 0, x + H, H);
      doc.line(x, H, x + H, 0);
    }
    doc.setFillColor(...WHITE);
    doc.rect(11, 10, W - 22, H - 20, "F");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slice = (products as any[]).slice(pg * PER_PAGE, (pg + 1) * PER_PAGE);

    for (let i = 0; i < slice.length; i++) {
      const product = slice[i];
      const globalIdx = pg * PER_PAGE + i + 1;
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = pagePadX + col * (cellW + gutterX);
      const y = pageTop + row * (cellH + gutterY);
      const img = imageMap.get(product.id) ?? null;

      doc.setFillColor(...WHITE);
      doc.rect(x, y, cellW, imgH, "F");
      if (!safeAddImageContain(doc, img, x, y, cellW, imgH)) {
        drawPlaceholder(doc, x + 3, y + 3, cellW - 6, imgH - 6);
      }

      const labelY = y + imgH + 3.5;
      doc.setFillColor(228, 228, 225);
      doc.rect(x + 2, labelY, 13, 10, "F");
      doc.setDrawColor(188, 188, 184);
      doc.setLineWidth(0.2);
      doc.rect(x + 2, labelY, 13, 10, "S");
      doc.triangle(x + 11.5, labelY + 10, x + 15, labelY + 10, x + 15, labelY + 13, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(...INK);
      doc.text(String(globalIdx).padStart(3, "0"), x + 8.5, labelY + 6.8, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.8);
      doc.setTextColor(...INK);
      const code = (product.sku || product.name).toUpperCase();
      doc.text(doc.splitTextToSize(code, cellW - 20).slice(0, 1), x + 19, labelY + 4.4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.4);
      doc.setTextColor(...CHARCOAL);
      const meta = `${product.category.name.toUpperCase()}  //  S/ ${Number(product.price).toFixed(2)}`;
      doc.text(doc.splitTextToSize(meta, cellW - 20).slice(0, 1), x + 19, labelY + 9.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(4.8);
      doc.setTextColor(...WARM_GRAY);
      const stockText = product.stock > 0 ? `${product.stock} disponibles` : "agotado";
      doc.text(stockText.toUpperCase(), x + 19, labelY + 14.2);
    }

    // Dashed row separators, like a printed line sheet.
    doc.setDrawColor(180, 180, 176);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 2], 0);
    for (let row = 1; row <= 2; row++) {
      const sepY = pageTop + row * cellH + (row - 0.5) * gutterY;
      doc.line(42, sepY, W - 16, sepY);
      doc.setFillColor(170, 170, 166);
      doc.rect(39, sepY - 1, 2, 2, "F");
    }
    doc.setLineDashPattern([], 0);

    // Footer.
    doc.setFillColor(...ROSE);
    doc.rect(16, H - 13, 10, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(...WHITE);
    doc.text(String(pg + 1).padStart(2, "0"), 21, H - 8.8, { align: "center" });

    doc.setDrawColor(...ROSE);
    doc.setLineWidth(0.35);
    doc.rect(26, H - 13, 46, 6, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.4);
    doc.setTextColor(...ROSE);
    doc.text(`${settings.name.toUpperCase()} CATALOGUE`, 49, H - 8.8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    doc.setTextColor(...WARM_GRAY);
    if (settings.whatsapp) doc.text(`WhatsApp: ${settings.whatsapp}`, W - 16, H - 8.8, { align: "right" });
  }

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
