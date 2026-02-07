import crypto from "crypto";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return secret;
}

function toBase64Url(buf: Buffer): string {
  return buf.toString("base64url");
}

function fromBase64Url(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

export function createVerificationToken(userId: string, email: string): string {
  const payload = JSON.stringify({
    sub: userId,
    email,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  });

  const payloadB64 = toBase64Url(Buffer.from(payload, "utf-8"));
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest();
  const sigB64 = toBase64Url(hmac);

  return `${payloadB64}.${sigB64}`;
}

export function verifyVerificationToken(
  token: string
): { sub: string; email: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  // Verify HMAC
  const expectedHmac = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest();

  let receivedHmac: Buffer;
  try {
    receivedHmac = fromBase64Url(sigB64);
  } catch {
    return null;
  }

  if (
    expectedHmac.length !== receivedHmac.length ||
    !crypto.timingSafeEqual(expectedHmac, receivedHmac)
  ) {
    return null;
  }

  // Decode payload
  let payload: { sub: string; email: string; exp: number };
  try {
    payload = JSON.parse(fromBase64Url(payloadB64).toString("utf-8"));
  } catch {
    return null;
  }

  // Check expiry
  if (!payload.exp || Date.now() > payload.exp) return null;
  if (!payload.sub || !payload.email) return null;

  return { sub: payload.sub, email: payload.email };
}
