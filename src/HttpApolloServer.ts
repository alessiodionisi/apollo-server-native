import { GraphQLOptions, ApolloServerBase } from 'apollo-server-core'
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions
} from '@apollographql/graphql-playground-html'
import http from 'http'
import https from 'https'

import { graphqlHttp } from './httpApollo'

export interface HttpServerRegistration {
  server: http.Server | https.Server
  path?: string
}

export class HttpApolloServer extends ApolloServerBase {
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
    return true
  }

  public applyMiddleware({ server, path }: HttpServerRegistration) {
    if (!path) path = '/graphql'

    // TODO: Health check

    // TODO: Uploads

    this.graphqlPath = path

    server.on(
      'request',
      (req: http.IncomingMessage, res: http.ServerResponse) => {
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
          return res.end()
        }

        graphqlHttp(() => this.createGraphQLServerOptions(req, res))(req, res)
      }
    )
  }
}
