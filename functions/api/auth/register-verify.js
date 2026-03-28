import { verifyRegistrationResponse } from '@simplewebauthn/server'

import {
  bytesToBase64url,
  createId,
  generateRecoveryKeySet,
} from '../../_lib/crypto.js'
import {
  cleanupExpiredRecords,
  deleteChallenge,
  getChallenge,
  getPasskeyCountForUser,
  getUserByEmail,
  getUserById,
  listPasskeysForUser,
  normalizeEmail,
  replaceRecoveryKeys,
} from '../../_lib/db.js'
import { createSession, getAuthenticatedSession } from '../../_lib/auth.js'
import { error, json, readJson } from '../../_lib/response.js'
import { createPasskeyLabel, getExpectedOrigins, getRpId } from '../../_lib/webauthn.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await readJson(request)
  const mode = body.mode === 'add' ? 'add' : 'register'

  if (!body.response) {
    return error('Your passkey response was missing. Please try again.')
  }

  await cleanupExpiredRecords(env.DB)

  const session = await getAuthenticatedSession(request, env)
  const email = mode === 'register' ? normalizeEmail(body.email) : session?.user.email
  const challenge = await getChallenge(env.DB, {
    kind: mode === 'add' ? 'add-passkey' : 'register',
    userId: mode === 'add' ? session?.user.id : null,
    email: mode === 'register' ? email : null,
  })

  if (!challenge) {
    return error('That sign-in step expired. Please start again.', 400)
  }

  if (mode === 'add' && !session) {
    return error('Please sign in again.', 401)
  }

  let verification

  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: getExpectedOrigins(request),
      expectedRPID: getRpId(request),
    })
  } catch {
    await deleteChallenge(env.DB, challenge.id)
    return error('That passkey could not be confirmed. Please try again.', 400)
  }

  if (!verification.verified || !verification.registrationInfo) {
    await deleteChallenge(env.DB, challenge.id)
    return error('That passkey could not be confirmed. Please try again.', 400)
  }

  const { registrationInfo } = verification
  const userId = challenge.user_id || session?.user.id

  await deleteChallenge(env.DB, challenge.id)

  let user

  if (mode === 'register') {
    const existingUser = await getUserByEmail(env.DB, email)

    if (existingUser) {
      return error('That email already has an account. Try signing in instead.', 409)
    }

    await env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)')
      .bind(userId, email)
      .run()

    user = await getUserById(env.DB, userId)
  } else {
    user = session.user
  }

  const passkeyIndex = (await getPasskeyCountForUser(env.DB, userId)) + 1
  const transports = registrationInfo.credential.transports || []
  const label = createPasskeyLabel(passkeyIndex, transports)

  try {
    await env.DB.prepare(
      `INSERT INTO passkeys (
        id,
        user_id,
        credential_id,
        public_key,
        counter,
        transports,
        label,
        device_type,
        backed_up,
        last_used_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
      .bind(
        createId(),
        userId,
        registrationInfo.credential.id,
        bytesToBase64url(registrationInfo.credential.publicKey),
        registrationInfo.credential.counter,
        JSON.stringify(transports),
        label,
        registrationInfo.credentialDeviceType,
        registrationInfo.credentialBackedUp ? 1 : 0,
      )
      .run()
  } catch {
    return error('That passkey is already saved. Try signing in instead.', 409)
  }

  const headers = new Headers()
  let recoveryKeys = []

  if (mode === 'register') {
    const recoveryKeySet = await generateRecoveryKeySet()
    recoveryKeys = recoveryKeySet.keys
    await replaceRecoveryKeys(env.DB, userId, recoveryKeySet.records)

    const sessionData = await createSession(env.DB, userId, request)
    headers.set('Set-Cookie', sessionData.cookie)
  }

  return json(
    {
      user,
      recoveryKeys,
      passkeys: await listPasskeysForUser(env.DB, userId),
    },
    { headers },
  )
}
