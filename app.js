const express         = require('express');
const mongoose        = require('mongoose');
const bodyParser      = require('body-parser');
const cors            = require('cors');
const session         = require('express-session');
const config          = require('./config');
const port            = process.env.PORT || 5000;

//Initiate app
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', require('./routes'));

//Connect to database
mongoose.connect(config.mongoURI);
mongoose.set('debug', true); //Verbose logging in console

app.listen(port);
console.log("Listening on port: " + port);
