const mongoose  = require('mongoose');
const passport  = require('passport');
const crypto    = require('crypto');
const jwt       = require('jsonwebtoken');
const Users     = mongoose.model('Users');
const mongoURI  = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;


const update = function(req, res) {
    var params = req.body;

    //Check if all needed information is sent in request
    if (!params.emailNotifications || !params.smsNotifications) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
    }

     
}

module.exports = {
  updateSettings
}
