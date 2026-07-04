export default {
  async fetch(request: Request, env: any, _ctx: any): Promise<Response> {
    return env.ASSETS.fetch(request)
  },
}
