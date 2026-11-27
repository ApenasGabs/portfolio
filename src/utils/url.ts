const HTTP_PROTOCOL_RE = /^https?:\/\//i;
const ANY_PROTOCOL_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Normalizes an external URL coming from GitHub metadata (e.g. repo `homepage`).
 * - Adds `https://` when the protocol is missing (`foo.vercel.app` → `https://foo.vercel.app`).
 * - Returns `null` for empty values or non-http(s) protocols (`javascript:`, `mailto:`...).
 */
export const normalizeExternalUrl = (raw: string | null | undefined): string | null => {
  const value = (raw ?? "").trim();
  if (value === "") return null;
  const withProtocol = HTTP_PROTOCOL_RE.test(value)
    ? value
    : ANY_PROTOCOL_RE.test(value) && !/^[^:/]+:\d/.test(value)
      ? null
      : `https://${value.replace(/^\/+/, "")}`;
  if (withProtocol === null) return null;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname === "" || !url.hostname.includes(".")) return null;
    return withProtocol;
  } catch {
    return null;
  }
};
