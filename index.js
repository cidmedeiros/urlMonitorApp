/*
*Primary file for the API
*/

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const util = require('util')

//Set Server -> it processes the incoming data embedded in the request object then assigns the associated action to it
const server = http.createServer((req, res) => {

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
            'payload': buffer
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
});

//Start the server and have it listen to the available port
server.listen(3000, () =>{
    console.log('Listening on port 3000');
})

//Define the handlers
var handlers = {};

//Define Sample Handler
handlers.sample = (data, callback) => {
    //call a http status code, and a handler payload object
    callback(406, {'name':'sample handler'});
};

//Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

//Define a request router
const router = {
    'sample': handlers.sample
};