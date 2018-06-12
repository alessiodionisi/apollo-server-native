import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core'
import * as GraphiQL from 'apollo-server-module-graphiql'
import url from 'url'
import { IncomingMessage, ServerResponse } from 'http'

export interface NativeGraphQLOptionsFunction {
  (req?: IncomingMessage): GraphQLOptions | Promise<GraphQLOptions>
}

export function nativeGraphql(
  options: GraphQLOptions | NativeGraphQLOptionsFunction,
) {
  if (!options) {
    throw new Error('Apollo Server requires options.')
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    )
  }

  const graphqlHandler = async (req: IncomingMessage, res: ServerResponse) => {
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
        query = await JSON.parse(body)
      } catch (err) {
        query = undefined
      }
    } else {
      query = url.parse(req.url, true).query
    }

    try {
      const gqlResponse = await runHttpQuery([req, res], {
        method: req.method,
        options: options,
        query: query,
        request: convertNodeHttpToRequest(req),
      })

      res.setHeader('Content-Type', 'application/json')
      res.write(gqlResponse)
      res.end()
    } catch (error) {
      if ('HttpQueryError' === error.name) {
        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            res.setHeader(header, error.headers[header])
          })
        }
      }

      if (!error.statusCode) {
        error.statusCode = 500
      }

      res.statusCode = error.statusCode
      res.write(error.message)
      res.end()
    }
  }

  return graphqlHandler
}

export interface NativeGraphiQLOptionsFunction {
  (req?: IncomingMessage):
    | GraphiQL.GraphiQLData
    | Promise<GraphiQL.GraphiQLData>
}

export function nativeGraphiql(
  options: GraphiQL.GraphiQLData | NativeGraphiQLOptionsFunction,
) {
  const graphiqlHandler = (req: IncomingMessage, res: ServerResponse) => {
    const query = (req.url && url.parse(req.url, true).query) || {}
    return GraphiQL.resolveGraphiQLString(query, options, req).then(
      graphiqlString => {
        res.setHeader('Content-Type', 'text/html')
        res.write(graphiqlString)
        res.end()
      },
      error => {
        res.statusCode = 500
        res.write(error.message)
        res.end()
      },
    )
  }

  return graphiqlHandler
}
