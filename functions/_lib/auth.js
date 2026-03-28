import { generateToken } from './crypto.js'
import { getUserFromSession } from './db.js'

export const SESSION_COOKIE_NAME = 'studio_pilot_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((allCookies, cookie) => {
      const separatorIndex = cookie.indexOf('=')

      if (separatorIndex === -1) {
        return allCookies
      }

      const name = cookie.slice(0, separatorIndex)
      const value = cookie.slice(separatorIndex + 1)
      allCookies[name] = decodeURIComponent(value)
      return allCookies
    }, {})
}

function shouldUseSecureCookie(request) {
  return new URL(request.url).protocol === 'https:'
}

export function getSessionToken(request) {
  const cookies = parseCookies(request.headers.get('cookie') || '')
  return cookies[SESSION_COOKIE_NAME] || null
}

export function buildSessionCookie(token, request, expiresAt) {
  const secureAttribute = shouldUseSecureCookie(request) ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(
    expiresAt,
  ).toUTCString()}${secureAttribute}`
}

export function clearSessionCookie(request) {
  const secureAttribute = shouldUseSecureCookie(request) ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttribute}`
}

export async function createSession(db, userId, request) {
  const token = generateToken(32)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()

  await db
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expiresAt)
    .run()

  return {
    token,
    expiresAt,
    cookie: buildSessionCookie(token, request, expiresAt),
  }
}

export async function deleteSession(db, token) {
  if (!token) {
    return
  }

  await db
    .prepare('DELETE FROM sessions WHERE token = ?')
    .bind(token)
    .run()
}

export async function getAuthenticatedSession(request, env) {
  const token = getSessionToken(request)

  if (!token) {
    return null
  }

  const user = await getUserFromSession(env.DB, token)

  if (!user) {
    return null
  }

  return { user, token }
}
