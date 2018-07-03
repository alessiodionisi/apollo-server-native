import { graphqlNative } from './nativeApollo'

import { ApolloServerBase } from 'apollo-server-core'
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core'
import { GraphQLOptions } from 'apollo-server-core'
import { RenderPageOptions as PlaygroundRenderPageOptions, renderPlaygroundPage } from 'graphql-playground-html'
import http from 'http'

export interface ServerRegistration {
  path?: string
  gui?: boolean | PlaygroundRenderPageOptions
}

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res })
  }

  public createHandler({
    path,
    gui
  }: ServerRegistration = {}) {
    if (!path) path = '/graphql'

    this.graphqlPath = path

    const guiEnabled =
      !!gui || (gui === undefined && process.env.NODE_ENV !== 'production')
    
    const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
      if (req.url !== path) return

      if (guiEnabled && req.method === 'GET') {
        const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
          endpoint: path,
          subscriptionEndpoint: this.subscriptionsPath,
          version: this.playgroundVersion,
          ...(typeof gui === 'boolean' ? {} : gui),
        }
        const playgroundPage = renderPlaygroundPage(playgroundRenderPageOptions)
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Length', playgroundPage.length)
        res.write(playgroundPage)
        return res.end()
      }

      return graphqlNative(this.createGraphQLServerOptions.bind(this))(
        req,
        res
      )
    }

    return handler
  }
}
