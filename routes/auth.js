var MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto');
var config = require('../config');
var mongoURI = config.mongoURI;

var signup = function(req, res) {
    var params = req.body;
    
    //Check if all needed information is sent in request
    if (!params.phoneNumber || !params.firstName || !params.lastName || !params.email || !params.password) {
        res.json({
            success: false,
            message: 'Not enough information to create a new account'
        });
    }

    MongoClient.connect(mongoURI, function(err, client) {
        const userCollection = client.db("freshbudgets").collection('users');
        const userDocument = userCollection.findOne(
            {phoneNumber: req.body.phoneNumber}
        );
        if (userDocument) {
            res.json({
                success: false,
                message: 'Phone number already in use'
            });
        }
        

    });
};