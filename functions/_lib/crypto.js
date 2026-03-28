const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function createId() {
  return crypto.randomUUID()
}

export function bytesToBase64url(bytes) {
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function base64urlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)

  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function generateToken(size = 32) {
  const bytes = new Uint8Array(size)
  crypto.getRandomValues(bytes)
  return bytesToBase64url(bytes)
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

function generateRecoveryKey() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  return Array.from(bytes, (byte) => RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length]).join('')
}

export async function generateRecoveryKeySet(count = 8) {
  const keys = Array.from({ length: count }, () => generateRecoveryKey())
  const hashes = await Promise.all(keys.map((key) => sha256Hex(key)))

  return {
    keys,
    records: hashes.map((hash) => ({
      id: createId(),
      hash,
    })),
  }
}
