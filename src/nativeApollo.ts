import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest
} from 'apollo-server-core'

import url from 'url'
import http from 'http'

export interface NativeGraphQLOptionsFunction {
  (req?: http.IncomingMessage, res?: http.ServerResponse): GraphQLOptions | Promise<GraphQLOptions>
}

export function graphqlNative(
  options: GraphQLOptions | NativeGraphQLOptionsFunction
) {
  if (!options) {
    throw new Error('Apollo Server requires options.')
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    )
  }

  const graphqlHandler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    let query

    if (!req.method) throw new Error('Apollo Server expects req.method')
    if (!req.url) throw new Error('Apollo Server expects req.url')

    if (req.method === 'POST') {
      try {
        const body = await new Promise<string>((resolve) => {
          let rawBody = ''
          req.on('data', chunk => {
            rawBody += chunk
          })
          req.on('end', () => {
            resolve(rawBody)
          })
        })
        query = JSON.parse(body)
      } catch (err) {
        query = undefined
      }
    } else {
      query = url.parse(req.url, true).query
    }

    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: query,
      request: convertNodeHttpToRequest(req)
    }).then(
      ({ graphqlResponse, responseInit }) => {
        const headers = responseInit.headers
        if (headers) {
          Object.keys(headers).forEach(name => {
            res.setHeader(name, headers[name])
          })
        }
        // res.setHeader(
        //   'Content-Length',
        //   graphqlResponse.length
        // )
        res.write(graphqlResponse)
        res.end()
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) throw error

        const errorHeaders = error.headers
        if (errorHeaders) {
          Object.keys(errorHeaders).forEach(name => {
            res.setHeader(name, errorHeaders[name])
          })
        }

        res.statusCode = error.statusCode
        res.write(error.message)
        res.end()
      }
    )
  }

  return graphqlHandler
}
