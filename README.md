# Simple API layer

This is a sample project that uses json web token to secure a simple API that inserts
records into a postgres database

Example shamelessly hacked together based on other samples that other kind developers have
published

## Requirements

- node, npm
- postgresdb: API inserts records here via /api/v1/case
- mongodb: used to store credentials.  Initialized using /setup


## How to use
- clone repo and deploy to Heroku
- using a tool like REST Explorer in Chrome, hit https://yourapp.herokuapp.com/api/authenticate with a POST request. The body of the post should look like:
	{ "name" : "Mark Lott",
	  "password" : "password"}
- make sure the Content-Type header is set to application/json
- the response that comes back should look like the following:

	{
	    "success": true,
	    "message": "Enjoy your token!",
	    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTdlZWU5YWIxNGVjNjExMDBjYjA2OTYiLCJuYW1lIjoiTWFyayBMb3R0IiwicGFzc3dvcmQiOiJwYXNzd29yZCIsImFkbWluIjp0cnVlLCJfX3YiOjB9.NAgdeMya8TUwD6-8fx42yEj47QLlCTIDY6p8EQvmkUA"
	}

- copy the token value
- Now hit https://yourapp.herokuapp.com/api/v1/case with a POST request.  The body of the post should look like:
	{ "contactid" : "your salesforce contact id",
	  "subject" : "A subject description"}
- make sure the Content-Type header is still set to application/json
- add an additonal header called x-access-token and set the value to the token that was returned
- You should get a message back indicating that a row was inserted:

	{
	    "command": "INSERT",
	    "rowCount": 1,
	    "oid": 0,
	    "rows": [],
	    "fields": [],
	    "_parsers": [],
	    "RowCtor": null,
	    "rowAsArray": false
	}

- check your postgresdb to see if it is there
