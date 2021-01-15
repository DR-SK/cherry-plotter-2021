const express = require("express");
const app = express();

app.use(express.json());
app.use(require("./middleware/not-found"));
app.use(require("./middleware/error"));

app.use("/games", require("./controllers/games"));
app.use("/auth", require('./controllers/auth'));

module.exports = app;
