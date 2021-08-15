// node-graphql/src/db.js
const { PrismaClient } = require('@prisma/client')

module.exports = {
  prisma: new PrismaClient(),
}