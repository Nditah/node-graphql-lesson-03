
// node-graphql/src/schema.js

const { gql } = require('apollo-server')

const typeDefs = gql`
  type Student {
    id: ID!
    email: String!
    fullname: String!
    dept: String
    enrolled: Boolean
  }

  type Query {
    enrollment: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    registerStudent(email: String!, fullname: String!): Student!
    enroll(id: ID!): Student
  }
`
module.exports = {
  typeDefs,
}