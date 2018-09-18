const mongoose = require('mongoose');
const passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Users = mongoose.model('Users');
const mongoURI = config.mongoURI;
const jwtSecret = config.jwtSecret;

const getToken = function(req) {
  return req.header('token');
}

const verifyToken = function(req, res, next) {
  var token = getToken(req);
  if (token) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if(err) {
        res.json({
          success: false,
          message: "Failed to authenticate token."
        });
      }
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
  else {
    res.json({
      success: false,
      message: "No token provided"
    });
  }
}

const signup = function(req, res) {
    var params = req.body;

    //Check if all needed information is sent in request
    if (!params.phoneNumber || !params.firstName || !params.lastName || !params.email || !params.password) {
        res.json({
            success: false,
            message: 'Not enough information to create a new account'
        });
    }

    const newUser = new Users();
    newUser.firstName = params.firstName;
    newUser.lastName = params.lastName;
    newUser.phoneNumber = params.phoneNumber;
    newUser.email = params.email;
    newUser.setPassword(params.password);

    return newUser.save(function(err) {
      if (err) {
        console.log(err.errors);
        res.json({
          success: false,
          message: "failed to save user.",
          token: null
        });
      }
      else {
        res.json({
          success: true,
          message: "user successfully created",
          token: newUser.createJWT()
        });
      }
    });
}

const login = function(req, res, next) {
  var params = req.body;
  if (!params.phoneNumber || !params.password) {
    res.json({
        success: false,
        message: 'Insufficient login information'
    });
  }

  return passport.authenticate('local', { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (user) {
      user.token = user.createJWT();
      res.json({
        success: true,
        message: "user successfully signed in",
        token: user.token
      })
    }
    else {
      res.json({
        success: false,
        message: "failed to sign in user",
      });
    }

  })(req, res, next);
}

const verifyPhone = function (req, res) {
  let code = req.body.code;

  res.json({
    success: true,
    code
  })
}

var functions = {
    login,
    signup,
    verifyToken,
    verifyPhone
};

module.exports = functions;
