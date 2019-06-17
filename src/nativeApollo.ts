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

function getRequestBody(req: http.IncomingMessage) {
  return new Promise<string>(resolve => {
    let body: Buffer
    req.on('data', (chunk: Buffer) => {
      if (!body) body = chunk
      else body = Buffer.concat([body, chunk])
    })
    req.on('end', () => {
      resolve(body.toString())
    })
  })
}

function createApolloRequest(req: http.IncomingMessage) {
  if (!req.method || !req.url) {
    throw new Error('Invalid request, missing method or url')
  }

  const rHeaders = new Headers()

  for (const [name, value] of Object.entries(req.headers)) {
    if (!value) continue
    if (Array.isArray(value)) {
      value.forEach(v => rHeaders.append(name, v))
    } else {
      rHeaders.append(name, value)
    }
  }

  return new Request(req.url, {
    headers: rHeaders,
    method: req.method,
  })
}

export function graphqlNative(
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
    if (!req.method || !req.url) {
      throw new Error('Invalid request, missing method or url')
    }

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
        method: req.method,
        options,
        query:
          req.method === 'POST'
            ? JSON.parse(await getRequestBody(req))
            : new URL(req.url).searchParams,
        request: createApolloRequest(req),
      })

      if (responseInit.headers) {
        for (const [name, value] of Object.entries(responseInit.headers)) {
          res.setHeader(name, value)
        }
      }

      res.write(graphqlResponse)
      res.end()
    } catch (err) {
      const error = err as HttpQueryError

      if ('HttpQueryError' !== error.name) {
        throw error
      }

      if (error.headers) {
        for (const [name, value] of Object.entries<string>(error.headers)) {
          res.setHeader(name, value)
        }
      }

      res.statusCode = error.statusCode
      res.write(error.message)
      res.end()
    }
  }
}
