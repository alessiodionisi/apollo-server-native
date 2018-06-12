# Production-ready Node.js GraphQL server without dependencies

[![npm version](https://badge.fury.io/js/apollo-server-native.svg)](https://badge.fury.io/js/apollo-server-native)

## Installation

With yarn:
```
yarn add apollo-server-native graphql graphql-tag graphql-tools
```

With npm:
```
npm install --save apollo-server-native graphql graphql-tag graphql-tools
```


## Example

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
```
