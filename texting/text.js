// Twilio Credentials
var accountSid = 'AC108d7114ab6ec011c40348dd2de2d8ef';
var authToken = '5817c9cf10b4c8589a0d08ae2376ed10';

//require the Twilio module and create a REST client
var twilio = require('twilio')
var client = twilio(accountSid, authToken);

function text (number,message) {
  console.log("from text")
  client.messages.create({
      to: number,
      from: "+12268871350",
      body: message,
  }, function(err, message) {
      if(err){
        console.log(err)
      }else {
        console.log(message.sid);
      }
  });
}

function call(number,message) {
  client.calls.create({
      url: `https://handler.twilio.com/twiml/EH8fd768ed227501b6900f15ce316e6cd3?message=${message}`,
      to: number,
      from: "+12268871350"
  }, function(err, call) {
      if(err){
        console.log(err)
      } else {
        process.stdout.write(call.sid);
      }
  });
}

module.exports = {
  call:call,
  text:text
}

// text("+15192407058","Take your medicine")
// call("+15192407058","Take+your+medicine")
