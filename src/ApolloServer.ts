import { GraphQLOptions, ApolloServerBase } from 'apollo-server-core'
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html'
import http from 'http'

import { graphqlNative } from './nativeApollo'

export interface ServerRegistration {
  path?: string
}

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res })
  }

  protected supportsSubscriptions(): boolean {
    return true
  }

  protected supportsUploads(): boolean {
    return false
  }

  public createHandler({ path }: ServerRegistration = {}) {
    this.graphqlPath = path ? path : '/graphql'
    const promiseWillStart = this.willStart()

    return async (req: http.IncomingMessage, res: http.ServerResponse) => {
      await promiseWillStart

      if (this.playgroundOptions && req.method === 'GET') {
        const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
          endpoint: this.graphqlPath,
          subscriptionEndpoint: this.subscriptionsPath,
          ...this.playgroundOptions,
        }

        const playground = renderPlaygroundPage(playgroundRenderPageOptions)

        res.setHeader('content-type', 'text/html')
        res.write(playground)
        res.end()

        return
      }

      graphqlNative(() => this.createGraphQLServerOptions(req, res))(req, res)
    }
  }
}
