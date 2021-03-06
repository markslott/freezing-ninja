var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose    = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var User   = require('./models/user');
var config = require('./config');

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/testdb1';
mongoose.connect(config.database);
app.set('superSecret', config.secret); // secret variable

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

app.get('/setup', function(req, res) {

  // create a sample user
  var newUser = new User({ 
    name: 'Mark Lott', 
    password: 'password',
    admin: true 
  });
  newUser.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// basic route (http://localhost:8080)
app.get('/test', function(req, res) {
  res.send('Hello! welcome to my test api.');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
