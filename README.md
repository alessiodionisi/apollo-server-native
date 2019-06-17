# Apollo Server integration for native Node.js HTTP

[![npm version](https://badge.fury.io/js/apollo-server-native.svg)](https://badge.fury.io/js/apollo-server-native)

This integration of Apollo Server works with native Node.js HTTP.

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
const { ApolloServer, gql } = require('apollo-server-native')

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

const apolloServer = new ApolloServer({ typeDefs, resolvers })

const server = http.createServer()

server.on('request', apolloServer.createHandler())

server.listen({ port: 3000 }, () =>
  console.log(
    `🚀 Server ready at http://localhost:3000${apolloServer.graphqlPath}`
  )
)
```

## Example with HTTPS

```js
const https = require('https')
const { ApolloServer, gql } = require('apollo-server-native')

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

const apolloServer = new ApolloServer({ typeDefs, resolvers })

const server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
})

server.on('request', apolloServer.createHandler())

server.listen({ port: 3000 }, () =>
  console.log(
    `🚀 Server ready at https://localhost:3000${apolloServer.graphqlPath}`
  )
)
```
