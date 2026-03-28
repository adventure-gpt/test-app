import { createId } from '../../_lib/crypto.js'
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

export async function onRequestGet(context) {
  const { request, env } = context
  const session = await getAuthenticatedSession(request, env)

  if (!session) {
    return error('Please sign in again.', 401)
  }

  const { results = [] } = await env.DB.prepare(
    `SELECT id, title, summary, category, status, created_at, updated_at
     FROM ideas
     WHERE user_id = ?
     ORDER BY datetime(updated_at) DESC, datetime(created_at) DESC`,
  )
    .bind(session.user.id)
    .all()

  return json({ ideas: results.map(serializeIdea) })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const session = await getAuthenticatedSession(request, env)

  if (!session) {
    return error('Please sign in again.', 401)
  }

  const body = await readJson(request)
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const summary = typeof body.summary === 'string' ? body.summary.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const status = VALID_STATUSES.has(body.status) ? body.status : 'fresh'

  if (!title || !summary || !category) {
    return error('Give your idea a title, a short note, and a category.')
  }

  if (title.length > 80 || summary.length > 220 || category.length > 40) {
    return error('Keep your idea a little shorter so it stays easy to scan.')
  }

  const ideaId = createId()

  await env.DB.prepare(
    `INSERT INTO ideas (id, user_id, title, summary, category, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(ideaId, session.user.id, title, summary, category, status)
    .run()

  const idea = await env.DB.prepare(
    `SELECT id, title, summary, category, status, created_at, updated_at
     FROM ideas
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
  )
    .bind(ideaId, session.user.id)
    .first()

  return json({ idea: serializeIdea(idea) }, 201)
}
