/**
 * Server-side Web Push sending for KeepDearly (Phase 4B).
 *
 * Everything here runs only on the server: this module is `*.server.ts` and
 * reads no client code. It implements the two standards the push services
 * require, on top of the Web Crypto API alone — no new dependency is added:
 *
 *  - VAPID (RFC 8292): an ES256 JWT identifying this application server,
 *    signed with `VAPID_PRIVATE_KEY`.
 *  - Message encryption (RFC 8291 + RFC 8188, "aes128gcm"): an ephemeral
 *    ECDH P-256 key agreement with the subscription's `p256dh` key, HKDF
 *    combining with the subscription's `auth` secret, then AES-128-GCM.
 *
 * The crypto core (`sealAes128gcm`) is a pure function of explicit inputs so
 * it can be checked byte-for-byte against the RFC 8291 Appendix A test
 * vector. The VAPID signer likewise produces a JWT any ES256 verifier can
 * check. Nothing here ever logs a secret.
 *
 * This module has no runtime imports, so it stays runnable in any server
 * runtime that provides Web Crypto and `fetch` (Node 18+, Workers, Deno).
 */

/** A Web Push destination: exactly the three fields stored per subscription. */
export type PushTarget = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * `Uint8Array` backed by a plain `ArrayBuffer` — what Web Crypto's
 * `BufferSource` accepts under TypeScript 5.7+'s typed-array generics.
 * Everything here is constructed from `new Uint8Array(...)`, TextEncoder or
 * Web Crypto, so this is the honest type for all of it.
 */
type Bytes = Uint8Array<ArrayBuffer>;

/** The VAPID keypair halves, both base64url encoded. */
export type VapidKeys = {
  /** base64url, 65-byte uncompressed P-256 point (the `k` parameter). */
  publicKey: string;
  /** base64url, 32-byte P-256 private scalar. Never logged, never bundled. */
  privateKey: string;
};

/**
 * What the service worker renders on delivery. `title` mirrors the reminder
 * card (the person's name, or the app's own fallback), `body` is the memory
 * text, and `url` is an in-app path the notification click opens.
 */
export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

/**
 * How a send ended. Only `delivered` may mark a reminder as notified;
 * `expired` also tells the caller to drop the dead subscription, while
 * `transient` and `rejected` must leave the reminder for a later pass.
 */
export type PushSendOutcome = "delivered" | "expired" | "transient" | "rejected";

/** The single record size we announce, matching the RFC 8291 example. */
const RECORD_SIZE = 4096;

/** RFC 8030: how long the push service keeps retrying an undeliverable message. */
const PUSH_TTL_SECONDS = 60 * 60 * 24; // one day: a nudge older than that is stale.

/** RFC 8292 limits `exp` to 24h; 12h is the conventional choice. */
const VAPID_EXPIRY_SECONDS = 12 * 60 * 60;

/** Per-request budget so one hung push service cannot stall the whole pass. */
const PUSH_REQUEST_TIMEOUT_MS = 15_000;

const encoder = new TextEncoder();

// --------------------------------------------------------------------------
// base64url (RFC 4648 §5) — btoa/atob exist in Node, Workers and browsers.
// --------------------------------------------------------------------------

