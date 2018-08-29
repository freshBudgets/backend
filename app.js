var express         = require('express');
var app             = express();
var config          = require('./config');
var port            = process.env.PORT || 5000;
var mongoClient     = require('mongodb').MongoClient;

const mongoUri = config.mongoURI;

mongoClient.connect(mongoUri, { useNewUrlParser: true }, function(err, client) {
   if(err) {
        console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
   }
   console.log('Connected...');

   /* DO SOMETHING ... */

   client.close();
});


app.use('/', require('./routes'));


app.listen(port);
console.log("Listening on port: " + port);
