export function shouldUseSecureCookie(requestUrl?: string): boolean {
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.COOKIE_SECURE === "true") return true;

  if (requestUrl) {
    try {
      const url = new URL(requestUrl);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return false;
      return url.protocol === "https:";
    } catch {
      return process.env.NODE_ENV === "production";
    }
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") return true;
  return false;
}
