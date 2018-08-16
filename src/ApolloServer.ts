import http from 'http'

import {
  GraphQLOptions,
  ApolloServerBase
} from 'apollo-server-core'
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions
} from '@apollographql/graphql-playground-html'

import { graphqlNative } from './nativeApollo'

export interface ServerRegistration {
  path?: string
}

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res })
  }

  protected supportsSubscriptions(): boolean {
    return true
  }

  public createHandler({
    path
  }: ServerRegistration = {}) {
    if (!path) path = '/graphql'

    this.graphqlPath = path

    const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
      if (req.url !== path) return

      if (this.playgroundOptions && req.method === 'GET') {
        const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
          endpoint: path,
          subscriptionEndpoint: this.subscriptionsPath,
          ...this.playgroundOptions
        }
        res.setHeader('Content-Type', 'text/html')
        const playground = renderPlaygroundPage(playgroundRenderPageOptions)
        res.write(playground)
        res.end()
        return
      }

      return graphqlNative(this.createGraphQLServerOptions.bind(this))(
        req,
        res
      )
    }

    return handler
  }
}
