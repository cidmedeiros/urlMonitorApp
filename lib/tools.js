/* Where all the helpers tools live */

//Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

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
tools.sendTwilioSms = function(phone,msg,callback){
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg){
        // Configure the request payload
        var payload = {
        'From' : config.twilio.fromPhone,
        'To' : '+1'+phone,
        'Body' : msg
        };
        var stringPayload = querystring.stringify(payload);

        // Configure the request details
        var requestDetails = {
        'protocol' : 'https:',
        'hostname' : 'api.twilio.com',
        'method' : 'POST',
        'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
        'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
        'headers' : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            var status =  res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201){
            callback(false);
            } else {
            callback('Status code returned was '+status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error',function(e){
        callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters were missing or invalid');
    }
};

tools.getTemplate = (templateName, callback) => {
    templateName = typeof(templateName) == 'string' ? templateName : false;
    if(templateName){
        let templatesDir = path.join(__dirname, '/../templates/');
        fs.readFile(templatesDir+templateName+'.html', 'utf8', (err, str) => {
            if(!err && str.length > 0){
                callback(false, str);
            } else {
                callback('No template could be found!')
            }
        });
    } else {
        callback('A valid template was not specified!');
    }
}

//Add the global header and footer to a string, and pass provided data object to the header and footer for interpolation
tools.addUniversalTemplates = (str, data, callback) => {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    //Get the header
    tools.getTemplate('_header', data, (err, headerString) => {
        if(!err && headerString){
            tools.getTemplate('_footer', data,
             (err, footerString) => {
                 //Get the footer
                 tools.getTemplate('_footer', data, (err, footerString) => {
                     if(!err, footerString){
                         let fullString = headerString+str+footerString
                         callback(false, fullString);
                     } else {
                         callback('Could not find the footer template')
                     }
                 })
            })
        } else {
            callback('Could not find the header template')
        }
    })
} 

tools.interpolate = (str, data) => {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    //Add the templateGlobals to the data object, prepending their key name with "global"
    for(var keyName in config.templateGlobals){
        if(config.templateGlobals.hasOwnProperty(keyName)){
            data['global'+keyName] = config.templateName[keyName];
        }
    }
    //For each key in the data object, insert its value into the string at the corresponding placeholder
    for(var key in data){
        if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
            let replace = data[key];
            let find = '{'+key+'}';
            str = str.replace(find, replace);
        }
    }
    return str;
}

module.exports = tools;