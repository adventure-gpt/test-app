import { getAuthenticatedSession } from '../../_lib/auth.js'
import { generateRecoveryKeySet } from '../../_lib/crypto.js'
import { replaceRecoveryKeys } from '../../_lib/db.js'
import { error, json } from '../../_lib/response.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const session = await getAuthenticatedSession(request, env)

  if (!session) {
    return error('Please sign in again.', 401)
  }

  const recoveryKeySet = await generateRecoveryKeySet()
  await replaceRecoveryKeys(env.DB, session.user.id, recoveryKeySet.records)

  return json({ recoveryKeys: recoveryKeySet.keys })
}
