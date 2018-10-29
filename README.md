# Apollo Server integration for HTTP, HTTPS and HTTP2

[![npm version](https://badge.fury.io/js/apollo-server-native.svg)](https://badge.fury.io/js/apollo-server-native)

This integration of Apollo Server works with native HTTP, HTTPS and HTTP2.

## Installation
Install `apollo-server-native` package with yarn or npm

## Example with HTTP
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

const server = http.createServer()
const apolloServer = new ApolloServer({ typeDefs, resolvers })

apolloServer.applyMiddleware({
  server
})

server.listen(3000, () => console.log(`🚀 server ready at http://localhost:3000`))
```

## Example with HTTPS
```js
const https = require('https')
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

const server = https.createServer({

})
const apolloServer = new ApolloServer({ typeDefs, resolvers })

apolloServer.applyMiddleware({
  server
})

server.listen(3000, () => console.log(`🚀 server ready at https://localhost:3000`))
```

## Example with HTTP2
```js
const http2 = require('http2')
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

const server = http2.createSecureServer({
  
})
const apolloServer = new ApolloServer({ typeDefs, resolvers })

apolloServer.applyMiddleware({
  server
})

server.listen(3000, () => console.log(`🚀 server ready at https://localhost:3000`))
```
