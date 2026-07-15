const DEPLOY_ID = 'v8'

export default {
  async fetch(request: Request, env: any, _ctx: any): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/' || url.pathname === '/index.html') {
      try {
        const cache = caches.default
        await cache.delete(request)
      } catch { }

      const response = await env.ASSETS.fetch(request)
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'no-store, private')
      headers.set('X-Deploy-ID', DEPLOY_ID)
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    return env.ASSETS.fetch(request)
  },
}
