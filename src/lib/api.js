export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const hasBody = options.body !== undefined
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson
    ? await response.json()
    : response.status === 204
      ? null
      : await response.text()

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || 'Something went wrong.')
  }

  return payload
}
