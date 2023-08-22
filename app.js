var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayout=require("express-ejs-layouts");
const database = require('./config/database');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var guruRouter = require('./routes/guru');
var siswaRouter = require('./routes/siswa');

var app = express();

// view engine setup
app.use(expressLayout);
app.set('view engine', 'ejs');

//Connection mongoDB
database.connection.on("error",console.error.bind(console,"Mongodb Connection Error:"));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/guru', guruRouter);
app.use('/siswa',siswaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
