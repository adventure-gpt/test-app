export const RP_NAME = 'Studio Pilot'

export function getRequestOrigin(request) {
  return new URL(request.url).origin
}

export function getRpId(request) {
  const hostname = new URL(request.url).hostname

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return 'localhost'
  }

  return hostname
}

export function getExpectedOrigins(request) {
  const origin = getRequestOrigin(request)
  const hostname = new URL(request.url).hostname

  if (hostname === 'localhost') {
    return [origin, 'http://localhost:8788']
  }

  return [origin]
}

export function createPasskeyLabel(index, transports = []) {
  if (transports.includes('internal')) {
    return index === 1 ? 'Main device passkey' : `Device passkey ${index}`
  }

  return index === 1 ? 'Main passkey' : `Saved passkey ${index}`
}
