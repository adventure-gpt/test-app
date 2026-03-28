export function json(data, init = {}) {
  const responseInit =
    typeof init === 'number'
      ? { status: init }
      : {
          status: init.status ?? 200,
          headers: init.headers,
        }

  const headers = new Headers(responseInit.headers)
  headers.set('content-type', 'application/json; charset=utf-8')

  return new Response(JSON.stringify(data), {
    status: responseInit.status,
    headers,
  })
}

export function error(message, status = 400, extras = {}) {
  return json({ error: message, ...extras }, { status })
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}
