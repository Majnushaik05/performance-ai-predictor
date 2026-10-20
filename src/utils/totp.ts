/**
 * RFC 6238 TOTP implementation using Web Crypto API.
 * Compatible with Angel One SmartAPI TOTP authentication.
 */

// Base32 alphabet decoding
function base32Decode(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const idx = alphabet.indexOf(cleanBase32[i]);
    if (idx === -1) {
      throw new Error(`Invalid base32 character: ${cleanBase32[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

export async function generateTOTP(secret: string, timeStep = 30): Promise<string> {
  if (!secret || secret.trim() === '') {
    throw new Error('TOTP secret string is required');
  }

  const cleanSecret = secret.trim();
  const keyBytes = base32Decode(cleanSecret);

  // Current counter step
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);

  // 8-byte big-endian counter buffer
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, 0, false);
  view.setUint32(4, counter, false);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
  const hashBytes = new Uint8Array(signature);

  // Dynamic truncation
  const offset = hashBytes[hashBytes.length - 1] & 0xf;
  const binary =
    ((hashBytes[offset] & 0x7f) << 24) |
    ((hashBytes[offset + 1] & 0xff) << 16) |
    ((hashBytes[offset + 2] & 0xff) << 8) |
    (hashBytes[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}
