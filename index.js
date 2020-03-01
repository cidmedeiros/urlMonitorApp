/*
*Primary file for the API
*/

//Dependencies
const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const tools = require('./lib/tools');

//Instantiate HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

//Start the HTTP server and have it listen to the Env port
httpServer.listen(config.httpPort, () =>{
    console.log(`Server running on ${config.envName} mode, and listening on port ${config.httpPort} with HTTP protocol`);
});

//Instantiate HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions,(req, res) => {
    unifiedServer(req, res);
});

//Start the HTTPS server and have it listen to the Env port
httpsServer.listen(config.httpsPort, () =>{
    console.log(`Server running on ${config.envName} mode, and listening on port ${config.httpsPort} with HTTPS protocol`);
});

//Server seetings -> it processes the incoming url/data embedded in the request object then assigns the associated action to it
let unifiedServer = (req, res) => {
    //get the URl and parse it
    //the true argmnt tells the url module to call the query-stream module
    let parseUrl = url.parse(req.url, true);

    //get the path: 1 -> untrimmed; 2 -> trimmes the slashes out
    let path = parseUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as an object
    //ex: localhost:3000/foo/nigh/?fizz=buzz
    //query -> { fizz: 'buzz' }
    let queryStringObject = parseUrl.query;

    //get the HTTP method
    let method = req.method.toLocaleLowerCase();

    //get the headers as an object
    let headers = req.headers

    //get the payload as an object, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    //on means event emitter. The data means stream of data
    req.on('data', (data) =>{
        buffer += decoder.write(data);
    });
    
    //end finalizes the event emitter
    req.on('end', () =>{
        //cuts off data stream
        buffer += decoder.end();

        //Verifies the handler this request should go to.
        //If one is not found, it should go to notFound handler.
        let chosenhandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
        console.log('handler is:',chosenhandler);

        //construct the data object to send to the chosenhandler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': tools.parseJsonToObject(buffer) //make sure the incoming data is an Object
        }

        //setting up a general router to route the request to the handlers
        chosenhandler(data, (statusCode, handlerPayload) => {
            //use the handler statusCode or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //use the handler payload object if any or default to {}
            handlerPayload = typeof(handlerPayload) ? handlerPayload : {};

            //convert the handlerPayload to String to be sent to the user
            let handlerPayloadString = JSON.stringify(handlerPayload);

            //Return the responses
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(handlerPayloadString);
            console.log('Returning this response', statusCode, handlerPayloadString);
        })
    });
};

//Define a request router
const router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens' : handlers.tokens
};