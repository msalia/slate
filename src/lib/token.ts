const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generatePublishToken(length = 5): string {
  let token = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    token += chars[byte % chars.length];
  }
  return token;
}
