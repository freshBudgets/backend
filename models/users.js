const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {type: String, unique: true},
  phoneNumber: {type: Number, unique: true},
  password: String
});

UserSchema.methods.setPassword = function(password) {
  this.password = bcrypt.hashSync(password, 10);
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(this.password, password);
}

UserSchema.methods.createJWT = function() {
  return jwt.sign( {
    phoneNumber: this.phoneNumber,
    email: this.email
  }, config.jwtSecret, { expiresIn: config.jwtExpireTime });
}

UserSchema.plugin(uniqueValidator, "already taken.");
mongoose.model('Users', UserSchema);
