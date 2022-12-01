const createError = require('http-errors');
const express = require('express');
const errorHandler = require("./middleware/error");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require("dotenv");
const connDB = require("./conf/db");
const fileUpload = require("express-fileupload");

// Load env consts
dotenv.config({ path: './conf/config.env' });

// Connect to DB
connDB()


const app = express();

// Routers file
const bootcamps = require('./routes/bootcamps.routes');
const courses = require('./routes/courses.routes');
const indexRouter = require('./routes/index.route');
const usersRouter = require('./routes/users.route');
const auth = require('./routes/auth.routes');

// Simple express middleware for uploading files.
app.use(fileUpload({
    limits: {
        fileSize: process.env.MAX_IMAGE_SIZE
    },
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Dev logger
if (process.env.NODE_ENV.startsWith('dev')) {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', usersRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// Middleware
app.use(errorHandler) // error handler

module.exports = app;
