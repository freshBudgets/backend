const config = require('../config');
const twilioClient = require('twilio')(config.twilioSID, config.twilioToken)
const MessagingResponse = require('twilio').twiml.MessagingResponse;

//Used just as an example on how to send twilio messages


const sendTestSMS = function(req,res){
  console.log(req.body);
  twilioClient.messages.create({
      body: 'whats up this is a freshbudgets twilio test',
      from: config.twilioPhoneNumber,
      to: '+1' + req.body.phoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done();
}

const respondToSMS = function(req, res) {
  const twiml = new MessagingResponse();
  const message = twiml.message();
  message.body('Response successfully sent');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

module.exports = {
  sendTestSMS,
  respondToSMS
}
