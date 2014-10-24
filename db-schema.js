var mongoose = require('mongoose');
var Q = require('./q.min'); 
mongoose.connect('mongodb://localhost/testdb');


var getDB = function(db){ 
	this.db = db; 
}; 

//User schema
var userSchema = mongoose.Schema({
					_id: {type: Number, required: true}, 
	                name: {type: String, required: true}, 
	                createdAt: {type: Date, required: true},
	                updatedAt: {type: Date, required: true},
	                userAddress: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserAddress'}]
	            });
var Users = mongoose.model('Users', userSchema, 'Users');

//LearningParams schema 
var userAddressSchema = mongoose.Schema({
					_id: {type: Number, required: true},
					user: {type: Number, ref: 'Users', required: true}, 
					address: {type: String, required: true}, 
					createdAt:{type: Date, required: true}, 
					updatedAt: {type: Date, required: true}
				});
var UserAddress = mongoose.model('UserAddress',userAddressSchema, 'UserAddress');

// Users
var insertUser = function(req, res){
	var objUser = new Users(req.body);
	objUser.createdAt = new Date();
	objUser.updatedAt = new Date();
	objUser.save(function (err, user) {
	  if (err) return res.send(err);
	  res.send("user data saved");
	});
};

var getUsers = function(req, res){
	Users.find({}, function(error, result) {
		if (error) { res.send(400, error); }
		else { 
          res.send(result);
         }
	});
};

//UserAddress
var getUserAddresses = function (req, res) {
	UserAddress.find({}, function(err, result) {
		if(err) {
			res.send(400, error);
		} else {
			res.send(result);
		}
	})
}

var insertUserAddress = function(req, res) {
	var objUserAddress = new UserAddress(req.body);
	objUserAddress.createdAt = new Date();
	objUserAddress.updatedAt = new Date();

	objUserAddress.save(function(err, result) {
		if (err) return res.send(err);
	  res.send("Address data saved");
	});
}

var getUserAddressWithUserData = function(req, res) {
	UserAddress.find({}).populate("user").exec(function(err, result) {
		if (err) { res.send(400, err); }
		else {
			 res.send(JSON.parse(JSON.stringify(result)));
		}
	});
}

// get collection data
// <collectionName> : database collection name
var getCollectionData = function(collectionName) {
	var deferred = Q.defer();
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) deferred.reject(error);
    else {
    	the_collection.find({}).toArray(function(error,doc) { //C
	        if( error ) deferred.reject(error);
	        else{
	        	deferred.resolve(JSON.parse(JSON.stringify(doc)));
	        }
	    });
    }
  });
  return deferred.promise;
};

// drop collection
// <collectionName> : database collection name
var dropCollection = function(collectionName) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) console.log(error);
    else {
    	the_collection.drop();
    }
  });
};

// bulk data insertion
var bulkInsert = function(req, res) {
	var self = this;
	self.getCollectionData("temp_Users").then(function(userResults){
		var user = new Users().collection.initializeOrderedBulkOp();
      	for(var i=0; i < userResults.length; i++){
      		var obj = {};
      		obj._id = userResults[i].id;
      		obj.uid = userResults[i].uid;
      		obj.createdAt = userResults[i].createdAt;
      		obj.updatedAt = userResults[i].updatedAt;
      		obj.last_synced_usn = userResults[i].last_synced_usn;
      		user.insert(obj);
      	}
      	if(userResults.length == 0) user.insert({});
      	user.execute(function(error,result) { 
      		if (error) { res.send(400, error); }
      		else{
      			res.send('bulk data insertion completed successfully');
      		}
        });
	})
	.fail(function(error){
		res.send(400, error);
	});
}


exports.insertUser = insertUser;
exports.getUsers = getUsers;
exports.getDB = getDB;
exports.getUserAddresses = getUserAddresses;
exports.insertUserAddress = insertUserAddress;
exports.getUserAddressWithUserData = getUserAddressWithUserData;
