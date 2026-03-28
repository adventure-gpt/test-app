import { generateRegistrationOptions } from '@simplewebauthn/server'

import { createId } from '../../_lib/crypto.js'
import {
  cleanupExpiredRecords,
  getPasskeyDescriptorsForUser,
  getUserByEmail,
  isValidEmail,
  normalizeEmail,
  storeChallenge,
} from '../../_lib/db.js'
import { getAuthenticatedSession } from '../../_lib/auth.js'
import { error, json, readJson } from '../../_lib/response.js'
import { getRpId, RP_NAME } from '../../_lib/webauthn.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await readJson(request)
  const mode = body.mode === 'add' ? 'add' : 'register'

  await cleanupExpiredRecords(env.DB)

  let userId
  let email

  if (mode === 'add') {
    const session = await getAuthenticatedSession(request, env)

    if (!session) {
      return error('Please sign in again.', 401)
    }

    userId = session.user.id
    email = session.user.email
  } else {
    email = normalizeEmail(body.email)

    if (!isValidEmail(email)) {
      return error('Enter a valid email address.')
    }

    const existingUser = await getUserByEmail(env.DB, email)

    if (existingUser) {
      return error('That email already has an account. Try signing in instead.', 409)
    }

    userId = createId()
  }

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: getRpId(request),
    userName: email,
    userID: new TextEncoder().encode(userId),
    userDisplayName: email.split('@')[0],
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: await getPasskeyDescriptorsForUser(env.DB, userId),
    authenticatorSelection: {
      residentKey: 'required',
      requireResidentKey: true,
      userVerification: 'preferred',
    },
  })

  await storeChallenge(env.DB, {
    id: createId(),
    kind: mode === 'add' ? 'add-passkey' : 'register',
    challenge: options.challenge,
    userId,
    email,
  })

  return json({ options })
}
