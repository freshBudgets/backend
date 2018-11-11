const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const sms = require('./sms');
const Users = mongoose.model('Users');
const jwtSecret = process.env.JWT_SECRET;
const BudgetCategory = mongoose.model('BudgetCategory');

//this is a change

const getToken = function(req) {
  return req.header('token');
};

const verifyToken = function(req, res, next) {
  var token = getToken(req);
  if (token) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if(err) {
        return res.status(401).send({
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
    return res.status(403).send({
      success: false,
      message: "No token provided"
    });
  }
};

const signup = function(req, res) {
    var params = req.body;
    //Check if all needed information is sent in request
    if (!params.phoneNumber || !params.firstName || !params.lastName || !params.email || !params.password) {
        res.json({
            success: false,
            message: 'Not enough information to create a new account'
        });
    }
    //Create new user from request params
    const newUser = new Users(params);
    newUser.setPassword(params.password);
    newUser.generateSMSVerificationCode();
    newUser.isVerified = false;
    //Save new user
    newUser.save(function(err) {
      if (err) {
        console.log(err.errors);
        res.json({
          success: false,
          errorMap: { message: "failed to save user." },
          token: null
        });
      }
      else {
        sms.sendSMSVerificationCode(newUser.phoneNumber, newUser.smsVerificationCode);
        const uncategorizedBudget = new BudgetCategory();
        uncategorizedBudget.user = mongoose.Types.ObjectId(newUser._id);
        uncategorizedBudget.budgetName = 'Uncategorized Transactions';
        uncategorizedBudget.budgetLimit = 100;
        uncategorizedBudget.currentAmount = 0;
        uncategorizedBudget.save(function(err) {
          if (err) {
            console.log(err.errors);
            res.json({
              success: false,
              errorMap: { message: "failed to save user." },
              token: null
            });
          }
          else {
            res.json({
              success: true,
              message: "user successfully created",
              token: newUser.createJWT(),
              user: newUser.toJSON()
            });
          }
        });
      }
    });
};

const login = function(req, res, next) {
  var params = req.body;
  if (!params.phoneNumber || !params.password) {
    res.json({
        success: false,
        message: 'Insufficient login information'
    });
  }
  return passport.authenticate('local', { session: false }, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      user.token = user.createJWT();
      res.json({
        success: true,
        message: "user successfully signed in",
        token: user.token,
        user: user.toJSON()
      });
    }
    else {
      res.json({
        success: false,
        message: "failed to sign in user",
      });
    }
  })(req, res, next);
};

const verifyPhone = function (req, res) {
  let code = req.body.code;
  res.json({
    success: true,
    code
  });
};

var functions = {
    login,
    signup,
    verifyToken,
    verifyPhone
};

module.exports = functions;
