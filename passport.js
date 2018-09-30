const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

passport.use(new LocalStrategy({
  usernameField: 'phoneNumber',
  passwordField: 'password'
},
  function(username, password, done) {
    Users.findOne({
      phoneNumber: username
    }, function (err, user) {
      if (err) { return done(err); }
      if (!user || !user.validatePassword(password)) {
        return done(null, false, {message: "Incorrect username or password."});
      }
      return done(null, user);
    })
  }
));
