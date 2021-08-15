// node-graphql/src/index.js

const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./schema')
const { resolvers } = require('./resolver')

const port = process.env.PORT || 9090

new ApolloServer({ resolvers, typeDefs }).listen({ port }, () =>
  console.log(`Server ready at: http://localhost:${port}`),
)
