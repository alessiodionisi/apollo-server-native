import { GraphQLOptions, ApolloServerBase } from 'apollo-server-core'
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions
} from '@apollographql/graphql-playground-html'
import http2 from 'http2'

import { graphqlHttp2 } from './http2Apollo'

export interface Http2ServerRegistration {
  server: http2.Http2SecureServer
  path?: string
}

export class Http2ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    stream: http2.ServerHttp2Stream,
    headers: http2.IncomingHttpHeaders
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ stream, headers })
  }

  protected supportsSubscriptions(): boolean {
    return true
  }

  protected supportsUploads(): boolean {
    return true
  }

  public applyMiddleware({ server, path }: Http2ServerRegistration) {
    if (!path) path = '/graphql'

    // TODO: Health check

    // TODO: Uploads

    this.graphqlPath = path

    server.on(
      'stream',
      (stream: http2.ServerHttp2Stream, headers: http2.IncomingHttpHeaders) => {
        if (headers[':path'] !== path) return

        if (this.playgroundOptions && headers[':method'] === 'GET') {
          const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
            endpoint: path,
            subscriptionEndpoint: this.subscriptionsPath,
            ...this.playgroundOptions
          }
          const playground = renderPlaygroundPage(playgroundRenderPageOptions)
          stream.respond({
            'content-type': 'text/html'
          })
          return stream.end(playground)
        }

        graphqlHttp2(() => this.createGraphQLServerOptions(stream, headers))(
          stream,
          headers
        )
      }
    )
  }
}
