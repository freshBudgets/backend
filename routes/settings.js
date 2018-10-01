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
    
    // res.json({
    //     success: true,
    //     message: 'You hit settings/update'
    // });
    
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
            res.json({
                user: user
            });
        }

    });
}

module.exports = {
  update
}
