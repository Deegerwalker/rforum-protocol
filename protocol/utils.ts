export type Bytes = Uint8Array;

export function bytesToHex(bytes: Bytes): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Bytes {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function concatBytes(parts: Bytes[]): Bytes {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function utf8ToBytes(text: string): Bytes {
  return new TextEncoder().encode(text);
}

export function bytesToUtf8(bytes: Bytes): string {
  return new TextDecoder().decode(bytes);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
}

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, canonicalize(v)] as const);
    const out: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      out[k] = v;
    }
    return out;
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function nowUnixMillis(): number {
  return Date.now();
}
