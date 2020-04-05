/* Where all the helpers tools live */

//Dependencies
const crypto = require('crypto');
const config = require('./configHA2');
const stripe = require('stripe');

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

//validateEmail function provided by StackOverflow user. Source: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript 
tools.validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = tools;