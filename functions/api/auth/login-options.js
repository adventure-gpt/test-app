import { generateAuthenticationOptions } from '@simplewebauthn/server'

import { createId } from '../../_lib/crypto.js'
import { cleanupExpiredRecords, storeChallenge } from '../../_lib/db.js'
import { json } from '../../_lib/response.js'
import { getRpId } from '../../_lib/webauthn.js'

export async function onRequestPost(context) {
  const { request, env } = context

  await cleanupExpiredRecords(env.DB)

  const options = await generateAuthenticationOptions({
    rpID: getRpId(request),
    userVerification: 'preferred',
    timeout: 60000,
  })

  await storeChallenge(env.DB, {
    id: createId(),
    kind: 'login',
    challenge: options.challenge,
  })

  return json({ options })
}
