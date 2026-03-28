import { getAuthenticatedSession } from '../../_lib/auth.js'
import { error, json, readJson } from '../../_lib/response.js'

const VALID_STATUSES = new Set(['fresh', 'taking-shape', 'ready'])

function serializeIdea(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function onRequestPut(context) {
  const { request, env, params } = context
  const session = await getAuthenticatedSession(request, env)

  if (!session) {
    return error('Please sign in again.', 401)
  }

  const body = await readJson(request)
  const status = VALID_STATUSES.has(body.status) ? body.status : null

  if (!status) {
    return error('Choose one of the available stages.')
  }

  await env.DB.prepare(
    `UPDATE ideas
     SET status = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
  )
    .bind(status, params.id, session.user.id)
    .run()

  const updatedIdea = await env.DB.prepare(
    `SELECT id, title, summary, category, status, created_at, updated_at
     FROM ideas
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
  )
    .bind(params.id, session.user.id)
    .first()

  if (!updatedIdea) {
    return error('That saved idea could not be found.', 404)
  }

  return json({ idea: serializeIdea(updatedIdea) })
}

export async function onRequestDelete(context) {
  const { request, env, params } = context
  const session = await getAuthenticatedSession(request, env)

  if (!session) {
    return error('Please sign in again.', 401)
  }

  const existingIdea = await env.DB.prepare(
    'SELECT id FROM ideas WHERE id = ? AND user_id = ? LIMIT 1',
  )
    .bind(params.id, session.user.id)
    .first()

  if (!existingIdea) {
    return error('That saved idea could not be found.', 404)
  }

  await env.DB.prepare('DELETE FROM ideas WHERE id = ? AND user_id = ?')
    .bind(params.id, session.user.id)
    .run()

  return json({ ok: true })
}
