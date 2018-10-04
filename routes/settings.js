const mongoose  = require('mongoose');
const passport  = require('passport');
const crypto    = require('crypto');
const jwt       = require('jsonwebtoken');
const Users     = mongoose.model('Users');
const mongoURI  = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// GET returns the users settings
const getSettings = function(req, res) {
    var params = req.body;

    //Variables from the request body
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    Users.findOne({_id:userID}, function(err, user) {
        if(err) {
            res.json({
                success: false,
                message: 'Error finding user'
            });
        }
        else {
            res.json({
                success: true,
                smsNotifications: user.smsNotifications,
                emailNotifications: user.emailNotifications
            });
        }
    });
    
}

// POST updates the users settings
const update = function(req, res) {
    var params = req.body;

    //Check if all needed information is sent in request
    if (!params.emailNotifications || !params.smsNotifications) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }
    
    
    //Variables from the request body
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    
    Users.findOne({_id:userID}, function(err, user) {
        if(err){
            res.json({
                success: false,
                message: 'Error finding user'
            });
        }

        else{
            user.smsNotifications = params.smsNotifications;
            user.emailNotifications = params.emailNotifications;

            user.save(function(err) {
                if(err) {
                    res.json({
                        success: false,
                        message: 'Could not save user settings'
                    });
                }
                else{
                    res.json({
                        success: true,
                        message: 'Successfully saved user settings'
                    });
                }
            });
        }

    });
}

module.exports = {
  getSettings,
  update
}
