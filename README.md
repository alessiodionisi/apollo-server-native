# Apollo Server integration for HTTP, HTTPS and HTTP2

[![npm version](https://badge.fury.io/js/apollo-server-native.svg)](https://badge.fury.io/js/apollo-server-native)

This integration of Apollo Server works with native HTTP, HTTPS and HTTP2.

## Example with GraphQL Playground
Install `apollo-server-native` package with npm or yarn

```js
const http = require('http')
const { ApolloServer, gql } = require('apollo-server-native')

const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => 'world'
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

const httpServer = http.createServer()
server.applyMiddleware({
  server: httpServer,
  path: '/'
})
httpServer.listen(3000, () => console.log(`🚀 Server ready at http://localhost:3000`))
```