import { graphqlNative } from './nativeApollo'

import { ApolloServerBase } from 'apollo-server-core'
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core'
import { GraphQLOptions } from 'apollo-server-core'
import { RenderPageOptions as PlaygroundRenderPageOptions, renderPlaygroundPage } from 'graphql-playground-html'
import http from 'http'

export interface ServerRegistration {
  server: http.Server;
  path?: string;
  // bodyParserConfig?: OptionsJson | boolean;
  // onHealthCheck?: (req: express.Request) => Promise<any>;
  // disableHealthCheck?: boolean;
  gui?: boolean | PlaygroundRenderPageOptions;
  // uploads?: boolean | Record<string, any>;
}

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res })
  }

  public applyMiddleware({
    server,
    path,
    // cors,
    // bodyParserConfig,
    // disableHealthCheck,
    gui,
    // onHealthCheck,
    // uploads,
  }: ServerRegistration) {
    if (!path) path = '/graphql'

    this.graphqlPath = path

    const guiEnabled =
      !!gui || (gui === undefined && process.env.NODE_ENV !== 'production')

    server.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
      if (req.url !== path) return

      if (guiEnabled && req.method === 'GET') {
        const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
          endpoint: path,
          subscriptionEndpoint: this.subscriptionsPath,
          version: '1.7.0',
          ...(typeof gui === 'boolean' ? {} : gui),
        }
        const playgroundPage = renderPlaygroundPage(playgroundRenderPageOptions)
        res.setHeader('Content-Type', 'text/html')
        res.write(playgroundPage)
        return res.end()
      }

      return graphqlNative(this.createGraphQLServerOptions.bind(this))(
        req,
        res,
      )
    })
  }
}
