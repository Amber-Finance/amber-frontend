/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next'
import { URLSearchParams } from 'url'

export const config = {
  api: {
    bodyParser: false,
  },
}

const mapTargetUrl = (path: string) => {
  if (path.startsWith('httpapi')) {
    return `https://api2.amplitude.com/${path}`
  }
  if (path.startsWith('config')) {
    return `https://sr-client-cfg.amplitude.com/${path}`
  }
  if (path.startsWith('upload')) {
    return `https://api-sr.amplitude.com/sessions/v2/track`
  }
  return null
}

const getRawBody = (req: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []

    // Handle case where there's no body
    if (req.headers['content-length'] === '0' || !req.headers['content-length']) {
      resolve(Buffer.alloc(0))
      return
    }

    req.on('data', (chunk) => {
      if (chunk) {
        chunks.push(chunk)
      }
    })

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', (error) => {
      reject(error)
    })
  })
}

const processHttpApiBody = (rawBody: Buffer): { body: Buffer; headers: Record<string, string> } => {
  const json = JSON.parse(rawBody.toString())

  if (!json.api_key || !Array.isArray(json.events)) {
    throw new Error('Missing api_key or events[]')
  }

  json.events.forEach((event: any) => {
    if (event.ip === '$remote') delete event.ip
  })

  const form = new URLSearchParams()
  form.set('api_key', json.api_key)
  form.set('event', JSON.stringify(json.events))
  if (json.user_id) form.set('user_id', json.user_id)
  if (json.user_properties) form.set('user_properties', JSON.stringify(json.user_properties))

  const body = Buffer.from(form.toString())
  return {
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': body.byteLength.toString(),
    },
  }
}

const processRequestBody = (
  path: string,
  rawBody: Buffer | undefined,
): { body: Buffer | undefined; headers: Record<string, string> } => {
  const headers: Record<string, string> = {}

  if (path.startsWith('httpapi') && rawBody) {
    const result = processHttpApiBody(rawBody)
    return { body: result.body, headers: result.headers }
  } else if (path.startsWith('upload') && rawBody) {
    headers['Content-Type'] = 'application/octet-stream'
    headers['Content-Length'] = rawBody.byteLength.toString()
    return { body: rawBody, headers }
  } else if (path.startsWith('config')) {
    return { body: undefined, headers }
  }

  return { body: rawBody, headers }
}

const buildHeaders = (
  req: NextApiRequest,
  additionalHeaders: Record<string, string>,
): Record<string, string> => {
  const headers = { ...additionalHeaders }

  for (const [key, value] of Object.entries(req.headers)) {
    if (['host', 'content-length'].includes(key.toLowerCase())) continue
    headers[key] = value as string
  }

  return headers
}

const buildTargetUrl = (target: string, req: NextApiRequest): URL => {
  const targetUrl = new URL(target)

  if (req.url) {
    try {
      const originalUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
      for (const [key, value] of originalUrl.searchParams.entries()) {
        targetUrl.searchParams.append(key, value)
      }
    } catch (urlError) {
      console.error('Error parsing URL:', urlError)
    }
  }

  return targetUrl
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pathArray = (req.query.path || []) as string[]
    const path = pathArray.join('/')
    const target = mapTargetUrl(path)

    if (!target) {
      console.error('Unsupported path:', path)
      res.status(400).json({ error: 'Unsupported Amplitude proxy path' })
      return
    }

    const method = req.method || 'GET'
    const isPost = method === 'POST'

    let rawBody: Buffer | undefined
    if (isPost) {
      try {
        rawBody = await getRawBody(req)
      } catch (bodyError) {
        console.error('Error reading body:', bodyError)
        res.status(400).json({ error: 'Failed to read request body' })
        return
      }
    }

    try {
      const { body, headers: bodyHeaders } = processRequestBody(path, rawBody)
      const headers = buildHeaders(req, bodyHeaders)
      const targetUrl = buildTargetUrl(target, req)

      const response = await fetch(targetUrl.toString(), {
        method,
        headers,
        body: body ? body.toString() : undefined,
      })

      const responseBuffer = await response.arrayBuffer()
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.status(response.status).send(Buffer.from(responseBuffer))
    } catch (processError: any) {
      console.error('Error processing request:', processError)
      res.status(400).json({ error: processError.message || 'Failed to process request' })
    }
  } catch (err: any) {
    console.error('Amplitude proxy error:', err)
    res.status(502).json({ error: 'Failed to proxy Amplitude request', details: err.message })
  }
}
