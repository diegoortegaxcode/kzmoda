export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeRichDescription(input: string): string {
  const noScript = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");

  return noScript.trim();
}

export function toPlainDescription(input?: string | null): string {
  if (!input) return "";
  return stripHtml(input);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeDescriptionForRender(input?: string | null): string {
  if (!input) return "";
  const safe = sanitizeRichDescription(input);
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(safe);
  if (hasHtml) return safe;

  return safe
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function plainTextToRichHtml(input: string): string {
  const blocks = input.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const htmlParts: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
    const isNumberList = lines.every((line) => /^\d+\.\s+/.test(line));

    if (isBulletList || isNumberList) {
      const tag = isNumberList ? "ol" : "ul";
      const items = lines
        .map((line) => line.replace(/^([-*]|\d+\.)\s+/, ""))
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");
      htmlParts.push(`<${tag}>${items}</${tag}>`);
    } else {
      htmlParts.push(`<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`);
    }
  }

  return htmlParts.join("");
}
