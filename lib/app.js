const express = require("express");
const app = express();

app.use(express.json());
app.use(require("./middleware/not-found"));
app.use(require("./middleware/error"));

// app.use("/games", require("./controllers/games"));

app.use('/api/v1/auth', require('./controllers/auth'));
console.log('are you working');
module.exports = app;