function base64UrlDecode(value: string): Bytes {
  const unurl = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = unurl + "=".repeat((4 - (unurl.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Checks a VAPID keypair decodes to the shapes P-256 expects.
 * Returns a human-readable problem, or null when both halves are usable.
 * The message names the variable but never contains the key itself.
 */
export function validateVapidKeys(keys: VapidKeys): string | null {
  try {
    if (base64UrlDecode(keys.publicKey).length !== 65) {
      return "VITE_VAPID_PUBLIC_KEY is not a 65-byte P-256 public key.";
    }
    if (base64UrlDecode(keys.privateKey).length !== 32) {
      return "VAPID_PRIVATE_KEY is not a 32-byte P-256 private key.";
    }
  } catch {
    return "The VAPID keys are not valid base64url.";
  }
  return null;
}

// --------------------------------------------------------------------------
// Byte helpers
// --------------------------------------------------------------------------

function concatBytes(...parts: Bytes[]): Bytes {
  let total = 0;
  for (const part of parts) total += part.length;
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}

function uint32Be(value: number): Bytes {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

async function hmacSha256(key: Bytes, data: Bytes): Promise<Bytes> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
}

// --------------------------------------------------------------------------
// RFC 8291 message encryption (aes128gcm content coding, RFC 8188 framing)
// --------------------------------------------------------------------------

/** An ephemeral application-server ECDH keypair for one message. */
export type EphemeralKeyPair = {
  /** PKCS#8 DER encoding of the private key, importable by Web Crypto. */
  privatePkcs8: Bytes;
  /** 65-byte uncompressed point; this is what goes into the header keyid. */
  publicRaw: Bytes;
};

/** Fresh P-256 keypair for a single push message (RFC 8291 §3.1). */
export async function generateEphemeralKeyPair(): Promise<EphemeralKeyPair> {
  const pair = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  return {
    privatePkcs8: new Uint8Array(await crypto.subtle.exportKey("pkcs8", pair.privateKey)),
    publicRaw: new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey)),
  };
}

export type SealParams = {
  /** The UTF-8 JSON notification payload, before the record delimiter. */
  plaintext: Bytes;
  /** Subscription key: `p256dh`, 65-byte uncompressed point. */
  uaPublic: Bytes;
  /** Subscription secret: `auth`, 16 octets. */
  authSecret: Bytes;
  /** 16 random octets; injected in tests, random in production. */
  salt: Bytes;
  /** The message's ephemeral keypair; injected in tests, fresh in production. */
  ephemeral: EphemeralKeyPair;
};

/**
 * Encrypts one push message body exactly per RFC 8291 §3.4 + RFC 8188:
 *
 *   PRK_key = HMAC-SHA-256(auth_secret, ecdh_secret)
 *   key_info = "WebPush: info" || 0x00 || ua_public || as_public
 *   IKM     = HMAC-SHA-256(PRK_key, key_info || 0x01)          (L = 32)
 *   PRK     = HMAC-SHA-256(salt, IKM)
 *   CEK     = HMAC-SHA-256(PRK, "Content-Encoding: aes128gcm" || 0x00 || 0x01)[0..15]
 *   NONCE   = HMAC-SHA-256(PRK, "Content-Encoding: nonce" || 0x00 || 0x01)[0..11]
 *   body    = salt || rs(4096, 4 bytes BE) || len(keyid) || keyid ||
 *             AES-128-GCM(CEK, NONCE, plaintext || 0x02)
 *
 * Every L above fits in one HMAC block, so each Expand is a single HMAC as
 * shown. Exported (rather than inlined) so the RFC test vector can drive it
 * with fixed inputs.
 */
export async function sealAes128gcm(params: SealParams): Promise<Bytes> {
  const { plaintext, uaPublic, authSecret, salt, ephemeral } = params;
  if (salt.length !== 16) throw new Error(`salt must be 16 bytes, got ${salt.length}.`);
  if (authSecret.length < 16) {
    throw new Error(`auth secret must be at least 16 bytes, got ${authSecret.length}.`);
  }
  if (uaPublic.length !== 65) {
    throw new Error(`subscription public key must be 65 bytes, got ${uaPublic.length}.`);
  }

  // ECDH(ephemeral private, ua public) — RFC 8291 §3.1.
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    ephemeral.privatePkcs8,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits"],
  );
  const userAgentKey = await crypto.subtle.importKey(
    "raw",
    uaPublic,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: userAgentKey }, privateKey, 256),
  );

  // HKDF combining step — RFC 8291 §3.3/§3.4.
  const prkKey = await hmacSha256(authSecret, ecdhSecret);
  const keyInfo = concatBytes(
    encoder.encode("WebPush: info"),
    new Uint8Array([0x00]),
    uaPublic,
    ephemeral.publicRaw,
  );
  const ikm = await hmacSha256(prkKey, concatBytes(keyInfo, new Uint8Array([0x01])));
  const prk = await hmacSha256(salt, ikm);

  const cekInfo = concatBytes(
    encoder.encode("Content-Encoding: aes128gcm"),
    new Uint8Array([0x00]),
  );
  const cekFull = await hmacSha256(prk, concatBytes(cekInfo, new Uint8Array([0x01])));
  const cek = cekFull.slice(0, 16);

  const nonceInfo = concatBytes(encoder.encode("Content-Encoding: nonce"), new Uint8Array([0x00]));
  const nonceFull = await hmacSha256(prk, concatBytes(nonceInfo, new Uint8Array([0x01])));
  const nonce = nonceFull.slice(0, 12);

  // RFC 8188 header: salt || rs || keyid-length || keyid.
  const header = concatBytes(
    salt,
    uint32Be(RECORD_SIZE),
    new Uint8Array([ephemeral.publicRaw.length]),
    ephemeral.publicRaw,
  );

  // Single record; 0x02 marks it as the last (and only) record (RFC 8188 §3).
  const record = concatBytes(plaintext, new Uint8Array([0x02]));
  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, record),
  );

  return concatBytes(header, ciphertext);
}

