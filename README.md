# Apollo Server integration for HTTP, HTTPS and HTTP2

[![npm version](https://badge.fury.io/js/apollo-server-native.svg)](https://badge.fury.io/js/apollo-server-native)

This integration of Apollo Server works with native HTTP, HTTPS and HTTP2.

<!-- ## Example
Install `apollo-server-native graphql graphql-tools` packages

```js
const http = require('http')
const { nativeGraphql, nativeGraphiql } = require('apollo-server-native')
const { gql } = require('apollo-server-core')
const { makeExecutableSchema } = require('graphql-tools')

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

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const graphiqlHandler = nativeGraphiql({ endpointURL: '/' })
    graphiqlHandler(req, res)
  } else {
    const graphqlHandler = nativeGraphql({ schema })
    graphqlHandler(req, res)
  }
})

server.listen(3000)
``` -->

## Example with GraphQL Playground
Install `apollo-server-native` package with npm or yarn

```js
const http = require('http')
const { nativeGraphql } = require('apollo-server-native')
const { gql } = require('apollo-server-core')
const { makeExecutableSchema } = require('graphql-tools')
const { renderPlaygroundPage } = require('graphql-playground-html')

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

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const playground = renderPlaygroundPage({ version: '1.7.0' })
    res.setHeader('Content-Type', 'text/html')
    res.write(playground)
    res.end()
  } else {
    const graphqlHandler = nativeGraphql({ schema })
    graphqlHandler(req, res)
  }
})

server.listen(3000)
```