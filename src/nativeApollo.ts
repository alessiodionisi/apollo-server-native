import url from 'url'
import http from 'http'
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest
} from 'apollo-server-core'

const getBody = (req: http.IncomingMessage) => {
  return new Promise<string>((resolve) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })
    req.on('end', () => {
      resolve(body)
    })
  })
}

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

    // get query
    if (req.method === 'POST') {
      try {
        query = JSON.parse(await getBody(req))
      } catch {
        query = undefined
      }
    } else {
      query = url.parse(req.url, true).query
    }

    // run query
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
        res.write(graphqlResponse)
        res.end()
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error
        }

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
