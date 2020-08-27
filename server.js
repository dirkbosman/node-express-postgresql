require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");

const app = express();
const pool = new Pool();

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("hello world"));

app.get("/users", (req, res) => {
  pool
    .query("SELECT * FROM users;")
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(500));
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  pool
    .query("SELECT * FROM users WHERE id=$1;", [id])
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(500));
});

app.post("/users", (req, res) => {
  const { name } = req.body;

  pool
    .query("INSERT INTO users(first_name) values($1);", [name])
    .then((data) => res.status(201).json(data))
    .catch((e) => res.sendStatus(500));
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  pool
    .query("DELETE FROM users WHERE id=$1;", [id])
    .then((data) => res.status(201).json(data))
    .catch((e) => res.sendStatus(500));
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  pool
    .query("UPDATE users SET first_name=$1 WHERE id=$2;", [name, id])
    .then((data) => res.status(201).json(data))
    .catch((e) => res.sendStatus(500));
});

app.get("/orders", (req, res) => {
  pool
    .query("SELECT * FROM orders;")
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(500));
});

app.get("/orders/:id", (req, res) => {
  const { id } = req.params;
  pool
    .query("SELECT * FROM orders WHERE id=$1;", [id])
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(500));
});

app.listen("3000", () => console.log("connected"));
