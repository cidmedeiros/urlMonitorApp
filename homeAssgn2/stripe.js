const config = require('./configHA2');
const https = require('https');
const tools = require('./toolsHA2');
const StringDecoder = require('string_decoder').StringDecoder;
const util = require('util');

//Create Stripe Object

var returnResponse = (data) => {
    return data;
}

stripe = {}

stripe.createStrCustomer = (customerData, callback) => {
    //Request stripe api to confirm the payment

    //object summary coming from the order requested by the customer

    let payload = {
        description: customerData.description
    }
    /*
        The encodeURIComponent() function encodes a URI by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two "surrogate" characters).
     */
    let payloadNotEncoded = tools.objToQuery(payload);

    //raw http url to use on postman tests only
    let endpoint = 'https://api.stripe.com/v1/customers?';
    var rawUrl = `${endpoint}${payloadNotEncoded}`;
    console.log(rawUrl)

    //craft object to http.request
    const requestDetails = {
        'protocol' : 'https:',
        'method' : 'POST',
        'hostname' : 'api.stripe.com',
        'path':'/v1/customers',
        'headers': {
          "Authorization": `Bearer ${config.stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          'Content-Length': Buffer.byteLength(payloadNotEncoded)
        }
    };

    var req = https.request(requestDetails, (res) =>{
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
        callback(res);
        } else {
        callback('Status code returned was '+status);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function(e){
        callback(e);
    });

    // Add the payload
    req.write(payloadNotEncoded);

};

customerData = {};
customerData.description = 'pizza eater'

stripe.charge = (callback) => {
    //Request stripe api to confirm the payment

    //object summary coming from the order requested by the customer
    let payload = {
        amount: 2000,
        currency: 'usd'
    }
    /*
        The encodeURIComponent() function encodes a URI by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two "surrogate" characters).
     */
    let payloadEncoded = encodeURIComponent(tools.objToQuery(payload));

    //raw http url to use on postman tests only
    let endpoint = 'https://api.stripe.com/v1/charges?';
    var rawUrl = `${endpoint}${payloadEncoded}`;
    console.log(rawUrl)

    //craft object to http.request
    const requestDetails = {
        'protocol' : 'https:',
        'method' : 'POST',
        'hostname' : 'api.stripe.com',
        'path':'/v1/charges',
        'headers': {
          "Authorization": `Bearer ${config.stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          'Content-Length': Buffer.byteLength(payloadEncoded)
        }
    };

    var req = https.request(requestDetails, (res) =>{
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
            callback(res);
        } else {
            callback({'statusCode': status});
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function(e){
        callback(e);
    });

    // Add the payload
    req.write(payloadEncoded);
    
    // End the request
    req.end();
}

stripe.createStrCustomer(customerData, (res) =>{
    console.log(res);
});