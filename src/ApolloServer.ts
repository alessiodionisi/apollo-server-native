import http from 'http'
import https from 'https'
import http2 from 'http2'
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
  server: http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer
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

  public applyMiddleware({
    server,
    path
  }: ServerRegistration) {
    this.graphqlPath = path || '/graphql'

    server.on('request', (req, res) => {
      if (this.graphqlPath !== req.url) return

      if (this.playgroundOptions && req.method === 'GET') {
        const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
          endpoint: this.graphqlPath,
          subscriptionEndpoint: this.subscriptionsPath,
          ...this.playgroundOptions
        }
        res.setHeader('content-type', 'text/html')
        const playground = renderPlaygroundPage(playgroundRenderPageOptions)
        res.write(playground)
        res.end()
        return
      }

      graphqlNative(this.createGraphQLServerOptions.bind(this))(req, res)
      return
    })

    // const handler = (req: http.IncomingMessage, res: http.ServerResponse) => {
    //   const graphql = this.createGraphQLServerOptions.bind(this)
    //   if (req.url !== this.graphqlPath) return

    //   if (this.playgroundOptions && req.method === 'GET') {
    //     const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
    //       endpoint: this.graphqlPath,
    //       subscriptionEndpoint: this.subscriptionsPath,
    //       ...this.playgroundOptions
    //     }
    //     res.setHeader('content-type', 'text/html')
    //     const playground = renderPlaygroundPage(playgroundRenderPageOptions)
    //     res.write(playground)
    //     res.end()
    //     return
    //   }

    //   return graphqlNative(graphql)(req, res)
    // }

    // return handler
  }
}
