const express         = require('express');
const mongoose        = require('mongoose');
const bodyParser      = require('body-parser');
const cors            = require('cors');
const morgan          = require('morgan');
const passport        = require('passport');
const port            = process.env.PORT || 5000;

//Initiate app
require('dotenv').config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
//app.use(session({ secret: 'freshbudgets-TOKEN', cookie: { maxAge: 60000 }}));

//Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
mongoose.set('debug', true); //Verbose logging in console

//Models
require('./models/transactions');
require('./models/plaidInstitutions');
require('./models/budgetCategory');
require('./models/users');

//Passport config
require('./passport');
app.use(passport.initialize());

//Set up server api routes to look at routes/index.js
app.use('/api/', require('./routes'));

var server = app.listen(port);
console.log("Listening on port: " + port);
module.exports = server;
