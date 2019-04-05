import { URL } from 'url'
import http2 from 'http2'
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core'
import { Headers, Request } from 'apollo-server-env'

export interface Http2GraphQLOptionsFunction {
  (stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders):
    | GraphQLOptions
    | Promise<GraphQLOptions>
}

const getStreamBody = (stream: http2.ServerHttp2Stream) =>
  new Promise<string>(resolve => {
    let body: Buffer
    stream.on('data', (chunk: Buffer) => {
      if (!body) body = chunk
      else body = Buffer.concat([body, chunk])
    })
    stream.on('end', () => {
      resolve(body.toString())
    })
  })

const createQueryRequest = (headers: http2.IncomingHttpHeaders) => {
  const method = headers[':method']
  if (!method) throw new Error('Missing method')

  const path = headers[':path']
  if (!path) throw new Error('Missing path')

  const rHeaders = new Headers()

  for (const [name, value] of Object.entries(headers)) {
    if (!value) continue
    if (name.startsWith(':')) continue
    if (Array.isArray(value)) {
      value.forEach(v => rHeaders.append(name, v))
    } else {
      rHeaders.append(name, value)
    }
  }

  return new Request(path, {
    headers: rHeaders,
    method,
  })
}

export function graphqlHttp2(
  options: GraphQLOptions | Http2GraphQLOptionsFunction
) {
  if (!options) {
    throw new Error('Apollo Server requires options.')
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`
    )
  }

  return async (
    stream: http2.ServerHttp2Stream,
    headers: http2.IncomingHttpHeaders
  ) => {
    const method = headers[':method']
    if (!method) throw new Error('Missing method')

    const path = headers[':path']
    if (!path) throw new Error('Missing path')

    runHttpQuery([stream, headers], {
      method,
      options: options,
      query:
        method === 'POST'
          ? JSON.parse(await getStreamBody(stream))
          : new URL(path).searchParams,
      request: createQueryRequest(headers),
    }).then(
      ({ graphqlResponse, responseInit }) => {
        if (responseInit.headers) {
          stream.respond(responseInit.headers)
        }

        stream.end(graphqlResponse)
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error
        }

        stream.respond({
          ...error.headers,
          ':status': error.statusCode,
        })

        stream.end(error.message)
      }
    )
  }
}
