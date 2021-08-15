
// node-graphql/src/schema.js

const { gql } = require('apollo-server')

const typeDefs = gql`

  type Student {
    id: ID!
    email: String!
    fullName: String!
    dept: Department
    enrolled: Boolean
  }

  type Department {
    id: ID!
    name: String!
    description: String!
    students: [Student!]!
  }

  type Teacher {
    id: ID!
    email: String!
    fullname: String!
    courses: [Course]
  }

  type Course {
    id: ID!
    code: String!
    name: String!
    description: String!
    teacher: Teacher
  }

  input TeacherCreateInput {
    email: String!
    fullname: String
    courses: [CourseCreateWithoutTeacherInput!]
  }

  input CourseCreateWithoutTeacherInput {
    code: String!
    name: String!
    description: String
  }

  type Query {
    enrollment: [Student!]!
    students: [Student!]!
    student(id: ID!): Student
    departments: [Department!]!
    department(id: ID!): Department
    courses: [Course!]!
    course(id: ID!): Course
    teachers: [Teacher!]!
    teacher(id: ID!): Teacher
  }

  type Mutation {
    registerStudent(email: String!, fullName: String!): Student!
    enroll(id: ID!): Student
    createTeacher(data: TeacherCreateInput!): Teacher!
    createCourse(teacherEmail: String!, code: String!, name: String!): Course!
    createDepartment(name: String!, description: String!): Department!

  }
`
module.exports = {
  typeDefs,
}