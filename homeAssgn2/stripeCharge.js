const config = require('./configHA2');
const https = require('https');
const querystring = require('querystring');

var stripeCharge = (callback) => {

    const apiURL = 'https://api.stripe.com/v1/charges?';

    const payload = querystring.stringify(
        {
            amount: 2000,
            currency: 'usd',
            source: 'tok_mastercard',
            description: 'My First Test Charge (created for API docs)'
        }
    );

    var url = `${apiURL}${payload}`;

    const requestDetails = {
        'protocol' : 'https:',
        'method' : 'POST',
        'headers': {
          "Authorization": `Bearer ${config.stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        }
    };

    var req = https.request(url, requestDetails, (res) =>{
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
    req.on('error', function(e){
        callback(e);
    });

    // Buffer the data in case of successful streaming
    let body = ''; 
    req.on("data", data => {
        body += data;
    });
    
    //
    req.on("end", () => {
    body = JSON.parse(body);
    return body;
    });
}

stripeCharge((res) =>{
    console.log(res);
});