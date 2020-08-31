# node-postgresql-unstructured

#### Summary:
- node express server, middleware and apis
- postgresql relational database

#### Boilerplates:
- [Part 1: node-postgresql-unstructured](https://github.com/dirkbosman/node-postgresql-unstructured) 
- [Part 2: node-postgresql-destructured](https://github.com/dirkbosman/node-postgresql-destructured)
- [Part 3: node-postgresql-controllers](https://github.com/dirkbosman/node-postgresql-controllers)


## Environment & Libraries

Install the necessary libraries:
```
npm init -y
npm i express
npm i nodemon --save-dev
npm i dotenv
```

Add the following to package.json:
```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon server.js"
  }
```

Note: we add nodemon only for development, and not for production, because it is unsafe. 
```
  "dependencies": {
    "dotenv": "^8.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.4"
  }
```

For production, you would configure start-prod in npm-scripts / in docker configurations.
```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start-prod": "node server.js"
  }
```

You can run the following in the terminal to start the server (via nodemon):
```npm start```



## Database (PostgreSQL)

Navigate to https://api.elephantsql.com/console/ to create an account and a server instance to host your database.

Create your database and copy the information. You will need this latter details to connect via your application.

Create your database tables now:

```
CREATE TABLE users (
   id  SERIAL PRIMARY KEY,
   first_name varchar(255),
   last_name varchar(255),
   age int
);
 
CREATE TABLE orders (
   id  SERIAL PRIMARY KEY,
   price float,
   date timestamp,
   user_id int,
   FOREIGN KEY (user_id) REFERENCES users(id)
);
 
INSERT INTO users (first_name, last_name, age) VALUES ('John', 'Doe', 18);
INSERT INTO users (first_name, last_name, age) VALUES ('Bob', 'Dylan', 30);
INSERT INTO users (first_name, last_name, age) VALUES ('Jane', 'Doe', 25);
 
INSERT INTO orders (price,date, user_id) VALUES ( 18, '2001-01-01 00:00:00', 1);
INSERT INTO orders (price,date, user_id) VALUES ( 18, '2001-01-02 04:00:00', 1);
INSERT INTO orders (price,date, user_id) VALUES ( 18, '2001-01-03 05:00:00', 2);
INSERT INTO orders (price,date, user_id) VALUES ( 18, '2001-01-04 06:00:00', 2);
```

Test whether you get an output under the `Browse`-tab: 
- `SELECT * FROM users;`
- `SELECT * FROM orders;`

Install the PostgreSQL adapter in Node:
`npm i pg`

Add your connection details from your console's [settings](https://api.elephantsql.com/console/) in a `.env`- or `.env.production`-file, as well as add `.env`- or `.env.production` in your `.gitignore`-file. Note the way you use the .env file can depend on your OS, so replicate the syntax that worked for you.
```
PGUSER=<value-same>
PGHOST=<value>
PGPASSWORD=<value>
PGDATABASE=<value-same>
PGPORT=<value>
```

## Server & APIs Setup (Node & Express)

Read: 
- https://expressjs.com/en/guide/routing.html
- https://node-postgres.com

Create routes for the *users* on:
- `GET`     on `/`     -> To get all the users.
- `GET`     on `/:id`  -> To get one user (with the id).
- `POST`    on `/`     -> To create a new user.
- `PUT`     on `/:id`  -> To edit one user (with the id).
- `DELETE`  on `/:id`  -> To delete one user (with the id).

Create routes for the *orders* on:
- `GET`    on `/`     -> To get all the orders.
- `GET`    on `/:id`  -> To get one order (with the id).
- `POST`   on `/`     -> To create a new order.
- `PUT`    on `/:id`  -> To edit one order (with the id).
- `DELETE` on `/:id`  -> To delete one order (with the id).

Creating the main file:
``` 
# express.js

require('dotenv').config();
const express = require("express");
const { Pool } = require('pg');

const app = express();
const pool = new Pool();

app.get("/", (req, res) => res.send("hello world"));

app.listen('3000', () => console.log('connected'));
```

Navigate to: `http://localhost:3000/`:
`hello world`

Add a new route to server.js:
```
app.get("/users", (req, res) => {
  pool
    .query("SELECT * FROM users;")
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(404));
});
```

Navigate to: `http://localhost:3000/users`:
```[{"id":1,"first_name":"John","last_name":"Doe","age":18},{"id":2,"first_name":"Bob","last_name":"Dylan","age":30},{"id":3,"first_name":"Jane","last_name":"Doe","age":25}]```

Add a new route to server.js. 
- Note: Add a prepared statement(s) "[id]" to protect against SQL injection:
```
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  pool
    .query("SELECT * FROM users WHERE id=$1;", [id])
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(404));
});
```

Navigate to: `http://localhost:3000/users/1`:
```[{"id":1,"first_name":"John","last_name":"Doe","age":18}]```

Navigate to: `http://localhost:3000/users` vs `http://localhost:3000/users/4`:
- It should give you an empty array, because no values exist in the DB for this id.
`[]`

#### SQL Injection:

This is an SQL injection you can easily try as it does not involve a new query and does not kill your database
```
app.get("/users/:id", (req, res) => {
 const { id } = req.params;
 pool
   .query(`SELECT * FROM users WHERE id=${id}`)
   .then(data => res.json(data.rows))
   .catch(e => res.sendStatus(500));
});
```
and your address would be: `http://localhost:3000/users/(SELECT%20MAX(id)%20FROM%20users)`, everything after `http://localhost:3000/users/` is saved under the `id`-param and then executed as a select-statement. The outcome should be: the user with the highest id. Note: the endpoint version in server.js uses prepared statements, so hitting the same url will output an error. 


#### SQL Prevention Demo & Protection:

```
app.get("/users/:id", (req, res) => {
const { id } = req.params;
pool
  .query(`SELECT * FROM users WHERE id=${id}`)
  .then((data) => res.json(data.rows))
  .catch((e) => res.sendStatus(500));
});
```

#### Middleware:

- Install the middleware:
`npm i body-parser`

#### INSERT Record(s):
```
app.post("/users", (req, res) => {
 const { name } = req.body;
 pool
   .query('INSERT INTO users(first_name) values($1);', [name])
   .then(data => res.status(201).json(data))
   .catch(e => res.sendStatus(500));
});
```

#### DELETE Record(s):
```
app.delete("/users/:id", (req, res) => {
 const { id } = req.params;

 pool
   .query('DELETE FROM users WHERE id=$1;', [id])
   .then(data => res.status(201).json(data))
   .catch(e => res.sendStatus(500));
});
```
Terminal:
`curl -H "Content-Type: application/json" -X DELETE http://localhost:3000/users/3`


#### UPDATE Record(s):
```
app.put("/users/:id", (req, res) => {
 const { id } = req.params;
 const { name } = req.body;
 pool
   .query('UPDATE users SET first_name=$1 WHERE id=$2;', [name, id])
   .then(data => res.status(201).json(data))
   .catch(e => res.sendStatus(500));
});
```
Terminal:
`curl -d '{"name": "Pikachu"}' -H "Content-Type: application/json" -X PUT http://localhost:3000/users/5`










