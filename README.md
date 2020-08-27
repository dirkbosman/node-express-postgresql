# node-postgresql-unstructured


## Steps

#### [Part 1](https://github.com/dirkbosman/node-postgresql-unstructured) and [Part 2](https://github.com/dirkbosman/node-postgresql-destructured) to use as a boilerplate to set-up a:
- node express server, middleware and apis
- postgresql relational database

Process

```
npm init -y
npm i express
npm i nodemon --save-dev
npm i dotenv
```


// Add
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon server.js"
  }


// Note: we add nodemon only for development, and 
// not for production, because it is unsafe. 
// -------------------------------------------------


  "dependencies": {
    "dotenv": "^8.2.0",
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.4"
  }


// For production, you would configure start-prod in npm-scripts / in docker configurations.
// "start-prod": "node server.js"


// starts with nodemon
npm start


* https://api.elephantsql.com/console/


Work to do: 1 First Commit + 1 Commit Per addition of a request endpoint (11 commits)

Create a Github Repo
Create an  instance on ElephantSQL (you have a guide for that)  

Create the database with: 


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


Create an Express server with routes for the users on:
GET  /  : To get all the users 
GET  /:id :  To get one user (with the id) 
POST / -> To create a new user 
PUT /:id  :  To edit one user (with the id) 
DELETE  /:id : To delete one user (with the id) 

Create routes for the orders on:
GET  /  : To get all the orders 
GET  /:id :  To get one order (with the id) 
POST / -> To create a new order
PUT /:id  :  To edit one order (with the id) 
DELETE  /:id : To delete one order (with the id)
If you are finished before 3 PM, try creating a module for your pool object, and seperating routes in 2 route files. One for Users, one for Orders : https://expressjs.com/en/guide/routing.html
        Jump to section express.Router


Don’t forget to check the doc here: ttps://node-postgres.com











SELECT * FROM users;
execute
SELECT * FROM orders;
execute


// Install the PostgreSQL adapter in Node
npm i pg


// https://api.elephantsql.com/console/ -> settings
PGUSER=dbuser
PGHOST=database.server.com
PGPASSWORD=secretpassword
PGDATABASE=mydb
PGPORT=3211


PGUSER=<value-same>
PGHOST=<value>
PGPASSWORD=<value>
PGDATABASE=<value-same>
PGPORT=<value>



// Note the way you use the .env file can depend on your OS
// so replicate the syntax that worked for you with the 
// contentful project either brackets or not



``` express.js
require('dotenv').config();
const express = require("express");
const { Pool } = require('pg');

const app = express();
const pool = new Pool();

app.get("/", (req, res) => res.send("hello world"));

app.listen('3000', () => console.log('connected'));
```


// Navigate to: http://localhost:3000/
hello world


// Add a new route to server.js
app.get("/users", (req, res) => {
  pool
    .query("SELECT * FROM users;")
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(404));
});


// Navigate to: http://localhost:3000/users
[{"id":1,"first_name":"John","last_name":"Doe","age":18},{"id":2,"first_name":"Bob","last_name":"Dylan","age":30},{"id":3,"first_name":"Jane","last_name":"Doe","age":25}]


// Add a new route to server.js. Note: Prepared Statements "[id]" to protect against SQL injection.
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  pool
    .query("SELECT * FROM users WHERE id=$1;", [id])
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(404));
});


http://localhost:3000/users/1
[{"id":1,"first_name":"John","last_name":"Doe","age":18}]

// Navigate to: http://localhost:3000/users gives us an empty array, because no values in DB exist for this id:
http://localhost:3000/users/4
[]


// SQL Injection:

@June 29th 2020 this is an SQL injection you can easily try as it does not involve a new query and does not kill your database

```
app.get("/users/:id", (req, res) => {
 const { id } = req.params;
 pool
   .query(`SELECT * FROM users WHERE id=${id}`)
   .then(data => res.json(data.rows))
   .catch(e => res.sendStatus(500));
});
```
and your address would be: http://localhost:3000/users/(SELECT%20MAX(id)%20FROM%20users)
everything after http://localhost:3000/users/ is saved under the id param and then executed as a select 
the outcome is the user with the highest id is output
the endpoint version in server.js uses prepared statements, so hitting the same url will output an error


IF  EXISTS (SELECT * FROM users WHERE id = 3'username')
DROP USER [username]

http://localhost:3000/users/(DELETE%20FROM%20users%20WHERE%20id=3)

DELETE%20FROM%20users%20WHERE%20id=3;

http://localhost:3000/users/(DELETE%20FROM%20users%20WHERE%20id=3)

DELETE FROM users WHERE id=3;
DELETE%20FROM%20users%20WHERE%20id=3;

(select * from users where id=3; DROP TABLE users; -- ';)
(select%20*%20from%20users%20where%20id=3;%20DROP%20TABLE%20users;%20--%20';)

(DELETE%20id%20FROM%20Users%20WHERE%20id%20=%203%20OR%201=1;)


// SQL Prevention Demo & Protection
// app.get("/users/:id", (req, res) => {
//   const { id } = req.params;
//   pool
//     .query(`SELECT * FROM users WHERE id=${id}`)
//     .then((data) => res.json(data.rows))
//     .catch((e) => res.sendStatus(500));
// });


// Inserting a Record(s)

npm i body-parser


app.post("/users", (req, res) => {
 const { name } = req.body;

 pool
   .query('INSERT INTO users(first_name) values($1);', [name])
   .then(data => res.status(201).json(data))
   .catch(e => res.sendStatus(500));
});


// Deleting a Record(s)


app.delete("/users/:id", (req, res) => {
 const { id } = req.params;

 pool
   .query('DELETE FROM users WHERE id=$1;', [id])
   .then(data => res.status(201).json(data))
   .catch(e => res.sendStatus(500));
});
curl -H "Content-Type: application/json" -X DELETE http://localhost:3000/users/3




// Updating a Record(s)


app.put("/users/:id", (req, res) => {
 const { id } = req.params;
 const { name } = req.body;

 pool
   .query('UPDATE users SET first_name=$1 WHERE id=$2;', [name, id])
   .then(data => res.status(201).json(data))
   .catch(e => res.sendStatus(500));
});


curl -d '{"name": "Pikachu"}' -H "Content-Type: application/json" -X PUT http://localhost:3000/users/5







