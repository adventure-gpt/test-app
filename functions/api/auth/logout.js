import { clearSessionCookie, deleteSession, getSessionToken } from '../../_lib/auth.js'
import { json } from '../../_lib/response.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const token = getSessionToken(request)

  if (token) {
    await deleteSession(env.DB, token)
  }

  return json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(request),
      },
    },
  )
}
