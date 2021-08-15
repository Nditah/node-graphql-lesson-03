
// node-graphql/src/schema.js

const { students } = require('./database.js')

const resolvers = {
    Query: {
      enrollment: (parent, args) => {
        return students.filter((student) => student.enrolled)
      },
      student: (parent, args) => {
        return students.find((student) => student.id === Number(args.id))
      },
    },
  
    Mutation: {
      registerStudent: (parent, args) => {
        students.push({
          id: students.length + 1,
          email: args.email,
          fullname: args.fullname,
          dept: args.dept,
          enrolled: false,
        })
        return students[students.length - 1]
      },
      enroll: (parent, args) => {
        const studentToEnroll = students.find((student) => student.id === Number(args.id))
        studentToEnroll.enrolled = true
        return studentToEnroll
      },
    },
  
    Student: {
      id: (parent) => parent.id,
      email: (parent) => parent.email,
      fullname: (parent) => parent.fullname,
      dept: (parent) => parent.dept,
      enrolled: (parent) => parent.enrolled,
    },
  }
  
  
  module.exports = {
    resolvers,
  }
  