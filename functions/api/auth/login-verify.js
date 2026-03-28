import { verifyAuthenticationResponse } from '@simplewebauthn/server'

import { base64urlToBytes } from '../../_lib/crypto.js'
import {
  cleanupExpiredRecords,
  deleteChallenge,
  getChallenge,
  getPasskeyByCredentialId,
  getUserById,
} from '../../_lib/db.js'
import { createSession } from '../../_lib/auth.js'
import { error, json, readJson } from '../../_lib/response.js'
import { getExpectedOrigins, getRpId } from '../../_lib/webauthn.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await readJson(request)

  if (!body.response?.id) {
    return error('Your passkey response was missing. Please try again.')
  }

  await cleanupExpiredRecords(env.DB)

  const challenge = await getChallenge(env.DB, { kind: 'login' })

  if (!challenge) {
    return error('That sign-in step expired. Please try again.', 400)
  }

  const passkey = await getPasskeyByCredentialId(env.DB, body.response.id)

  if (!passkey) {
    await deleteChallenge(env.DB, challenge.id)
    return error('That passkey was not found. Try using a recovery key instead.', 401)
  }

  let verification

  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getExpectedOrigins(request),
      expectedRPID: getRpId(request),
      credential: {
        id: passkey.credential_id,
        publicKey: base64urlToBytes(passkey.public_key),
        counter: passkey.counter,
        transports: passkey.transports ? JSON.parse(passkey.transports) : [],
      },
    })
  } catch {
    await deleteChallenge(env.DB, challenge.id)
    return error('That passkey could not be confirmed. Please try again.', 401)
  }

  await deleteChallenge(env.DB, challenge.id)

  if (!verification.verified) {
    return error('That passkey could not be confirmed. Please try again.', 401)
  }

  await env.DB.prepare(
    `UPDATE passkeys
     SET counter = ?, last_used_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(verification.authenticationInfo.newCounter, passkey.id)
    .run()

  const user = await getUserById(env.DB, passkey.user_id)
  const session = await createSession(env.DB, passkey.user_id, request)
  const headers = new Headers()
  headers.set('Set-Cookie', session.cookie)

  return json({ user }, { headers })
}
