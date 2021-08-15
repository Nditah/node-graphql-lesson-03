// node-graphql/src/schema.js

const resolvers = {
  Query: {
    enrollment: (parent, args) => {
      return prisma.student.findMany({
        where: { enrolled: true },
      });
    },

    student: (parent, args) => {
      return prisma.student.findOne({
        where: { id: Number(args.id) },
      });
    },

    students: (parent, args) => {
      return prisma.student.findMany({});
    },

    departments: (parent, args) => {
      return prisma.department.findMany({});
    },

    department: (parent, args) => {
      return prisma.department.findOne({
        where: { id: Number(args.id) },
      });
    },

    courses: (parent, args) => {
      return prisma.course.findMany({});
    },

    course: (parent, args) => {
      return prisma.course.findOne({
        where: { id: Number(args.id) },
      });
    },

    teachers: (parent, args) => {
      return prisma.teacher.findMany({});
    },

    teacher: (parent, args) => {
      return prisma.teacher.findOne({
        where: { id: Number(args.id) },
      });
    },
    
  },

  Mutation: {

    registerStudent: (parent, args) => {
      return prisma.student.create({
        data: {
          email: args.email,
          fullname: args.fullname,
          dept: args.dept,
        },
      });
    },

    enroll: (parent, args) => {
      return prisma.student.update({
        where: {
          id: Number(args.id),
        },
        data: {
          enrolled: true,
        },
      });
    },

  createTeacher: (parent, args) => {
      return prisma.teacher.create({
        data: {
          email: args.email,
          fullname: args.fullname,
          courses: {
          create: args.data.courses,
        },
        },
      });
    },

  createCourse: (parent, args) => {
      return prisma.course.create({
        data: {
          code: args.code,
          name: args.name,
          teacher: args.teacherEmail && {
          connect: { email: args.teacherEmail },
        },
        },
      });
    },

  createDepartment: (parent, args) => {
      return prisma.student.create({
        data: {
          name: args.name,
          description: args.description,
        },
      });
    },

  },

  Student: {
    id: (parent) => parent.id,
    email: (parent) => parent.email,
    fullname: (parent) => parent.fullname,
    enrolled: (parent) => parent.enrolled,
    dept: (parent, args) => {
      return prisma.department.findOne({
          where: { id: parent.id },
        })
    },
  },

  Teacher: {
    courses: (parent, args) => {
      return prisma.teacher.findOne({
          where: { id: parent.id },
        })
        .courses()
    },
  },

  Course: {
    teacher: (parent, args) => {
      return prisma.course.findOne({
          where: { id: parent.id },
        })
        .teacher()
    },
  },

  Department: {
    students: (parent, args) => {
      return prisma.department.findOne({
          where: { id: parent.id },
        })
        .students()
    },
  },

}

  
  module.exports = {
    resolvers,
  }
  