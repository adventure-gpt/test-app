function parseTransports(transports) {
  if (!transports) {
    return []
  }

  try {
    return JSON.parse(transports)
  } catch {
    return []
  }
}

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function cleanupExpiredRecords(db) {
  await db.batch([
    db.prepare("DELETE FROM auth_challenges WHERE expires_at <= datetime('now')"),
    db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')"),
  ])
}

export async function getUserByEmail(db, email) {
  return db
    .prepare('SELECT id, email, created_at FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first()
}

export async function getUserById(db, userId) {
  return db
    .prepare('SELECT id, email, created_at FROM users WHERE id = ? LIMIT 1')
    .bind(userId)
    .first()
}

export async function getUserFromSession(db, token) {
  return db
    .prepare(
      `SELECT users.id, users.email, users.created_at
       FROM sessions
       INNER JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at > datetime('now')
       LIMIT 1`,
    )
    .bind(token)
    .first()
}

export async function listPasskeysForUser(db, userId) {
  const { results = [] } = await db
    .prepare(
      `SELECT id, label, transports, device_type, backed_up, created_at, last_used_at
       FROM passkeys
       WHERE user_id = ?
       ORDER BY created_at ASC`,
    )
    .bind(userId)
    .all()

  return results.map((row) => ({
    id: row.id,
    label: row.label || 'Saved passkey',
    transports: parseTransports(row.transports),
    deviceType: row.device_type || 'multiDevice',
    backedUp: Boolean(row.backed_up),
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  }))
}

export async function getPasskeyDescriptorsForUser(db, userId) {
  const { results = [] } = await db
    .prepare(
      'SELECT credential_id, transports FROM passkeys WHERE user_id = ? ORDER BY created_at ASC',
    )
    .bind(userId)
    .all()

  return results.map((row) => ({
    id: row.credential_id,
    transports: parseTransports(row.transports),
  }))
}

export async function getPasskeyCountForUser(db, userId) {
  const row = await db
    .prepare('SELECT COUNT(*) AS count FROM passkeys WHERE user_id = ?')
    .bind(userId)
    .first()

  return Number(row?.count || 0)
}

export async function getPasskeyByCredentialId(db, credentialId) {
  return db
    .prepare(
      `SELECT id, user_id, credential_id, public_key, counter, transports, label
       FROM passkeys
       WHERE credential_id = ?
       LIMIT 1`,
    )
    .bind(credentialId)
    .first()
}

async function clearChallengeScope(db, { kind, userId = null, email = null }) {
  if (userId) {
    await db
      .prepare('DELETE FROM auth_challenges WHERE kind = ? AND user_id = ?')
      .bind(kind, userId)
      .run()
    return
  }

  if (email) {
    await db
      .prepare('DELETE FROM auth_challenges WHERE kind = ? AND email = ?')
      .bind(kind, email)
      .run()
    return
  }

  await db
    .prepare('DELETE FROM auth_challenges WHERE kind = ? AND user_id IS NULL AND email IS NULL')
    .bind(kind)
    .run()
}

export async function storeChallenge(db, { id, kind, challenge, userId = null, email = null }) {
  await clearChallengeScope(db, { kind, userId, email })

  await db
    .prepare(
      `INSERT INTO auth_challenges (id, user_id, email, kind, challenge, expires_at)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+60 seconds'))`,
    )
    .bind(id, userId, email, kind, challenge)
    .run()
}

export async function getChallenge(db, { kind, userId = null, email = null }) {
  if (userId) {
    return db
      .prepare(
        `SELECT id, user_id, email, challenge
         FROM auth_challenges
         WHERE kind = ? AND user_id = ? AND expires_at > datetime('now')
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .bind(kind, userId)
      .first()
  }

  if (email) {
    return db
      .prepare(
        `SELECT id, user_id, email, challenge
         FROM auth_challenges
         WHERE kind = ? AND email = ? AND expires_at > datetime('now')
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .bind(kind, email)
      .first()
  }

  return db
    .prepare(
      `SELECT id, user_id, email, challenge
       FROM auth_challenges
       WHERE kind = ? AND user_id IS NULL AND email IS NULL AND expires_at > datetime('now')
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(kind)
    .first()
}

export async function deleteChallenge(db, challengeId) {
  await db
    .prepare('DELETE FROM auth_challenges WHERE id = ?')
    .bind(challengeId)
    .run()
}

export async function replaceRecoveryKeys(db, userId, records) {
  const statements = [
    db.prepare('DELETE FROM recovery_keys WHERE user_id = ?').bind(userId),
    ...records.map((record) =>
      db
        .prepare('INSERT INTO recovery_keys (id, user_id, key_hash, used) VALUES (?, ?, ?, 0)')
        .bind(record.id, userId, record.hash),
    ),
  ]

  await db.batch(statements)
}
