const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const sendTestSMS = function(req,res){
  console.log(req.body);
  twilioClient.messages.create({
      body: 'whats up this is a freshbudgets twilio test',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + req.body.phoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done();
};

const respondToSMS = function(req, res) {
  console.log(req.body);
}

const sendSMSVerificationCode = function(phoneNumber, verificationCode) {
  twilioClient.messages.create({
    body: 'Your Fresh Budgets verification code is: ' + verificationCode,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1' + phoneNumber
  })
  .then(message => {
    console.log(message.sid);
  })
  .done();
};

const verifySMSVerificationCode = function(req, res) {
  const userID = req.decoded._id;
  Users.findOne({_id: userID}, function(err, user){
    if (err) {
      res.json({
        success: false,
        message: 'failed to find user'
      });
    }
    else {
      if (parseInt(req.body.verificationCode) != user.smsVerificationCode) {
        res.json({
          success: false,
          message: 'verification code does not match'
        });
      }
      else {
        user.isVerified = true;
        user.save();
        res.json({
          success: true,
          message: 'phone number verified'
        });
      }
    }
  });
};

module.exports = {
  sendTestSMS,
  respondToSMS,
  sendSMSVerificationCode,
  verifySMSVerificationCode
}
