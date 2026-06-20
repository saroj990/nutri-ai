const ITERATIONS = 100_000;
const HASH_ALGORITHM = "SHA-256";

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const saltBuffer = new Uint8Array(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  return crypto.subtle.importKey(
    "raw",
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: ITERATIONS,
        hash: HASH_ALGORITHM,
      },
      keyMaterial,
      256,
    ),
    { name: "HMAC", hash: HASH_ALGORITHM },
    false,
    ["sign"],
  );
}

export async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("nutriai-local-auth"),
  );

  return {
    hash: toBase64(new Uint8Array(signature)),
    salt: toBase64(salt),
  };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const key = await deriveKey(password, fromBase64(salt));
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("nutriai-local-auth"),
  );

  return toBase64(new Uint8Array(signature)) === hash;
}
