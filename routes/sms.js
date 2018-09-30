const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

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
