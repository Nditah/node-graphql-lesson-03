# node-graphql

## Introduction

REST (REpresentational State Transfer) is an architectural style for distributed hypermedia systems.
An API is a set of definitions and protocols for building and integrating application software.
Whereas REST is an architectural style, GraphQL is data query and manipulation language for APIs, and a runtime for fulfilling queries with existing data.
GraphQL was developed to solves many of the challeneges of flexibility and efficiency that developers encountered when interacting with RESTful APIs.

[Prisma](https://www.prisma.io/) is an open-source ORM for Nodejs and TypeScript. In our previous lesson on ["How To Build a REST API with Node.js, Prisma ORM, PostgreSQL Database, and Docker"](https://dev.to/nditah/how-to-build-a-rest-api-with-node-prisma-and-postgresql-429a) you implemented your first REST API Route. Today, we are going to take a step further to build a Grapghql API with Nodejs, Prisma, and Postgres.

In this lesson, you will use GraphQL and Prisma in combination as their responsibilities complement each other. 
You’ll build a GraphQL API for a blogging application in JavaScript using Node.js. 
You will first use Apollo Server to build the GraphQL API backed by in-memory data structures. 

## Content

🔷  Step 1 — Creating the Node.js Project

🔷  Step 2 — Defining the GraphQL Schema and Resolvers

🔷  Step 3 — Creating the GraphQL Server

🔷  Step 4 — Setting Up Prisma with PostgreSQL

🔷  Step 5 — Defining the Data Model with Prisma Migrate

🔷  Step 6 — Using Prisma Client in the GraphQL Resolvers

🔷  Step 7 — Creating and Migrating the PostgreSQL Database in App Platform

🔷  Step 8 — Adding the User Model

🔷  Step 9 — Creating the GitHub Repository

🔷  Step 10 — Deploying to App Platform

The Github repository of this project will be shared later on.

## Prerequisites

Node.js v10 to v14
Docker installed on your computer (to run the PostgreSQL database locally).
Basic familiarity with JavaScript, Node.js, GraphQL, and PostgreSQL is helpful, but not strictly required for this tutorial.


## Step 1 — Creating the Node.js Project

In this step, you will set up a Node.js project with npm and install the dependencies apollo-server and graphql.

This project will be the foundation for the GraphQL API that you’ll build and deploy throughout this tutorial.

First, create a new directory for your project:

    $ mkdir node-graphql
 
Next, navigate into the directory and initialize an empty npm project:

    cd node-graphql
    npm init --yes
 
This command creates a minimal *package.json* file that is used as the configuration file for your npm project.

You will receive the following output:

    Output
    Wrote to /home/Projects/lesson/node-graphql/package.json:
    {
      "name": "node-graphql",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC"
    }
    
You’re now ready to configure TypeScript in your project.

Execute the following command to install the necessary dependencies:

    $ npm install apollo-server graphql --save
 
This installs two packages as dependencies in your project:

- **apollo-server**: The HTTP library that you use to define how GraphQL requests are resolved and how to fetch data.

- **graphql**: is the library you’ll use to build the GraphQL schema.

You’ve created your project and installed the dependencies. In the next step you will define the GraphQL schema.


## Step 2 — Defining the GraphQL Schema and Resolvers

In this step, you will define the GraphQL schema and corresponding resolvers. The schema will define the operations that the API can handle. The resolvers will define the logic for handling those requests using in-memory data structures, which you will replace with database queries in the next step.

First, create a new directory called src that will contain your source files:

    $ mkdir src
 
Then run the following command to create the file for the schema:

    $ touch src/schema.js
 
Now add the following code to the file:

```js

// node-graphql/src/schema.js

const { gql } = require('apollo-server')

const typeDefs = gql`
  type Student {
    id: ID!
    email: String!
    fullName: String!
    dept: String
    enrolled: Boolean
  }

  type Query {
    enrollment: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    registerStudent(email: String!, fullName: String!): Student!
    enroll(id: ID!): Student
  }
`
```
 
Here you define the GraphQL schema using the **gql** [tagged template](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#gql). A schema is a collection of type definitions (hence **typeDefs**) that together define the shape of queries that can be executed against your API. This will convert the GraphQL schema string into the format that Apollo expects.

The schema introduces three types:

- **_Student_**: Defines the type for a student in your blogging app and contains four fields where each field is followed by its type, for example, _String_.

- **_Query_**: Defines the _enrollment_ query which returns multiple _students_ as denoted by the square brackets and the *student* query which accepts a single argument and returns a single *Student*.

- **_Mutation_**: Defines the *registerStudent* mutation for creating a registering *Student* and the *enroll* mutation which accepts an id and returns a *Student*.

Note that every GraphQL API has a query type and may or may not have a mutation type. These types are the same as a regular object type, but they are special because they define the entry point of every GraphQL query.

Next, add the *students* array to the _src/schema.js_ file, below the typeDefs variable:

```js

// node-graphql/src/schema.js

const posts = [
  {
    id: 1,
    email: 'ada@telixia.com',
    fullName: 'Ada Eze',
    dept: 'Software Engineering',
    enrolled: true,
  },
  {
    id: 2,
    email: 'musa@telixia.com',
    fullName: 'Musa Bashir',
    dept: 'Data Engineering',
    enrolled: true,
  },
  {
    id: 3,
    email: 'ola@telixia.com',
    fullName: 'Omolara Liza',
    dept: 'System Security',
    enrolled: false,
  },
]

```

You define the *students* array with three pre-defined *students*. Notice that the structure of each student object matches the **Student** type you defined in the schema. This array holds the *students* that will be served by the API. In a subsequent step, you will replace the array once the database and Prisma Client are introduced.

Next, define the resolvers object below the *students* array you just defined:

```js

// node-graphql/src/schema.js

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
  typeDefs,
}

```


You define the resolvers following the same structure as the GraphQL schema. Every field in the schema’s types has a corresponding resolver function whose responsibility is to return the data for that field in your schema. For example, the Query.enrollment() resolver will return the published posts by filtering the posts array.

Resolver functions receive four arguments:

1. **_parent_**: The parent is the return value of the previous resolver in the resolver chain. For top-level resolvers, the parent is *undefined*, because no previous resolver is called. For example, when making a enrollment query, the _query.enrollment()_ resolver will be called with parent’s value *undefined* and then the resolvers of Post will be called where parent is the object returned from the enrollment resolver.

2. **_args_**: This argument carries the parameters for the query, for example, the post query, will receive the id of the post to be fetched.

3. **_context_**: An object that gets passed through the resolver chain that each resolver can write to and read from, which allows the resolvers to share information.

4. **_info_**: An AST representation of the query or mutation. You can read more about the details in part III of this series: [Demystifying the info Argument in GraphQL Resolvers](https://www.prisma.io/blog/graphql-server-basics-demystifying-the-info-argument-in-graphql-resolvers-6f26249f613a).

Since the **context** and **info** are not necessary in these resolvers, only **parent** and **args** are defined.


## Step 3 — Creating the GraphQL Server

In this step, you will create the GraphQL server with Apollo Server and bind it to a port so that the server can accept connections.

First, run the following command to create the file for the server:

    $ touch src/server.js
 
Now add the following code to the file:

```js
// node-graphql/src/index.js

const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./schema')
const { resolvers } = require('./resolver')

const port = process.env.PORT || 9090

new ApolloServer({ resolvers, typeDefs }).listen({ port }, () =>
  console.log(`Server ready at: http://localhost:${port}`),
)
``` 

Here you instantiate the server and pass the schema and resolvers from the previous step.

The port the server will bind to is set from the PORT environment variable and if not set, it will default to 9090. The PORT environment variable will be automatically set by App Platform and ensure your server can accept connections once deployed.

Your GraphQL API is ready to run. Start the server with the following command:

    $ node src/index.js
 
You will receive the following output:

    Output
    Server ready at: http://localhost:9090

It’s considered good practice to add a start script to your **package.json** so that the entry point to your server is clear. Moreover, this will allow App Platform to start the server once deployed.

To do so, add the following line to the "scripts" object in **package.json**:

    
```json
{
  "name": "node-graphql",
  "version": "1.0.0",
  "description": "Grapghql API with Nodejs, Prisma, Postgres and Docker",
  "main": "index.js",
  "scripts": {
    "start": "node ./src"
  },
  "keywords": ["Grapghql", "API", "Node.js", "Prisma", "Postgres", "Docker"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "apollo-server": "^2.18.2",
    "graphql": "^15.3.0"
  }
}
```
 
Now you can start the server with the following command:

    $ npm start
 
To test the GraphQL API, open the URL from the output, which will lead you to the GraphQL Playground.

If you encounter and error like this:

```
Error: listen EADDRINUSE: address already in use :::9090
    at Server.setupListenHandle [as _listen2] (net.js:1320:16)
    at listenInCluster (net.js:1368:12)
    at Server.listen (net.js:1454:7)
    at /home/peace/Projects/Lesson/node-graphql/node_modules/apollo-server/dist/index.js:74:24
    at new Promise (<anonymous>)
    at ApolloServer.listen (/home/peace/Projects/Lesson/node-graphql/node_modules/apollo-server/dist/index.js:72:15)
Emitted 'error' event on Server instance at:
    at emitErrorNT (net.js:1347:8)
    at processTicksAndRejections (internal/process/task_queues.js:82:21) {
  code: 'EADDRINUSE',
  errno: -98,
  syscall: 'listen',
  address: '::',
  port: 9090
}
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! node-graphql@1.0.0 start: `node ./src`
npm ERR! Exit status 1
```

    $ npx kill-port 9090
    $ npm start

![GraphQL Playground - Default Screen](graphql-playground-01.png?raw=true)

CLick on **Query your server**

![GraphQL Playground](graphql-playground-02.png?raw=true)


The GraphQL Playground is an IDE where you can test the API by sending queries and mutations.

For example, to test the enrollment query which only returns enrolled students, enter the following query to the left side of the IDE and send the query by pressing the **Run** button:

**Operation**

```gql
query ExampleQuery {
  enrollment {
    id
    email
    fullname
    dept
  }
}
```


**Response**

```json
{
  "data": {
    "enrollment": [
      {
        "id": "1",
        "email": "ada@telixia.com",
        "fullname": "Ada Eze",
        "dept": "Software Engineering"
      },
      {
        "id": "2",
        "email": "musa@telixia.com",
        "fullname": "Musa Bashir",
        "dept": "Data Engineering"
      }
    ]
  }
}
```

![GraphQL Playground - Query and Result](graphql-playground-03.png?raw=true)


To test the registerStudent mutation, enter the following mutation:

**Operation**

```gql
mutation {
  registerStudent(
    email: "contact@telixia.com",
    fullname: "Sammy",
    ) {
    id
    email
    fullname
    dept
    enrolled
  }
}
```
 
 **Response**

 ```json
 {
  "data": {
    "registerStudent": {
      "id": "4",
      "email": "contact@telixia.com",
      "fullname": "Sammy",
      "dept": null,
      "enrolled": false
    }
  }
}
```


Note: You can choose which fields to return from the mutation by adding or removing fields within the curly braces following **registerStudent**. For example, if you wanted to only return the id and email you could simple omit the fullname, dept and enrolled field.


You have successfully created and tested the GraphQL server. In the next step, you will create a GitHub repository for the project.


## Step 4 — Creating the GitHub Repository

In this step, you will create a GitHub repository for your project and push your changes so that the GraphQL API can be automatically deployed from GitHub to any cloud platform of your choice.

Begin by initializing a repository from the prisma-graphql folder:

    $ git init
    $ touch .gitignore
 
 ```
# .gitignore 
# Specifies intentionally untracked files to ignore when using Git
# http://git-scm.com/docs/gitignore

*~
*.sw[mnpcod]
*.log
*.tmp
*.tmp.*
log.txt
*.sublime-project
*.sublime-workspace
.vscode/
npm-debug.log*

.idea/
.sourcemaps/
.sass-cache/
.tmp/
.versions/
coverage/
dist/
node_modules/
tmp/
temp/
www/
$RECYCLE.BIN/

.DS_Store
Thumbs.db
```

Next, use the following two commands to commit the code to the repository:

    $ git add .
    $ git commit -m 'Initial commit'
 
Now that the changes have been committed to your local repository, you will create a repository in GitHub and push your changes.

Go to GitHub to create a new repository. For consistency, name the repository node-graphql-lesson-03 and then click Create repository.

After the repository was created, push the changes with the following commands, which includes renaming the default local branch to main:

    $ git remote add origin git@github.com:<USERNAME>/node-graphql-lesson-03.git
    $ git branch -M main
    $ git push --set-upstream origin main
    
You have successfully committed and pushed the changes to GitHub. Next, you will connect the repository to App Platform and deploy the GraphQL API.

## Conclusion

Even though this lesson is not meant to compare REST vs. Graphql, it should be highlighted that:

🔷 While GraphQL simplifies data consumption, REST design standards are strongly favoured by many sectors due to cache-ability features, security, tooling community and ultimate reliability. For this reason and its storied record, many web services favour REST design.

🔷 Regardless of their choice, backend developers must understand exactly how frontend users will interact with their APIs to make the correct design choices. Though some API styles are easier to adopt than others, with the right documentation and walk-throughs in place, backend engineers can construct a high-quality API platform that frontend developers will love, no matter what style is used.
