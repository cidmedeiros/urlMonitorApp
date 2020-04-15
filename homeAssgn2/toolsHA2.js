//Where all the helpers tools live

//Dependencies
const crypto = require('crypto');
const config = require('./configHA2');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
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

//validateEmail function provided by StackOverflow user. Source: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript 
tools.validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

//Queryfy objects -> it casts an object in a query of key-pair values structure.
tools.objToQuery = (obj) => {
    const query = Object.keys(obj).map( key => `${key}=${obj[key]}`).join("&");
    return query.length > 0 ? `?${query}` : "";
}

//Charge an order through Stripe
tools.charge = (chargeData, callback) => {
    //Request stripe api to create a charge
    //Verify Data
    orderAmount = typeof(chargeData.amount) == 'number' && chargeData.amount > 0.50 ? chargeData.amount : false
    orderCard = typeof(chargeData.card) === 'string' && config.stripeInfo.card.indexOf(chargeData.card) > -1 ? chargeData.card.trim() : false;

    if(orderAmount && orderCard){
        //Object summary coming from the order requested by the customer
        let payload = {
            amount: orderAmount,
            currency:'usd',
            source: orderCard
        }

        let queryPayload = querystring.escape(JSON.stringify(payload));

        //raw http url to use on postman tests only
        let endpoint = `https://api.stripe.com/v1/charges/`;
        let rawUrl = `${endpoint}${queryPayload}`;

        //craft object to http.request
        const requestDetails = {
            'protocol' : 'https:',
            'method' : 'POST',
            'hostname' : 'api.stripe.com',
            'path':'/v1/charges',
            'headers': {
                "Authorization": `Bearer ${config.stripeInfo.stripeKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
                'Content-Length': Buffer.byteLength(queryPayload)
            }
        };

        var req = https.request(requestDetails, (res) =>{
            // Grab the status of the sent request
            var status =  res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201){
                //get the payload as an object
                let decoder = new StringDecoder('utf-8');
                let body = '';
                //on means event emitter. The data means stream of data
                res.on('data', (data) =>{
                    body += decoder.write(data);
                });
                res.on('end', () =>{
                    let charge = JSON.parse(body);
                    if(charge.paid == true){
                        callback(true);
                    } else {
                        callback(false);
                    }
                });
            } else {
            callback('Status code returned was '+status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', function(e){
            callback(e);
        });

        // Add the payload
        req.write(queryPayload);

    } else {
        callback('The given parameters were missing or invalid');
    }
};

// Send receipt and order summary through email using MailGun
tools.sendEmail = (email, order, callback) => {
    const emailVer = typeof(email) == 'string' && tools.validateEmail(email.trim()) ? email.trim() : false;
  
    if (emailVer) {
      let payload = {
          'from': config.mailGunInfo.from,
          'to': email,
          'subject': 'Payment Successful',
          'text': `Your order ${order.Id} - ${order.amount} has been confirmed and your pizzas are on the way`
        }

        let queryPayload = querystring.stringify(payload);
        //http url to use on postman tests only
        let endpoint = `https://api.mailgun.net/v3/sandboxb0302d63c9104a70bddecb2d668c3b96.mailgun.org`;
        var rawUrl = `${endpoint}${queryPayload}`;
  
        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.mailgun.net/v3/',
            'method': 'POST',
            'path': 'sandboxb0302d63c9104a70bddecb2d668c3b96.mailgun.org',
            'auth': config.mailGunInfo.mailgunKey,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(queryPayload)
            }
        }
  
        let req = https.request(requestDetails, (res) => {
            let status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });
  
      req.on('error', (e) => {
        callback(e);
      });
  
      req.write(queryPayload);
  
      req.end();
  
    } else {
      callback('The e-mail provided is not of a valid format.');
    }
  
};

//Export tools
module.exports = tools;