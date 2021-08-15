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

const students = [
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


You define the resolvers following the same structure as the GraphQL schema. Every field in the schema’s types has a corresponding resolver function whose responsibility is to return the data for that field in your schema. For example, the Query.enrollment() resolver will return the enrolled students by filtering the students array.

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

To avoid committing the **_node_modules_** folder and the **_.env_** file, begin by creating a **_.gitignore_** file:

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
    
You have successfully committed and pushed the changes to GitHub. 

## Step 6 — Setting Up Prisma with PostgreSQL

So far the GraphQL API you built used the in-memory students array in the **database.js** file to store data. This means that if your server restarts, all changes to the data will be lost. To ensure that your data is safely persisted, you will replace the **database.js** with a PostgreSQL database and use Prisma to access the data.

In this step, you will install the Prisma CLI, create your initial Prisma schema, set up PostgreSQL locally with Docker, and connect Prisma to it.

The Prisma schema is the main configuration file for your Prisma setup and contains your database schema.

Begin by installing the Prisma CLI with the following command:

    $ npm install prisma -D
  
The Prisma CLI will help with database workflows such as running database migrations and generating Prisma Client.

Next, you’ll set up your PostgreSQL database using Docker. Create a new Docker Compose file with the following command:

    $  touch docker-compose.yml
 
Now add the following code to the newly created file:


```yml

# node-graphql/docker-compose.yml

version: '3.8'
services:
  postgres:
    image: postgres:13
    restart: always
    environment:
      - POSTGRES_USER=db_user
      - POSTGRES_PASSWORD=db_password
    volumes:
      - postgres:/var/lib/postgresql/data
    ports:
      - '5432:5432'
volumes:
  postgres:
  ```

This Docker Compose configuration file is responsible for starting the official PostgreSQL Docker image on your machine. The POSTGRES_USER and POSTGRES_PASSWORD environment variables set the credentials for the superuser (a user with admin privileges). You will also use these credentials to connect Prisma to the database. Finally, you define a volume where PostgreSQL will store its data, and bind the 5432 port on your machine to the same port in the Docker container.

With this setup in place, go ahead and launch the PostgreSQL database server with the following command:

    $ docker-compose up -d
 
The Output:

```
Creating network "node-graphql_default" with the default driver
Creating volume "node-graphql_postgres" with default driver
Creating node-graphql_postgres_1 ... done
```

You can verify that the database server is running with the following command:

    $ docker ps
 
This will output something similar to:
```
CONTAINER ID   IMAGE         COMMAND                  CREATED          STATUS          PORTS                                       NAMES
ca2813291692   postgres:13   "docker-entrypoint.s…"   40 seconds ago   Up 35 seconds   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   node-graphql_postgres_1
```

With the PostgreSQL container running, you can now create your Prisma setup. Run the following command from the Prisma CLI:

    $ npx prisma init
 
Note that as a best practice, all invocations of the Prisma CLI should be prefixed with npx. This ensures it’s using your local installation.

After running the command, the Prisma CLI created a new folder called prisma in your project. It contains the following two files:

- **_schema.prisma_**: The main configuration file for your Prisma project (in which you will include your data model).
- **_.env_**: A dotenv file to define your database connection URL.

To make sure Prisma knows about the location of your database, open the **prisma/.env** file:

 
Adjust the DATABASE_URL environment variable to look as follows:

```json
# node-graphql/prisma/.env

DATABASE_URL="postgresql://db_user:db_password@localhost:5432/college_db?schema=public"
```

Note that you’re using the database credentials test-user and test-password, which are specified in the Docker Compose file. To learn more about the format of the connection URL, visit the [Prisma docs](https://www.prisma.io/docs/reference/database-connectors/postgresql/#connection-url).

You have successfully started PostgreSQL and configured Prisma using the Prisma schema. In the next step, you will define your data model for the blog and use Prisma Migrate to create the database schema.


## Step 7 — Defining the Data Model with Prisma Migrate

Now you will define your [data model](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model) in the Prisma schema file you’ve just created. This data model will then be mapped to the database with Prisma Migrate, which will generate and send the SQL statements for creating the tables that correspond to your data model.

Since you’re building a college portal, the main entities of the application will be students, teachers and courses. In this step, you will define a Student model with a similar structure to the Student type in the GraphQL schema. In a later step, you will evolve the app and add a Teacher and Course models.

Note: The GraphQL API can be seen as an abstraction layer for your database. When building a GraphQL API, it’s common for the GraphQL schema to closely resemble your database schema. However, as an abstraction, the two schemas won’t necessarily have the same structure, thereby allowing you to control which data you want to expose over the API. This is because some data might be considered sensitive or irrelevant for the API layer.

Prisma uses its own [data modeling language](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema#syntax) to define the shape of your application data.

Go to _node-graphql/prisma/schema.prisma_ Add the following model definitions to it:

```js
// node-graphql/prisma/schema.prisma

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Student {
  id       Int     @id @default(autoincrement())
  email    String
  fullname String?
  dept     String?
  enrolled Boolean @default(false)
}

```


You are defining a model called Student with a number of fields. The model will be mapped to a database table; the fields represent the individual columns.

The id fields have the following field attributes:

- **_@default(autoincrement())_** : This sets an auto-incrementing default value for the column.

- **_@id_**: This sets the column as the primary key for the table.

With the model in place, you can now create the corresponding table in the database using Prisma Migrate. This can be done with the **_migrate dev_** command that creates the migration files and runs them.

Open up your terminal again and run the following command:

    $ npx prisma migrate dev --name "init" --skip-generate
 
This will output something similar to:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "college_db", schema "public" at "localhost:5432"

PostgreSQL database college_db created at localhost:5432

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20210815160400_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

This command creates a new migration on your file system and runs it against the database to create the database schema. Here’s a quick overview of the options that are provided to the command:

- **_--name "init"_**: Specifies the name of the migration (will be used to name the migration folder that’s created on your file system).

- **_--skip-generate_**: Skips generating Prisma Client (this will be done in the next step).

Your **prisma/migrations** directory is now populated with the SQL migration file. This approach allows you to track changes to the database schema and create the same database schema in production.

Note: If you’ve already used Prisma Migrate with the _college_db_ database and there is an inconsistency between the migrations in the prisma/migration folder and the database schema you will be prompted to reset the database with the following output:

```
Output
? We need to reset the PostgreSQL database "college_db" at "localhost:5432". All data will be lost.
Do you want to continue? › (y/N)
You can resolve this by entering y which will reset the database. Beware that this will cause all data in the database to be lost.
```

You’ve now created your database schema. In the next step, you will install Prisma Client and use it in your GraphQL resolvers.

## Step 8 — Using Prisma Client in the GraphQL Resolvers

Prisma Client is an auto-generated and type-safe Object Relational Mapper (ORM) that you can use to programmatically read and write data in a database from a Node.js application. In this step, you’ll install Prisma Client in your project.

Open up your terminal again and install the Prisma Client npm package:

    $  npm install @prisma/client
 
Note: Prisma Client gives you rich auto-completion by generating code based on your Prisma schema to the _node_modules_ folder. To generate the code you use the *_npx prisma generate_* command. This is typically done after you create and run a new migration. On the first install, however, this is not necessary as it will automatically be generated for you in a *_postinstall_* hook.

With the database and GraphQL schema created, and Prisma Client installed, you will now use Prisma Client in the GraphQL resolvers to read and write data in the database. You’ll do this by replacing the *_database.js_* file with *_db.js_*, which you’ve used so far to hold your data.

    $ touch src/db.js

Begin by creating the following file:

```js
// node-graphql/src/db.js
const { PrismaClient } = require('@prisma/client')

module.exports = {
  prisma: new PrismaClient(),
}
```

Next, you will import the prisma instance into *_src/schema.js_*. To do so, open *_src/schema.js_*  and then import prisma from ./db at the top of the file:

    // node-graphql/src/schema.js

    const { prisma } = require('./db')

Now you will update the Query resolvers to fetch enrolled students from the database. Update the resolvers.Query object with the following resolvers:

```js
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
  },
```

Here, you’re using two Prisma Client queries:

- *_findMany_*: Fetches students whose enrolled field is false.

- *_findOne_*: Fetches a single student whose id field equals the id GraphQL argument.

Note, that as per the [GraphQL specification](http://spec.graphql.org/June2018/#sec-ID), the ID type is serialized the same way as a *_String_*. Therefore you convert to a *_Number_* because the id in the Prisma schema is an *_int_*.

Next, you will update the *_Mutation_* resolver to save and update students in the database. Update the *_resolvers.Mutation_* Object with the following resolvers:


```js

// node-graphql/src/schema.js



const resolvers = {
  ...
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
  },
}
```

You’re using two Prisma Client queries:

- *_create_*: Create a Student record.

- *_update_*: Update the enrolled field of the Student record whose id matches the one in the query argument.

Now that you’ve updated the resolvers to use Prisma Client, start the server to test the flow of data between the GraphQL API and the database with the following command:


    $ npm start 

Open the GraphQL playground at the address from the output and test the GraphQL API using the same queries from Step 3.

Then run the following two commands to commit the changes:

    $  git add .
    $  git commit -m 'Feature: Add Prisma'
    $  git push

Run the migrations against the database with Prisma Migrate.

    $ npx prisma migrate dev

## Step 10 — Adding the User Model

Your GraphQL API for College has a single entity named *_Student_*. In this step, you’ll evolve the API by defining a new model in the Prisma schema and adapting the GraphQL schema to make use of the new model. You will introduce a *_Teacher_*, a *_Course_* and a *_Department_* model. Also, there exist a one-to-many relation from *_Department_* to the *_Student_* model as well as betwwen a *_Teacher_*, to a *_Course_*. This will allow you to represent the Teacher of Course and associate multiple Courses to each Teacher for instance. Then you will evolve the GraphQL schema to allow creating Teacher and associating Course with teachers through the API.

First, open the Prisma schema and add the following:

```js
// node-graphql/prisma/schema.prisma

// model Student {
//   id       Int     @id @default(autoincrement())
//   email    String
//   fullname String?
//   dept     String?
//   enrolled Boolean @default(false)
// }

model Student {
  id       Int         @id @default(autoincrement())
  email    String      @unique
  fullname String?
  enrolled Boolean     @default(false)
  dept     Department? @relation(fields: [deptId], references: [id])
  deptId   Int?
}

model Department {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String
  students    Student[]
}

model Teacher {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  fullname String?
  courses  Course[]
}

model Course {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  description String?
  teacher     Teacher? @relation(fields: [teacherId], references: [id])
  teacherId   Int?
}

```

You’ve added the following to the Prisma schema:

- The *Department* model to represent course Specialties.
- The *Teacher* model to represent course Instructors/Facilitators.
- The *Course* model to represent subject matters

The Student model has been modifies as follows:

- Two relation fields: dept and deptId. Relation fields define connections between models at the Prisma level and do not exist in the database. These fields are used to generate the Prisma Client and to access relations with Prisma Client.

- The deptId field, which is referenced by the @relation attribute. Prisma will create a foreign key in the database to connect Student and Department.

Note that the *dept* field in the Student model is optional, similarly to the teacher field in Course model. That means you’ll be able to create students unassociated with a department as well as a course without and associated Teacher.

The relationship makes sense because course are usually later on assigned to Teachers and also Registered students are usually matrucilated later on into a Department.

Next, create and apply the migration locally with the following command:

    $  npx prisma migrate dev --name "more-features"

If the migration succeeds you will receive the following:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "college_db", schema "public" at "localhost:5432"


⚠️  Warnings for the current datasource:

  • A unique constraint covering the columns `[email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

✔ Are you sure you want create and apply this migration? … yes
The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20210815184145_more_features/
    └─ migration.sql

Your database is now in sync with your schema.

Running generate... (Use --skip-generate to skip the generators)

> prisma@2.29.1 preinstall /home/peace/Projects/Lesson/node-graphql/node_modules/prisma
> node scripts/preinstall-entry.js

```

The command also generates Prisma Client so that you can make use of the new table and fields.

You will now update the GraphQL schema and resolvers to make use of the updated database schema.

Open the src/schema.js file and add update typeDefs as follows:


```js

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

```

 In this updated code, you’re adding the following changes to the GraphQL schema:

- The *Teacher* type, which returns an array of *Course*.
- The *Department* type, which returns an array of *Student*.
- The *Course* type which has a *Teacher* type
- The dept of type *Department* field to the *Student* type.
- The createTeacher mutation, which expects the TeacherCreateInput as its input type.

- The CourseCreateWithoutTeacherInput input type used in the TeacherCreateInput input for creating teachers as part of the createTeacher mutation.

- The teacherEmail optional argument to the createCourse mutation.

With the schema updated, you will now update the resolvers to match the schema.

Update the resolvers object as follows:


```js
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
  

```

Let’s break down the changes to the resolvers:

- The createCourse mutation resolver now uses the teacherEmail argument (if passed) to create a relation between the created course and an existing teacher.

- The new createTeacher mutation resolver creates a teacher and related courses using nested writes.

- The Teacher.courses and Post.teacher resolvers define how to resolve the courses and teacher fields when the Teacher or Post are queried. These use Prisma’s Fluent API to fetch the relations.

Start the server to test the GraphQL API:

    $  npm start
 
Begin by testing the createTeacher resolver with the following GraphQL mutation:

```gql
mutation {
  createTeacher(data: { email: "yohanne@telixia.com", fullname: "Yohanne" }) {
    email
    id
  }
}
```
 
This will create a teacher.

Next, test the createCourse resolver with the following mutation:

```gql

mutation {
  createCourse(
    teacherEmail: "yohanne@telixia.com"
    code: "DAML"
    name: "Data Analytics and Machine Learning"
    description: "Data Analytics and Machine Learning with PowerBi, Tableau, and AutoML"
  ) {
    id
    code
    name
    description
    teacher {
      id
      fullname
    }
  }
}
```
 
Notice that you can fetch the teacher whenever the return value of a query is Course. In this example, the Course.teacher resolver will be called.

Finally, commit your changes and push to deploy the API:

    $  git add .
    $  git commit -m "Feature: Add Teacher, Couse, Department"
    $  git push
 
You have successfully evolved your database schema with Prisma Migrate and exposed the new model in your GraphQL API.


## Conclusion

Even though this lesson is not meant to compare REST vs. Graphql, it should be highlighted that:

🔷 While GraphQL simplifies data consumption, REST design standards are strongly favoured by many sectors due to cache-ability features, security, tooling community and ultimate reliability. For this reason and its storied record, many web services favour REST design.

🔷 Regardless of their choice, backend developers must understand exactly how frontend users will interact with their APIs to make the correct design choices. Though some API styles are easier to adopt than others, with the right documentation and walk-throughs in place, backend engineers can construct a high-quality API platform that frontend developers will love, no matter what style is used.
