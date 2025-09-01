import { API_URL } from '@/constants/api'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export default async function handler(req: Request) {
  try {
    const splitter = '/api/widget/skip/'

    const [...args] = req.url!.split(splitter).pop()!.split('/')
    const uri = [API_URL, ...args].join('/')
    const headers = new Headers()
    if (process.env.WIDGET_SKIP_API_KEY) {
      headers.set('authorization', process.env.WIDGET_SKIP_API_KEY)
    }
    return fetch(uri, {
      body: req.body,
      method: req.method,
      headers,
    })
  } catch (error) {
    const data = JSON.stringify({ error })
    return new Response(data, { status: 500 })
  }
}
