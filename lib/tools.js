/* Where all the helpers tools live */

//Dependencies
const crypto = require('crypto');
const config = require('../config');
const https = require('https');
const querystring = require('querystring');

//Container for all the helper functions
tools = {};

//Hash function -> create a sha256 hash
tools.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0){
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else{
        return false;
    }
};

//parse a JSON string to an object in all cases, without throwing
tools.parseJsonToObject = (str) => {
    try{
        let obj = JSON.parse(str);
        return obj;
    } catch(error){
        return {};
    }
};

//create random strings to use them as ids
tools.createRandomString = (strLength) => {
    let size = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
    if(size){
        let possibleChar = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for(i = 1; i <= size; i++){
            let randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            str += randomChar;
        }
        //return final result
        return str;
    } else {
        return false;
    }
};

//send sms via twilio
tools.sendTwilioSms = (phone, msg, callback) =>{
    //validate params
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim() <= 1600 ? msg.trim() : false;

    if(phone && msg){
        //configure the request payload
        let payload = {
            'From': config.twilio.fromPhone,
            'To' : '+1'+phone,
            'Body':  msg
        }
        //stringfy the payload
        let stringPayload = querystring.stringify(payload);

        //configure the request details
        let requestDetails = {
            'protocol': 'https',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' Buffer.byteLength(stringPayload)
            }
        };



    } else {
        callback(400, {'Error':'Missing or invalid parameters'});
    }
}

module.exports = tools;