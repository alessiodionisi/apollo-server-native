# Apollo Server integration for HTTP, HTTPS and HTTP2

[![npm version](https://badge.fury.io/js/apollo-server-native.svg)](https://badge.fury.io/js/apollo-server-native)

This integration of Apollo Server works with native HTTP, HTTPS and HTTP2.

## Installation

Install package with yarn or npm:

```sh
yarn add apollo-server-native graphql
```

```sh
npm install apollo-server-native graphql
```

## Example with HTTP

```js
const http = require('http')
const { HttpApolloServer, gql } = require('apollo-server-native')

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
}

const server = http.createServer()

const apolloServer = new HttpApolloServer({ typeDefs, resolvers })
apolloServer.applyMiddleware({
  server,
})

server.listen({ port: 3000 }, () =>
  console.log(
    `🚀 Server ready at https://localhost:3000${apolloServer.graphqlPath}`
  )
)
```

## Example with HTTPS

```js
const https = require('https')
const { HttpApolloServer, gql } = require('apollo-server-native')

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
}

const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
})

const apolloServer = new HttpApolloServer({ typeDefs, resolvers })
apolloServer.applyMiddleware({
  server,
})

server.listen({ port: 3000 }, () =>
  console.log(
    `🚀 Server ready at https://localhost:3000${apolloServer.graphqlPath}`
  )
)
```

## Example with HTTP2

```js
const http2 = require('http2')
const { Http2ApolloServer, gql } = require('apollo-server-native')

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
}

const server = http2.createSecureServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
})

const apolloServer = new Http2ApolloServer({ typeDefs, resolvers })
apolloServer.applyMiddleware({
  server,
})

server.listen({ port: 3000 }, () =>
  console.log(
    `🚀 Server ready at https://localhost:3000${apolloServer.graphqlPath}`
  )
)
```
