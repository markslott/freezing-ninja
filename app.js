var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var mongoose  = require('mongoose');
var config = require('./config'); // get our config file
var User   = require('./models/user'); // get our mongoose model
var app = express();
var router = express.Router();
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/fossildemo';



/* https://github.com/scotch-io/node-token-authentication/blob/master/server.js#L17 */

var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'html');


app.get('/setup', function(req, res) {

  // create a sample user
  var mark = new User({ 
    name: 'Mark Lott', 
    password: 'password',
    admin: true 
  });
  mark.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello, from the API!');
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

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
router.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});


// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.param('token') || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;  
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
      success: false, 
      message: 'No token provided.'
    });
    
  }
  
});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------

/* example taken from http://mherman.org/blog/2015/02/12/postgresql-and-nodejs/#.VX7czVxVhBd */
router.post('/v1/case', function(req,res) {
  var data = {text: req.body.text, complete: false};

  pg.connect(connectionString, function(err, client, done) {

        // SQL Query > Insert Data
        client.query("INSERT INTO items(text, complete) values($1, $2)", [data.text, data.complete]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(results);
        });

        // Handle Errors
        if(err) {
          console.log(err);
        }

    });

});

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

router.get('/check', function(req, res) {
  res.json(req.decoded);
});

app.use('/api',router);


module.exports = app;
