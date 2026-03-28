import { getAuthenticatedSession } from '../../_lib/auth.js'
import { listPasskeysForUser } from '../../_lib/db.js'
import { error, json } from '../../_lib/response.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const session = await getAuthenticatedSession(request, env)

  if (!session) {
    return error('Please sign in to continue.', 401)
  }

  return json({
    user: session.user,
    passkeys: await listPasskeysForUser(env.DB, session.user.id),
  })
}
