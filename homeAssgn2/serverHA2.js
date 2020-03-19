/* SERVER-related tasks */

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./configHA2');
const fs = require('fs');
const handlers = require('./handlersHA2');
const tools = require('./toolsHA2');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server'); //to monitor the server module -> NODE_DEBUG=server node index.js

//Instantiate the server module object
var server = {};

//Instantiate HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

//Server seetings -> it processes the incoming url/data embedded in the request object then assigns the associated action to it
server.unifiedServer = (req, res) => {
    //get the URl and parse it
    //the true argmnt tells the url module to call the query-stream module
    let parseUrl = url.parse(req.url, true);

    //get the path: 1 -> untrimmed; 2 -> trimmes the slashes out
    let path = parseUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as an object
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
        let chosenhandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;  

        //construct the data object to send to the chosenhandler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': tools.parseJsonToObject(buffer) //make sure the incoming data is an Object
        }

        //setting up a GENERAL router to route the request to the handlers
        chosenhandler(data, (statusCode, handlerPayload) => {
            //use the handler statusCode or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //use the handler payload object if any or default to {}
            handlerPayload = typeof(payload) == 'object' ? handlerPayload : {};

            //convert the handlerPayload to String to be sent to the user
            let handlerPayloadString = JSON.stringify(handlerPayload);

            //Return the responses
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(handlerPayloadString);

            //if the response is 200 print green, otherwise print red
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',`${method.toUpperCase()} /${trimmedPath} ${statusCode}}`);
            } else {
                debug('\x1b[31m%s\x1b[0m',`${method.toUpperCase()} /${trimmedPath} ${statusCode}}`);
            }
        })
    });
};

//Define a request router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens' : handlers.tokens,
    'order': handlers.order
};

//Define server init function
server.init = () =>{
    //Start the HTTP server and have it listen to the Env port
    server.httpServer.listen(config.httpPort, () =>{
        console.log('\x1b[36m%s\x1b[0m', `Server running on ${config.envName} mode, and listening on port ${config.httpPort} with HTTP protocol`);
    });
};

//Export server module
module.exports = server;