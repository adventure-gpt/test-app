import { createSession } from '../../_lib/auth.js'
import { cleanupExpiredRecords, getPasskeyCountForUser, getUserByEmail, normalizeEmail } from '../../_lib/db.js'
import { error, json, readJson } from '../../_lib/response.js'
import { sha256Hex } from '../../_lib/crypto.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await readJson(request)
  const email = normalizeEmail(body.email)
  const recoveryKey = typeof body.recoveryKey === 'string' ? body.recoveryKey.trim().toUpperCase() : ''

  if (!email || !recoveryKey) {
    return error('Enter your email and one recovery key.')
  }

  await cleanupExpiredRecords(env.DB)

  const user = await getUserByEmail(env.DB, email)

  if (!user) {
    return error('That email or recovery key did not match.', 401)
  }

  const keyHash = await sha256Hex(recoveryKey)
  const recoveryRecord = await env.DB.prepare(
    `SELECT id
     FROM recovery_keys
     WHERE user_id = ? AND key_hash = ? AND used = 0
     LIMIT 1`,
  )
    .bind(user.id, keyHash)
    .first()

  if (!recoveryRecord) {
    return error('That email or recovery key did not match.', 401)
  }

  await env.DB.prepare('UPDATE recovery_keys SET used = 1 WHERE id = ?')
    .bind(recoveryRecord.id)
    .run()

  const session = await createSession(env.DB, user.id, request)
  const remainingRow = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM recovery_keys WHERE user_id = ? AND used = 0',
  )
    .bind(user.id)
    .first()

  return json(
    {
      user,
      promptAddPasskey: true,
      remainingRecoveryKeys: Number(remainingRow?.count || 0),
      passkeyCount: await getPasskeyCountForUser(env.DB, user.id),
    },
    {
      headers: {
        'Set-Cookie': session.cookie,
      },
    },
  )
}
