import { URL } from 'url'
import http from 'http'
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core'
import { Headers, Request } from 'apollo-server-env'

export interface HttpGraphQLOptionsFunction {
  (req: http.IncomingMessage, res: http.ServerResponse):
    | GraphQLOptions
    | Promise<GraphQLOptions>
}

const getRequestBody = (req: http.IncomingMessage) =>
  new Promise<string>(resolve => {
    let body: Buffer
    req.on('data', (chunk: Buffer) => {
      if (!body) body = chunk
      else body = Buffer.concat([body, chunk])
    })
    req.on('end', () => {
      resolve(body.toString())
    })
  })

const createQueryRequest = (req: http.IncomingMessage) => {
  const method = req.method
  if (!method) throw new Error('Missing method')

  const url = req.url
  if (!url) throw new Error('Missing url')

  const rHeaders = new Headers()

  for (const [name, value] of Object.entries(req.headers)) {
    if (!value) continue
    if (Array.isArray(value)) {
      value.forEach(v => rHeaders.append(name, v))
    } else {
      rHeaders.append(name, value)
    }
  }

  return new Request(url, {
    headers: rHeaders,
    method,
  })
}

export function graphqlHttp(
  options: GraphQLOptions | HttpGraphQLOptionsFunction
) {
  if (!options) {
    throw new Error('Apollo Server requires options.')
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`
    )
  }

  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const method = req.method
    if (!method) throw new Error('Missing method')

    const url = req.url
    if (!url) throw new Error('Missing url')

    runHttpQuery([req, res], {
      method,
      options: options,
      query:
        req.method === 'POST'
          ? JSON.parse(await getRequestBody(req))
          : new URL(url).searchParams,
      request: createQueryRequest(req),
    }).then(
      ({ graphqlResponse, responseInit }) => {
        if (responseInit.headers) {
          for (const [name, value] of Object.entries(responseInit.headers)) {
            res.setHeader(name, value)
          }
        }

        res.write(graphqlResponse)
        res.end()
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error
        }

        if (error.headers) {
          for (const [name, value] of Object.entries(error.headers)) {
            res.setHeader(name, value)
          }
        }

        res.statusCode = error.statusCode
        res.write(error.message)
        res.end()
      }
    )
  }
}