// --------------------------------------------------------------------------
// VAPID (RFC 8292): ES256 JWT in the Authorization header
// --------------------------------------------------------------------------

/**
 * DER/PKCS#8 wrapper for a raw 32-byte P-256 private scalar.
 *
 * Web Crypto will not import a bare scalar (that is how `.env.local` stores
 * the VAPID key), but it will import this fixed structure: PKCS#8 wrapping
 * the RFC 5915 ECPrivateKey. Only the 32 key bytes are variable.
 */
function p256PrivateKeyToPkcs8(privateScalar: Bytes): Bytes {
  if (privateScalar.length !== 32) {
    throw new Error(`P-256 private scalar must be 32 bytes, got ${privateScalar.length}.`);
  }
  const prefix = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01,
    0x01, 0x04, 0x20,
  ]);
  return concatBytes(prefix, privateScalar);
}

async function signEs256(signingInput: string, privateScalar: Bytes): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    p256PrivateKeyToPkcs8(privateScalar),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, encoder.encode(signingInput)),
  );
  // Web Crypto emits IEEE P1363 (r || s, 64 bytes) — exactly what JWS wants.
  // Anything else is a runtime that broke the Web Crypto spec, and we would
  // rather fail loudly than emit a JWT no push service accepts.
  if (signature.length !== 64) {
    throw new Error(
      `Unexpected ES256 signature length ${signature.length}; expected 64 (IEEE P1363).`,
    );
  }
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

/**
 * Signs the VAPID JWT: header {typ: JWT, alg: ES256} and claims
 * {aud: push service origin, exp: now + 12h, sub: contact URI}.
 *
 * `nowMs` exists only so tests can pin `exp`.
 */
export async function signVapidJwt(
  keys: VapidKeys,
  audience: string,
  subject: string,
  nowMs: number = Date.now(),
): Promise<string> {
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = {
    aud: audience,
    exp: Math.floor(nowMs / 1000) + VAPID_EXPIRY_SECONDS,
    sub: subject,
  };
  const signingInput = `${header}.${base64UrlEncode(encoder.encode(JSON.stringify(claims)))}`;
  return signEs256(signingInput, base64UrlDecode(keys.privateKey));
}

// --------------------------------------------------------------------------
// Sending
// --------------------------------------------------------------------------

/**
 * Encrypts `payload` for `target` and POSTs it to the subscription endpoint.
 *
 * Outcomes map from the push service's answer:
 *  - 2xx                 -> "delivered"  (RFC 8030 returns 201 Created)
 *  - 404 / 410           -> "expired"    (endpoint is gone; caller drops the row)
 *  - 429 / 5xx / network -> "transient"  (retry on a later pass)
 *  - anything else       -> "rejected"   (logged with the service's reason;
 *                                         not delivered, endpoint kept)
 */
export async function sendWebPush(
  target: PushTarget,
  payload: PushPayload,
  keys: VapidKeys,
  subject: string,
): Promise<PushSendOutcome> {
  const sealed = await sealAes128gcm({
    plaintext: encoder.encode(JSON.stringify(payload)),
    uaPublic: base64UrlDecode(target.p256dh),
    authSecret: base64UrlDecode(target.auth),
    salt: crypto.getRandomValues(new Uint8Array(16)),
    ephemeral: await generateEphemeralKeyPair(),
  });

  const audience = new URL(target.endpoint).origin;
  const jwt = await signVapidJwt(keys, audience, subject);

  let response: Response;
  try {
    response = await fetch(target.endpoint, {
      method: "POST",
      headers: {
        // RFC 8292: proof-of-possession JWT plus the public key it was signed with.
        Authorization: `vapid t=${jwt}, k=${keys.publicKey}`,
        "Content-Type": "application/octet-stream",
        // What we produced above; services decrypt with the subscription keys.
        "Content-Encoding": "aes128gcm",
        TTL: String(PUSH_TTL_SECONDS),
      },
      body: sealed,
      signal: AbortSignal.timeout(PUSH_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("Web Push request failed before any response:", error);
    return "transient";
  }

  if (response.ok) return "delivered";

  if (response.status === 404 || response.status === 410) return "expired";
  if (response.status === 429 || response.status >= 500) return "transient";

  // 400/401/403 etc: surface the service's own reason. Push services echo
  // only their error text here, never anything of ours worth hiding.
  const detail = await response.text().catch(() => "");
  console.error(`Web Push rejected the message (HTTP ${response.status}): ${detail.slice(0, 300)}`);
  return "rejected";
}
