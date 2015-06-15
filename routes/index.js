var express = require('express');
var router = express.Router();
var User   = require('../models/user')
var jwt    = require('jsonwebtoken');
var config = require('../config');
var pg = require('pg');

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
router.post('/authenticate', function(req, res) {
	console.log('authenticate user ' + req.body.name + " / " + req.body.password);
	// find the user
	/*
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
*/
	user = { name: 'Mark Lott',
		     password: 'password'
	}
	var token = jwt.sign(user, config.secret, {
		expiresInMinutes: 1440 // expires in 24 hours
	});

	res.json({
		success: true,
		message: 'Enjoy your token!',
		token: token
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
		jwt.verify(token, config.secret, function(err, decoded) {			
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

router.post('/v1/case', function(req, res) {
	var data = {text: req.body.text, complete: false};
	pg.connect(connectionString, function(err, client, done) {
		//implement sql update here
		client.query("INSERT INTO mycase(contactid, subject) values($1, $2)", [data.contactid, data.subject],
			function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row inserted with id: ' + result.rows[0].id);
                }

                client.end();
            });  
		);
	}


});





module.exports = router;
