// Web Crypto API — works in Edge (middleware) and Node 18+ (Next.js 15 requires Node 18.18+)

const SECRET = process.env.JWT_SECRET ?? "kmoda-secret-change-in-production";

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "ASISTENTE" | "CLIENTE";
  iat: number;
  exp: number;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

const te = new TextEncoder();
const td = new TextDecoder();

function enc(buf: BufferSource): string {
  const bytes = ArrayBuffer.isView(buf) ? new Uint8Array(buf.buffer as ArrayBuffer, buf.byteOffset, buf.byteLength) : new Uint8Array(buf as ArrayBuffer);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function dec(s: string): ArrayBuffer {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(pad + "===".slice((pad.length + 3) % 4 || 4)), (c) => c.charCodeAt(0)).buffer as ArrayBuffer;
}

export async function signJWT(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  const key = await hmacKey();
  const header = enc(te.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = enc(te.encode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 28800 })));
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(`${header}.${body}`));
  return `${header}.${body}.${enc(sig)}`;
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const [h, b, s] = token.split(".");
    if (!h || !b || !s) return null;
    const key = await hmacKey();
    const ok = await crypto.subtle.verify("HMAC", key, dec(s), te.encode(`${h}.${b}`));
    if (!ok) return null;
    const payload = JSON.parse(td.decode(dec(b))) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
