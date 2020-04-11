const config = require('./configHA2');
const https = require('https');
const tools = require('./toolsHA2');
const StringDecoder = require('string_decoder').StringDecoder;
const querystring = require('querystring');

//Create Stripe Object

stripe = {}

stripe.charge = (chargeData, callback) => {
    //Request stripe api to create a card
    //get customer ID

    //Object summary coming from the order requested by the customer
    let payload = {
        amount:chargeData.amount,
        currency:'usd',
        source: 'tok_visa'
    }

    let queryPayload = querystring.escape(JSON.stringify(payload));

    //raw http url to use on postman tests only
    let endpoint = `https://api.stripe.com/v1/charges/`;
    var rawUrl = `${endpoint}${queryPayload}`;
    console.log(rawUrl)

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
                callback(JSON.parse(body));
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
};

module.exports = stripe;