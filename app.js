"use strict";
var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var httpContext = require("express-http-context");
var cors = require("cors");
var app = express();
var db = require("./db");
global.__root = __dirname + "/";
var AuthController = require("./auth/AuthController");
/**
 *
 * Shop
 */
var ShopController = require("./management_shop/shopController");

app.use(cors());

app.get("/api", function (req, res) {
  res.status(200).send("API works.");
});
app.use("/api/auth", AuthController);


app.use("/api/shop", ShopController);



app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
