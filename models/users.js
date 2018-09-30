const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpireTime = parseInt(process.env.JWT_EXPIRE_TIME);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {type: String, unique: true},
  phoneNumber: {type: Number, unique: true},
  password: String,
  isVerified: Boolean,
  plaidInstitutions: [{type: Schema.Types.ObjectId, ref: 'PlaidInstituions'}]
});

UserSchema.methods.setPassword = function(password) {
  this.password = bcrypt.hashSync(password, 10);
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(this.password, password);
};

UserSchema.methods.createJWT = function() {
  return jwt.sign( {
    phoneNumber: this.phoneNumber,
    email: this.email,
    _id: this._id
  }, jwtSecret, { expiresIn: jwtExpireTime });
};

UserSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    isVerified: this.isVerified
  };
};

UserSchema.plugin(uniqueValidator, "already taken.");
mongoose.model('Users', UserSchema);