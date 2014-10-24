var http = require('http'),
    express = require('express'),
    path = require('path'),

    MongoDbServer = require('mongodb').Server,
    MongoClient = require('mongodb').MongoClient,
    dbSchema = require("./db-schema");

    var app = express();
    app.use(express.bodyParser());
    var server = http.createServer(app);
 
server.listen(3000);

console.error("Express server listening on port 3000");

var mongoHost = 'localhost'; //A
var mongoPort = 27017; 
var collectionDriver;

var mongoClient = new MongoClient(new MongoDbServer(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) {
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("testdb");
  dbSchema.getDB(db);
});

app.get('/', function (req, res) {
	console.log("Hi");
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

app.post('/users', function (req, res) {
	dbSchema.insertUser(req, res);
});

app.post('/userAdress', function (req, res) {
	dbSchema.insertUserAddress(req, res);
});

app.get('/getUsers', function (req, res) {
  dbSchema.getUsers(req, res);
})

app.get('/getUserAddresses', function (req, res) {
  dbSchema.getUserAddresses(req, res);
})

app.get('/getUserAddressWithUserData', function (req, res) {
  dbSchema.getUserAddressWithUserData(req, res);
});








