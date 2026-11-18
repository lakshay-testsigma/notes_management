import type { ParsedCookie, SameSite } from "./types.ts";

const SAME_SITE_VALUES: Record<string, SameSite> = {
  strict: "Strict",
  lax: "Lax",
  none: "None",
};

// Control characters (except tab) make the whole header unusable, as in jshttp and undici.
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000a-\u001f\u007f]/;

// Lenient reader: it returns null for a header it cannot read and never throws.
export function parseSetCookie(header: string): ParsedCookie | null {
  if (CONTROL_CHARACTERS.test(header)) return null;

  const firstSemicolon = header.indexOf(";");
  const pair = firstSemicolon === -1 ? header : header.slice(0, firstSemicolon);
  const equals = pair.indexOf("=");
  if (equals === -1) return null;

  const name = pair.slice(0, equals).trim();
  if (name === "") return null;

  const cookie: ParsedCookie = {
    name,
    value: pair.slice(equals + 1).trim(),
    attributes: { secure: false, httpOnly: false, partitioned: false },
    ignored: [],
  };

  // A loop over the attributes: one pass, no recursion, no regular-expression backtracking.
  let position = firstSemicolon;
  while (position !== -1) {
    const next = header.indexOf(";", position + 1);
    const piece = header.slice(position + 1, next === -1 ? header.length : next).trim();
    position = next;
    if (piece !== "") applyAttribute(cookie, piece);
  }
  return cookie;
}

function applyAttribute(cookie: ParsedCookie, piece: string): void {
  const equals = piece.indexOf("=");
  const key = (equals === -1 ? piece : piece.slice(0, equals)).trim().toLowerCase();
  const value = equals === -1 ? "" : piece.slice(equals + 1).trim();
  const attributes = cookie.attributes;

  if (key === "secure") attributes.secure = true;
  else if (key === "httponly") attributes.httpOnly = true;
  else if (key === "partitioned") attributes.partitioned = true;
  else if (key === "path") attributes.path = value;
  // A leading dot on Domain means nothing in current browsers, so drop it.
  else if (key === "domain") attributes.domain = value.replace(/^\./, "").toLowerCase();
  else if (key === "expires") attributes.expires = value;
  else if (key === "samesite") {
    const sameSite = SAME_SITE_VALUES[value.toLowerCase()];
    if (sameSite) attributes.sameSite = sameSite;
    else cookie.ignored.push(`SameSite=${value}`);
  } else if (key === "max-age") {
    if (/^-?\d+$/.test(value)) attributes.maxAge = Number(value);
    else cookie.ignored.push(`Max-Age=${value}`);
  } else cookie.ignored.push(piece);
}
